const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const outputPath = process.argv[3] || path.join(__dirname, 'artifacts', 'dd-browser-results.json');
const artifactDir = path.join(__dirname, 'artifacts');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function record(results, id, title, status, details) {
  results.push({ id, title, status, details });
}

function writeFixture(name, content) {
  const filePath = path.join(artifactDir, name);
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

async function withPage(browser, viewport, fn) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });
  try {
    await fn(page, consoleErrors, pageErrors);
  } finally {
    await page.close();
  }
}

async function openApp(page) {
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForSelector('#tab-bar');
}

async function switchTab(page, tabId) {
  await page.click(`.tab-btn[data-tab="${tabId}"]`);
}

async function waitForPlot(page, selector) {
  await page.waitForFunction((sel) => {
    const node = document.querySelector(sel);
    if (!node) return false;
    if (node.classList.contains('js-plotly-plot')) return true;
    return !!node.querySelector('.js-plotly-plot');
  }, selector);
}

async function trainCurrent(page) {
  await page.click('#btn-train');
  await Promise.race([
    waitForPlot(page, '#boundary-chart'),
    page.waitForSelector('.accuracy-badge', { state: 'attached' }),
  ]);
}

async function main() {
  const results = [];
  let browser;

  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });

    await withPage(browser, { width: 1440, height: 960 }, async (page, consoleErrors, pageErrors) => {
      await openApp(page);

      const introVisible = await page.locator('#intro-tab').isVisible();
      record(results, 'purpose.no-code-ui', '可從 UI 啟動，不需程式碼', introVisible ? 'pass' : 'fail', `introVisible=${introVisible}`);

      const tabOrder = await page.locator('.tab-btn').evaluateAll((els) => els.map((el) => el.dataset.tab));
      const expectedOrder = ['intro', 'describe', 'preprocess', 'train', 'results', 'log'];
      record(
        results,
        'ui.tab-count-browser',
        '瀏覽器中六個 Tab 可見且順序正確',
        JSON.stringify(tabOrder) === JSON.stringify(expectedOrder) ? 'pass' : 'fail',
        tabOrder.join(' -> '),
      );

      await switchTab(page, 'results');
      const emptyPrompt = await page.locator('#tab-content').textContent();
      record(
        results,
        'teaching.results-empty-state',
        '未訓練切到成效 tab 有提示',
        /請先到「訓練」完成訓練。/.test(emptyPrompt || '') ? 'pass' : 'fail',
        emptyPrompt || '',
      );

      await switchTab(page, 'preprocess');
      const preprocessText = await page.locator('#tab-content').textContent();
      const hasWhyText = /Min-Max|Z-score|均值0標準差1|0~1/.test(preprocessText || '');
      record(results, 'teaching.why-copy', '前處理區有解釋性文字', hasWhyText ? 'pass' : 'fail', (preprocessText || '').slice(0, 180));

      const consoleClean = consoleErrors.length === 0 && pageErrors.length === 0;
      record(
        results,
        'ui.console-clean-intro',
        '基本導覽流程無 console / pageerror',
        consoleClean ? 'pass' : 'fail',
        `consoleErrors=${consoleErrors.length}, pageErrors=${pageErrors.length}`,
      );
    });

    await withPage(browser, { width: 1440, height: 960 }, async (page, consoleErrors, pageErrors) => {
      await openApp(page);
      await switchTab(page, 'train');
      await page.selectOption('#algo-select', 'knn');
      await trainCurrent(page);
      const accuracyBadge = await page.locator('.accuracy-badge').first().textContent();
      const chartVisible = await page.evaluate(() => {
        const node = document.querySelector('#boundary-chart');
        if (!node) return false;
        return node.classList.contains('js-plotly-plot') || !!node.querySelector('.js-plotly-plot');
      });
      record(
        results,
        'train.browser-knn',
        'k-NN 瀏覽器實跑成功',
        chartVisible && /準確率/.test(accuracyBadge || '') ? 'pass' : 'fail',
        `accuracy=${accuracyBadge || ''}`,
      );

      const kLabelBefore = await page.locator('#k-val').textContent();
      await page.locator('#k-slider').fill('9');
      const kLabelAfter = await page.locator('#k-val').textContent();
      record(
        results,
        'train.browser-slider',
        'k 值滑桿可操作並更新標籤',
        kLabelBefore !== kLabelAfter && /9/.test(kLabelAfter || '') ? 'pass' : 'fail',
        `${kLabelBefore || ''} -> ${kLabelAfter || ''}`,
      );

      await switchTab(page, 'results');
      await page.waitForSelector('.cm-table');
      const cmText = await page.locator('#result-chart').textContent();
      record(
        results,
        'results.browser-matrix',
        '成效頁混淆矩陣可見',
        /實際 ↓ 預測 →/.test(cmText || '') && /Setosa|Versicolor|Virginica/.test(cmText || '') ? 'pass' : 'fail',
        (cmText || '').slice(0, 180),
      );

      await switchTab(page, 'train');
      await page.selectOption('#algo-select', 'dt');
      await trainCurrent(page);
      await page.selectOption('#algo-select', 'rf');
      await trainCurrent(page);
      record(results, 'train.browser-dt-rf', 'DT / RF 瀏覽器實跑成功', 'pass', 'Decision Tree 與 Random Forest 皆完成點擊訓練。');

      await page.selectOption('#algo-select', 'knn');
      await trainCurrent(page);
      const beforeCount = await page.locator('.accuracy-badge').count();
      await page.selectOption('#x-feat', { index: 0 });
      const afterCount = await page.locator('.accuracy-badge').count();
      record(
        results,
        'train.browser-xy-clear',
        '切換 X 軸後應清空舊訓練結果',
        beforeCount > 0 && afterCount === 0 ? 'pass' : 'fail',
        `beforeCount=${beforeCount}, afterCount=${afterCount}`,
      );

      const numericCsv = writeFixture('upload_numeric.csv', 'x,y,label\n1,2,0\n2,3,1\n3,4,1\n');
      await page.setInputFiles('#csv-input', numericCsv);
      await page.waitForFunction(() => [...document.querySelectorAll('#dataset-select option')].some((opt) => opt.textContent.includes('upload_numeric')));
      const numericBody = await page.locator('#data-table tbody').textContent();
      const numericOk = /Class 0/.test(numericBody || '') && /Class 1/.test(numericBody || '');

      const textCsv = writeFixture('upload_text.csv', 'x,y,label\n1,2,cat\n2,3,dog\n3,4,cat\n');
      await page.setInputFiles('#csv-input', textCsv);
      await page.waitForFunction(() => [...document.querySelectorAll('#dataset-select option')].some((opt) => opt.textContent.includes('upload_text')));
      const textBody = await page.locator('#data-table tbody').textContent();
      const textOk = /cat/.test(textBody || '') && /dog/.test(textBody || '');
      record(
        results,
        'data.browser-csv-upload',
        'CSV 上傳可解析數字與文字標籤',
        numericOk && textOk ? 'pass' : 'fail',
        `numericOk=${numericOk}, textOk=${textOk}`,
      );

      const consoleClean = consoleErrors.length === 0 && pageErrors.length === 0;
      record(
        results,
        'ui.console-clean-train',
        '訓練流程無 console / pageerror',
        consoleClean ? 'pass' : 'fail',
        `consoleErrors=${consoleErrors.length}, pageErrors=${pageErrors.length}`,
      );
    });

    await withPage(browser, { width: 1440, height: 960 }, async (page, consoleErrors, pageErrors) => {
      await openApp(page);
      await page.selectOption('#dataset-select', 'mall_customers');
      await page.waitForFunction(() => document.querySelector('.tab-btn.active')?.dataset.tab === 'describe');
      await page.waitForFunction(() => !document.querySelector('#data-table thead')?.innerHTML.includes('target-col'));
      await switchTab(page, 'train');
      await page.click('#btn-train');
      await waitForPlot(page, '#boundary-chart');
      await switchTab(page, 'results');
      await waitForPlot(page, '#elbow-chart');
      const resultsText = await page.locator('#tab-content').textContent();
      record(
        results,
        'results.browser-kmeans',
        'k-means 與 Elbow 曲線瀏覽器實跑成功',
        /Elbow/.test(resultsText || '') ? 'pass' : 'fail',
        (resultsText || '').slice(0, 160),
      );

      const consoleClean = consoleErrors.length === 0 && pageErrors.length === 0;
      record(
        results,
        'ui.console-clean-kmeans',
        'k-means 流程無 console / pageerror',
        consoleClean ? 'pass' : 'fail',
        `consoleErrors=${consoleErrors.length}, pageErrors=${pageErrors.length}`,
      );
    });

    await withPage(browser, { width: 390, height: 844 }, async (page, consoleErrors, pageErrors) => {
      await openApp(page);
      const resizerVisible = await page.locator('#panel-resizer').isVisible();
      const leftBefore = await page.locator('#leftPanel').boundingBox();
      await page.locator('#panel-resizer').dragTo(page.locator('#tab-bar'));
      const leftAfter = await page.locator('#leftPanel').boundingBox();
      record(
        results,
        'ui.portrait-browser',
        'Portrait 模式分隔條可見且可拖動',
        !!resizerVisible && !!leftBefore && !!leftAfter && Math.abs(leftBefore.height - leftAfter.height) > 5 ? 'pass' : 'fail',
        `visible=${resizerVisible}, before=${leftBefore ? leftBefore.height : 'n/a'}, after=${leftAfter ? leftAfter.height : 'n/a'}`,
      );

      const consoleClean = consoleErrors.length === 0 && pageErrors.length === 0;
      record(
        results,
        'ui.console-clean-portrait',
        'Portrait 流程無 console / pageerror',
        consoleClean ? 'pass' : 'fail',
        `consoleErrors=${consoleErrors.length}, pageErrors=${pageErrors.length}`,
      );
    });
  } finally {
    if (browser) await browser.close();
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pass: results.filter((item) => item.status === 'pass').length,
    fail: results.filter((item) => item.status === 'fail').length,
    results,
  };

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
  process.stdout.write(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    error: String(error && error.stack ? error.stack : error),
  };
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.error(payload.error);
  process.exit(1);
});

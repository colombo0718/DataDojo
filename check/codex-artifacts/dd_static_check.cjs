const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..', '..');
const appJsPath = path.join(repoRoot, 'app.js');
const indexHtmlPath = path.join(repoRoot, 'index.html');
const styleCssPath = path.join(repoRoot, 'style.css');
const outputPath = process.argv[2] || path.join(__dirname, 'artifacts', 'dd-static-results.json');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function makeElement() {
  return {
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    listeners: {},
    classList: { add() {}, remove() {} },
    addEventListener(type, cb) { this.listeners[type] = cb; },
    setPointerCapture() {},
    getBoundingClientRect() { return { height: 120, width: 240 }; },
  };
}

function createHarness() {
  const source = fs.readFileSync(appJsPath, 'utf8');
  const elements = new Map();

  const getElement = (key) => {
    if (!elements.has(key)) elements.set(key, makeElement());
    return elements.get(key);
  };

  const plotly = {
    calls: [],
    newPlot(divId, traces, layout, cfg) {
      this.calls.push({ divId, traces, layout, cfg });
    },
  };

  const context = {
    console,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    Infinity,
    NaN,
    Set,
    Map,
    Promise,
    fetch: async (file) => ({
      text: async () => fs.readFileSync(path.join(repoRoot, file), 'utf8'),
    }),
    FileReader: class {
      readAsText(file) {
        if (!this.onload) return;
        const result = file && file.content ? file.content : '';
        this.onload({ target: { result } });
      }
    },
    Option: function Option(text, value) {
      this.text = text;
      this.value = value;
    },
    document: {
      getElementById(id) { return getElement(id); },
      querySelector(selector) { return getElement(selector); },
      querySelectorAll() { return []; },
    },
    window: { addEventListener() {} },
    Plotly: plotly,
    setTimeout,
    clearTimeout,
  };

  vm.createContext(context);
  const wrapped = `${source}
globalThis.__DD__ = {
  DATASET_META,
  state,
  loadDataset,
  updateTable,
  countMissing,
  applyPreprocessing,
  resetPreprocessing,
  splitAndTrain,
  renderDecisionBoundary,
  renderClusterScatter,
  renderConfusionMatrix,
  renderResultsTab,
  renderAccuracyCurve,
  computeAccuracyCurve,
  computeElbow,
  renderBeforeAfter,
  switchTab,
  updateStats,
};`;
  vm.runInContext(wrapped, context, { filename: 'app.js' });

  return {
    source,
    plotly,
    elements,
    api: context.__DD__,
    getElement,
    resetDom() {
      for (const el of elements.values()) {
        el.innerHTML = '';
        el.textContent = '';
        el.value = '';
        el.listeners = {};
        el.style = {};
      }
      plotly.calls.length = 0;
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function approxEqual(a, b, epsilon = 1e-6) {
  return Math.abs(a - b) <= epsilon;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values) {
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - m) ** 2, 0) / values.length);
}

function parseCsvRows(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',').map((item) => item.trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((item) => item.trim()));
  return { headers, rows };
}

function record(results, id, title, status, details) {
  results.push({ id, title, status, details });
}

async function main() {
  const harness = createHarness();
  const {
    source,
    plotly,
    api: {
      DATASET_META,
      state,
      loadDataset,
      updateTable,
      countMissing,
      applyPreprocessing,
      resetPreprocessing,
      splitAndTrain,
      renderDecisionBoundary,
      renderClusterScatter,
      renderConfusionMatrix,
      renderResultsTab,
      renderAccuracyCurve,
      computeAccuracyCurve,
      computeElbow,
      renderBeforeAfter,
      switchTab,
    },
    getElement,
    resetDom,
  } = harness;

  const results = [];

  try {
    new Function(source);
    record(results, 'code.syntax', 'app.js 語法檢查', 'pass', 'new Function 驗證通過。');
  } catch (error) {
    record(results, 'code.syntax', 'app.js 語法檢查', 'fail', String(error));
  }

  const builtInKeys = ['iris', 'penguins', 'breast_cancer', 'titanic', 'heart_disease', 'pima_diabetes', 'mall_customers'];
  const loadSummary = [];
  for (const key of builtInKeys) {
    await loadDataset(key);
    loadSummary.push(`${key}:${state.data.length}`);
  }
  const allLoaded = loadSummary.every((item) => Number(item.split(':')[1]) > 0);
  record(
    results,
    'data.load.all',
    '七個內建資料集可載入',
    allLoaded ? 'pass' : 'fail',
    loadSummary.join(', '),
  );

  await loadDataset('mall_customers');
  resetDom();
  updateTable();
  const mallHeader = getElement('#data-table thead').innerHTML;
  const mallNoTarget = !mallHeader.includes('target-col');
  record(
    results,
    'data.load.unsupervised-no-target',
    '無監督資料表無 target 欄',
    mallNoTarget ? 'pass' : 'fail',
    mallNoTarget ? '商場顧客表頭未渲染 target 欄。' : mallHeader,
  );

  const classMapStatuses = [];
  for (const key of ['titanic', 'heart_disease', 'pima_diabetes']) {
    await loadDataset(key);
    const d = DATASET_META[key];
    const targetIndex = d.featureCount;
    const labelsValid = state.data.every((row) => row[targetIndex] === 0 || row[targetIndex] === 1);
    resetDom();
    updateTable();
    const bodyHtml = getElement('#data-table tbody').innerHTML;
    const visibleNames = d.classes.every((label) => bodyHtml.includes(label));
    classMapStatuses.push(`${key}:${labelsValid && visibleNames ? 'ok' : 'bad'}`);
  }
  record(
    results,
    'data.load.classmap',
    'classMap 數字標籤對應中文類名',
    classMapStatuses.every((item) => item.endsWith('ok')) ? 'pass' : 'fail',
    classMapStatuses.join(', '),
  );

  await loadDataset('iris');
  state.algorithm = 'rf';
  state.accuracy = '99.0';
  state.predictor = () => 1;
  state.lastPreds = [1, 1];
  await loadDataset('penguins');
  const resetOk = state.algorithm === 'knn'
    && state.accuracy === null
    && state.predictor === null
    && state.lastPreds.length === 0;
  record(
    results,
    'data.load.switch-reset',
    '切換資料集重置算法與訓練結果',
    resetOk ? 'pass' : 'fail',
    `algorithm=${state.algorithm}, accuracy=${state.accuracy}, lastPreds=${state.lastPreds.length}`,
  );

  state.dsKey = 'iris';
  state.rawData = [
    [1, 10, 100, 1000, 0],
    [3, Number.NaN, 300, 1100, 1],
    [5, 30, 500, 1200, 0],
  ];
  state.data = clone(state.rawData);
  state.colScale = ['none', 'none', 'none', 'none'];
  record(
    results,
    'preprocess.missing-count',
    '缺失值筆數偵測',
    countMissing(1) === 1 ? 'pass' : 'fail',
    `column1 missing=${countMissing(1)}`,
  );

  state.missingPolicy = 'mean';
  state.accuracy = '77.7';
  state.predictor = () => 0;
  applyPreprocessing();
  const meanFillOk = approxEqual(state.data[1][1], 20);
  const clearedOnPreprocess = state.accuracy === null && state.predictor === null;
  record(
    results,
    'preprocess.mean-fill',
    '缺失值補平均值',
    meanFillOk ? 'pass' : 'fail',
    `filled=${state.data[1][1]}`,
  );
  record(
    results,
    'preprocess.clear-model',
    '前處理後清除 accuracy 與 predictor',
    clearedOnPreprocess ? 'pass' : 'fail',
    `accuracy=${state.accuracy}, predictor=${state.predictor}`,
  );

  state.rawData = [
    [1, 10, 100, 1000, 0],
    [3, 20, 300, 1100, 1],
    [5, Number.NaN, 500, 1200, 0],
    [7, 40, 700, 1300, 1],
  ];
  state.data = clone(state.rawData);
  state.colScale = ['none', 'none', 'none', 'none'];
  state.missingPolicy = 'median';
  applyPreprocessing();
  record(
    results,
    'preprocess.median-fill',
    '缺失值補中位數',
    approxEqual(state.data[2][1], 20) ? 'pass' : 'fail',
    `filled=${state.data[2][1]}`,
  );

  state.rawData = [
    [1, 10, 100, 1000, 0],
    [3, Number.NaN, 300, 1100, 1],
    [5, 30, 500, 1200, 0],
  ];
  state.data = clone(state.rawData);
  state.colScale = ['none', 'none', 'none', 'none'];
  state.missingPolicy = 'drop';
  applyPreprocessing();
  record(
    results,
    'preprocess.drop-missing',
    '缺失值刪除該筆',
    state.data.length === 2 ? 'pass' : 'fail',
    `rows=${state.data.length}`,
  );

  state.rawData = [
    [1, 10, 100, 1000, 0],
    [3, 20, 200, 1100, 1],
    [5, 30, 300, 1200, 0],
  ];
  state.data = clone(state.rawData);
  state.missingPolicy = 'none';
  state.colScale = ['minmax', 'zscore', 'none', 'none'];
  applyPreprocessing();
  const col0 = state.data.map((row) => row[0]);
  const col1 = state.data.map((row) => row[1]);
  const col2 = state.data.map((row) => row[2]);
  const minMaxOk = approxEqual(Math.min(...col0), 0) && approxEqual(Math.max(...col0), 1);
  const zScoreOk = approxEqual(mean(col1), 0, 1e-12) && approxEqual(std(col1), 1, 1e-12);
  const independentScalingOk = col2.join(',') === '100,200,300';
  record(
    results,
    'preprocess.minmax',
    'Min-Max 縮放值域 0~1',
    minMaxOk ? 'pass' : 'fail',
    `range=[${Math.min(...col0)}, ${Math.max(...col0)}]`,
  );
  record(
    results,
    'preprocess.zscore',
    'Z-score 縮放均值≈0、標準差≈1',
    zScoreOk ? 'pass' : 'fail',
    `mean=${mean(col1)}, std=${std(col1)}`,
  );
  record(
    results,
    'preprocess.independent-scaling',
    '各欄位可個別縮放互不干擾',
    independentScalingOk ? 'pass' : 'fail',
    `untouched-column=${col2.join(',')}`,
  );

  resetDom();
  updateTable();
  const normalizedHtml = getElement('#data-table tbody').innerHTML;
  const hasThreeDecimals = /\d+\.\d{3}/.test(normalizedHtml);
  resetPreprocessing();
  resetDom();
  updateTable();
  const resetHtml = getElement('#data-table tbody').innerHTML;
  const hasOneDecimal = /\d+\.\d<\/td>/.test(resetHtml);
  record(
    results,
    'preprocess.table-format',
    '資料表套用後 3 位小數，重置後 1 位小數',
    hasThreeDecimals && hasOneDecimal ? 'pass' : 'fail',
    `normalized=${hasThreeDecimals}, reset=${hasOneDecimal}`,
  );

  resetDom();
  state.selectedCol = 0;
  renderBeforeAfter();
  const firstBeforeTitle = plotly.calls[0]?.layout?.title?.text || '';
  const firstAfterTitle = plotly.calls[1]?.layout?.title?.text || '';
  resetDom();
  state.selectedCol = 1;
  renderBeforeAfter();
  const secondBeforeTitle = plotly.calls[0]?.layout?.title?.text || '';
  const secondAfterTitle = plotly.calls[1]?.layout?.title?.text || '';
  const previewUpdated = firstBeforeTitle !== secondBeforeTitle && firstAfterTitle !== secondAfterTitle;
  record(
    results,
    'preprocess.preview-switch',
    '切換預覽欄位會更新前後直方圖',
    previewUpdated ? 'pass' : 'fail',
    `${firstBeforeTitle} -> ${secondBeforeTitle}`,
  );

  await loadDataset('iris');
  const trainStatuses = [];
  for (const algorithm of ['knn', 'dt', 'rf']) {
    resetDom();
    plotly.calls.length = 0;
    state.algorithm = algorithm;
    splitAndTrain();
    renderDecisionBoundary('boundary-chart');
    const lastPlot = plotly.calls[plotly.calls.length - 1];
    const hasHeatmap = lastPlot?.traces?.some((trace) => trace.type === 'heatmap');
    const hasScatter = lastPlot?.traces?.some((trace) => trace.type === 'scatter');
    trainStatuses.push(`${algorithm}:${state.accuracy ? 'acc' : 'noacc'}:${hasHeatmap && hasScatter ? 'plot' : 'noplot'}`);
  }
  record(
    results,
    'train.supervised',
    'k-NN / DT / RF 可訓練並渲染邊界',
    trainStatuses.every((item) => item.includes(':acc:plot')) ? 'pass' : 'fail',
    trainStatuses.join(', '),
  );

  await loadDataset('mall_customers');
  state.kClusters = 5;
  resetDom();
  plotly.calls.length = 0;
  splitAndTrain();
  renderClusterScatter('cluster-chart');
  const kmPlot = plotly.calls[plotly.calls.length - 1];
  const kmOk = !!state.kmResult && kmPlot?.traces?.length === 6;
  record(
    results,
    'train.kmeans',
    'k-means 可分群並渲染散點圖',
    kmOk ? 'pass' : 'fail',
    `clusters=${state.kClusters}, traces=${kmPlot?.traces?.length ?? 0}`,
  );

  const sliderBindingsOk = source.includes("document.getElementById('k-slider')?.addEventListener('input'")
    && source.includes("document.getElementById('depth-slider')?.addEventListener('input'")
    && source.includes("document.getElementById('ntrees-slider')?.addEventListener('input'")
    && source.includes("document.getElementById('k-clusters').addEventListener('input'");
  record(
    results,
    'train.sliders-bound',
    '各算法參數滑桿綁定存在',
    sliderBindingsOk ? 'pass' : 'fail',
    sliderBindingsOk ? 'k/depth/trees/clusters 皆有 input listener。' : '缺少至少一個 listener。',
  );

  const xyChangeClearsTraining = /document\.getElementById\('x-feat'\)\.addEventListener\('change', e=>\{ state\.xFeat=\+e\.target\.value; \}\);/.test(source)
    || /document\.getElementById\('y-feat'\)\.addEventListener\('change', e=>\{ state\.yFeat=\+e\.target\.value; \}\);/.test(source);
  record(
    results,
    'train.xy-clears-results',
    '切換 X / Y 軸後清除訓練結果',
    xyChangeClearsTraining ? 'fail' : 'pass',
    xyChangeClearsTraining
      ? 'source 顯示 x-feat / y-feat change 只改 state.xFeat / state.yFeat，未清空 accuracy / predictor。'
      : 'change handler 含清除邏輯。',
  );

  await loadDataset('titanic');
  state.testY = [0, 0, 1, 1];
  state.lastPreds = [0, 1, 1, 1];
  resetDom();
  renderConfusionMatrix('result-chart');
  const binaryHtml = getElement('result-chart').innerHTML;
  const binaryOk = binaryHtml.includes('精確率') && binaryHtml.includes('66.7%') && binaryHtml.includes('0.800');
  record(
    results,
    'results.binary-metrics',
    '二元分類混淆矩陣與 precision / recall / F1',
    binaryOk ? 'pass' : 'fail',
    binaryOk ? '精確率 66.7%、召回率 100.0%、F1 0.800。' : binaryHtml.slice(0, 200),
  );

  await loadDataset('iris');
  state.testY = [0, 1, 2, 1];
  state.lastPreds = [0, 2, 2, 1];
  resetDom();
  renderConfusionMatrix('result-chart');
  const multiHtml = getElement('result-chart').innerHTML;
  const multiOk = !multiHtml.includes('精確率') && multiHtml.includes('Setosa');
  record(
    results,
    'results.multiclass-matrix',
    '多元分類混淆矩陣無二元指標行',
    multiOk ? 'pass' : 'fail',
    multiOk ? '三類混淆矩陣輸出正常。' : multiHtml.slice(0, 200),
  );

  await loadDataset('iris');
  const curveStatuses = [];
  for (const algorithm of ['knn', 'dt', 'rf']) {
    state.algorithm = algorithm;
    if (algorithm === 'knn') state.k = 5;
    if (algorithm === 'dt') state.dtDepth = 4;
    if (algorithm === 'rf') state.nTrees = 20;
    splitAndTrain();
    const curveData = computeAccuracyCurve();
    const currentX = algorithm === 'knn' ? state.k : algorithm === 'dt' ? state.dtDepth : state.nTrees;
    resetDom();
    plotly.calls.length = 0;
    renderAccuracyCurve('curve-chart', curveData, '參數', currentX);
    const markerColors = plotly.calls[0]?.traces?.[0]?.marker?.color || [];
    curveStatuses.push(`${algorithm}:${Array.isArray(markerColors) && markerColors.includes('#f78166') ? 'red' : 'nored'}`);
  }
  record(
    results,
    'results.curves',
    'k-NN / DT / RF 參數掃描曲線含當前紅點',
    curveStatuses.every((item) => item.endsWith(':red')) ? 'pass' : 'fail',
    curveStatuses.join(', '),
  );

  await loadDataset('mall_customers');
  state.kClusters = 4;
  splitAndTrain();
  resetDom();
  plotly.calls.length = 0;
  renderResultsTab();
  const elbowPlot = plotly.calls.find((call) => call.divId === 'elbow-chart');
  const elbowColors = elbowPlot?.traces?.[0]?.marker?.color || [];
  const elbowOk = Array.isArray(elbowColors) && elbowColors.includes('#f78166');
  record(
    results,
    'results.elbow',
    'k-means Elbow 曲線含當前紅點',
    elbowOk ? 'pass' : 'fail',
    elbowOk ? `k=${state.kClusters} 已標紅。` : '找不到紅點標記。',
  );

  await loadDataset('iris');
  state.accuracy = null;
  resetDom();
  renderResultsTab();
  const supervisedPrompt = getElement('tab-content').innerHTML.includes('請先到「訓練」完成訓練。');
  await loadDataset('mall_customers');
  state.kmResult = null;
  resetDom();
  renderResultsTab();
  const unsupervisedPrompt = getElement('tab-content').innerHTML.includes('請先到「訓練」完成分群。');
  record(
    results,
    'results.empty-state',
    '未訓練切到成效 tab 顯示提示',
    supervisedPrompt && unsupervisedPrompt ? 'pass' : 'fail',
    `supervised=${supervisedPrompt}, unsupervised=${unsupervisedPrompt}`,
  );

  const qualityExpectations = {
    iris: { rows: 150, check: ({ rows, dist }) => rows === 150 && dist.every((count) => count === 50) },
    penguins: { rows: 344, check: ({ rows }) => rows === 344 },
    breast_cancer: { rows: 569, check: ({ rows, positiveRate }) => rows === 569 && positiveRate > 0.35 && positiveRate < 0.38 },
    titanic: { rows: 891, check: ({ rows, positiveRate }) => rows === 891 && Math.abs(positiveRate - 0.384) < 0.002 },
    heart_disease: { rows: 303, check: ({ rows, positiveRate }) => rows === 303 && Math.abs(positiveRate - 0.46) < 0.03 },
    pima_diabetes: { rows: 768, check: ({ rows, positiveRate }) => rows === 768 && Math.abs(positiveRate - 0.35) < 0.03 },
    mall_customers: { rows: 200, check: ({ rows }) => rows === 200 },
  };

  for (const key of builtInKeys) {
    const filePath = path.join(repoRoot, DATASET_META[key].file);
    const { rows } = parseCsvRows(filePath);
    const lastCol = rows.map((row) => row[row.length - 1]);
    const numericLastCol = lastCol.every((value) => value !== '' && !Number.isNaN(Number(value)));
    const summary = {
      rows: rows.length,
      dist: [],
      positiveRate: null,
    };
    if (!DATASET_META[key].unsupervised) {
      const counts = new Map();
      for (const value of lastCol) counts.set(value, (counts.get(value) || 0) + 1);
      summary.dist = [...counts.values()];
      if (numericLastCol) {
        const positive = lastCol.filter((value) => Number(value) === 1).length;
        summary.positiveRate = positive / rows.length;
      }
    }
    const ok = qualityExpectations[key].check(summary);
    record(
      results,
      `quality.${key}`,
      `資料集品質檢查：${key}`,
      ok ? 'pass' : 'fail',
      JSON.stringify(summary),
    );
  }

  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const tabCount = (html.match(/data-tab="/g) || []).length;
  const doneClassLogic = source.includes("btn.classList.add('done')");
  record(
    results,
    'ui.tabs',
    '六個 Tab 與 Pipeline done 樣式',
    tabCount === 6 && doneClassLogic ? 'pass' : 'fail',
    `tabCount=${tabCount}, doneClass=${doneClassLogic}`,
  );

  const css = fs.readFileSync(styleCssPath, 'utf8');
  const portraitCss = css.includes('@media (orientation: portrait)') && css.includes('#panel-resizer');
  const resizerLogic = source.includes("resizer.addEventListener('pointerdown'") && source.includes('setPointerCapture');
  record(
    results,
    'ui.portrait-resizer-source',
    'Portrait 分隔條程式與樣式存在',
    portraitCss && resizerLogic ? 'pass' : 'warn',
    `css=${portraitCss}, logic=${resizerLogic}; 互動表現仍需瀏覽器實測。`,
  );

  record(
    results,
    'ui.console',
    '瀏覽器 console 無 uncaught error',
    'manual',
    '需在真實瀏覽器執行自動測試或手動巡檢確認。',
  );

  const singleFileOk = fs.existsSync(appJsPath) && !fs.existsSync(path.join(repoRoot, 'src'));
  const predictorInterfaceOk = source.includes('state.predictor = p => knnPredict')
    && source.includes('state.predictor = p => dtPredict')
    && source.includes('state.predictor = p => rfPredict');
  record(
    results,
    'code.single-file-predictor',
    'app.js 單檔且經由 state.predictor 接入算法',
    singleFileOk && predictorInterfaceOk ? 'pass' : 'fail',
    `singleFile=${singleFileOk}, predictorInterface=${predictorInterfaceOk}`,
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    repoRoot,
    pass: results.filter((item) => item.status === 'pass').length,
    fail: results.filter((item) => item.status === 'fail').length,
    warn: results.filter((item) => item.status === 'warn').length,
    manual: results.filter((item) => item.status === 'manual').length,
    results,
  };

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
  process.stdout.write(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  const payload = {
    generatedAt: new Date().toISOString(),
    error: String(error && error.stack ? error.stack : error),
  };
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.error(payload.error);
  process.exit(1);
});

// ── Dataset ───────────────────────────────────────────────────────────────────
const DATASETS = {
  iris: {
    name: 'Iris 鳶尾花',
    features: ['花萼長度', '花萼寬度', '花瓣長度', '花瓣寬度'],
    target: '品種',
    classes: ['Setosa', 'Versicolor', 'Virginica'],
    colors: ['#636EFA', '#EF553B', '#00CC96'],
    raw: [
      // Setosa (0)
      [5.1,3.5,1.4,0.2,0],[4.9,3.0,1.4,0.2,0],[4.7,3.2,1.3,0.2,0],[4.6,3.1,1.5,0.2,0],[5.0,3.6,1.4,0.2,0],
      [5.4,3.9,1.7,0.4,0],[4.6,3.4,1.4,0.3,0],[5.0,3.4,1.5,0.2,0],[4.4,2.9,1.4,0.2,0],[4.9,3.1,1.5,0.1,0],
      [5.4,3.7,1.5,0.2,0],[4.8,3.4,1.6,0.2,0],[4.8,3.0,1.4,0.1,0],[4.3,3.0,1.1,0.1,0],[5.8,4.0,1.2,0.2,0],
      [5.7,4.4,1.5,0.4,0],[5.4,3.9,1.3,0.4,0],[5.1,3.5,1.4,0.3,0],[5.7,3.8,1.7,0.3,0],[5.1,3.8,1.5,0.3,0],
      [5.4,3.4,1.7,0.2,0],[5.1,3.7,1.5,0.4,0],[4.6,3.6,1.0,0.2,0],[5.1,3.3,1.7,0.5,0],[4.8,3.4,1.9,0.2,0],
      [5.0,3.0,1.6,0.2,0],[5.0,3.4,1.6,0.4,0],[5.2,3.5,1.5,0.2,0],[5.2,3.4,1.4,0.2,0],[4.7,3.2,1.6,0.2,0],
      [4.8,3.1,1.6,0.2,0],[5.4,3.4,1.5,0.4,0],[5.2,4.1,1.5,0.1,0],[5.5,4.2,1.4,0.2,0],[4.9,3.1,1.5,0.2,0],
      [5.0,3.2,1.2,0.2,0],[5.5,3.5,1.3,0.2,0],[4.9,3.6,1.4,0.1,0],[4.4,3.0,1.3,0.2,0],[5.1,3.4,1.5,0.2,0],
      [5.0,3.5,1.3,0.3,0],[4.5,2.3,1.3,0.3,0],[4.4,3.2,1.3,0.2,0],[5.0,3.5,1.6,0.6,0],[5.1,3.8,1.9,0.4,0],
      [4.8,3.0,1.4,0.3,0],[5.1,3.8,1.6,0.2,0],[4.6,3.2,1.4,0.2,0],[5.3,3.7,1.5,0.2,0],[5.0,3.3,1.4,0.2,0],
      // Versicolor (1)
      [7.0,3.2,4.7,1.4,1],[6.4,3.2,4.5,1.5,1],[6.9,3.1,4.9,1.5,1],[5.5,2.3,4.0,1.3,1],[6.5,2.8,4.6,1.5,1],
      [5.7,2.8,4.5,1.3,1],[6.3,3.3,4.7,1.6,1],[4.9,2.4,3.3,1.0,1],[6.6,2.9,4.6,1.3,1],[5.2,2.7,3.9,1.4,1],
      [5.0,2.0,3.5,1.0,1],[5.9,3.0,4.2,1.5,1],[6.0,2.2,4.0,1.0,1],[6.1,2.9,4.7,1.4,1],[5.6,2.9,3.6,1.3,1],
      [6.7,3.1,4.4,1.4,1],[5.6,3.0,4.5,1.5,1],[5.8,2.7,4.1,1.0,1],[6.2,2.2,4.5,1.5,1],[5.6,2.5,3.9,1.1,1],
      [5.9,3.2,4.8,1.8,1],[6.1,2.8,4.0,1.3,1],[6.3,2.5,4.9,1.5,1],[6.1,2.8,4.7,1.2,1],[6.4,2.9,4.3,1.3,1],
      [6.6,3.0,4.4,1.4,1],[6.8,2.8,4.8,1.4,1],[6.7,3.0,5.0,1.7,1],[6.0,2.9,4.5,1.5,1],[5.7,2.6,3.5,1.0,1],
      [5.5,2.4,3.8,1.1,1],[5.5,2.4,3.7,1.0,1],[5.8,2.7,3.9,1.2,1],[6.0,2.7,5.1,1.6,1],[5.4,3.0,4.5,1.5,1],
      [6.0,3.4,4.5,1.6,1],[6.7,3.1,4.7,1.5,1],[6.3,2.3,4.4,1.3,1],[5.6,3.0,4.1,1.3,1],[5.5,2.5,4.0,1.3,1],
      [5.5,2.6,4.4,1.2,1],[6.1,3.0,4.6,1.4,1],[5.8,2.6,4.0,1.2,1],[5.0,2.3,3.3,1.0,1],[5.6,2.7,4.2,1.3,1],
      [5.7,3.0,4.2,1.2,1],[5.7,2.9,4.2,1.3,1],[6.2,2.9,4.3,1.3,1],[5.1,2.5,3.0,1.1,1],[5.7,2.8,4.1,1.3,1],
      // Virginica (2)
      [6.3,3.3,6.0,2.5,2],[5.8,2.7,5.1,1.9,2],[7.1,3.0,5.9,2.1,2],[6.3,2.9,5.6,1.8,2],[6.5,3.0,5.8,2.2,2],
      [7.6,3.0,6.6,2.1,2],[4.9,2.5,4.5,1.7,2],[7.3,2.9,6.3,1.8,2],[6.7,2.5,5.8,1.8,2],[7.2,3.6,6.1,2.5,2],
      [6.5,3.2,5.1,2.0,2],[6.4,2.7,5.3,1.9,2],[6.8,3.0,5.5,2.1,2],[5.7,2.5,5.0,2.0,2],[5.8,2.8,5.1,2.4,2],
      [6.4,3.2,5.3,2.3,2],[6.5,3.0,5.5,1.8,2],[7.7,3.8,6.7,2.2,2],[7.7,2.6,6.9,2.3,2],[6.0,2.2,5.0,1.5,2],
      [6.9,3.2,5.7,2.3,2],[5.6,2.8,4.9,2.0,2],[7.7,2.8,6.7,2.0,2],[6.3,2.7,4.9,1.8,2],[6.7,3.3,5.7,2.1,2],
      [7.2,3.2,6.0,1.8,2],[6.2,2.8,4.8,1.8,2],[6.1,3.0,4.9,1.8,2],[6.4,2.8,5.6,2.1,2],[7.2,3.0,5.8,1.6,2],
      [7.4,2.8,6.1,1.9,2],[7.9,3.8,6.4,2.0,2],[6.4,2.8,5.6,2.2,2],[6.3,2.8,5.1,1.5,2],[6.1,2.6,5.6,1.4,2],
      [7.7,3.0,6.1,2.3,2],[6.3,3.4,5.6,2.4,2],[6.4,3.1,5.5,1.8,2],[6.0,3.0,4.8,1.8,2],[6.9,3.1,5.4,2.1,2],
      [6.7,3.1,5.6,2.4,2],[6.9,3.1,5.1,2.3,2],[5.8,2.7,5.1,1.9,2],[6.8,3.2,5.9,2.3,2],[6.7,3.3,5.7,2.5,2],
      [6.7,3.0,5.2,2.3,2],[6.3,2.5,5.0,1.9,2],[6.5,3.0,5.2,2.0,2],[6.2,3.4,5.4,2.3,2],[5.9,3.0,5.1,1.8,2],
    ]
  }
};

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  dsKey: 'iris',
  rawData: [],
  data: [],
  normalized: false,
  activeTab: 'describe',
  selectedCol: 2,
  xFeat: 2,
  yFeat: 3,
  k: 5,
  trainX: [], trainY: [],
  testX:  [], testY:  [],
  lastPreds: [],
  accuracy: null,
  logs: [],
};

const PIPELINE_TABS = ['describe', 'preprocess', 'train', 'results'];

// ── Utils ─────────────────────────────────────────────────────────────────────
const ds   = () => DATASETS[state.dsKey];
const col  = i  => state.data.map(r => r[i]);
const mean = a  => a.reduce((s,v)=>s+v,0)/a.length;
const std  = a  => { const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length); };

function addLog(msg) {
  const now = new Date();
  const t = [now.getHours(),now.getMinutes(),now.getSeconds()]
              .map(n=>String(n).padStart(2,'0')).join(':');
  state.logs.unshift({ t, msg });
  if (state.activeTab === 'log') renderLogTab();
}

// ── k-NN ──────────────────────────────────────────────────────────────────────
function euclidean(a, b) {
  return Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i])**2, 0));
}

function knnPredict(trainX, trainY, point, k) {
  const dists = trainX.map((x,i)=>({ d: euclidean(x,point), y: trainY[i] }));
  dists.sort((a,b)=>a.d-b.d);
  const votes = {};
  dists.slice(0,k).forEach(n => votes[n.y]=(votes[n.y]||0)+1);
  return +Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0];
}

// ── Data Processing ───────────────────────────────────────────────────────────
function loadDataset(key) {
  state.dsKey    = key;
  state.rawData  = DATASETS[key].raw.map(r=>[...r]);
  state.data     = DATASETS[key].raw.map(r=>[...r]);
  state.normalized = false;
  state.accuracy   = null;
  addLog(`載入資料集：${DATASETS[key].name}（${DATASETS[key].raw.length} 筆）`);
}

function applyNormalization() {
  const nFeat = ds().features.length;
  const mins  = ds().features.map((_,i)=>Math.min(...state.rawData.map(r=>r[i])));
  const maxs  = ds().features.map((_,i)=>Math.max(...state.rawData.map(r=>r[i])));
  state.data = state.rawData.map(row => {
    const r = [...row];
    for (let i=0;i<nFeat;i++) r[i]=(row[i]-mins[i])/(maxs[i]-mins[i]);
    return r;
  });
  state.normalized = true;
  addLog(`套用正規化（Min-Max）：${ds().features.join('、')} → 縮放至 0～1`);
}

function splitAndTrain() {
  const nFeat    = ds().features.length;
  const shuffled = [...state.data].sort(()=>Math.random()-0.5);
  const cut      = Math.floor(shuffled.length*0.8);
  const train    = shuffled.slice(0,cut);
  const test     = shuffled.slice(cut);
  state.trainX   = train.map(r=>[r[state.xFeat],r[state.yFeat]]);
  state.trainY   = train.map(r=>r[nFeat]);
  state.testX    = test.map(r=>[r[state.xFeat],r[state.yFeat]]);
  state.testY    = test.map(r=>r[nFeat]);
  state.lastPreds = state.testX.map(p=>knnPredict(state.trainX,state.trainY,p,state.k));
  const correct  = state.lastPreds.filter((p,i)=>p===state.testY[i]).length;
  state.accuracy = (correct/state.testY.length*100).toFixed(1);
  addLog(`k-NN 訓練完成：k=${state.k}，特徵（${ds().features[state.xFeat]} × ${ds().features[state.yFeat]}），準確率 ${state.accuracy}%`);
}

// ── Plotly ────────────────────────────────────────────────────────────────────
const BASE = {
  paper_bgcolor: '#0d1117',
  plot_bgcolor:  '#0d1117',
  font:  { color:'#e6edf3', size:11 },
  xaxis: { gridcolor:'#30363d', zerolinecolor:'#30363d' },
  yaxis: { gridcolor:'#30363d', zerolinecolor:'#30363d' },
};
const CFG = { displayModeBar:false, responsive:true };

function renderHist(divId, values, color, title) {
  Plotly.newPlot(divId, [{
    type:'histogram', x:values, nbinsx:20,
    marker:{ color, opacity:0.8 },
  }], {
    ...BASE,
    title:  { text:title, font:{ size:10, color:'#8b949e' } },
    margin: { t:20, r:8, b:36, l:44 },
  }, CFG);
}

function renderDecisionBoundary(divId) {
  const d = ds();
  const xd = state.data.map(r=>r[state.xFeat]);
  const yd = state.data.map(r=>r[state.yFeat]);
  const xMin=Math.min(...xd)-0.3, xMax=Math.max(...xd)+0.3;
  const yMin=Math.min(...yd)-0.3, yMax=Math.max(...yd)+0.3;
  const step=(xMax-xMin)/70;

  const xs=[], ys=[], zs=[];
  for (let y=yMin; y<=yMax; y+=step) {
    const row=[];
    for (let x=xMin; x<=xMax; x+=step) {
      if (ys.length===0) xs.push(+x.toFixed(4));
      row.push(knnPredict(state.trainX,state.trainY,[x,y],state.k));
    }
    ys.push(+y.toFixed(4));
    zs.push(row);
  }

  const heatmap = {
    type:'heatmap', x:xs, y:ys, z:zs,
    colorscale:[[0,'rgba(99,110,250,0.25)'],[0.5,'rgba(239,85,59,0.25)'],[1,'rgba(0,204,150,0.25)']],
    showscale:false, zmin:0, zmax:2,
  };

  const trainS = d.classes.map((cls,ci)=>{
    const pts=state.trainX.filter((_,i)=>state.trainY[i]===ci);
    return { type:'scatter', mode:'markers', name:`${cls}（訓練）`,
      x:pts.map(p=>p[0]), y:pts.map(p=>p[1]),
      marker:{ color:d.colors[ci], size:7, line:{ color:'#ffffff88', width:1 } } };
  });

  const testS = d.classes.map((cls,ci)=>{
    const pts=state.testX.filter((_,i)=>state.testY[i]===ci);
    return { type:'scatter', mode:'markers', name:`${cls}（測試）`,
      x:pts.map(p=>p[0]), y:pts.map(p=>p[1]),
      marker:{ color:d.colors[ci], size:11, symbol:'diamond', line:{ color:'#fff', width:2 } } };
  });

  Plotly.newPlot(divId, [heatmap,...trainS,...testS], {
    ...BASE,
    xaxis:{ ...BASE.xaxis, title:d.features[state.xFeat] },
    yaxis:{ ...BASE.yaxis, title:d.features[state.yFeat] },
    legend:{ bgcolor:'#161b22', bordercolor:'#30363d', borderwidth:1, font:{ size:11 } },
    margin:{ t:16, r:10, b:54, l:60 },
  }, CFG);
}

// ── Tab Renderers ─────────────────────────────────────────────────────────────
function renderIntroTab() {
  document.getElementById('tab-content').innerHTML = `
    <div id="intro-tab">
      <img src="banner.png" alt="DataDojo 資料道場">
      <div class="intro-body">
        <h2>DataDojo 資料道場</h2>
        <p>LeafLune 旗下的互動式機器學習教學平台。在瀏覽器中體驗完整的資料分析與機器學習流程，不需要寫程式碼。</p>
        <h3>🎯 學習流程</h3>
        <p>📊 資料描述 → 🧹 前處理 → 🤖 訓練 / 測試 → 💡 結果解讀</p>
        <h3>✨ 平台特色</h3>
        <p>每一個操作都有即時的視覺回饋，讓你親眼看到資料的變化——正規化前後的分布對比、k 值改變時決策邊界即時變形。理解不靠死記，靠的是直接感受。</p>
        <h3>🤝 適合對象</h3>
        <p>技職學校學生、資料科學初學者、想直觀理解機器學習的任何人。</p>
      </div>
    </div>`;
}

function renderDescribeTab() {
  const d = ds();
  const featOpts = d.features.map((f,i)=>`<option value="${i}" ${i===state.selectedCol?'selected':''}>${f}</option>`).join('');
  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">📊 資料描述</div>
        <div class="ctrl-row">
          <span class="ctrl-label">選擇欄位</span>
          <select id="col-select">${featOpts}</select>
        </div>
        <div id="stats-row"></div>
        <p class="stage-desc">查看每個特徵的分布狀況，建立對資料的基本認識。</p>
      </div>
      <div class="stage-chart" id="col-hist"></div>
    </div>`;

  updateStats();
  renderHist('col-hist', col(state.selectedCol), '#00d4ff', '');

  document.getElementById('col-select').addEventListener('change', e=>{
    state.selectedCol=+e.target.value;
    updateStats();
    renderHist('col-hist', col(state.selectedCol), '#00d4ff', '');
  });
}

function renderPreprocessTab() {
  const applied = state.normalized;
  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">🧹 資料前處理</div>
        <div class="ctrl-row">
          <button class="btn btn-primary" id="btn-norm" ${applied?'disabled':''}>套用正規化（Min-Max）</button>
          ${applied?'<span class="norm-badge">✓ 已套用，數值縮放至 0～1</span>':''}
        </div>
        <p class="stage-desc">正規化將每個特徵縮放到 0～1，讓不同單位的特徵可以公平比較。套用後觀察右側前後對比——形狀不變，但 X 軸範圍縮進了。</p>
      </div>
      <div class="stage-chart" id="norm-chart"></div>
    </div>`;

  if (applied) renderBeforeAfter();

  document.getElementById('btn-norm')?.addEventListener('click', ()=>{
    applyNormalization();
    updateTable();
    renderPreprocessTab();
  });
}

function renderBeforeAfter() {
  document.getElementById('norm-chart').innerHTML = `
    <div class="before-after">
      <div><div class="chart-label">正規化前</div><div id="hist-before" class="chart-sub"></div></div>
      <div><div class="chart-label after">正規化後</div><div id="hist-after" class="chart-sub"></div></div>
    </div>`;
  const ci   = state.selectedCol;
  const name = ds().features[ci];
  renderHist('hist-before', state.rawData.map(r=>r[ci]), '#00d4ff', name);
  renderHist('hist-after',  state.data.map(r=>r[ci]),    '#3fb950', name+'（正規化後）');
}

function renderTrainTab() {
  const d    = ds();
  const opts = i => d.features.map((f,fi)=>`<option value="${fi}" ${fi===i?'selected':''}>${f}</option>`).join('');
  const acc  = state.accuracy ? `<span class="accuracy-badge">準確率 ${state.accuracy}%</span>` : '';
  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">🤖 訓練 / 測試</div>
        <div class="ctrl-row">
          <span class="ctrl-label">X 軸</span>
          <select id="x-feat">${opts(state.xFeat)}</select>
          <span class="ctrl-label">Y 軸</span>
          <select id="y-feat">${opts(state.yFeat)}</select>
        </div>
        <div class="ctrl-row">
          <span class="ctrl-label">k 值</span>
          <input type="range" id="k-slider" min="1" max="20" value="${state.k}">
          <span class="k-val" id="k-val">k = ${state.k}</span>
          <button class="btn btn-primary" id="btn-train">訓練</button>
          ${acc}
        </div>
        <p class="stage-desc">選擇兩個特徵，拖動 k 值滑桿後按「訓練」，觀察決策邊界如何變化。</p>
      </div>
      <div class="stage-chart" id="boundary-chart"></div>
    </div>`;

  if (state.accuracy) renderDecisionBoundary('boundary-chart');

  document.getElementById('x-feat').addEventListener('change', e=>{ state.xFeat=+e.target.value; });
  document.getElementById('y-feat').addEventListener('change', e=>{ state.yFeat=+e.target.value; });
  document.getElementById('k-slider').addEventListener('input', e=>{
    state.k=+e.target.value;
    document.getElementById('k-val').textContent=`k = ${state.k}`;
  });
  document.getElementById('btn-train').addEventListener('click', ()=>{
    splitAndTrain();
    renderTrainTab();
  });
}

function renderResultsTab() {
  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">💡 結果解讀</div>
        ${state.accuracy ? `
        <div class="ctrl-row">
          <span class="accuracy-badge" style="font-size:20px">準確率 ${state.accuracy}%</span>
          <span style="color:var(--muted);font-size:12px;margin-left:8px">
            k=${state.k}，測試集 ${state.testY.length} 筆，正確 ${Math.round(state.accuracy/100*state.testY.length)} 筆
          </span>
        </div>
        <p class="stage-desc">圓形 = 訓練資料，菱形 = 測試資料。背景色塊是決策邊界——模型認為該區域屬於哪個品種。</p>
        ` : `<p class="stage-desc" style="color:var(--orange)">請先到「訓練 / 測試」完成訓練。</p>`}
      </div>
      <div class="stage-chart" id="result-chart"></div>
    </div>`;

  if (state.accuracy) renderDecisionBoundary('result-chart');
}

function renderLogTab() {
  document.getElementById('tab-content').innerHTML = `
    <div id="log-tab">
      ${state.logs.length === 0
        ? '<p style="color:var(--muted);padding:16px">尚無操作記錄。</p>'
        : state.logs.map(l=>`
          <div class="log-item">
            <span class="log-time">${l.t}</span>
            <span class="log-msg">${l.msg}</span>
          </div>`).join('')}
    </div>`;
}

// ── Tab Switching ─────────────────────────────────────────────────────────────
const TAB_RENDERERS = {
  intro:      renderIntroTab,
  describe:   renderDescribeTab,
  preprocess: renderPreprocessTab,
  train:      renderTrainTab,
  results:    renderResultsTab,
  log:        renderLogTab,
};

function switchTab(tab) {
  state.activeTab = tab;

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active', 'done');
    if (b.dataset.tab === tab) b.classList.add('active');
  });

  // pipeline stage 進度標記
  const stageIdx = PIPELINE_TABS.indexOf(tab);
  if (stageIdx >= 0) {
    PIPELINE_TABS.forEach((t, i) => {
      const btn = document.querySelector(`.tab-btn[data-tab="${t}"]`);
      if (!btn) return;
      if (i < stageIdx) btn.classList.add('done');
    });
  }

  TAB_RENDERERS[tab]?.();
}

// ── Left Panel ────────────────────────────────────────────────────────────────
function updateTable() {
  const d     = ds();
  const nFeat = d.features.length;
  const thead = document.querySelector('#data-table thead');
  const tbody = document.querySelector('#data-table tbody');

  thead.innerHTML = `<tr>
    ${d.features.map(f=>`<th>${f}</th>`).join('')}
    <th class="target-col">${d.target}</th>
  </tr>`;

  tbody.innerHTML = state.data.map(row=>`<tr>
    ${row.slice(0,nFeat).map(v=>`<td>${v.toFixed(state.normalized?3:1)}</td>`).join('')}
    <td class="target-col">${d.classes[row[nFeat]]}</td>
  </tr>`).join('');

  document.getElementById('data-count').textContent = `${state.data.length} 筆`;
}

function updateStats() {
  const vals = col(state.selectedCol);
  const m=mean(vals), s=std(vals);
  const el = document.getElementById('stats-row');
  if (!el) return;
  el.innerHTML = [
    ['平均',m.toFixed(2)],['標準差',s.toFixed(2)],
    ['最小',Math.min(...vals).toFixed(2)],['最大',Math.max(...vals).toFixed(2)],
    ['筆數',vals.length],
  ].map(([l,v])=>`<div class="stat-box"><div class="stat-label">${l}</div><div class="stat-value">${v}</div></div>`).join('');
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  loadDataset('iris');
  updateTable();
  switchTab('describe');

  document.getElementById('dataset-select').addEventListener('change', e=>{
    loadDataset(e.target.value);
    state.normalized=false; state.accuracy=null;
    updateTable();
    switchTab(state.activeTab);
  });

  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', ()=>switchTab(b.dataset.tab));
  });
}

window.addEventListener('load', init);

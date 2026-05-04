// ── Dataset Metadata ───────────────────────────────────────────────────────────
const DATASET_META = {
  iris: {
    name: 'Iris 鳶尾花',
    file: 'data/iris.csv',
    features: ['花萼長度 (cm)', '花萼寬度 (cm)', '花瓣長度 (cm)', '花瓣寬度 (cm)'],
    target: '品種',
    featureCount: 4,
    classes: ['Setosa', 'Versicolor', 'Virginica'],
    colors: ['#636EFA', '#EF553B', '#00CC96'],
    defaultX: 2,
    defaultY: 3,
  },
  penguins: {
    name: 'Palmer 企鵝',
    file: 'data/penguins.csv',
    features: ['嘴長 (mm)', '嘴深 (mm)', '翅膀長 (mm)', '體重 (g)'],
    target: '品種',
    featureCount: 4,
    classes: ['Adelie', 'Chinstrap', 'Gentoo'],
    colors: ['#636EFA', '#EF553B', '#00CC96'],
    defaultX: 0,
    defaultY: 2,
  },
  breast_cancer: {
    name: '乳癌診斷',
    file: 'data/breast_cancer.csv',
    features: ['半徑', '紋理', '周長', '面積', '光滑度', '凹度'],
    target: '診斷',
    featureCount: 6,
    classes: ['Benign', 'Malignant'],
    colors: ['#3fb950', '#f78166'],
    defaultX: 0,
    defaultY: 5,
  },
  titanic: {
    name: 'Titanic 鐵達尼號',
    file: 'data/titanic.csv',
    features: ['船艙等級', '性別(女0男1)', '年齡', '手足配偶數', '父母子女數', '票價'],
    target: '存活',
    featureCount: 6,
    classes: ['未存活', '存活'],
    classMap: { '0': 0, '1': 1 },
    colors: ['#f78166', '#3fb950'],
    defaultX: 0,
    defaultY: 5,
  },
  heart_disease: {
    name: '心臟病診斷',
    file: 'data/heart_disease.csv',
    features: ['年齡', '性別(女0男1)', '胸痛類型', '靜態血壓', '膽固醇', '最高心率'],
    target: '心臟病',
    featureCount: 6,
    classes: ['無', '有'],
    classMap: { '0': 0, '1': 1 },
    colors: ['#3fb950', '#f78166'],
    defaultX: 0,
    defaultY: 5,
  },
  pima_diabetes: {
    name: 'Pima 糖尿病',
    file: 'data/pima_diabetes.csv',
    features: ['懷孕次數', '血糖值', '血壓', 'BMI', '糖尿病遺傳指數', '年齡'],
    target: '糖尿病',
    featureCount: 6,
    classes: ['無', '有'],
    classMap: { '0': 0, '1': 1 },
    colors: ['#3fb950', '#f78166'],
    defaultX: 1,
    defaultY: 3,
  },
  mall_customers: {
    name: '商場顧客',
    file: 'data/mall_customers.csv',
    features: ['年齡', '年收入(千$)', '消費分數'],
    featureCount: 3,
    unsupervised: true,
    defaultX: 1,
    defaultY: 2,
  },
};

const CLASS_COLORS = ['#636EFA','#EF553B','#00CC96','#AB63FA','#FFA15A','#19D3F3','#FF6692'];

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  dsKey: 'iris',
  rawData: [],
  data: [],
  normalized: false,
  activeTab: 'intro',
  selectedCol: 0,
  xFeat: 2,
  yFeat: 3,
  k: 5,
  algorithm: 'knn',
  dtDepth: 4,
  dtModel: null,
  nTrees: 20,
  rfModel: null,
  kClusters: 3,
  kmResult: null,
  predictor: null,
  trainX: [], trainY: [],
  testX:  [], testY:  [],
  lastPreds: [],
  accuracy: null,
  logs: [],
};

const PIPELINE_TABS = ['describe', 'preprocess', 'train', 'results'];

// ── Utils ─────────────────────────────────────────────────────────────────────
const ds   = () => DATASET_META[state.dsKey];
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

// ── Decision Tree (CART) ──────────────────────────────────────────────────────
function gini(y) {
  if (!y.length) return 0;
  const n = y.length, c = {};
  y.forEach(v => c[v] = (c[v]||0) + 1);
  return 1 - Object.values(c).reduce((s,v) => s + (v/n)**2, 0);
}

function bestSplit(X, y) {
  const n = X.length, nF = X[0].length;
  let bestGain = -1, bestF = 0, bestT = 0;
  const base = gini(y);

  for (let f = 0; f < nF; f++) {
    const idxs = Array.from({length:n},(_,i)=>i).sort((a,b)=>X[a][f]-X[b][f]);
    const sy = idxs.map(i=>y[i]), sx = idxs.map(i=>X[i][f]);
    const lc = {}, rc = {};
    sy.forEach(v => rc[v]=(rc[v]||0)+1);
    for (let k=0; k<n-1; k++) {
      const v=sy[k];
      lc[v]=(lc[v]||0)+1; rc[v]--; if(!rc[v]) delete rc[v];
      if (sx[k]===sx[k+1]) continue;
      const ln=k+1, rn=n-ln;
      const lG=1-Object.values(lc).reduce((s,c)=>s+(c/ln)**2,0);
      const rG=1-Object.values(rc).reduce((s,c)=>s+(c/rn)**2,0);
      const gain=base-(ln/n)*lG-(rn/n)*rG;
      if (gain>bestGain){bestGain=gain;bestF=f;bestT=(sx[k]+sx[k+1])/2;}
    }
  }
  return {f:bestF, t:bestT, gain:bestGain};
}

function buildTree(X, y, depth, maxDepth) {
  const c={}; y.forEach(v=>c[v]=(c[v]||0)+1);
  const leaf=+Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];
  if (depth>=maxDepth || y.length<=3 || new Set(y).size===1) return {leaf};
  const {f,t,gain}=bestSplit(X,y);
  if (gain<=0) return {leaf};
  const lm=X.map(x=>x[f]<=t), rm=X.map(x=>x[f]>t);
  return {f,t,
    left: buildTree(X.filter((_,i)=>lm[i]),y.filter((_,i)=>lm[i]),depth+1,maxDepth),
    right:buildTree(X.filter((_,i)=>rm[i]),y.filter((_,i)=>rm[i]),depth+1,maxDepth),
  };
}

function dtPredict(node, pt) {
  if ('leaf' in node) return node.leaf;
  return pt[node.f]<=node.t ? dtPredict(node.left,pt) : dtPredict(node.right,pt);
}

function buildForest(X, y, nTrees, maxDepth) {
  const trees = [];
  for (let t = 0; t < nTrees; t++) {
    const idx = Array.from({length: X.length}, () => Math.floor(Math.random() * X.length));
    trees.push(buildTree(idx.map(i=>X[i]), idx.map(i=>y[i]), 0, maxDepth));
  }
  return trees;
}

function rfPredict(trees, pt) {
  const counts = {};
  trees.forEach(t => { const p = dtPredict(t, pt); counts[p] = (counts[p]||0)+1; });
  return +Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
}

function kMeans(X, k, maxIter=100) {
  const n = X.length, dim = X[0].length;
  const used = new Set();
  let centroids = [];
  while (centroids.length < k) {
    const i = Math.floor(Math.random() * n);
    if (!used.has(i)) { used.add(i); centroids.push([...X[i]]); }
  }
  let labels = new Array(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    const newLabels = X.map(pt => {
      let best = 0, minD = Infinity;
      centroids.forEach((c,ci) => {
        const d = pt.reduce((s,v,d) => s+(v-c[d])**2, 0);
        if (d < minD) { minD = d; best = ci; }
      });
      return best;
    });
    if (newLabels.every((l,i) => l === labels[i])) break;
    labels = newLabels;
    centroids = Array.from({length:k}, (_,ci) => {
      const pts = X.filter((_,i) => labels[i] === ci);
      if (!pts.length) return centroids[ci];
      return Array.from({length:dim}, (_,d) => pts.reduce((s,p) => s+p[d], 0)/pts.length);
    });
  }
  const inertia = X.reduce((s,pt,i) => {
    const c = centroids[labels[i]];
    return s + pt.reduce((ss,v,d) => ss+(v-c[d])**2, 0);
  }, 0);
  return { labels, centroids, inertia };
}

function computeElbow(X) {
  return Array.from({length:8}, (_,i) => {
    const k = i + 2;
    return { x: k, y: +kMeans(X, k).inertia.toFixed(0) };
  });
}

function renderClusterScatter(divId) {
  const d = ds();
  const { labels, centroids } = state.kmResult;
  const k = state.kClusters;
  const X = state.data.map(r => [r[state.xFeat], r[state.yFeat]]);
  const traces = Array.from({length:k}, (_,ci) => {
    const pts = X.filter((_,i) => labels[i] === ci);
    return {
      type:'scatter', mode:'markers', name:`群 ${ci+1}`,
      x: pts.map(p=>p[0]), y: pts.map(p=>p[1]),
      marker:{ color: CLASS_COLORS[ci % CLASS_COLORS.length], size:7, opacity:0.8 },
    };
  });
  traces.push({
    type:'scatter', mode:'markers', name:'中心點',
    x: centroids.map(c=>c[0]), y: centroids.map(c=>c[1]),
    marker:{ color:'#fff', size:14, symbol:'x', line:{color:'#000',width:2} },
  });
  Plotly.newPlot(divId, traces, {
    ...BASE,
    xaxis:{ ...BASE.xaxis, title:{ text:d.features[state.xFeat], font:{size:10} } },
    yaxis:{ ...BASE.yaxis, title:{ text:d.features[state.yFeat], font:{size:10} } },
    margin:{ t:16, r:8, b:48, l:52 },
    showlegend:true, legend:{ font:{ color:'#e6edf3', size:10 } },
  }, CFG);
}

function computeAccuracyCurve() {
  const { trainX, trainY, testX, testY, algorithm, dtDepth } = state;
  if (!trainX.length) return null;
  const acc = (preds) => +(preds.filter((p,i)=>p===testY[i]).length / testY.length * 100).toFixed(1);
  if (algorithm === 'knn') {
    return Array.from({length:20},(_,i)=>({ x:i+1, y:acc(testX.map(p=>knnPredict(trainX,trainY,p,i+1))) }));
  }
  if (algorithm === 'dt') {
    return Array.from({length:10},(_,i)=>({ x:i+1, y:acc(testX.map(p=>dtPredict(buildTree(trainX,trainY,0,i+1),p))) }));
  }
  if (algorithm === 'rf') {
    return [5,10,15,20,30,40,50].map(n=>({ x:n, y:acc(testX.map(p=>rfPredict(buildForest(trainX,trainY,n,dtDepth),p))) }));
  }
  return null;
}

// ── Data Processing ───────────────────────────────────────────────────────────
async function loadDataset(key) {
  const meta = DATASET_META[key];
  state.dsKey       = key;
  state.normalized  = false;
  state.accuracy    = null;
  state.algorithm   = 'knn';
  state.predictor   = null;
  state.selectedCol = 0;
  state.xFeat       = meta.defaultX;
  state.yFeat       = meta.defaultY;
  state.trainX = []; state.trainY = [];
  state.testX  = []; state.testY  = [];
  state.lastPreds   = [];

  let rows;
  if (meta._rawData) {
    rows = meta._rawData;
  } else {
    const text  = await fetch(meta.file).then(r => r.text());
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (meta.unsupervised) {
      rows = lines.slice(1).map(line => {
        const parts = line.split(',').map(s => s.trim());
        return parts.slice(0, meta.featureCount).map(Number);
      }).filter(r => r.every(v => !isNaN(v)));
    } else {
      rows = lines.slice(1).map(line => {
        const parts    = line.split(',').map(s => s.trim());
        const features = parts.slice(0, meta.featureCount).map(Number);
        const raw = parts[meta.featureCount];
        const classIdx = meta.classMap ? (meta.classMap[raw] ?? -1) : meta.classes.indexOf(raw);
        return [...features, classIdx];
      }).filter(r => r[meta.featureCount] !== -1);
    }
  }

  state.kmResult = null;
  state.rawData = rows;
  state.data    = rows.map(r => [...r]);
  addLog(`載入資料集：${meta.name}（${rows.length} 筆）`);
}

function handleCSVUpload(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) { addLog('⚠️ CSV 格式錯誤：需要至少一列 header 與一筆資料'); return; }

    const headers     = lines[0].split(',').map(s => s.trim());
    const featureCount = headers.length - 1;
    if (featureCount < 1) { addLog('⚠️ CSV 至少需要一個特徵欄位與一個目標欄位'); return; }

    const featureCols = headers.slice(0, featureCount);
    const targetHeader = headers[featureCount];

    const rawRows = lines.slice(1).map(l => l.split(',').map(s => s.trim()));
    const targetVals = rawRows.map(r => r[featureCount]);
    const uniqueTargets = [...new Set(targetVals)];

    const allNumeric = uniqueTargets.every(v => !isNaN(v) && v !== '');
    let classes, toIdx;
    if (allNumeric) {
      const sorted = [...new Set(uniqueTargets.map(Number))].sort((a,b)=>a-b);
      classes = sorted.map(v => `Class ${v}`);
      toIdx   = v => sorted.indexOf(Number(v));
    } else {
      classes = uniqueTargets;
      toIdx   = v => uniqueTargets.indexOf(v);
    }

    const rows = rawRows.map(parts => {
      const features = parts.slice(0, featureCount).map(Number);
      const classIdx = toIdx(parts[featureCount]);
      return [...features, classIdx];
    }).filter(r => r[featureCount] >= 0 && r.slice(0, featureCount).every(v => !isNaN(v)));

    if (rows.length === 0) { addLog('⚠️ CSV 解析後無有效資料列'); return; }

    const dsName = file.name.replace(/\.csv$/i, '');
    const key    = 'upload_' + Date.now();
    DATASET_META[key] = {
      name: dsName,
      file: null,
      _rawData: rows,
      features: featureCols,
      target: targetHeader,
      featureCount,
      classes,
      colors: classes.map((_,i) => CLASS_COLORS[i % CLASS_COLORS.length]),
      defaultX: 0,
      defaultY: Math.min(1, featureCount - 1),
    };

    const select = document.getElementById('dataset-select');
    const opt = new Option(`📁 ${dsName}`, key);
    select.add(opt);
    select.value = key;

    loadDataset(key).then(() => { updateTable(); switchTab('describe'); });
  };
  reader.readAsText(file);
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
  if (ds().unsupervised) {
    const X = state.data.map(r => [r[state.xFeat], r[state.yFeat]]);
    state.kmResult = kMeans(X, state.kClusters);
    state.accuracy = null;
    addLog(`k-means 分群：k=${state.kClusters}，特徵（${ds().features[state.xFeat]} × ${ds().features[state.yFeat]}），群內誤差 ${state.kmResult.inertia.toFixed(0)}`);
    return;
  }

  const nFeat    = ds().features.length;
  const shuffled = [...state.data].sort(()=>Math.random()-0.5);
  const cut      = Math.floor(shuffled.length*0.8);
  const train    = shuffled.slice(0,cut);
  const test     = shuffled.slice(cut);
  state.trainX   = train.map(r=>[r[state.xFeat],r[state.yFeat]]);
  state.trainY   = train.map(r=>r[nFeat]);
  state.testX    = test.map(r=>[r[state.xFeat],r[state.yFeat]]);
  state.testY    = test.map(r=>r[nFeat]);

  if (state.algorithm === 'knn') {
    state.predictor = p => knnPredict(state.trainX, state.trainY, p, state.k);
    addLog(`k-NN 訓練：k=${state.k}，特徵（${ds().features[state.xFeat]} × ${ds().features[state.yFeat]}）`);
  } else if (state.algorithm === 'dt') {
    state.dtModel   = buildTree(state.trainX, state.trainY, 0, state.dtDepth);
    state.predictor = p => dtPredict(state.dtModel, p);
    addLog(`Decision Tree 訓練：depth=${state.dtDepth}，特徵（${ds().features[state.xFeat]} × ${ds().features[state.yFeat]}）`);
  } else {
    state.rfModel   = buildForest(state.trainX, state.trainY, state.nTrees, state.dtDepth);
    state.predictor = p => rfPredict(state.rfModel, p);
    addLog(`Random Forest 訓練：${state.nTrees} 棵樹，depth=${state.dtDepth}，特徵（${ds().features[state.xFeat]} × ${ds().features[state.yFeat]}）`);
  }

  state.lastPreds = state.testX.map(p => state.predictor(p));
  const correct  = state.lastPreds.filter((p,i)=>p===state.testY[i]).length;
  state.accuracy = (correct/state.testY.length*100).toFixed(1);
  addLog(`準確率 ${state.accuracy}%（測試集 ${state.testY.length} 筆）`);
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
      row.push(state.predictor([x,y]));
    }
    ys.push(+y.toFixed(4));
    zs.push(row);
  }

  const colorscale = d.classes.length === 2
    ? [[0,'rgba(63,185,80,0.25)'],[1,'rgba(247,129,102,0.25)']]
    : [[0,'rgba(99,110,250,0.25)'],[0.5,'rgba(239,85,59,0.25)'],[1,'rgba(0,204,150,0.25)']];

  const heatmap = {
    type:'heatmap', x:xs, y:ys, z:zs,
    colorscale, showscale:false, zmin:0, zmax:d.classes.length-1,
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
        <p>LeafLune 旗下的互動式機器學習教學平台，讓你在瀏覽器中體驗完整的資料分析與機器學習流程——不需要安裝軟體，不需要寫程式碼。</p>

        <p>學 ML 有一個幾乎所有人都遇過的困境：<strong style="color:var(--text)">聽理論很順，一進入實操就卡關。</strong>影片裡的圖解清楚生動，但真的要動手，不是要先學 Python，就是要面對像 Weka 這樣功能堆滿卻毫無引導的工具——難度一口氣跳了好幾級。</p>
        <p>DataDojo 就是專門填補這個斷層的地方。<strong style="color:var(--cyan)">看完理論，立刻在這裡動手操作</strong>——不需要寫程式，介面友善，每一步都有即時的視覺回饋，讓你親眼看到資料的變化，而不是對著一堆數字猜發生了什麼事。</p>

        <h3>📋 操作流程</h3>
        <ul class="intro-list">
          <li><strong>📊 資料描述</strong>　載入資料集，查看各欄位的分布、平均值、標準差，建立對資料的基本認識</li>
          <li><strong>🧹 前處理</strong>　套用正規化，觀察數值縮放前後的分布變化，理解為何需要前處理</li>
          <li><strong>🤖 訓練 / 測試</strong>　選擇特徵與演算法，調整參數，即時觀察決策邊界的變化</li>
          <li><strong>💡 結果解讀</strong>　查看準確率與預測分布，理解模型在測試資料上的表現</li>
        </ul>

        <h3>🗺️ 學習地圖</h3>
        <div class="intro-audience">
          <div class="audience-row"><span class="aud-who">國中小</span><span class="aud-sep">→</span><span class="aud-what">認識資料：平均數、標準差、分布圖，資料描述就是終點</span></div>
          <div class="audience-row"><span class="aud-who">高中 / 技職</span><span class="aud-sep">→</span><span class="aud-what">資料清理與前處理，親眼看到資料品質如何影響結果</span></div>
          <div class="audience-row"><span class="aud-who">大學生</span><span class="aud-sep">→</span><span class="aud-what">走完整個 pipeline，從資料載入到模型評估一條龍</span></div>
          <div class="audience-row aud-next"><span class="aud-who">專業人士</span><span class="aud-sep">→</span><span class="aud-what">帶著在 DataDojo 建立的直覺，銜接 Kaggle 或 Python 生態系實戰</span></div>
        </div>
        <p style="color:var(--muted);font-size:12px;margin-top:8px">同一個平台，不同的出口。介面設計自然引導你走多深，不強迫選擇。</p>

        <div class="intro-footer">
          <span>📊 DataDojo</span>
          <span style="color:var(--border)">×</span>
          <span>LeafLune Edutainment Studio</span>
        </div>

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

  if (d.unsupervised) {
    const inertiaLabel = state.kmResult
      ? `<span class="accuracy-badge">群內誤差 ${state.kmResult.inertia.toFixed(0)}</span>` : '';
    document.getElementById('tab-content').innerHTML = `
      <div class="stage-tab">
        <div class="stage-controls">
          <div class="stage-title">🔵 分群 / k-means</div>
          <div class="ctrl-row">
            <span class="ctrl-label">X 軸</span>
            <select id="x-feat">${opts(state.xFeat)}</select>
            <span class="ctrl-label">Y 軸</span>
            <select id="y-feat">${opts(state.yFeat)}</select>
          </div>
          <div class="ctrl-row">
            <span class="ctrl-label">群數 k</span>
            <input type="range" id="k-clusters" min="2" max="10" value="${state.kClusters}">
            <span class="k-val" id="k-clusters-val">k = ${state.kClusters}</span>
          </div>
          <div class="ctrl-row">
            <button class="btn btn-primary" id="btn-train">分群</button>
            ${inertiaLabel}
          </div>
          <p class="stage-desc">k-means 不需要標準答案，自動將資料分成 k 群。到成效頁看 Elbow 曲線找最佳 k。</p>
        </div>
        <div class="stage-chart" id="boundary-chart"></div>
      </div>`;
    if (state.kmResult) renderClusterScatter('boundary-chart');
    document.getElementById('x-feat').addEventListener('change', e=>{ state.xFeat=+e.target.value; });
    document.getElementById('y-feat').addEventListener('change', e=>{ state.yFeat=+e.target.value; });
    document.getElementById('k-clusters').addEventListener('input', e=>{
      state.kClusters=+e.target.value;
      document.getElementById('k-clusters-val').textContent=`k = ${state.kClusters}`;
    });
    document.getElementById('btn-train').addEventListener('click', ()=>{
      splitAndTrain(); renderTrainTab();
    });
    return;
  }

  const algo = state.algorithm;
  const desc = algo === 'knn'
    ? 'k 越小邊界越鋸齒（過擬合），k 越大越平滑（欠擬合）。'
    : algo === 'dt'
    ? '深度越深邊界越細緻，但可能過擬合訓練資料。'
    : '多棵決策樹各自投票，集體決策比單棵樹更穩定。';

  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">🤖 訓練 / 測試</div>
        <div class="ctrl-row">
          <span class="ctrl-label">算法</span>
          <select id="algo-select">
            <option value="knn" ${algo==='knn'?'selected':''}>k-NN</option>
            <option value="dt"  ${algo==='dt' ?'selected':''}>Decision Tree</option>
            <option value="rf"  ${algo==='rf' ?'selected':''}>Random Forest</option>
          </select>
          <span class="ctrl-label">X 軸</span>
          <select id="x-feat">${opts(state.xFeat)}</select>
          <span class="ctrl-label">Y 軸</span>
          <select id="y-feat">${opts(state.yFeat)}</select>
        </div>
        <div class="ctrl-row" id="knn-params" style="${algo==='knn'?'':'display:none'}">
          <span class="ctrl-label">k 值</span>
          <input type="range" id="k-slider" min="1" max="20" value="${state.k}">
          <span class="k-val" id="k-val">k = ${state.k}</span>
        </div>
        <div class="ctrl-row" id="dt-params" style="${algo!=='knn'?'':'display:none'}">
          <span class="ctrl-label">最大深度</span>
          <input type="range" id="depth-slider" min="1" max="10" value="${state.dtDepth}">
          <span class="k-val" id="depth-val">depth = ${state.dtDepth}</span>
        </div>
        <div class="ctrl-row" id="rf-params" style="${algo==='rf'?'':'display:none'}">
          <span class="ctrl-label">樹的數量</span>
          <input type="range" id="ntrees-slider" min="5" max="50" step="5" value="${state.nTrees}">
          <span class="k-val" id="ntrees-val">${state.nTrees} 棵</span>
        </div>
        <div class="ctrl-row">
          <button class="btn btn-primary" id="btn-train">訓練</button>
          ${acc}
        </div>
        <p class="stage-desc">選擇算法與特徵後按「訓練」，觀察決策邊界。${desc}</p>
      </div>
      <div class="stage-chart" id="boundary-chart"></div>
    </div>`;

  if (state.accuracy) renderDecisionBoundary('boundary-chart');

  document.getElementById('algo-select').addEventListener('change', e=>{
    state.algorithm=e.target.value; state.accuracy=null; state.predictor=null;
    renderTrainTab();
  });
  document.getElementById('x-feat').addEventListener('change', e=>{ state.xFeat=+e.target.value; });
  document.getElementById('y-feat').addEventListener('change', e=>{ state.yFeat=+e.target.value; });
  document.getElementById('k-slider')?.addEventListener('input', e=>{
    state.k=+e.target.value;
    document.getElementById('k-val').textContent=`k = ${state.k}`;
  });
  document.getElementById('depth-slider')?.addEventListener('input', e=>{
    state.dtDepth=+e.target.value;
    document.getElementById('depth-val').textContent=`depth = ${state.dtDepth}`;
  });
  document.getElementById('ntrees-slider')?.addEventListener('input', e=>{
    state.nTrees=+e.target.value;
    document.getElementById('ntrees-val').textContent=`${state.nTrees} 棵`;
  });
  document.getElementById('btn-train').addEventListener('click', ()=>{
    splitAndTrain();
    renderTrainTab();
  });
}

function renderConfusionMatrix(divId) {
  const d = ds();
  const n = d.classes.length;
  const mat = Array.from({length:n},()=>Array(n).fill(0));
  state.lastPreds.forEach((pred,i)=>mat[state.testY[i]][pred]++);
  const total = state.testY.length;

  let metricsHtml = '';
  if (n === 2) {
    const tp=mat[1][1],fp=mat[0][1],fn=mat[1][0],tn=mat[0][0];
    const prec = tp/(tp+fp)||0, rec = tp/(tp+fn)||0;
    const f1   = 2*prec*rec/(prec+rec)||0;
    metricsHtml = `<div class="cm-metrics">
      <div class="cm-metric"><div class="cm-metric-label">精確率</div><div class="cm-metric-val">${(prec*100).toFixed(1)}%</div></div>
      <div class="cm-metric"><div class="cm-metric-label">召回率</div><div class="cm-metric-val">${(rec*100).toFixed(1)}%</div></div>
      <div class="cm-metric"><div class="cm-metric-label">F1</div><div class="cm-metric-val">${f1.toFixed(3)}</div></div>
      <div class="cm-metric"><div class="cm-metric-label">TP</div><div class="cm-metric-val" style="color:var(--green)">${tp}</div></div>
      <div class="cm-metric"><div class="cm-metric-label">TN</div><div class="cm-metric-val" style="color:var(--green)">${tn}</div></div>
      <div class="cm-metric"><div class="cm-metric-label">FP+FN</div><div class="cm-metric-val" style="color:var(--orange)">${fp+fn}</div></div>
    </div>`;
  }

  const header = `<tr><th class="cm-corner">實際 ↓ 預測 →</th>${d.classes.map((c,ci)=>`<th style="color:${d.colors[ci]}">${c}</th>`).join('')}</tr>`;
  const bodyRows = mat.map((row,ri)=>`<tr>
    <th style="color:${d.colors[ri]}">${d.classes[ri]}</th>
    ${row.map((v,ci)=>`<td class="cm-cell ${ri===ci?'cm-correct':'cm-wrong'}">${v}<span class="cm-pct">${(v/total*100).toFixed(1)}%</span></td>`).join('')}
  </tr>`).join('');

  document.getElementById(divId).innerHTML = `<div class="cm-wrap">
    ${metricsHtml}
    <div class="cm-hint">對角線（綠色）= 預測正確；其餘 = 混淆</div>
    <table class="cm-table"><thead>${header}</thead><tbody>${bodyRows}</tbody></table>
  </div>`;
}

function renderAccuracyCurve(divId, curveData, xLabel, currentX) {
  const xs = curveData.map(p=>p.x), ys = curveData.map(p=>p.y);
  Plotly.newPlot(divId, [{
    type:'scatter', mode:'lines+markers', x:xs, y:ys,
    line:{ color:'#58a6ff', width:2 },
    marker:{ color:xs.map(x=>x===currentX?'#f78166':'#58a6ff'), size:8 },
  }], {
    ...BASE,
    title:{ text:`${xLabel} vs 準確率`, font:{ size:11, color:'#8b949e' } },
    xaxis:{ ...BASE.xaxis, title:{ text:xLabel, font:{size:10} } },
    yaxis:{ ...BASE.yaxis, title:{ text:'準確率 (%)', font:{size:10} }, range:[0,100] },
    margin:{ t:30, r:16, b:48, l:52 },
  }, CFG);
}

function renderResultsTab() {
  if (ds().unsupervised) {
    document.getElementById('tab-content').innerHTML = `
      <div class="stage-tab">
        <div class="stage-controls">
          <div class="stage-title">💡 分群結果</div>
          ${state.kmResult
            ? `<p class="stage-desc">群數 k=${state.kClusters}，群內誤差 ${state.kmResult.inertia.toFixed(0)}。Elbow 曲線：找誤差下降開始趨緩的轉折點，那就是最佳 k。</p>`
            : `<p class="stage-desc" style="color:var(--orange)">請先到「訓練」完成分群。</p>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;overflow-y:auto;flex:1;min-height:0">
          <div id="cluster-chart" style="flex:1;min-height:220px"></div>
          ${state.kmResult ? '<div id="elbow-chart" style="height:220px"></div>' : ''}
        </div>
      </div>`;
    if (state.kmResult) {
      renderClusterScatter('cluster-chart');
      const X = state.data.map(r => [r[state.xFeat], r[state.yFeat]]);
      const elbow = computeElbow(X);
      Plotly.newPlot('elbow-chart', [{
        type:'scatter', mode:'lines+markers', x:elbow.map(p=>p.x), y:elbow.map(p=>p.y),
        line:{color:'#58a6ff',width:2},
        marker:{color:elbow.map(p=>p.x===state.kClusters?'#f78166':'#58a6ff'), size:8},
      }], {
        ...BASE,
        title:{ text:'Elbow 曲線：群數 vs 群內誤差', font:{size:11,color:'#8b949e'} },
        xaxis:{ ...BASE.xaxis, title:{text:'群數 k',font:{size:10}} },
        yaxis:{ ...BASE.yaxis, title:{text:'群內誤差',font:{size:10}} },
        margin:{ t:30, r:16, b:48, l:60 },
      }, CFG);
    }
    return;
  }

  const algo = state.algorithm;
  const algoLabel = algo==='knn' ? `k-NN（k=${state.k}）`
    : algo==='dt' ? `Decision Tree（depth=${state.dtDepth}）`
    : `Random Forest（${state.nTrees} 棵，depth=${state.dtDepth}）`;
  const curveLabel = algo==='knn' ? 'k 值' : algo==='dt' ? '樹深度' : '樹的數量';
  const curveDesc  = algo==='knn'
    ? 'k 太小容易過擬合，k 太大容易欠擬合，紅點是目前選擇的 k。'
    : algo==='dt'
    ? '深度越深邊界越複雜，但過深會過擬合，紅點是目前深度。'
    : '樹越多結果越穩定，紅點是目前棵數。';

  document.getElementById('tab-content').innerHTML = `
    <div class="stage-tab">
      <div class="stage-controls">
        <div class="stage-title">💡 結果解讀</div>
        ${state.accuracy ? `
        <div class="ctrl-row">
          <span class="accuracy-badge" style="font-size:18px">準確率 ${state.accuracy}%</span>
          <span style="color:var(--muted);font-size:12px;margin-left:10px">
            ${algoLabel} · 測試集 ${state.testY.length} 筆 · 正確 ${Math.round(state.accuracy/100*state.testY.length)} 筆
          </span>
        </div>
        <p class="stage-desc">混淆矩陣：橫軸是模型預測，縱軸是真實答案。對角線是答對的，其他格子是搞錯的。</p>
        ` : `<p class="stage-desc" style="color:var(--orange)">請先到「訓練」完成訓練。</p>`}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;overflow-y:auto;flex:1;min-height:0">
        <div id="result-chart"></div>
        ${state.accuracy ? `
        <div style="padding:0 8px">
          <p class="stage-desc" style="margin:0 0 4px">${curveLabel}掃描曲線：${curveDesc}</p>
        </div>
        <div id="curve-chart" style="height:220px"></div>` : ''}
      </div>
    </div>`;

  if (state.accuracy) {
    renderConfusionMatrix('result-chart');
    const curveData = computeAccuracyCurve();
    const currentX  = algo==='knn' ? state.k : algo==='dt' ? state.dtDepth : state.nTrees;
    if (curveData) renderAccuracyCurve('curve-chart', curveData, curveLabel, currentX);
  }
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

  if (d.unsupervised) {
    thead.innerHTML = `<tr>
      <th class="row-num">#</th>
      ${d.features.map(f=>`<th>${f}</th>`).join('')}
    </tr>`;
    tbody.innerHTML = state.data.map((row,idx)=>`<tr>
      <td class="row-num">${idx+1}</td>
      ${row.map(v=>`<td>${v.toFixed(state.normalized?3:1)}</td>`).join('')}
    </tr>`).join('');
    return;
  }

  thead.innerHTML = `<tr>
    <th class="row-num">#</th>
    ${d.features.map(f=>`<th>${f}</th>`).join('')}
    <th class="target-col">${d.target}</th>
  </tr>`;

  tbody.innerHTML = state.data.map((row,idx)=>`<tr>
    <td class="row-num">${idx+1}</td>
    ${row.slice(0,nFeat).map(v=>`<td>${v.toFixed(state.normalized?3:1)}</td>`).join('')}
    <td class="target-col">${d.classes[row[nFeat]]}</td>
  </tr>`).join('');
}

function initResizer() {
  const resizer = document.getElementById('panel-resizer');
  if (!resizer) return;
  const main      = document.getElementById('main');
  const right     = document.getElementById('rightPanel');
  const left      = document.getElementById('leftPanel');
  const tabBar    = document.getElementById('tab-bar');

  let dragging = false, startY = 0, startRightH = 0;

  resizer.addEventListener('pointerdown', e => {
    dragging    = true;
    startY      = e.clientY;
    startRightH = right.getBoundingClientRect().height;
    resizer.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  resizer.addEventListener('pointermove', e => {
    if (!dragging) return;
    const totalH   = main.getBoundingClientRect().height;
    const tabBarH  = tabBar.getBoundingClientRect().height;
    const resizerH = resizer.getBoundingClientRect().height;
    const minRight = tabBarH;
    const maxRight = totalH - resizerH;

    const delta   = e.clientY - startY;
    const newRight = Math.min(maxRight, Math.max(minRight, startRightH + delta));
    const newLeft  = totalH - newRight - resizerH;

    right.style.height = `${newRight}px`;
    left.style.height  = `${Math.max(0, newLeft)}px`;
  });

  resizer.addEventListener('pointerup',    () => { dragging = false; });
  resizer.addEventListener('pointercancel',() => { dragging = false; });
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
async function init() {
  switchTab('intro');
  await loadDataset('iris');
  updateTable();

  document.getElementById('dataset-select').addEventListener('change', async e => {
    await loadDataset(e.target.value);
    state.normalized = false;
    state.accuracy   = null;
    updateTable();
    switchTab('describe');
  });

  document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('csv-input').click();
  });
  document.getElementById('csv-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) { handleCSVUpload(file); e.target.value = ''; }
  });

  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', ()=>switchTab(b.dataset.tab));
  });

  initResizer();
}

window.addEventListener('load', init);

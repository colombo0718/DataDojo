# PROJECT.md — DataDojo 專案快速指引

## 這個專案是什麼

**DataDojo (DD)** 是 LeafLune 旗下的互動式機器學習教育平台，讓使用者在瀏覽器中體驗監督學習與非監督學習。
定位為網頁版 Weka，搭配視覺化讓學習者直觀理解各種 ML 算法的行為。
與 Rein Room (RR) 並列為 LeafLune 教育工具體系的兩大支柱：RR 主攻強化學習，DD 主攻傳統 ML。

## 線上網址

- GitHub：`https://github.com/colombo0718/DataDojo`
- 正式部署：待設定（目標：Cloudflare Pages）

---

## 品牌定位

- 隸屬：LeafLune Edutainment Studio
- 縮寫：DD
- 受眾：技職學校學生、資料科學初學者、對 ML 有興趣的一般大眾
- 推廣渠道：MOSME 平台嵌入（同 RR 路線）、勁園科教出版配套書籍

---

## 核心功能規劃

### 算法層（ml.js）
| 類別 | 算法 |
|------|------|
| 監督 - 分類 | k-NN、Decision Tree、Naive Bayes、Random Forest、SVM |
| 監督 - 迴歸 | 線性迴歸、多項式迴歸 |
| 非監督 - 分群 | k-means、DBSCAN |
| 降維 / 視覺化 | PCA、UMAP |

### 視覺化層（Plotly）
- 決策邊界圖
- 混淆矩陣
- ROC 曲線
- 分群散點圖
- PCA / UMAP 投影圖

### 資料層
- CSV 上傳與解析
- 內建示範資料集（Iris、MNIST 子集等）
- 缺失值處理、特徵正規化

---

## 與 RR 的連動

| 方向 | 說明 |
|------|------|
| RR → DD | RR 的 SAR 軌跡、Q-table 可匯入 DD 做 UMAP 分群、PCA 分析（找不同打法流派） |
| DD → RR | DD 訓練出的分類器（state → action）可匯入 RR 當作初始 policy（Behavioral Cloning） |

共通格式：`(state_vec, action_vec, reward, next_state_vec, done)`

---

## 技術棧

| 功能 | 技術 |
|------|------|
| ML 算法 | `ml.js`（mljs/ml） |
| 視覺化 | Plotly.js（與 RR 共用） |
| 神經網路 | TensorFlow.js（與 RR 共用） |
| 資料處理 | danfojs 或原生 JS |
| 部署 | Cloudflare Pages（靜態前端，無後端） |

---

## 開發規範

- 純前端，無後端，無資料庫——所有運算在瀏覽器完成
- 提交訊息中英文皆可，說明改了什麼即可
- 視覺風格參考 RR，保持 LeafLune 品牌一致性

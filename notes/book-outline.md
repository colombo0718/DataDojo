# DataDojo 配套書籍構想

> 狀態：章節架構確立 + ML 全景引言 + RL 後記補全（2026-05-02）
> 出版方向：勁園科教 / 自出版電子書（待確認）

---

## 定位

DataDojo 平台是「理論到實作」的橋，這本書是讓這座橋可以離線閱讀、系統性學習的配套文字版。

**目標讀者：** 技職高中 / 大一學生，有基本電腦操作能力，沒有程式基礎。
**學完之後能做什麼：** 在 DataDojo 上完整跑一個 ML 專案，並且有足夠直覺銜接到 Kaggle / Colab。

---

## 全書結構概覽

```
【引言節】第一章開頭：ML 全景（三大典範地圖）
    ↓
第一章  資料長什麼樣子          Iris
第二章  資料清洗與前處理         Breast Cancer
第三章  讓機器學會分類：k-NN     Palmer Penguins
第四章  讓規則說出來：決策樹     Titanic
第五章  模型表現好不好           Heart Disease
第六章  學太好也是問題           Pima Diabetes
第七章  不給答案也能學           Mall Customers
第八章  走進真實戰場             Kaggle / Colab 復現前七章
    ↓
【後記】第三條路：強化學習與 Rein Room
```

---

## 每章固定結構（模板）

1. **引言** — 這章要回答的一個問題
2. **資料集深度介紹** — 背景故事 + 收集方式 + 每個欄位的意義
3. **理論講解** — 概念 + 頓悟瞬間設計
4. **DataDojo 實作** — 步驟式操作指引（附截圖）
5. **Colab 對照程式碼** — 等效 Python，讓學生知道 DD 的按鈕背後是什麼

第八章例外：不介紹新資料集，專注 Kaggle/Colab 環境，並復現前七章全部實驗。

---

## 八章架構

---

### 【引言節】機器學習是什麼（第一章開頭，約 3 頁，無 DD 操作）

這一節不獨立成章，作為第一章的開場，給讀者一張進入正文前的地圖。

**Mitchell 定義（T/P/E）**
> 「如果一個程式在任務 T 上的表現 P 隨著經驗 E 的累積而提升，我們就說這個程式從 E 中學習了。」
>
> 翻譯成人話：給它看夠多的例子（E），它做分類的能力（P）就會變好（T）。

**三大學習典範**

| 典範 | 學習方式 | 本書涵蓋 | 延伸平台 |
|------|----------|----------|----------|
| 監督學習 | 有標準答案，從例子學規則 | ✅ 第三～六章 | DataDojo |
| 非監督學習 | 沒有答案，自己找規律 | ✅ 第七章 | DataDojo |
| 強化學習 | 在環境中行動，從獎懲中學 | 後記簡介 | Rein Room |

**學習 ≠ 記憶**
這是本書最重要的直覺，越早建立越好：模型不是把訓練資料背起來，而是從中提取出可以推廣到新資料的規律。背起來的模型在考試時會失敗——這就是「過擬合」，第六章會深入討論。

---

### 第一章｜資料長什麼樣子

**引言問題：** 機器學習的材料是資料——但「資料」到底是什麼形狀的？

**本章資料集：Iris 鳶尾花**
> 1936 年英國統計學家 Ronald Fisher 在加拿大加斯帕半島採集，三種鳶尾花各 50 株。這是史上被引用最多次的機器學習資料集，幾乎每本 ML 教材都從它開始——原因很簡單：花是大家都見過的東西，但三種花用眼睛很難分辨，機器卻能做到。
>
> 欄位：花萼長度、花萼寬度、花瓣長度、花瓣寬度（cm）、品種（Setosa / Versicolor / Virginica）

**理論：** 表格結構（列 = 觀測值、欄 = 特徵）、特徵 vs 標籤、數值 vs 類別、描述統計（平均、標準差、分布）

**DD 操作：** 載入 Iris → 看 `#` 行號 + 橘色目標欄 → 切換欄位看直方圖 → 對比花萼 vs 花瓣的分布差異

**Colab 對照：**
```python
import pandas as pd
df = pd.read_csv("iris.csv")
df.describe()           # 對應 DD 統計量列
df["花瓣長度"].hist()   # 對應 DD 直方圖
```

---

### 第二章｜資料清洗與前處理

**引言問題：** 資料收集回來就可以直接用了嗎？

**本章資料集：Breast Cancer Wisconsin（乳癌診斷）**
> 1995 年由威斯康辛大學醫院的醫師 William H. Wolberg 收集，從乳房腫塊的細針穿刺切片（FNA）計算出 30 個細胞核特徵。核心問題：這個腫塊是良性（Benign）還是惡性（Malignant）？
>
> 欄位意義有趣的地方：radius（核半徑）最大值約 28，但 area（面積）最大值超過 2500——同樣是描述「大小」，但數值差了 100 倍。這是理解正規化必要性的最佳範例。

**理論：** 量綱不一致對距離計算的影響、Min-Max 正規化原理、缺失值的三種處理策略

**DD 操作：** 載入 Breast Cancer → 描述 tab 看 radius vs area 的 x 軸差異 → 切到清理 tab → 按正規化 → 並排對比，確認形狀不變但 x 軸統一到 0~1

**Colab 對照：**
```python
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
df_scaled = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)
```

---

### 第三章｜讓機器學會分類：k-NN

**引言問題：** 機器怎麼「學」？它從資料中學到的「東西」長什麼樣子？

**本章資料集：Palmer Penguins（南極企鵝）**
> 2007-2009 年由 Dr. Kristen Gorman 在南極 Palmer 研究站收集，覆蓋三個島嶼的三種企鵝。這份資料集是 Iris 的「現代替代品」——同樣三個類別，同樣四個特徵，但主角從花變成企鵝，更有趣。
>
> 欄位：嘴長、嘴深（mm）、翅膀長（mm）、體重（g）、性別、品種（Adelie / Chinstrap / Gentoo）。翅膀長 vs 體重這兩個特徵幾乎可以線性分開 Gentoo，視覺上非常乾淨。

**理論：** 訓練 / 測試分割的必要性、k-NN 邏輯（距離 + 投票）、k 值對決策邊界的影響、過擬合的第一個直覺（k=1 死記答案）

**DD 操作：** 載入企鵝 → 訓練 tab 選翅膀長 × 體重 → 訓練（看圓形 vs 菱形的意義）→ 拉 k 從 1 到 15，觀察邊界從破碎到平滑

**Colab 對照：**
```python
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
knn.score(X_test, y_test)
```

---

### 第四章｜讓規則說出來：決策樹

**引言問題：** k-NN 的決策過程是一個黑盒子——有沒有一種模型，可以把它學到的規則直接說出來？

**本章資料集：Titanic**
> 1912 年 4 月 15 日，鐵達尼號沉沒，1502 人罹難。英國貿易委員會的調查紀錄留下了乘客的艙等、年齡、性別、票價等資訊。這是機器學習歷史上最有名的二元分類任務：給定乘客資料，預測他是否存活。
>
> 為什麼適合決策樹：存活的關鍵因素是「女士和小孩優先上救生艇」——這本身就是一套 if-else 規則，機器從資料中學到的決策樹會和歷史事實驚人地吻合。

**理論：** 決策樹邏輯（Gini 不純度、遞迴分割）、深度 vs 複雜度、可解釋性的代價、DT vs k-NN 的邊界形狀差異（水平/垂直 vs 曲線）

**DD 操作：** 載入 Titanic → 算法切換到 Decision Tree → 選性別 × 票價 → depth 從 2 到 8，觀察邊界從方塊到細碎 → 切換到 k-NN 同特徵對比邊界形狀

**Colab 對照：**
```python
from sklearn.tree import DecisionTreeClassifier, export_text

dt = DecisionTreeClassifier(max_depth=4)
dt.fit(X_train, y_train)
print(export_text(dt, feature_names=feature_names))
# 印出可讀的 if-else 規則
```

---

### 第五章｜模型表現好不好：評估指標

**引言問題：** 準確率 96% 聽起來很好——但如果資料有 96% 是同一類，猜全對也能到 96%。準確率說謊了嗎？

**本章資料集：Cleveland Heart Disease**
> 1988 年由美國克里夫蘭診所基金會收集，303 名受試者，包含年齡、性別、胸痛類型、靜止心電圖等 13 個臨床指標，目標是預測是否有心臟病。
>
> 這份資料集的教學價值在於：心臟病漏診（把有病的人說成沒病 = False Negative）的代價，遠大於誤診（把沒病的說成有病 = False Positive）。這讓「精確率 vs 召回率的取捨」有了真實的道德重量。

**理論：** 混淆矩陣四格（TP/FP/TN/FN）、精確率（你說的陽性中有多少是真的）vs 召回率（真正的陽性中你找到多少）、F1 score、不均衡資料集的陷阱

**DD 操作：** 載入心臟病資料 → 訓練 → 切到成效 tab → 讀混淆矩陣（對角線 vs 非對角線）→ 對比乳癌 / 心臟病兩個資料集，感受 FN 代價

**Colab 對照：**
```python
from sklearn.metrics import confusion_matrix, classification_report
print(classification_report(y_test, y_pred))
# precision, recall, f1 全部出來
```

> ⚠️ **DD 開發依賴：** 需新增 Heart Disease 資料集

---

### 第六章｜學太好也是問題：過擬合與欠擬合

**引言問題：** 模型在練習題（訓練集）上 100 分，在考試（測試集）卻只有 70 分——哪裡出問題了？

**本章資料集：Pima Indians Diabetes（糖尿病預測）**
> 1988 年美國國家糖尿病與消化腎臟病研究所收集，對象是美國亞利桑那州皮馬原住民婦女，768 人，8 個特徵（懷孕次數、血糖、血壓、BMI 等）。
>
> 皮馬族是世界上二型糖尿病發病率最高的族群之一，這份資料集被廣泛用於研究 ML 在醫療診斷上的應用。8 個特徵中有幾個高度相關（如血糖和胰島素），是展示特徵選擇效果的好例子。

**理論：** 偏差 vs 變異（bias-variance tradeoff）、訓練準確率 vs 測試準確率、k vs 準確率折線圖的形狀解讀、「甜蜜點」在中間

**DD 操作：** 載入糖尿病資料 → 掃描 k=1~20 → 看折線圖（訓練 vs 測試雙線）→ 找交叉點，感受甜蜜點

**Colab 對照：**
```python
from sklearn.model_selection import validation_curve
train_scores, test_scores = validation_curve(
    KNeighborsClassifier(), X, y,
    param_name="n_neighbors", param_range=range(1, 21)
)
```

> ⚠️ **DD 開發依賴：** 需新增 Diabetes 資料集 + k vs 準確率折線圖功能（TODO 中期）

---

### 第七章｜不給答案也能學：非監督分群

**引言問題：** 前六章的資料都有「正確答案」——如果根本沒有人標記答案，機器還能學到什麼嗎？

**本章資料集：Mall Customer Segmentation**
> 一家購物中心收集的顧客資料：年齡、年收入、消費評分（購物中心自行評估的 1~100 分）。沒有「正確分類」，沒有人告訴你顧客應該分成幾群——但這正是重點。
>
> 這份資料集的教學價值：任何人都能直覺地說「高收入高消費」是一群、「高收入低消費」是另一群——機器自己找出來的結果和直覺驚人地接近，讓學生親眼看到「資料本身的形狀說話」。

**理論：** 監督 vs 非監督的根本差異、k-means 迭代邏輯（隨機中心 → 分配 → 更新 → 收斂）、k 值選擇（Elbow method 直覺）、聚類結果的解讀與命名

**DD 操作：** 載入 Mall Customers → 切到非監督模式 → 選年收入 × 消費評分 → k 從 2 調到 7 → 找到 k=5 時最自然的分群 → 對比同資料用 k-NN 的結果

**Colab 對照：**
```python
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=5, random_state=42)
kmeans.fit(X)
# 和 DD 的結果比對
```

> ⚠️ **DD 開發依賴：** 需新增 Mall Customers 資料集 + k-means 功能（TODO 中期）

---

### 第八章｜走進真實戰場：Kaggle 與 Colab

**引言問題：** 前七章你用 DataDojo 做的每個實驗——在資料科學家的日常工具裡，長什麼樣子？

**本章無新資料集。** 復現前七章的所有實驗。

**結構：**
1. Colab 環境介紹（不需安裝，開 notebook 就能跑）
2. Kaggle 平台介紹（找到 Titanic、Iris 等入門 competition）
3. 依序復現 Ch1~7：每個實驗一個 cell block，和 DD 操作截圖並排
4. 讓學生體驗：「我在 DD 按的每個按鈕，背後就是這幾行 Python」

---

### 【後記】第三條路：強化學習與 Rein Room

**不獨立成章，約 2 頁，放在第八章之後。**

前八章走完了監督學習與非監督學習——機器學習三大典範，你已經走完兩條。

第三條路叫做**強化學習**。

它和前兩條路有一個根本差異：強化學習不看「資料集」，它看的是「環境」。Agent 在環境中採取行動，環境給出獎勵或懲罰，Agent 從中慢慢學會什麼行動在什麼情況下是好的。沒有人事先標記答案，也沒有自然群集可以找——Agent 必須靠自己的嘗試和錯誤摸索出策略。

這種學習方式讓 AI 學會了下圍棋（AlphaGo）、玩 Atari 電動（DQN）、控制機器手臂——凡是需要「在環境中做決策」的問題，強化學習往往是答案。

**Rein Room** 是為強化學習設計的互動平台，和 DataDojo 同屬 LeafLune 教育工具體系。你在 DataDojo 建立的直覺——算法怎麼學、怎麼評估、怎麼調參數——在 Rein Room 裡都用得上，只是舞台從靜態資料表換成了動態遊戲環境。

如果你對「機器怎麼學會玩遊戲」感到好奇，Rein Room 是下一站。

---

## 資料集分配總覽

| 章 | 資料集 | 已在 DD？ | 書的核心教學點 |
|----|--------|-----------|----------------|
| 1 | Iris 鳶尾花 | ✅ | 表格結構、描述統計 |
| 2 | Breast Cancer 乳癌診斷 | ✅ | 量綱差異、正規化 |
| 3 | Palmer Penguins 南極企鵝 | ✅ | k-NN、訓練測試分割 |
| 4 | Titanic 鐵達尼號 | ✅ | Decision Tree、可解釋性 |
| 5 | Cleveland Heart Disease 心臟病 | ❌ 待加 | 混淆矩陣、FP vs FN 代價 |
| 6 | Pima Indians Diabetes 糖尿病 | ❌ 待加 | 過擬合、k vs 準確率曲線 |
| 7 | Mall Customer Segmentation 顧客分群 | ❌ 待加 | k-means、非監督學習 |
| 8 | — | — | Kaggle/Colab 復現前七章 |

**現在可以動筆的章節：** 第一章 ~ 第四章（DD 功能已完整支援）
**等 DD 功能補齊：** 第五章（Heart Disease 資料集）、第六章（Diabetes + k vs 準確率曲線）、第七章（Mall Customers + k-means）

---

## 待確認

- [ ] 出版形式：實體書（勁園）/ 電子書 / PDF 講義
- [ ] 每章習題形式：操作題（在 DD 上做）+ 思考題
- [ ] 是否搭配錄製示範影片（YouTube，每章一支）
- [ ] 書名方向：《看見機器學習》？《資料道場》？《不用寫程式的機器學習》？

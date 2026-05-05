# DataDojo Checklist Report

Date: 2026-05-05

Scope:
- Main app kept read-only.
- New test artifacts were added only under `check/`.
- Static checks ran via `node check/codex-artifacts/dd_static_check.cjs`.
- Browser checks ran via `powershell -NoProfile -ExecutionPolicy Bypass -File check/codex-artifacts/run_dd_checks.ps1`.

Artifacts:
- `check/codex-artifacts/dd_static_check.cjs`
- `check/codex-artifacts/dd_browser_check.cjs`
- `check/codex-artifacts/run_dd_checks.ps1`
- `check/codex-artifacts/artifacts/dd-static-results.json`
- `check/codex-artifacts/artifacts/dd-browser-results.json`

## Summary

Overall, the project is in usable shape for the core browser ML flow. The biggest confirmed problems are:

1. `X / Y` feature changes do not clear old training results.
2. `data/penguins.csv` does not match the checklist expectation of 344 rows.
3. `data/breast_cancer.csv` does not match the checklist expectation of 569 rows and about 63/37 class balance.
4. Parameter sliders do not provide immediate model redraw; the user still has to click `訓練` or `分群`.

Confirmed strengths:

- Core no-code flow works in browser.
- Built-in datasets load.
- CSV upload works for both numeric and text labels.
- k-NN, Decision Tree, Random Forest, and k-means all run in browser.
- Confusion matrix, parameter curves, Elbow chart, portrait resizer, and console cleanliness all passed the executed checks.

## Purpose Layer

| Item | Status | Notes |
|---|---|---|
| 理論到實作的橋 | Partial | Intro copy, pipeline tabs, and no-code flow are present, but this still needs real classroom validation. |
| 不需要程式碼 | Pass | Browser flow can load data, preprocess, train, and inspect results without code. |
| 比 Weka 更親民 | Partial | Chinese UI and explanatory copy exist, but “more friendly than Weka” is still partly subjective. |
| 調參數有即時回饋 | Fail | Slider listeners only update state/labels. They do not auto-train or auto-redraw the chart. |
| 老師看得見學生做了什麼 | Partial | `log` tab exists and logs key actions, but reconstructability for assessment was not fully validated. |

## Teaching Layer

| Item | Status | Notes |
|---|---|---|
| 第一次使用零門檻 | Partial | Intro screen is visible and understandable, but the “60 秒內” claim still needs user testing. |
| 流程引導清楚 | Pass | Browser test confirmed tab order: `intro -> describe -> preprocess -> train -> results -> log`. |
| 空狀態有提示 | Pass | Untrained results tab shows `請先到「訓練」完成訓練。` |
| 引導文字在關鍵處說明「為什麼」 | Pass | Preprocess tab includes Min-Max / Z-score explanation text. |
| 手機可用 | Pass | Portrait mode resizer is visible, draggable, and produced no console/page errors. |
| 視覺化夠直觀 | Manual | Needs human teaching judgment. The charts exist and render correctly. |
| 不同程度都有東西看 | Partial | Describe tab, F1 metrics, and Elbow chart are all present, but educational depth still needs human judgment. |

## Functional Layer

### Data loading and parsing

| Item | Status | Notes |
|---|---|---|
| 七個內建資料集皆可正常載入 | Pass | Loaded counts: iris 150, penguins 105, breast_cancer 100, titanic 891, heart_disease 303, pima_diabetes 768, mall_customers 200. |
| 無監督資料集左表無 target 欄 | Pass | `mall_customers` header renders without target column. |
| CSV 上傳可解析數字標籤與文字標籤 | Pass | Browser upload test passed for both `0/1` and `cat/dog`. |
| classMap 機制正常 | Pass | Titanic / heart disease / pima all rendered Chinese labels correctly. |
| 切換資料集後 algorithm 重置為 k-NN，訓練結果清除 | Pass | Confirmed in static harness. |

### Preprocess tab

| Item | Status | Notes |
|---|---|---|
| 缺失值筆數偵測 | Pass | Verified with synthetic missing-value data. |
| 補平均值 / 補中位數 / 刪除該筆 | Pass | All three policies executed correctly in static harness. |
| Min-Max 縮放後值域 0~1 | Pass | Verified numerically. |
| Z-score 後均值≈0、標準差≈1 | Pass | Verified numerically. |
| 各欄位可個別設定不同縮放 | Pass | Untouched column stayed unchanged during mixed scaling test. |
| 套用後 3 位小數；重置後 1 位小數 | Pass | Verified from rendered table HTML. |
| 前後直方圖切換預覽欄位後正確更新 | Pass | Plot titles changed with selected column. |
| 套用前處理後清空 accuracy / predictor | Pass | Confirmed in static harness. |

### Train tab

| Item | Status | Notes |
|---|---|---|
| k-NN / DT / RF 皆正常訓練並渲染決策邊界 | Pass | Static harness and browser run both passed. |
| k-means 正常分群並渲染散點圖 | Pass | Browser `mall_customers` flow passed. |
| 各算法參數滑桿正常運作 | Pass | Listener existence and browser label update both passed. |
| X / Y 軸切換後訓練結果清除 | Fail | Browser result stayed visible: `beforeCount=1, afterCount=1`. Source listeners only change `state.xFeat` / `state.yFeat`. |

### Results tab

| Item | Status | Notes |
|---|---|---|
| 二元分類：混淆矩陣 + precision / recall / F1 | Pass | Verified in static harness with synthetic binary case. |
| 多元分類：N×N 混淆矩陣，無二元指標行 | Pass | Verified in static harness and browser Iris flow. |
| k-NN / DT / RF 參數掃描曲線正確，紅點標當前參數 | Pass | Static harness confirmed red marker logic. |
| k-means：分群散點圖 + Elbow 曲線正確，紅點標當前 k | Pass | Static harness and browser flow both passed. |
| 未訓練切到成效 tab 顯示提示，不崩潰 | Pass | Confirmed in browser and static harness. |

### Dataset quality

| Item | Status | Notes |
|---|---|---|
| Iris（150筆） | Pass | Actual rows 150, class split 50/50/50. |
| Palmer 企鵝（344筆） | Fail | Actual rows are 105, not 344. |
| 乳癌診斷（569筆，約 63/37） | Fail | Actual rows are 100 with 50/50 split, not 569 and not about 63/37. |
| Titanic（891筆，存活率 38.4%） | Pass | Actual rows 891, positive rate 0.3838. |
| 心臟病診斷（303筆，陽性率約 46%） | Pass | Actual rows 303, positive rate 0.4587. |
| Pima 糖尿病（768筆，陽性率約 35%） | Pass | Actual rows 768, positive rate 0.3490. |
| 商場顧客（200筆，5 個自然群） | Partial | Row count passed. “5 natural groups” and “best projection” still need human interpretation. |

### UI and code

| Item | Status | Notes |
|---|---|---|
| 六個 Tab 切換順暢，Pipeline 進度樣式正確 | Pass | Static and browser checks passed. |
| Portrait 分隔條可拖動，上限切齊 tab-bar 下緣 | Pass | Browser drag test passed. |
| `new Function(fs.readFileSync('app.js','utf8'))` 無語法錯誤 | Pass | Passed. |
| 瀏覽器 console 無 uncaught error | Pass | Intro, train, k-means, and portrait runs all had `consoleErrors=0, pageErrors=0`. |
| app.js 維持單檔；新算法透過 `state.predictor` 接入 | Pass | Source check passed. |

## Recommended next fixes

1. Clear `accuracy`, `predictor`, and old chart state when `#x-feat` or `#y-feat` changes.
2. Decide whether the checklist should match the shipped data, or the shipped data should be replaced to match the checklist for `penguins` and `breast_cancer`.
3. If “即時回饋” is a hard requirement, make slider changes retrain/redraw automatically instead of waiting for another button click.
4. If the `log` tab is meant for teacher assessment, define the minimum log granularity needed to reconstruct a student workflow.

## Re-run commands

```powershell
node check/codex-artifacts/dd_static_check.cjs
powershell -NoProfile -ExecutionPolicy Bypass -File check/codex-artifacts/run_dd_checks.ps1
```

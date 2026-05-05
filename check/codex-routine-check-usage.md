# Codex 例行檢查使用說明

這份文件說明如何用 CLI 呼叫 Codex，讓它在不同專案中執行例行巡檢、產出報告，並遵守固定規則。

## 固定規則

- Codex 只能動 `check\` 底下的內容
- `check\` 以外的任何路徑都不是 Codex 可以修改的地方
- 每個專案統一使用 `check\checklist.md` 作為巡檢清單
- 要了解專案內容時，讀的是 `PROJECT.md`
- `CLAUDE.md` 是給 Claude Code 的工作手冊，和 Codex 無關

## 巡檢時的讀寫邊界

### 可讀

- `PROJECT.md`
- `check\checklist.md`
- 專案中的程式碼與資料檔
- `check\` 內既有報告與既有副產品

### 可寫

- `check\codex-report_YYYY-MM-DD.md`
- `check\codex-artifacts\` 底下的所有副產品

### 不可寫

- `check\` 以外的所有地方
- `check\checklist.md`

## 報告與副產品規則

- 每日正式報告檔名固定為 `check\codex-report_YYYY-MM-DD.md`
- 所有副產品都放在 `check\codex-artifacts\`

副產品包含：

- 檢查腳本
- JSON 結果
- 暫存 CSV
- 截圖
- log
- 其他為了完成巡檢而產生的中間檔

## PowerShell 注意事項

在 Windows PowerShell 裡，直接執行 `codex` 可能會撞到 execution policy，因為它會優先走 `codex.ps1`。

所以建議一律改用：

```powershell
cmd /c codex.cmd ...
```

## 推薦命令

### 版本 A：較安全

這個版本適合一般日常巡檢。

```powershell
$repo = "C:\Path\To\Project"
$date = Get-Date -Format "yyyy-MM-dd"

@"
你現在在專案根目錄：$repo

任務：依照 check/checklist.md 做例行巡檢，並完成今日報告。

硬性規則：
- 你只能修改 check\ 底下的內容。
- check\ 以外任何地方都不能寫入。
- checklist 固定是 check/checklist.md。
- 了解專案只讀 PROJECT.md，不要把 CLAUDE.md 當成你的工作手冊。
- 正式報告只能寫成 check/codex-report_$date.md。
- 所有副產品（腳本、json、暫存 csv、截圖、log）一律放在 check/codex-artifacts/。
- 不要修改 check/checklist.md。
- 優先重用 check/codex-artifacts/ 既有腳本；沒有才新增。

執行要求：
- 先讀 PROJECT.md、check/checklist.md，以及 check/ 現有內容。
- 依 checklist 做靜態檢查與可行的瀏覽器/自動化檢查。
- 主觀項請標成 Manual 或 Partial，不要硬判成 Pass。
- 報告至少包含：摘要、Pass、Fail、Manual/Partial、產物清單、重跑命令。
- 最後在 stdout 只簡短回覆：是否完成、報告路徑、最重要的 3 個發現。
"@ | cmd /c codex.cmd -a never exec -C "$repo" -s workspace-write -
```

### 版本 B：完全無人值守

這個版本會跳過 approvals 與 sandbox。

只建議在你已經有外層 VM、容器或受控測試環境時使用。

```powershell
$repo = "C:\Path\To\Project"
$date = Get-Date -Format "yyyy-MM-dd"

@"
你現在在專案根目錄：$repo

任務：依照 check/checklist.md 做例行巡檢，並完成今日報告。

硬性規則：
- 你只能修改 check\ 底下的內容。
- check\ 以外任何地方都不能寫入。
- checklist 固定是 check/checklist.md。
- 了解專案只讀 PROJECT.md，不要把 CLAUDE.md 當成你的工作手冊。
- 正式報告只能寫成 check/codex-report_$date.md。
- 所有副產品都放在 check/codex-artifacts/。
- 不要修改 check/checklist.md。
- 優先重用 check/codex-artifacts/ 既有腳本；沒有才新增。
- 最後在 stdout 只簡短回覆：是否完成、報告路徑、最重要的 3 個發現。
"@ | cmd /c codex.cmd exec --dangerously-bypass-approvals-and-sandbox -C "$repo" -
```

## 建議固定提示詞

如果你要讓 Claude Code 代你呼叫 Codex，可以固定用下面這段提示詞：

```text
請對目前專案做例行巡檢。

規則：
- 你只能修改 check/ 底下的內容。
- check/ 以外任何地方都不能寫入。
- checklist 固定是 check/checklist.md。
- 了解專案只讀 PROJECT.md。
- 不要把 CLAUDE.md 當成你的工作手冊。
- check/ 根目錄只允許正式報告 codex-report_YYYY-MM-DD.md。
- 其他所有副產品都放 check/codex-artifacts/。
- 優先重用 check/codex-artifacts/ 既有巡檢腳本。
- 依 checklist 執行靜態檢查、可行的自動化檢查、瀏覽器檢查。
- 主觀項標為 Manual 或 Partial。
- 不要修改主程式，不要修改 checklist。
- 報告必須寫入 check/codex-report_YYYY-MM-DD.md。
- 報告至少包含：摘要、Pass、Fail、Manual/Partial、產物清單、重跑命令。
- 最後只回覆簡短摘要，不要重貼整份報告。
```

## 多專案時怎麼換

如果每個專案都已統一規格，那通常只要換專案根路徑即可：

```powershell
$repo = "C:\Path\To\AnotherProject"
```

因為以下名稱都已固定：

- `PROJECT.md`
- `check/checklist.md`
- `check/codex-report_YYYY-MM-DD.md`
- `check/codex-artifacts/`

## 建議報告結構

每日報告建議至少包含：

- Summary
- Purpose Layer
- Teaching Layer
- Functional Layer
- Confirmed Failures
- Manual / Partial Items
- Artifacts
- Re-run Commands

## 常見陷阱

### 1. 直接用 `codex`

不建議：

```powershell
codex exec "..."
```

建議：

```powershell
cmd /c codex.cmd exec "..."
```

### 2. 把副產品寫到 `check\` 根目錄

不建議：

- `check\test.json`
- `check\tmp.csv`
- `check\debug.png`

建議：

- `check\codex-artifacts\test.json`
- `check\codex-artifacts\tmp.csv`
- `check\codex-artifacts\debug.png`

### 3. 讀錯檔

Codex 要讀的是：

- `PROJECT.md`
- `check\checklist.md`

不是：

- `CLAUDE.md`

## 最短版本

如果你只想保留最精簡的用法，可以用這段：

```powershell
$repo = "C:\Path\To\Project"
$date = Get-Date -Format "yyyy-MM-dd"

@"
請對目前專案做例行巡檢。
- 只能修改 check/ 底下
- checklist 固定是 check/checklist.md
- 了解專案只讀 PROJECT.md
- 不要使用 CLAUDE.md 當工作手冊
- 正式報告只能寫 check/codex-report_$date.md
- 其他副產品都放 check/codex-artifacts/
- 不要修改 checklist
- 主觀項標 Manual 或 Partial
"@ | cmd /c codex.cmd -a never exec -C "$repo" -s workspace-write -
```

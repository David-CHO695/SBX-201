# SBX-201

David 的 AI 學習首頁與 30 分鐘番茄鐘，整合為繁體中文、免登入的單頁網站。

## 啟動

使用 Node.js 24 或更新版本，於本目錄執行：

```powershell
npm ci
npm run dev -- --host 127.0.0.1
```

開啟終端機顯示的本機網址。請透過 HTTP 伺服器使用，勿直接雙擊 index.html。

## 驗證與建置

```powershell
npm run test -- --run
npm run build
npm run preview -- --host 127.0.0.1
```

## 操作

- 主選單可前往學習首頁或番茄鐘；點外部或按 Escape 關閉。
- 問候按鈕累計點擊次數；三個顏色選項各自依紅、橙、黃、藍、紫循環。
- 番茄鐘固定 30 分鐘，提供開始、暫停／繼續及重置。
- 完成後需重置才能再次開始。首頁互動與導覽不影響倒數。
- 重新整理會清除計時、計次及顏色狀態。各分頁獨立操作。
- 不提供登入、筆記編輯、休息週期、提醒、歷史記錄或雲端同步。

產品需求見 PRD_SBX-201.md，驗收結果見 docs/ACCEPTANCE.md。

## 本次驗證環境

本機未提供 npm 指令，實際以 pnpm 11.19.0 安裝及驗證：

```powershell
pnpm install --lockfile=false
pnpm exec vitest run
pnpm run build
pnpm exec vite --host 127.0.0.1 --port 5173
```

npm 指令為一般使用方式，本次未實際執行 npm ci。請勿把 pnpm 啟動指令寫成 `pnpm run dev -- --host ...`，該版本會將額外 `--` 原樣傳入。

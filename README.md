# SBX-201

David 的 AI 學習首頁與 30 分鐘番茄鐘，整合為繁體中文、免登入的網站，提供學習首頁與番茄鐘兩個可切換頁面。

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

- 左上主選單提供學習首頁、番茄鐘與選項二／三；點外部或按 Escape 關閉。
- 首頁問候按鈕累計點擊次數；選單中的選項二／三各自依紅、橙、黃、藍、紫循環。
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

## 秒針音效

番茄鐘頁面新增音效開關，預設靜音；開啟後倒數每秒播放滴答。垂直音量控制為 1–10 段，預設 5，向上加大、向下降低。暫停、完成或重置後不播放。重新整理清除設定。音效使用瀏覽器 Web Audio，不需音訊檔案。

## 公開 repository 與部署

- GitHub repository：https://github.com/David-CHO695/SBX-201
- 網站預定網址：https://david-cho695.github.io/SBX-201/
- GitHub Pages 使用 Actions workflow，在 main 更新時先執行 npm ci、測試及 build，再發布 dist。
- Repository 的 Settings → Pages → Source 設為 GitHub Actions。
- 原有 base: './' 支援 repository 子路徑；#home 與 #pomodoro 不需伺服器額外路由設定。

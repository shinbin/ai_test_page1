<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/dd18e64b-64c0-486f-b0b6-9c7764f7a0ec

## 開發與部署指南

### 本地開發

1. **安裝套件**：
   ```bash
   npm install
   ```

2. **設定環境變數**：
   複製 `.env.example` 並重新命名為 `.env` 或 `.env.local`，填入您的 `GEMINI_API_KEY`。

3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   瀏覽器開啟：`http://localhost:3000`

### 建置專案

1. **編譯專案**：
   ```bash
   npm run build
   ```
   編譯後的檔案將存放在 `dist` 資料夾。

### 自動化部署 (GitHub Actions)

專案已設定 GitHub Actions。當您將程式碼推送到 `main` 分支時，將自動執行以下操作：
1. 簽出程式碼
2. 安裝相依套件
3. 建置專案
4. 部署至 **GitHub Pages**

#### 注意事項：
- 請確保在 GitHub Repository 的 `Settings > Pages` 中將 `Build and deployment` 的來源 (Source) 設定為 `GitHub Actions`。
- 本專案使用 Vite 4+ 版本，部署路徑請參考 `vite.config.ts` 中的 `base` 設定。


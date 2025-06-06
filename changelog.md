# 人工智慧導論 期末專案 Changelog

## 版本 1.1.2 (2025-06-05)

### ✨ 功能增強 (Enhancements)
- **井字棋統計修復**: 解決了 AI vs AI 統計數據顯示問題
  - 修正 HTML 結構中缺失的統計顯示元素
  - 修復 JavaScript 中的元素 ID 映射錯誤
  - 確保所有遊戲模式的統計數據正確顯示

### 🎨 界面改進 (UI Improvements)
- **首頁符號增強**: 增加首頁右側浮動符號種類
  - 新增井字棋符號 (`fa-th`)，代表井字棋遊戲
  - 新增語言符號 (`fa-language`)，代表英語學習應用
  - 隨機分佈優化：重新設計符號位置，避免重疊並提升視覺平衡
  - 動畫時序調整：優化動畫延遲時間，創造更自然的浮動效果
  - 總符號數量從4個增加到6個，更好地代表平台功能
  - 移除開發模式的「重新定位符號」測試按鈕，提升界面整潔度

- **嵌入式 PDF 閱讀器**: 添加網頁內 PDF 文件閱讀功能
  - 在「關於專案」區域整合嵌入式 PDF 閱讀器
  - 添加「在網頁中閱讀 PDF」按鈕，可直接打開內嵌閱讀器
  - 實現 PDF 閱讀器的平滑開啟/關閉動畫
  - 同時保留「在新分頁開啟」的外部 PDF 連結選項
  - 優化按鈕顏色，避免與 PDF 圖示顏色衝突
  - 優化閱讀器樣式，確保在各種設備上的良好顯示
  - 改用本地 PDF 檔案，提升載入速度和穩定性

### 🔧 錯誤修復 (Bug Fixes)
- **井字棋遊戲修復**: 解決了多個運行時錯誤
  - 修復 Game 類缺少 `restartGame()` 方法
  - 修復 UI 類缺少 `updateSoundButton()` 方法
  - 添加 `showMainMenu()` 和 `showGameBoard()` 方法
  - 移除重複的遊戲初始化代碼
  - 修復方法調用不匹配問題

### 🎮 遊戲測試完成
- **全功能測試**: 井字棋遊戲所有功能已測試並修復
- **界面流暢性**: 確保遊戲模式切換和界面響應正常
- **AI 功能**: 驗證 Minimax 算法在各難度級別下運行正常

## 版本 1.1.0 (2025-05-30)

### ✨ 新功能 (Features)
- **井字棋遊戲完成**: 完整實現井字棋遊戲，具備以下特色：
  - 🤖 **Minimax AI**: 採用經典 Minimax 算法配合 Alpha-Beta 剪枝
  - 🎯 **四種難度**: 簡單、普通、困難、專家級 AI 對手
  - 👥 **雙人模式**: 支援人類 vs 人類和人類 vs AI 對戰
  - 🎨 **現代界面**: 響應式設計，支援各種設備
  - 🔊 **音效系統**: 完整的遊戲音效和視覺反饋
  - 💾 **數據持久化**: 自動保存遊戲統計和用戶設定
  - ↩️ **撤銷功能**: 支援移動撤銷和遊戲重置

### 🏗️ 技術架構
- **純原生實現**: 使用純 JavaScript + CSS3 + HTML5，無外部依賴
- **模組化設計**: 採用 MVC 架構，包含以下核心模組：
  - `Game` 類別：遊戲主控制器
  - `Board` 類別：棋盤邏輯處理
  - `AI` 類別：Minimax 算法實現
  - `UI` 類別：用戶界面控制
  - `AudioManager` 類別：音效管理
  - `GameStorage` 類別：數據存儲管理

### 📁 檔案結構
```
tic_tac_toe/
├── index.html          # 主頁面
├── Readme.md           # 項目說明
├── goal.md             # 開發目標
├── changelog.md        # 變更日誌
├── css/               # 樣式檔案
├── js/                # JavaScript 檔案
└── assets/            # 資源檔案
```

### 🔄 網站更新
- 更新主頁面井字棋遊戲卡片狀態：從「開發中」改為「已完成」
- 新增井字棋遊戲連結，可直接從主頁面進入遊戲
- 更新遊戲資訊模態窗口，展示完整的功能特色和技術亮點

## 版本 1.0.1 (2025-05-30)

### 🔧 修正 (Fixes)
- **AI 實現描述修正**: 將網站上錯誤的 AlphaZero 描述修正為實際使用的 Minimax 演算法
  - 修正主頁面遊戲卡片描述：從 "AlphaZero 演算法" 改為 "Minimax 演算法"
  - 更新技術亮點：從 "AlphaZero 和 Minimax" 改為 "Minimax 和 Alpha-Beta 剪枝"
  - 修正技術棧標籤：將 "AlphaZero" 替換為準確的演算法名稱
  - 更新黑白棋遊戲頁面標題和副標題
  - 修正頁腳描述：從 "AlphaZero 強化學習" 改為 "ㄏ 演算法實現"

### 📝 技術分析
- **AI 實現確認**: 經過代碼分析確認實際使用的演算法：
  - 簡單難度：隨機選擇合法步
  - 普通難度：基於位置評分的策略選擇
  - 困難難度：Minimax 演算法 + Alpha-Beta 剪枝
  - 超難難度：嘗試載入機器學習模型，失敗時回退到 Minimax
- **模型文件檢查**: 發現訓練模型文件為空，確認未實際使用深度學習

### 🎯 改進效果
- 移除了誤導性的 AlphaZero 宣傳
- 提供準確的技術實現描述
- 確保用戶對 AI 能力有正確期待
- 維持專業性和誠實性

## 版本 1.0.0 (2025-05-30)

### ✨ 新功能 (Features)
- **黑白棋遊戲**: 完整的黑白棋遊戲實現
  - 支援人類 vs 人類、人類 vs AI、AI vs AI 三種遊戲模式
  - 四種 AI 難度等級：簡單、普通、困難、超難
  - 現代化的使用者介面設計
  - 音效系統和動畫效果
  - 遊戲狀態儲存功能

### 🤖 AI 實現
- **Minimax 演算法**: 主要的 AI 決策演算法
- **Alpha-Beta 剪枝**: 優化搜尋效率
- **位置評估函數**: 綜合考慮角落、邊緣、行動力等因素
- **戰略考量**: 避免危險位置、防止對手佔領角落

### 🎨 使用者介面
- 響應式網頁設計
- 現代化 CSS 動畫效果
- Font Awesome 圖示整合
- 直觀的遊戲控制介面

### 🛠️ 技術棧
- **前端**: HTML5, CSS3, JavaScript
- **AI 演算法**: Minimax, Alpha-Beta 剪枝
- **開發工具**: GitHub Copilot, VS Code, Git
- **部署**: GitHub Pages

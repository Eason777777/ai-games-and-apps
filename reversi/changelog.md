# 黑白棋專案 Changelog

## 版本 1.1.8 (2025-05-30)

### 新功能

- **完整實作悔棋功能**
  - **Human vs Human 模式**：支援撤銷最後一步移動
  - **Human vs AI 模式**：支援撤銷最近兩步移動（AI + 玩家），確保輪回到玩家回合
  - **AI vs AI 模式**：不提供悔棋功能，悔棋按鈕自動隱藏
  - 悔棋操作包含音效回饋和狀態提示
  - 智能檢測：避免在無足夠歷史記錄、遊戲結束或AI思考時執行悔棋

### 技術改進

- **棋盤邏輯層 (board.js)**
  - 修正了方法名稱不匹配問題：添加 `undoLastMove()` 方法
  - 完善了 `saveState()` 和 `undo()` 的狀態管理
  - 確保每次 `makeMove()` 都正確保存棋盤狀態供悔棋使用

- **遊戲邏輯層 (game.js)**
  - 重構 `undoMove()` 方法，支援不同遊戲模式的悔棋邏輯
  - 在 `setGameMode()` 中根據模式自動控制悔棋按鈕的顯示/隱藏
  - 添加悔棋後的回合調整邏輯，確保 Human vs AI 模式下始終輪到玩家

- **音效系統 (audio.js)**
  - 新增悔棋音效 `undo.mp3` 支援
  - 悔棋操作提供聽覺回饋，提升使用者體驗

### 介面改進

- **智能按鈕控制**
  - AI vs AI 模式下悔棋按鈕自動隱藏，避免誤觸
  - Human vs Human 和 Human vs AI 模式下悔棋按鈕正常顯示
  - 悔棋按鈕狀態根據移動歷史智能啟用/禁用

- **用戶體驗優化**
  - 提供清晰的悔棋限制說明（透過模態對話框）
  - 悔棋操作立即更新棋盤顯示和遊戲狀態
  - 保持遊戲流暢性，避免意外的 AI 觸發

## 版本 1.1.7 (2025-05-29)

### 介面改進

- **自定義遊戲規則彈出視窗樣式**
  - 為遊戲規則模態視窗設計了專屬的視覺樣式，與其他彈出介面區別開來
  - 更換了遊戲規則彈出視窗的背景顏色，使用深灰藍色背景 `rgba(44, 62, 80, 0.8)` 替代預設背景
  - 模態視窗內容採用藍色漸層背景 `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
  - 內容文字改為左對齊，取代原本的置中對齊，提升閱讀體驗
  - 添加藍色邊框和特殊陰影效果，使遊戲規則視窗更具辨識度
  - 標題保持置中對齊並添加底部分隔線，保持視覺層次

### 技術改進

- **JavaScript 架構優化**
  - 修改 `showGameRules()` 函數，新增參數標識遊戲規則模態視窗
  - 擴展 `showModalWithHTML()` 函數，支援條件式添加特殊 CSS 類別 `rules-modal`
  - 更新 `hideModal()` 函數，確保關閉時移除特殊樣式類別，避免影響其他模態視窗

- **CSS 模組化設計**
  - 新增 `.rules-modal` 樣式類別，專門為遊戲規則模態視窗設計
  - 保持其他模態視窗（AI 設定確認、錯誤訊息等）的原有樣式不變
  - 實現樣式隔離，確保不同類型的彈出視窗有各自的視覺特色

## 版本 1.1.6 (2025-05-29)

### 修復項目

- **修復了玩家跳過回合後可下子位置提示未更新的問題**
  - 修正了 `skipTurn()` 方法，當某一方無法下子切換到下一方後，會重新渲染棋盤
  - 確保切換玩家後會正確顯示新玩家的可下子位置（白點提示）
  - 提升了遊戲體驗，讓玩家能清楚看到輪到自己時有哪些位置可以下子

## 版本 1.1.5 (2025-05-29)

### 修復項目

- **完美修復了棋盤標籤對齊問題**
  - 修正了垂直標籤 (1-8) 與棋盤格子的精確對齊
  - 修正了水平標籤 (a-h) 與棋盤格子的精確對齊
  - 讓標籤圍繞正方形棋盤本身，而不是長方形的 board-container
  - 為棋盤添加適當邊距 (margin: 30px) 以容納標籤
  - 移除了容器的不必要填充，確保標籤定位準確
  - 更新了響應式設計，確保在不同螢幕尺寸下標籤仍正確對齊
  - 修改 JavaScript 標籤附加邏輯，將標籤直接附加到棋盤元素而非容器

## 版本 1.1.4 (2025-05-29)

### 修復項目

- 修復了缺少提示可下子位置（白點）的問題
- 修復了棋盤標籤 a~h 和 1~8 的對齊問題
- 添加了缺失的 UI.updateGameStatus 方法，解決了錯誤提示
- 修復了 AI vs AI 模式下確認按鈕無效的問題，為 ai-vs-ai-confirm 按鈕添加事件監聽器

## 版本 1.1.3 (2025-05-29)

### 修復項目

- 修復了遊戲初始化問題，在網頁加載時自動創建 Game 實例
- 確保 game.js 中的 init 方法能夠在網頁載入時正確執行
- 清理所有臨時檔案和備份檔案，讓專案結構更加乾淨

## 版本 1.1.2 (2025-05-29)

### 修復項目

- 修復了初始加載時錯誤顯示AI難度選擇界面的問題
- 修復了按鈕和棋盤無法互動的問題
- 添加了缺失的核心遊戲方法: handleCellClick, resetBoard, resetGame, undoMove, checkGameState, skipTurn
- 確保所有遊戲操作正常執行
- 修正了棋盤顯示問題，確保格子正確顯示
- 修復了 setDifficultyActive 方法中的參數順序問題
- 調整了AI難度選擇界面的預設隱藏狀態

### 改進項目

- 優化了初始載入時的UI顯示
- 改進了遊戲邏輯的錯誤處理
- 添加更多調試輸出，便於追蹤問題
- 強化了遊戲狀態切換的穩定性
- 完善了使用者交互體驗

## 版本 1.1.1 (2025-05-29)

### 修復項目

- 修復了UI介面中的格式問題，確保正確顯示棋盤和難度選擇界面
- 修復了AI難度選擇功能，現在黑白棋AI可以分別設置不同難度
- 修復了game.js和ui.js文件之間的整合問題，確保兩個文件的方法能夠正確調用
- 解決了游戲中可能出現的未定義方法錯誤
- 優化了模態視窗處理機制
- 確保黑子和白子的AI難度設置正確地保存和應用
- 修復了ai-vs-ai模式下的雙AI設置界面顯示問題

### 改進項目

- 將ui_fixed.js和game-fixed.js的修復版本分別應用到了ui.js和game.js
- 改進代碼格式，避免方法定義之間出現語法錯誤
- 確保所有事件監聽器正常工作
- 優化了view-rules功能的實現

## 版本 1.1.0 (2025-05-28)

### 新增功能

- 在 AI vs AI 模式中，允許為黑子和白子分別設置不同的 AI 難度
- 新增雙 AI 難度設定專用介面，同時提供黑子和白子的難度選項
- 支援黑白子分別設置四種難度級別：簡單、普通、困難、超難

### 架構改進

- 重構 Game 類別，以支援兩個獨立的 AI 對象
  - 新增 `blackAI` 和 `whiteAI` 屬性，分別管理黑白子 AI
  - 修改 `makeAIMove` 方法，根據當前玩家智能選擇對應的 AI
  - 更新 `setAIDifficulty` 方法，支持為特定顏色的 AI 設置難度
  
- 改進 UI 類別，支援雙 AI 難度設置
  - 修改 `setDifficultyActive` 方法，支援為黑白子分別高亮顯示難度選項
  - 更新 `showAIDifficultyOptions` 方法，根據遊戲模式顯示不同的介面
  - 在 `setModeActive` 方法中增加對 AI vs AI 模式的特殊處理

- 界面設計改進
  - 新增 CSS 樣式，優化黑白子難度選擇的視覺效果
  - 為黑白子難度選項添加獨特的視覺標識

### 新增檔案

- 新增 `ai_difficulty.css` 檔案，包含 AI vs AI 難度設置的專用樣式

## 版本 1.0.4 (2025-05-28)

### 錯誤修復

- 修復 AI vs AI 模式下未確認難度仍然啟動遊戲的問題
- 解決多次點擊 AI 難度按鈕導致「多個 AI 同時下棋」使棋盤顯示速度異常的問題
- 增強 AI 移動的安全檢查，防止多個 AI 同時思考和執行
- 在切換 AI 難度時正確重置遊戲狀態，避免異常操作

### 功能改進

- 優化 AI 對戰邏輯，增加移動之間的延遲時間，提升觀賞體驗
- AI 難度變更後立即顯示提示訊息，引導用戶點擊確認按鈕
- 強化 AI 設置確認流程，防止未確認設置就開始遊戲
- 新增 `resetBoard` 方法，實現更精確的棋盤重置控制

## 版本 1.0.3 (2025-05-26)

### 錯誤修復

- 修復 `Uncaught TypeError: this.board.switchPlayer is not a function` 錯誤
- 加強代碼健壯性，優化對方法不存在情況的處理
- 確保 `skipTurn` 和 `checkGameState` 方法在不同情況下都能正常運行
- 優化棋手切換邏輯，避免方法調用錯誤

## 版本 1.0.2 (2025-05-26)

### 界面優化

- 移動 AI 難度選擇區域從棋盤下方到上方，提高設置流程的直觀性
- 移除「保存遊戲」和「加載遊戲」按鈕，簡化介面
- 添加玩家棋子顏色選擇區域（黑/白），增加遊戲可自訂性
- 添加 AI 設定確認按鈕，確保玩家需先確認 AI 難度設定才能開始遊戲

### 樣式改進

- 改進遊戲信息區域的 CSS，解決分數顯示換行問題
- 優化棋子顏色選擇按鈕的樣式和互動效果
- 增強 AI 難度選擇區域的視覺呈現
- 添加動畫效果提升用戶體驗
- 更新棋盤標籤顯示，增加 a-h 與 1-8 的座標標示

### 代碼重構

- 重構棋盤渲染方法，提高效能
- 重新設計模態視窗關閉邏輯，確保遊戲流程的一致性
- 優化事件處理機制，解決事件傳播問題

### 對話記錄更新

#### 先前修改（版本 1.0.1 之前）

1. **界面調整**:
   - 移動了 AI 難度選擇區域到棋盤上方
   - 移除了「保存遊戲」和「加載遊戲」按鈕
   - 添加了玩家棋子顏色選擇區域（黑/白）
   - 添加了 AI 設定確認按鈕

2. **樣式優化**:
   - 改進了遊戲信息區域的 CSS，解決分數顯示換行問題
   - 優化了棋子顏色選擇按鈕的樣式和互動效果
   - 增強了 AI 難度選擇區域的視覺呈現
   - 添加了動畫效果提升用戶體驗

3. **功能增強**:
   - 實現了選擇玩家顏色功能
   - 實現了 AI 難度確認機制
   - 修復了程式錯誤 (hideModal 和 makeAIMove 函數缺失)

4. **代碼修改**:
   - 添加了 HTML 結構調整，包含玩家棋子顏色選擇區域和 AI 難度確認按鈕
   - 更新了相關的 CSS 樣式和 JavaScript 功能
   - 修復了功能錯誤和缺失的函數

## 版本 1.0.1 (2025-05-26)

### 錯誤修復

- 修復 `game.js` 中 `handleCellClick` 函數缺失的問題
- 修復 `game.js` 中 `checkGameState` 函數缺失的問題
- 修復 "AI設定已確認" 模態視窗的確認按鈕無效的問題，現在點擊確認後會正確處理AI設定
- 修復 "無法走步" 模態視窗的確認按鈕無效的問題，現在點擊確認或關閉按鈕後正確切換玩家回合
- 修復在 `board.js` 中添加缺失的 `hasValidMove`、`getScore`、`switchPlayer` 和 `isGameOver` 方法
- 優化模態視窗處理機制，確保無論點擊確認按鈕或關閉按鈕都能執行相同的回調函數

### 改進項目

- 在模態視窗機制中添加 `currentModalCallback` 追蹤當前模態視窗的回調函數
- 在 `skipTurn` 和其他關鍵函數中添加日誌輸出，便於調試和追蹤問題
- 重新設計模態視窗的關閉流程，確保遊戲邏輯的連貫性

## 版本 1.0.0 (2025-05-24)

### 新增功能

- 實現黑白棋基礎遊戲邏輯和規則
- 支援人對人、人對AI、AI對AI三種遊戲模式
- 提供三種AI難度：簡單、普通、困難
- 新增棋盤動畫效果和音效
- 支援悔棋功能
- 遊戲結果顯示和統計
- 使用彈出式遮罩顯示遊戲訊息，避免使用alert
- 實現跳過無法下棋的玩家回合
- 提供玩家顏色選擇功能 (當選擇人對AI模式時)
- 支援靜音/開啟音效切換
- 存檔和讀檔功能

### AI實現

- 簡單難度：隨機選擇有效落子位置
- 普通難度：基於位置評分策略，優先選擇角落和邊緣
- 困難難度：使用極小化極大算法（Minimax）搭配 Alpha-Beta 剪枝，預測深度5層

### UI界面

- 響應式設計，支援不同螢幕尺寸
- 美觀的黑白棋盤和棋子設計
- 下棋時的視覺動畫效果
- 清晰的遊戲狀態和分數顯示
- 直觀的控制按鈕和模式選擇

### 優化

- 基於 HTML5, CSS3 和原生 JavaScript 實現，無需外部框架依賴
- 適合在 GitHub Pages 上部署
- 支援本地存儲遊戲進度功能

## 對話記錄

### 對話 1 (2025-05-26)

#### 報告的問題

1. `game.js:78 Uncaught TypeError: this.handleCellClick is not a function`
2. `Uncaught (in promise) TypeError: this.checkGameState is not a function`
3. "AI設定已確認" 模態視窗的確認按鈕沒有作用
4. "無法走步" 提示視窗的確認按鈕沒有反應，只能點擊右上角的叉叉關閉，但關閉後沒有切換另一方下子

#### 問題分析與解決方案

1. **`handleCellClick` 函數缺失**：
   - 問題：在棋盤點擊事件中調用了未定義的 `handleCellClick` 函數。
   - 解決方案：添加 `handleCellClick` 方法以處理棋盤點擊事件，實現棋子放置、判斷合法性、更新棋盤等功能。

2. **`checkGameState` 函數缺失**：
   - 問題：在 AI 移動方法中調用了未定義的 `checkGameState` 函數。
   - 解決方案：添加 `checkGameState` 方法用於檢查遊戲狀態，判斷遊戲是否結束。

3. **`board.js` 中缺少關鍵方法**：
   - 問題：缺少必要的 `hasValidMove`、`getScore`、`switchPlayer` 和 `isGameOver` 方法。
   - 解決方案：在 `board.js` 中實現這些方法，確保遊戲邏輯正常運作。

4. **模態視窗確認按鈕無效**：
   - 問題：模態視窗的確認按鈕點擊後沒有執行回調函數。
   - 解決方案：
     * 在 UI 類中引入 `currentModalCallback` 變量追蹤當前模態視窗的回調函數
     * 修改 `showModal` 和 `showModalWithHTML` 方法，確保點擊確認按鈕和關閉按鈕都會執行回調函數
     * 優化模態視窗關閉流程，確保遊戲邏輯的連貫性

5. **"無法走步" 提示沒有正確切換玩家**：
   - 問題：關閉 "無法走步" 提示後，沒有切換到另一玩家。
   - 解決方案：修改 `skipTurn` 方法，確保在模態視窗關閉時正確切換玩家並更新棋盤顯示。

#### 實施的改進

1. 所有修復均已完成，遊戲現在應該可以順暢運行
2. 添加了調試日誌，幫助追蹤和解決問題
3. 優化了用戶體驗，確保模態視窗的交互更加直觀

### 具體代碼修改記錄

#### HTML 結構調整
1. 添加了玩家棋子顏色選擇區域:
   ```html
   <div id="player-color-selection" style="display: none;">
       <h3><i class="fas fa-palette"></i> 選擇您的棋子顏色</h3>
       <div class="color-selection-buttons">
           <button id="select-black" class="color-btn active">
               <div class="piece-preview black"></div> 黑子 (先手)
           </button>
           <button id="select-white" class="color-btn">
               <div class="piece-preview white"></div> 白子 (後手)
           </button>
       </div>
   </div>
   ```

2. 移動 AI 難度選擇至棋盤上方，並添加確認按鈕:
   ```html
   <div class="ai-difficulty" id="ai-difficulty">
       <h2><i class="fas fa-sliders-h"></i> AI 難度</h2>
       <div class="button-group difficulty-buttons">
           <button id="easy" class="difficulty-btn"><i class="fas fa-baby"></i> 簡單</button>
           <button id="medium" class="difficulty-btn"><i class="fas fa-user-graduate"></i> 普通</button>
           <button id="hard" class="difficulty-btn"><i class="fas fa-brain"></i> 困難</button>
           <button id="confirm-ai-settings" class="confirm-btn"><i class="fas fa-check-circle"></i> 確定</button>
       </div>
   </div>
   ```

#### CSS 樣式優化
1. 優化遊戲信息區域，解決分數顯示的換行問題:
   ```css
   #score {
       display: flex;
       align-items: center;
       white-space: nowrap; /* 防止換行 */
   }
   
   .score-divider {
       margin: 0 5px;
       font-size: 1.5rem;
       display: inline-block; /* 確保冒號不會獨立換行 */
   }
   ```

2. 添加玩家顏色選擇區域的樣式:
   ```css
   #player-color-selection {
       background-color: #f9f9f9;
       border-radius: 15px;
       padding: 15px 20px;
       margin: 15px 0;
       box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
       text-align: center;
       animation: fadeIn 0.5s ease;
   }
   ```

3. 優化 AI 難度選擇區域:
   ```css
   .ai-difficulty {
       margin: 15px 0 25px 0;
       background-color: #f9f9f9;
       border-radius: 15px;
       padding: 15px 25px;
       box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
       text-align: center;
   }
   ```

#### JavaScript 功能增強
1. 添加 `hideModal` 函數:
   ```javascript
   hideModal() {
       // 模態視窗淡出效果
       const modalContent = this.modal.querySelector('.modal-content');
       if (modalContent) {
           modalContent.style.opacity = '0';
           modalContent.style.transform = 'scale(0.9)';
       }
       this.modal.classList.remove('show');

       setTimeout(() => {
           this.modal.style.display = 'none';
       }, 300);
   }
   ```

2. 添加 `makeAIMove` 函數:
   ```javascript
   makeAIMove() {
       this.aiThinking = true;

       setTimeout(async () => {
           const move = this.ai.makeMove(this.board);
           if (move) {
               // AI 落子邏輯...
           }

           this.aiThinking = false;
       }, 500);
   }
   ```

3. 實現玩家顏色選擇功能:
   ```javascript
   setPlayerColor(color) {
       this.playerColor = color;
       
       // 更新顏色選擇按鈕狀態
       document.getElementById('select-black').classList.toggle('active', color === 1);
       document.getElementById('select-white').classList.toggle('active', color === 2);
       
       // 重置遊戲
       this.resetGame();
   }
   ```

4. 實現 AI 難度確認機制:
   ```javascript
   confirmAISettings() {
       if (!this.ai.difficulty) {
           this.ui.showModal('請選擇 AI 難度', '請至少選擇一個 AI 難度（簡單、普通或困難）。');
           return;
       }
       
       this.aiDifficultyConfirmed = true;
       
       // 定義確認按鈕回調函數
       const confirmCallback = () => {
           console.log('AI 設定已確認，執行回調函數');
           // 如果是人對 AI 模式且輪到 AI，或者是 AI 對 AI 模式，則啟動 AI
           if (this.gameMode === 'ai-vs-ai') {
               console.log('啟動 AI 對 AI 模式');
               this.startAIvsAI();
           } else if (this.gameMode === 'human-vs-ai' &&
               ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                   (this.playerColor === 2 && this.board.currentPlayer === 1))) {
               console.log('啟動人機對戰，AI 行動中');
               this.makeAIMove();
           } else {
               console.log('遊戲設定完成，等待玩家行動');
           }
       };
       
       this.ui.showModal(
           'AI 設定已確認', 
           `AI 難度已設為${this.getAIDifficultyText(this.ai.difficulty)}，遊戲開始！`, 
           confirmCallback
       );
   }
   ```
// 使用者介面管理器
class UI {
    constructor() {
        this.elements = {};
        this.currentGameMode = null;
        this.isAnimating = false;
        this.initializeElements();
        this.bindEvents();
    }

    // 初始化DOM元素
    initializeElements() {
        this.elements = {
            // 模式卡片
            cardHumanVsHuman: document.getElementById('card-human-vs-human'),
            cardHumanVsAI: document.getElementById('card-human-vs-ai'),
            cardAIVsAI: document.getElementById('card-ai-vs-ai'),
            viewRules: document.getElementById('view-rules'),

            // 符號選擇
            playerSymbolSelection: document.getElementById('player-symbol-selection'),
            selectX: document.getElementById('select-x'),
            selectO: document.getElementById('select-o'),

            // AI 難度選擇
            aiDifficulty: document.getElementById('ai-difficulty'),
            singleAIDifficulty: document.getElementById('single-ai-difficulty'),
            aiVsAIDifficulty: document.getElementById('ai-vs-ai-difficulty'),
            confirmAISettings: document.getElementById('confirm-ai-settings'),
            aiVsAIConfirm: document.getElementById('ai-vs-ai-confirm'),

            // 遊戲資訊
            gameStatus: document.getElementById('game-status'),
            xScore: document.getElementById('x-score'),
            oScore: document.getElementById('o-score'),

            // 棋盤
            board: document.getElementById('board'),
            cells: document.querySelectorAll('.cell'),

            // 控制按鈕
            newGame: document.getElementById('new-game'),
            undo: document.getElementById('undo'),

            // 模態框
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalConfirm: document.getElementById('modal-confirm'),
            closeButton: document.querySelector('.close-button')
        };
    }

    // 綁定事件
    bindEvents() {
        // 模式卡片選擇
        this.elements.cardHumanVsHuman?.addEventListener('click', () => this.selectGameMode('human-vs-human'));
        this.elements.cardHumanVsAI?.addEventListener('click', () => this.selectGameMode('human-vs-ai'));
        this.elements.cardAIVsAI?.addEventListener('click', () => this.selectGameMode('ai-vs-ai'));
        this.elements.viewRules?.addEventListener('click', () => this.showRules());

        // 符號選擇
        this.elements.selectX?.addEventListener('click', () => this.selectPlayerSymbol('X'));
        this.elements.selectO?.addEventListener('click', () => this.selectPlayerSymbol('O'));

        // AI 難度選擇
        this.bindDifficultyEvents();

        // 棋盤點擊
        this.elements.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.onCellClick(index));
        });

        // 控制按鈕
        this.elements.newGame?.addEventListener('click', () => this.onNewGame());
        this.elements.undo?.addEventListener('click', () => this.onUndo());

        // 模態框
        this.elements.closeButton?.addEventListener('click', () => this.closeModal());
        this.elements.modalConfirm?.addEventListener('click', () => this.closeModal());
        this.elements.modal?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });

        // 鍵盤事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // 綁定 AI 難度選擇事件
    bindDifficultyEvents() {
        // 單人 AI 難度
        ['easy', 'medium', 'hard', 'impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty));
        });

        // AI vs AI 難度
        ['x-easy', 'x-medium', 'x-hard', 'x-impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty, 'X'));
        });

        ['o-easy', 'o-medium', 'o-hard', 'o-impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty, 'O'));
        });

        // 確認按鈕
        this.elements.confirmAISettings?.addEventListener('click', () => this.confirmAISettings());
        this.elements.aiVsAIConfirm?.addEventListener('click', () => this.confirmAISettings());
    }    // 選擇遊戲模式
    selectGameMode(mode) {
        this.currentGameMode = mode;

        // 更新卡片樣式
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('active');
        });

        const selectedCard = document.getElementById(`card-${mode}`);
        selectedCard?.classList.add('active');

        // 顯示模式設定模態框
        this.showGameSettingModal(mode);
    }

    // 顯示遊戲模式設定模態框
    showGameSettingModal(mode) {
        if (window.gameSettingModal) {
            const defaults = { mode };
            window.gameSettingModal.show(defaults, (settings) => {
                // 模態框確認後的回調
                if (settings.mode === 'human-vs-human') {
                    window.game?.startGame('human');
                } else if (settings.mode === 'human-vs-ai') {
                    window.game?.setPlayerSymbol(settings.playerSymbol);
                    window.game?.setAIDifficulty(settings.aiLevel);
                    window.game?.startGame('ai');
                } else if (settings.mode === 'ai-vs-ai') {
                    window.game?.setAIDifficulty(settings.xAiLevel, 'X');
                    window.game?.setAIDifficulty(settings.oAiLevel, 'O');
                    window.game?.startGame('ai-vs-ai');
                }
            });
        } else {
            console.error('Game setting modal not initialized');
            // 降級處理
            if (mode === 'human-vs-human') {
                window.game?.startGame('human');
            }
        }
    }    // 這些方法已經移至模態框中處理
    // 保留空方法以維護向後兼容
    
    // 選擇玩家符號
    selectPlayerSymbol(symbol) {
        // 此方法已移至模態框中處理
    }

    // 選擇 AI 難度
    selectDifficulty(difficulty, player = null) {
        // 此方法已移至模態框中處理
    }

    // 確認 AI 設置
    confirmAISettings() {
        // 此方法已移至模態框中處理
    }

    // 棋盤格子點擊
    onCellClick(index) {
        if (this.isAnimating) return;
        window.game?.handleCellClick(index);
    }

    // 新遊戲
    onNewGame() {
        window.game?.restartGame();
    }

    // 悔棋
    onUndo() {
        window.game?.undoMove();
    }

    // 更新棋盤顯示
    updateBoard(board) {
        this.elements.cells.forEach((cell, index) => {
            const value = board.grid[index];
            cell.textContent = value || '';
            cell.className = 'cell';

            if (value) {
                cell.classList.add(value.toLowerCase());
                cell.classList.add('placing');

                // 移除動畫類別
                setTimeout(() => {
                    cell.classList.remove('placing');
                }, 300);
            }
        });
    }

    // 更新遊戲狀態
    updateGameStatus(status) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = status;
        }
    }

    // 更新分數
    updateScore(xScore, oScore) {
        if (this.elements.xScore) {
            this.elements.xScore.textContent = xScore;
        }
        if (this.elements.oScore) {
            this.elements.oScore.textContent = oScore;
        }
    }

    // 設置撤銷按鈕狀態
    setUndoEnabled(enabled) {
        if (this.elements.undo) {
            this.elements.undo.disabled = !enabled;
        }
    }

    // 高亮獲勝線條
    highlightWinningLine(line) {
        if (!line) return;

        line.forEach(index => {
            this.elements.cells[index]?.classList.add('winning');
        });
    }    // 顯示遊戲結束對話框
    showGameEndDialog(title, message, callback = null) {
        this.showModal(title, message, callback);

        // 添加慶祝動畫，檢查多種勝利情況的文本
        if (title.includes('獲勝') || title.includes('贏了') || title === '你贏了！') {
            this.elements.modal?.classList.add('celebrate');
            setTimeout(() => {
                this.elements.modal?.classList.remove('celebrate');
            }, 2500);
        }
    }

    // 顯示模態框
    showModal(title, message, callback = null) {
        if (this.elements.modal) {
            this.elements.modalTitle.textContent = title;
            this.elements.modalMessage.textContent = message;
            this.elements.modal.style.display = 'block';

            if (callback) {
                this.elements.modalConfirm.onclick = () => {
                    callback();
                    this.closeModal();
                };
            }
        }
    }

    // 關閉模態框
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
            this.elements.modal.classList.remove('celebrate');
        }
    }

    // 顯示規則
    showRules() {
        const title = window.textManager?.getText('modal.gameRules.title', '井字棋遊戲規則');
        const content = window.textManager?.getText('modal.gameRules.content', `
井字棋是一個經典的策略遊戲，規則簡單易懂：

1. 遊戲在 3×3 的棋盤上進行
2. 兩名玩家輪流在空格中放置自己的符號（X 或 O）
3. 率先在橫、直、斜任意方向連成一線者獲勝
4. 如果棋盤填滿而無人獲勝則為平局

**AI 難度說明：**
- 簡單：隨機策略，適合初學者
- 普通：基礎 Minimax 演算法
- 困難：進階 Minimax 演算法
- 不可能：完美 Minimax 演算法，永不出錯
        `);

        this.showModal(title, content);
    }

    // 顯示載入動畫
    showLoading(message = '載入中...') {
        this.updateGameStatus(message);
        this.elements.board?.classList.add('loading');
    }

    // 隱藏載入動畫
    hideLoading() {
        this.elements.board?.classList.remove('loading');
    }

    // 顯示 AI 思考狀態
    showAIThinking(cell = null) {
        this.updateGameStatus('AI 思考中...');
        if (cell !== null) {
            this.elements.cells[cell]?.classList.add('thinking');
        }
    }

    // 隱藏 AI 思考狀態
    hideAIThinking() {
        this.elements.cells.forEach(cell => {
            cell.classList.remove('thinking');
        });
    }

    // 設置動畫狀態
    setAnimating(animating) {
        this.isAnimating = animating;
    }

    // 鍵盤事件處理
    handleKeydown(e) {
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'Enter':
                if (this.elements.modal.style.display === 'block') {
                    this.closeModal();
                }
                break;
            case 'n':
            case 'N':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.onNewGame();
                }
                break;
            case 'z':
            case 'Z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.onUndo();
                }
                break;
        }
    }

    // 添加錯誤動畫
    showError(element) {
        element?.classList.add('error-shake');
        setTimeout(() => {
            element?.classList.remove('error-shake');
        }, 500);
    }

    // 重置UI到初始狀態
    reset() {
        this.elements.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.updateGameStatus('選擇遊戲模式開始');
        this.updateScore(0, 0);
        this.setUndoEnabled(false);
        this.hideLoading();
        this.hideAIThinking();
        this.closeModal();
    }

    // 顯示主選單
    showMainMenu() {
        // 隱藏所有設置面板
        this.elements.playerSymbolSelection.style.display = 'none';
        this.elements.aiDifficulty.style.display = 'none';
        this.elements.singleAIDifficulty.style.display = 'none';
        this.elements.aiVsAIDifficulty.style.display = 'none';

        // 重置遊戲模式按鈕
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('active');
        });

        // 重置棋盤和狀態
        this.reset();
        this.updateGameStatus('選擇遊戲模式開始');
    }

    // 顯示遊戲棋盤
    showGameBoard() {
        // 隱藏所有設置面板
        this.elements.playerSymbolSelection.style.display = 'none';
        this.elements.aiDifficulty.style.display = 'none';
        this.elements.singleAIDifficulty.style.display = 'none';
        this.elements.aiVsAIDifficulty.style.display = 'none';

        // 棋盤已經在 HTML 中顯示，這裡主要是確保設置面板隱藏
    }
}
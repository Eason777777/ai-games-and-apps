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
            // 遊戲模式按鈕
            humanVsHuman: document.getElementById('human-vs-human'),
            humanVsAI: document.getElementById('human-vs-ai'),
            aiVsAI: document.getElementById('ai-vs-ai'),
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
            muteButton: document.getElementById('mute-button'),

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
        // 遊戲模式選擇
        this.elements.humanVsHuman?.addEventListener('click', () => this.selectGameMode('human-vs-human'));
        this.elements.humanVsAI?.addEventListener('click', () => this.selectGameMode('human-vs-ai'));
        this.elements.aiVsAI?.addEventListener('click', () => this.selectGameMode('ai-vs-ai'));
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
        this.elements.muteButton?.addEventListener('click', () => this.toggleMute());

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

        // 更新按鈕樣式
        document.querySelectorAll('.button-group button').forEach(btn => {
            btn.classList.remove('active');
        });

        const selectedButton = document.getElementById(mode);
        selectedButton?.classList.add('active');

        // 顯示相應的設置界面
        this.showGameModeSettings(mode);

        // 播放點擊音效
        window.audioManager?.playClick();
    }

    // 顯示遊戲模式設置
    showGameModeSettings(mode) {
        // 隱藏所有設置面板
        this.elements.playerSymbolSelection.style.display = 'none';
        this.elements.aiDifficulty.style.display = 'none';
        this.elements.singleAIDifficulty.style.display = 'none';
        this.elements.aiVsAIDifficulty.style.display = 'none'; switch (mode) {
            case 'human-vs-human':
                // 直接開始遊戲
                setTimeout(() => window.game?.startGame('human'), 300);
                break;
            case 'human-vs-ai':
                // 顯示符號選擇和 AI 難度
                this.elements.playerSymbolSelection.style.display = 'block';
                this.elements.aiDifficulty.style.display = 'block';
                this.elements.singleAIDifficulty.style.display = 'block';
                break;
            case 'ai-vs-ai':
                // 顯示 AI vs AI 難度選擇
                this.elements.aiDifficulty.style.display = 'block';
                this.elements.aiVsAIDifficulty.style.display = 'block';
                break;
        }
    }

    // 選擇玩家符號
    selectPlayerSymbol(symbol) {
        // 更新按鈕樣式
        document.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const selectedButton = document.getElementById(`select-${symbol.toLowerCase()}`);
        selectedButton?.classList.add('active');

        window.game?.setPlayerSymbol(symbol);
        window.audioManager?.playClick();
    }

    // 選擇 AI 難度
    selectDifficulty(difficulty, player = null) {
        const difficultyValue = difficulty.replace(/^[xo]-/, '');

        if (player) {
            // AI vs AI 模式
            const buttons = document.querySelectorAll(`.${player.toLowerCase()}-ai-btn`);
            buttons.forEach(btn => btn.classList.remove('active'));
            document.getElementById(difficulty)?.classList.add('active');

            window.game?.setAIDifficulty(difficultyValue, player);
        } else {
            // 單人 AI 模式
            const buttons = document.querySelectorAll('#single-ai-difficulty .difficulty-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            document.getElementById(difficulty)?.classList.add('active');

            window.game?.setAIDifficulty(difficultyValue);
        }

        window.audioManager?.playClick();
    }    // 確認 AI 設置
    confirmAISettings() {
        const actualMode = this.currentGameMode === 'human-vs-ai' ? 'ai' : this.currentGameMode;
        window.game?.startGame(actualMode);
        window.audioManager?.playClick();
    }    // 棋盤格子點擊
    onCellClick(index) {
        if (this.isAnimating) return;
        window.game?.handleCellClick(index);
    }    // 新遊戲
    onNewGame() {
        window.game?.restartGame();
        window.audioManager?.playNewGame();
    }

    // 悔棋
    onUndo() {
        window.game?.undoMove();
        window.audioManager?.playClick();
    }    // 切換音效
    toggleMute() {
        const enabled = window.audioManager?.toggle();
        this.updateSoundButton(enabled);
    }

    // 更新音效按鈕顯示
    updateSoundButton(enabled) {
        const button = this.elements.muteButton;
        if (button) {
            const icon = button.querySelector('i');
            const text = button.childNodes[1];
            if (enabled) {
                icon.className = 'fas fa-volume-up';
                text.textContent = ' 音效：開';
            } else {
                icon.className = 'fas fa-volume-mute';
                text.textContent = ' 音效：關';
            }
        }
    }// 更新棋盤顯示
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
    }

    // 顯示遊戲結束對話框
    showGameEndDialog(title, message, callback = null) {
        this.showModal(title, message, callback);

        // 添加慶祝動畫
        if (title.includes('獲勝')) {
            this.elements.modal?.classList.add('celebrate');
            setTimeout(() => {
                this.elements.modal?.classList.remove('celebrate');
            }, 2000);
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
        const rules = `
井字棋遊戲規則：

1. 遊戲在3x3的棋盤上進行
2. 兩名玩家輪流在空格中放置自己的符號（X或O）
3. 第一個在水平、垂直或對角線上連成三個符號的玩家獲勝
4. 如果棋盤填滿但沒有玩家獲勝，則為平局

AI 難度說明：
• 簡單：隨機選擇為主，偶爾使用基本策略
• 普通：使用基本的攻守策略，優先中心和角落
• 困難：使用 Minimax 演算法，偶爾出現失誤
• 不可能：完美的 Minimax 演算法，永不出錯
        `;

        this.showModal('遊戲規則', rules);
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
    }    // 重置UI到初始狀態
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
        document.querySelectorAll('.button-group button').forEach(btn => {
            btn.classList.remove('active');
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

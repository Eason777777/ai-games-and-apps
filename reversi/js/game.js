class Game {
    constructor() {
        this.board = new Board();
        this.ui = new UI();
        this.ai = new AI('medium');  // 原來的 AI 物件，暫時保留以維持兼容性
        // 為黑子和白子創建各自的 AI 物件
        this.blackAI = new AI('medium');
        this.whiteAI = new AI('medium');
        this.gameMode = 'human-vs-human'; // 預設為人類對人類
        this.playerColor = 1; // 預設人類是黑方
        this.aiThinking = false;
        this.gameOver = false;
        this.soundEnabled = true; // 預設啟用音效
        this.aiDifficultyConfirmed = false; // 是否確認了 AI 難度設定
        // 黑白子的 AI 難度是否都已設定
        this.blackAIDifficultySet = false;
        this.whiteAIDifficultySet = false;

        this.init();
    }

    // 播放音效函數
    playSound(soundName) {
        if (this.soundEnabled && window.audioManager) {
            window.audioManager.play(soundName);
        }
    }

    // 切換靜音狀態
    toggleMute() {
        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            this.soundEnabled = !isMuted;
            return isMuted;
        }
        return false;
    }

    init() {
        console.log('初始化遊戲...');
        // 初始化棋盤
        this.board.initialize();
        this.ui.renderBoard(this.board, null);
        this.gameOver = false;
        this.aiDifficultyConfirmed = false; // 重置AI難度確認狀態

        // 設置事件監聽器
        this.setupEventListeners();

        // 根據模式顯示/隱藏AI難度選項
        this.ui.showAIDifficultyOptions(this.gameMode === 'human-vs-ai' || this.gameMode === 'ai-vs-ai', this.gameMode);

        // 根據模式顯示/隱藏玩家顏色選擇
        this.showPlayerColorSelection(this.gameMode === 'human-vs-ai');

        // AI對AI模式下啟動遊戲
        if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed) {
            this.startAIvsAI();
        }
        // 如果當前是AI回合，讓AI執行
        else if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed &&
            ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                (this.playerColor === 2 && this.board.currentPlayer === 1))) {
            this.makeAIMove();
        }
    }

    setupEventListeners() {
        // 棋盤點擊事件
        this.ui.boardElement.addEventListener('click', (event) => {
            if (this.aiThinking || this.gameOver) return;

            // 如果需要先確認AI難度但尚未確認，則提示用戶
            if ((this.gameMode === 'human-vs-ai' || this.gameMode === 'ai-vs-ai') && !this.aiDifficultyConfirmed) {
                this.ui.showModal('請先確認AI設定', '請選擇AI難度並點擊確定按鈕後再開始遊戲。');
                return;
            }

            const cell = event.target.closest('.cell');
            if (!cell) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            this.handleCellClick(row, col);
        });

        // 遊戲模式按鈕
        document.getElementById('human-vs-human').addEventListener('click', () => {
            this.setGameMode('human-vs-human');
        });

        document.getElementById('human-vs-ai').addEventListener('click', () => {
            this.setGameMode('human-vs-ai');
        });

        document.getElementById('ai-vs-ai').addEventListener('click', () => {
            this.setGameMode('ai-vs-ai');
        });

        // AI難度按鈕 - 通用(適用於人機對戰)
        document.getElementById('easy').addEventListener('click', () => {
            this.setAIDifficulty('easy');
        });

        document.getElementById('medium').addEventListener('click', () => {
            this.setAIDifficulty('medium');
        });

        document.getElementById('hard').addEventListener('click', () => {
            this.setAIDifficulty('hard');
        });

        document.getElementById('super-hard').addEventListener('click', () => {
            this.setAIDifficulty('super-hard');
        });

        // 黑子 AI 難度按鈕
        document.getElementById('black-easy').addEventListener('click', () => {
            this.setAIDifficulty('easy', 'black');
        });

        document.getElementById('black-medium').addEventListener('click', () => {
            this.setAIDifficulty('medium', 'black');
        });

        document.getElementById('black-hard').addEventListener('click', () => {
            this.setAIDifficulty('hard', 'black');
        });

        document.getElementById('black-super-hard').addEventListener('click', () => {
            this.setAIDifficulty('super-hard', 'black');
        });

        // 白子 AI 難度按鈕
        document.getElementById('white-easy').addEventListener('click', () => {
            this.setAIDifficulty('easy', 'white');
        });

        document.getElementById('white-medium').addEventListener('click', () => {
            this.setAIDifficulty('medium', 'white');
        });

        document.getElementById('white-hard').addEventListener('click', () => {
            this.setAIDifficulty('hard', 'white');
        });

        document.getElementById('white-super-hard').addEventListener('click', () => {
            this.setAIDifficulty('super-hard', 'white');
        });        // 確認AI設定按鈕
        document.getElementById('confirm-ai-settings').addEventListener('click', () => {
            this.confirmAISettings();
        });

        // AI vs AI 模式下的確認按鈕
        document.getElementById('ai-vs-ai-confirm').addEventListener('click', () => {
            this.confirmAISettings();
        });

        // 玩家顏色選擇按鈕
        document.getElementById('select-black').addEventListener('click', () => {
            this.setPlayerColor(1);
        });

        document.getElementById('select-white').addEventListener('click', () => {
            this.setPlayerColor(2);
        });

        // 新遊戲按鈕
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });

        // 悔棋按鈕
        document.getElementById('undo').addEventListener('click', () => {
            this.undoMove();
        });

        // 靜音按鈕
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                const isMuted = this.toggleMute();
                muteButton.innerHTML = isMuted ?
                    '<i class="fas fa-volume-mute"></i> 音效：關' :
                    '<i class="fas fa-volume-up"></i> 音效：開';
            });
        }
    }

    // 玩家顏色選擇顯示控制
    showPlayerColorSelection(show) {
        const colorSelection = document.getElementById('player-color-selection');
        if (colorSelection) {
            colorSelection.style.display = show ? 'block' : 'none';
        }
    }

    // 設置玩家顏色
    setPlayerColor(color) {
        this.playerColor = color;

        // 更新顏色選擇按鈕狀態
        document.getElementById('select-black').classList.toggle('active', color === 1);
        document.getElementById('select-white').classList.toggle('active', color === 2);

        // 重置遊戲
        this.resetGame();
    }

    // 確認AI設定
    confirmAISettings() {
        if (this.gameMode === 'ai-vs-ai') {
            // 檢查是否已選擇黑白雙方的AI難度
            if (!this.blackAIDifficultySet || !this.whiteAIDifficultySet) {
                this.ui.showModal('請選擇雙方AI難度', '請為黑子和白子分別選擇AI難度。');
                return;
            }
        } else if (this.gameMode === 'human-vs-ai') {
            // 檢查是否已選擇AI難度（單一AI）
            if (!this.ai.difficulty) {
                this.ui.showModal('請選擇AI難度', '請至少選擇一個AI難度（簡單、普通或困難）。');
                return;
            }
        }

        // 取消任何可能在進行的AI操作
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        this.aiThinking = false; // 重置AI思考狀態
        this.aiDifficultyConfirmed = true; // 標記AI難度已確認

        // 定義確認按鈕回調函數
        const confirmCallback = () => {
            if (this.gameMode === 'ai-vs-ai') {
                console.log('AI vs AI 設定已確認，黑子難度:', this.blackAI.difficulty, '白子難度:', this.whiteAI.difficulty);
            } else {
                console.log('AI設定已確認，執行回調函數，難度:', this.ai.difficulty);
            }

            // 重置棋盤以確保新遊戲開始
            this.resetBoard();

            // 如果是人對AI模式且輪到AI，或者是AI對AI模式，則啟動AI
            if (this.gameMode === 'ai-vs-ai') {
                console.log('啟動AI對AI模式');
                // 設置一個短延遲以確保UI先更新
                setTimeout(() => {
                    if (this.aiDifficultyConfirmed) {
                        this.startAIvsAI();
                    }
                }, 300);
            } else if (this.gameMode === 'human-vs-ai' &&
                ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                    (this.playerColor === 2 && this.board.currentPlayer === 1))) {
                console.log('啟動人機對戰，AI行動中');
                // 設置一個短延遲以確保UI先更新
                setTimeout(() => {
                    if (this.aiDifficultyConfirmed) {
                        this.makeAIMove();
                    }
                }, 300);
            } else {
                console.log('遊戲設定完成，等待玩家行動');
            }
        };

        // 根據不同遊戲模式顯示不同的確認訊息
        if (this.gameMode === 'ai-vs-ai') {
            this.ui.showModal(
                'AI設定已確認',
                `黑子AI難度: ${this.getAIDifficultyText(this.blackAI.difficulty)}, 白子AI難度: ${this.getAIDifficultyText(this.whiteAI.difficulty)}，遊戲開始！`,
                confirmCallback
            );
        } else {
            this.ui.showModal(
                'AI設定已確認',
                `AI難度已設為${this.getAIDifficultyText(this.ai.difficulty)}，遊戲開始！`,
                confirmCallback
            );
        }
    }

    // 獲取AI難度的中文說明
    getAIDifficultyText(difficulty) {
        switch (difficulty) {
            case 'easy': return '簡單';
            case 'medium': return '普通';
            case 'hard': return '困難';
            case 'super-hard': return '超難';
            default: return '未知';
        }
    }    // 設置遊戲模式
    setGameMode(mode) {
        this.gameMode = mode;
        this.ui.setModeActive(mode);
        this.aiDifficultyConfirmed = false; // 重置AI難度確認狀態

        // 重置黑白子AI難度設定狀態
        this.blackAIDifficultySet = false;
        this.whiteAIDifficultySet = false;

        // 根據遊戲模式控制悔棋按鈕的顯示/隱藏
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            if (mode === 'ai-vs-ai') {
                // AI vs AI 模式：隱藏悔棋按鈕
                undoButton.style.display = 'none';
                undoButton.disabled = true;
            } else {
                // Human vs Human 或 Human vs AI 模式：顯示悔棋按鈕
                undoButton.style.display = 'inline-block';
                undoButton.disabled = true; // 初始狀態為禁用，直到有移動歷史
            }
        }

        // 如果選擇了AI相關模式，顯示AI難度選項和玩家顏色選擇
        this.ui.showAIDifficultyOptions(mode === 'human-vs-ai' || mode === 'ai-vs-ai', mode);
        this.showPlayerColorSelection(mode === 'human-vs-ai');

        // 重置遊戲
        this.resetGame();
    }

    // 設置AI難度
    setAIDifficulty(difficulty, playerType = null) {
        // 決定要設定哪個 AI 物件的難度
        if (this.gameMode === 'ai-vs-ai') {
            // 在 AI vs AI 模式下，根據特定參數設定黑子或白子的難度
            if (playerType === 'black') {
                this.blackAI.setDifficulty(difficulty);
                this.blackAIDifficultySet = true;
                this.ui.setDifficultyActive('black', difficulty);
                console.log(`黑子 AI 難度已設置為: ${difficulty}`);
            } else if (playerType === 'white') {
                this.whiteAI.setDifficulty(difficulty);
                this.whiteAIDifficultySet = true;
                this.ui.setDifficultyActive('white', difficulty);
                console.log(`白子 AI 難度已設置為: ${difficulty}`);
            } else {
                // 向下兼容，保留原始行為
                this.ai.setDifficulty(difficulty);
                this.blackAI.setDifficulty(difficulty);
                this.whiteAI.setDifficulty(difficulty);
                this.blackAIDifficultySet = true;
                this.whiteAIDifficultySet = true;
                this.ui.setDifficultyActive(null, difficulty);
                console.log(`所有 AI 難度已設置為: ${difficulty}`);
            }
        } else {
            // 在 human-vs-ai 模式下，只設定單一 AI 難度
            this.ai.setDifficulty(difficulty);
            this.ui.setDifficultyActive(null, difficulty);
            console.log(`AI難度已設置為: ${difficulty}`);
        }

        // 重置AI難度確認狀態
        this.aiDifficultyConfirmed = false;

        // 停止所有AI相關活動
        this.aiThinking = false;
    }

    // 啟動 AI vs AI 模式
    startAIvsAI() {
        if (!this.aiDifficultyConfirmed) {
            console.log("AI難度未確認，無法啟動AI對AI模式");
            return;
        }

        console.log(`啟動 AI vs AI 模式，黑子難度: ${this.blackAI.difficulty}, 白子難度: ${this.whiteAI.difficulty}`);

        // 清除所有可能的延遲執行的AI移動
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        // 重置棋盤
        this.resetBoard();

        // 開始AI移動
        this.makeAIMove();
    }

    // AI 移動方法
    makeAIMove() {
        // 檢查遊戲狀態和AI確認狀態
        if (this.gameOver) {
            console.log('AI移動取消: 遊戲已結束');
            return;
        }

        if (!this.aiDifficultyConfirmed) {
            console.log('AI移動取消: AI難度未確認');
            // 提示用戶確認AI難度
            this.ui.showModal(
                '請確認AI難度',
                '請先選擇AI難度並點擊確認按鈕，然後再開始遊戲。'
            );
            return;
        }

        // 防止多個AI同時思考
        if (this.aiThinking) {
            console.log('AI已在思考中，跳過重複調用');
            return;
        }

        // 取消所有正在進行的AI移動計時器
        if (this.aiMoveTimeout) {
            console.log('取消之前的AI移動計時器');
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        // 根據當前玩家選擇合適的AI物件
        let activeAI;
        if (this.gameMode === 'ai-vs-ai') {
            // 在AI vs AI模式中，根據當前玩家選擇使用黑子AI或白子AI
            activeAI = this.board.currentPlayer === 1 ? this.blackAI : this.whiteAI;
            console.log(`AI vs AI模式，當前玩家: ${this.board.currentPlayer === 1 ? '黑子' : '白子'}，難度: ${activeAI.difficulty}`);
        } else {
            // 在人機模式中，使用通用AI物件
            activeAI = this.ai;
            console.log(`人機模式，AI難度: ${activeAI.difficulty}`);
        }

        // 標記AI正在思考中
        this.aiThinking = true;

        // 建立新的AI移動計時器
        this.aiMoveTimeout = setTimeout(async () => {
            // 再次檢查遊戲狀態和AI設置
            if (this.gameOver) {
                console.log('遊戲已結束，取消AI移動');
                this.aiThinking = false;
                return;
            }

            if (!this.aiDifficultyConfirmed) {
                console.log('AI難度未確認，取消AI移動');
                this.aiThinking = false;
                return;
            }

            const move = activeAI.makeMove(this.board);
            if (move) {
                const [row, col] = move;
                this.board.makeMove(row, col);
                // 獲取對應的棋盤格子，添加點擊效果
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    this.addClickEffect(cell);
                }

                // 記錄下棋的座標，傳遞給 UI 以便特殊處理動畫效果
                this.ui.renderBoard(this.board, { row, col });

                // 啟用悔棋按鈕
                document.getElementById('undo').disabled = false;

                // 檢查遊戲是否結束
                if (this.checkGameState()) {
                    this.aiThinking = false;
                    return;
                }

                // 安全地檢查當前玩家是否有合法步
                const hasValidMove = typeof this.board.hasValidMove === 'function' &&
                    !this.board.hasValidMove(this.board.currentPlayer);
                if (hasValidMove) {
                    await this.skipTurn();
                }

                // 在每次移動後檢查遊戲狀態和AI設置
                if (!this.gameOver && this.aiDifficultyConfirmed) {
                    // 如果仍然是AI回合，繼續AI移動
                    if (this.gameMode === 'ai-vs-ai' ||
                        (this.gameMode === 'human-vs-ai' &&
                            ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                                (this.playerColor === 2 && this.board.currentPlayer === 1)))) {
                        // 使用合理的延遲來避免AI太快移動
                        this.aiMoveTimeout = setTimeout(() => {
                            // 最後一次檢查確保仍然需要AI移動
                            if (!this.gameOver && this.aiDifficultyConfirmed) {
                                this.makeAIMove();
                            }
                        }, 800); // 增加延遲時間，讓玩家能看清楚每一步
                    }
                }
            } else {
                console.log('AI無法找到有效移動');
            }

            this.aiThinking = false;
        }, 500);
    }
    // 處理棋盤格子點擊事件
    handleCellClick(row, col) {
        // 如果是AI回合或遊戲已經結束，則不處理
        if (this.aiThinking || this.gameOver) {
            console.log('跳過處理：AI思考中或遊戲已結束');
            return;
        }

        // 如果是AI模式且當前應該是AI下棋，則忽略點擊
        if (this.gameMode === 'human-vs-ai' &&
            ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                (this.playerColor === 2 && this.board.currentPlayer === 1))) {
            console.log('跳過處理：當前是AI回合');
            return;
        }

        // 判斷移動是否有效
        if (this.board.isValidMove(row, col)) {
            // 執行移動
            this.board.makeMove(row, col);

            // 添加點擊效果
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                this.addClickEffect(cell);
            }

            // 播放音效
            this.playSound('place');

            // 更新棋盤顯示
            this.ui.renderBoard(this.board, { row, col });

            // 啟用悔棋按鈕
            document.getElementById('undo').disabled = false;

            // 檢查遊戲是否結束
            if (this.checkGameState()) {
                return;
            }

            // 檢查是否需要跳過回合
            if (!this.board.hasValidMove(this.board.currentPlayer)) {
                this.skipTurn();
                return;
            }

            // 如果是AI回合，則執行AI移動
            if (this.gameMode === 'human-vs-ai' &&
                ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                    (this.playerColor === 2 && this.board.currentPlayer === 1))) {
                // 使用setTimeout讓UI更新後再進行AI思考
                setTimeout(() => {
                    if (!this.gameOver) {
                        this.makeAIMove();
                    }
                }, 500);
            }
        } else {
            console.log('無效移動');
        }
    }

    // 添加點擊效果
    addClickEffect(cell) {
        cell.classList.add('clicked');
        setTimeout(() => {
            cell.classList.remove('clicked');
        }, 300);
    }

    // 重置棋盤
    resetBoard() {
        console.log('重置棋盤');
        // 初始化棋盤
        this.board.initialize();

        // 重新渲染棋盤
        this.ui.renderBoard(this.board, null);

        // 更新遊戲狀態
        this.ui.updateGameStatus(this.board.currentPlayer);

        // 禁用悔棋按鈕
        document.getElementById('undo').disabled = true;

        // 重置遊戲結束狀態
        this.gameOver = false;
    }

    // 重置遊戲
    resetGame() {
        // 取消所有進行中的AI移動
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        // 重置AI思考狀態
        this.aiThinking = false;

        // 重置棋盤
        this.resetBoard();

        // 如果是AI回合，且AI設置已確認，則啟動AI
        if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed) {
            // 設置短延遲，確保UI更新後再啟動
            setTimeout(() => {
                if (this.aiDifficultyConfirmed) {
                    this.startAIvsAI();
                }
            }, 300);
        } else if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed &&
            ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                (this.playerColor === 2 && this.board.currentPlayer === 1))) {
            // 如果是人機對戰且輪到AI，則啟動AI移動
            setTimeout(() => {
                if (this.aiDifficultyConfirmed) {
                    this.makeAIMove();
                }
            }, 300);
        }
    }    // 悔棋功能
    undoMove() {
        // 如果沒有移動歷史或遊戲已結束或AI正在思考，則不執行悔棋
        if (this.board.moveHistory.length === 0 || this.gameOver || this.aiThinking) {
            console.log('悔棋被阻止：無歷史記錄、遊戲結束或AI思考中');
            return;
        }

        // AI vs AI 模式不允許悔棋
        if (this.gameMode === 'ai-vs-ai') {
            this.ui.showModal('無法悔棋', 'AI對戰模式不支援悔棋功能。');
            return;
        }

        // 在人機對戰模式下，需要撤銷兩步（AI一步 + 玩家一步）
        if (this.gameMode === 'human-vs-ai') {
            // 確保有足夠的歷史記錄可以撤銷兩步
            if (this.board.moveHistory.length < 2) {
                this.ui.showModal('無法悔棋', '需要至少完成一輪對戰才能悔棋。');
                return;
            }

            // 撤銷最近的兩步移動（AI + 玩家）
            let undoCount = 0;
            if (this.board.undoLastMove()) {
                undoCount++;
                console.log('撤銷了AI的移動');
            }
            if (this.board.undoLastMove()) {
                undoCount++;
                console.log('撤銷了玩家的移動');
            }

            if (undoCount > 0) {
                this.playSound('undo');
                console.log(`人機對戰模式：成功撤銷了 ${undoCount} 步移動`);
            }
        } else if (this.gameMode === 'human-vs-human') {
            // 人人對戰模式：只撤銷最後一步
            if (this.board.undoLastMove()) {
                this.playSound('undo');
                console.log('人人對戰模式：成功撤銷了最後一步移動');
            }
        }

        // 更新棋盤顯示
        this.ui.renderBoard(this.board, null);

        // 更新遊戲狀態
        this.ui.updateGameStatus(this.board.currentPlayer);

        // 如果沒有移動歷史，禁用悔棋按鈕
        if (this.board.moveHistory.length === 0) {
            document.getElementById('undo').disabled = true;
        }

        // 在人機對戰模式下，確保輪到玩家回合
        if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed) {
            // 檢查當前是否為玩家回合，如果不是則需要調整
            const isPlayerTurn = (this.playerColor === this.board.currentPlayer);
            if (!isPlayerTurn) {
                // 如果悔棋後輪到AI，再撤銷一步讓玩家繼續
                if (this.board.moveHistory.length > 0 && this.board.undoLastMove()) {
                    this.ui.renderBoard(this.board, null);
                    this.ui.updateGameStatus(this.board.currentPlayer);
                    console.log('調整回合：確保輪到玩家');
                }
            }
        }
    }

    // 檢查遊戲狀態
    checkGameState() {
        // 檢查遊戲是否結束
        if (this.board.isGameOver()) {
            // 獲取勝利方
            const scores = this.board.getScore();
            let winner = null;

            if (scores.black > scores.white) {
                winner = 1;
            } else if (scores.white > scores.black) {
                winner = 2;
            }

            // 更新UI顯示
            this.ui.updateGameStatus(this.board.currentPlayer, true, winner);

            // 更新遊戲結束狀態
            this.gameOver = true;

            // 播放結束音效
            this.playSound('gameOver');

            return true;
        }

        // 如果遊戲未結束，更新UI顯示當前玩家
        this.ui.updateGameStatus(this.board.currentPlayer);

        return false;
    }

    // 跳過回合
    async skipTurn() {
        // 如果當前玩家沒有有效移動，則跳過回合
        if (!this.board.hasValidMove(this.board.currentPlayer)) {
            // 準備提示訊息
            const currentPlayerText = this.board.currentPlayer === 1 ? '黑子' : '白子';
            const nextPlayerText = this.board.currentPlayer === 1 ? '白子' : '黑子';

            const messageText = `${currentPlayerText}沒有可走的步，輪到${nextPlayerText}`;

            // 創建一個Promise，在模態視窗關閉時解析
            await new Promise(resolve => {
                this.ui.showModal('無法走步', messageText, resolve);
            });            // 切換玩家
            this.board.switchPlayer();

            // 重新渲染棋盤以顯示新玩家的可下子位置
            this.ui.renderBoard(this.board, null);

            // 更新UI顯示
            this.ui.updateGameStatus(this.board.currentPlayer);

            // 檢查下一個玩家是否也沒有有效移動
            if (!this.board.hasValidMove(this.board.currentPlayer)) {
                // 如果兩個玩家都沒有有效移動，遊戲結束
                this.checkGameState();
                return true;
            }

            // 如果是AI回合，執行AI移動
            if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed &&
                ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                    (this.playerColor === 2 && this.board.currentPlayer === 1))) {
                setTimeout(() => {
                    if (!this.gameOver) {
                        this.makeAIMove();
                    }
                }, 500);
            } else if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed) {
                setTimeout(() => {
                    if (!this.gameOver) {
                        this.makeAIMove();
                    }
                }, 500);
            }

            return true;
        }

        return false;
    }
}

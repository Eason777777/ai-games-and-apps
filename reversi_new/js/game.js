class Game {
    constructor() {
        this.board = new Board();
        this.ui = new UI();
        this.ai = new AI('medium');  // 原來的 AI 物件，暫時保留以維持兼容性
        // 為黑子和白子創建各自的 AI 物件
        this.blackAI = new AI('medium');
        this.whiteAI = new AI('medium');
        this.gameMode = 'human-vs-human'; // 預設為人類對人類
        this.playerColor = 1; // 預設人類是黑方        this.aiThinking = false;
        this.gameOver = false;
        this.soundEnabled = true; // 保留供未來音效擴充使用
        this.aiDifficultyConfirmed = false; // 是否確認了 AI 難度設定
        // 黑白子的 AI 難度是否都已設定
        this.blackAIDifficultySet = false;
        this.whiteAIDifficultySet = false;

        // AI vs AI 模式的 timeout 跟蹤
        this.aiLoopTimeout = null;
        this.aiLoopActive = false;

        // 遊戲記錄相關屬性
        this.gameRecord = {
            moves: [],           // 移動記錄
            gameMode: '',        // 遊戲模式
            playerColor: 1,      // 玩家顏色（在人機模式下）
            aiDifficulty: '',    // AI難度
            blackAIDifficulty: '', // 黑子AI難度（AI vs AI模式）
            whiteAIDifficulty: '', // 白子AI難度（AI vs AI模式）
            startTime: null,     // 遊戲開始時間
            endTime: null,       // 遊戲結束時間
            winner: null,        // 獲勝方
            finalScore: null     // 最終分數
        }; this.init();
    }

    init() {
        console.log('初始化遊戲...');
        // 初始化棋盤
        this.board.initialize();
        this.ui.renderBoard(this.board, null);
        this.gameOver = false;
        this.aiDifficultyConfirmed = false;

        // 初始化遊戲記錄
        this.initializeGameRecord();

        // 設置事件監聽器
        this.setupEventListeners();

        // 首次載入不再顯示AI難度/顏色選擇，由新UI/Modal控制
        // 若有預設設定可於 applyGameSettings 呼叫
    }

    // 初始化遊戲記錄
    initializeGameRecord() {
        this.gameRecord = {
            moves: [],
            gameMode: this.gameMode,
            playerColor: this.playerColor,
            aiDifficulty: this.ai ? this.ai.difficulty : 'medium',
            blackAIDifficulty: this.blackAI ? this.blackAI.difficulty : 'medium',
            whiteAIDifficulty: this.whiteAI ? this.whiteAI.difficulty : 'medium',
            startTime: new Date(),
            endTime: null,
            winner: null,
            finalScore: null
        };
    }    // 記錄移動
    recordMove(row, col, player, flippedPieces) {
        const move = {
            step: this.gameRecord.moves.length + 1,
            row: row,
            col: col,
            player: player,
            flippedPieces: flippedPieces || [],
            timestamp: new Date(),
            boardState: this.board.grid.map(row => [...row]) // 深拷貝當前棋盤狀態
        };

        this.gameRecord.moves.push(move);
        console.log('記錄移動:', move);
    }

    // 記錄跳過回合
    recordSkip(player) {
        const move = {
            step: this.gameRecord.moves.length + 1,
            row: -1,    // -1 表示跳過回合
            col: -1,    // -1 表示跳過回合
            player: player,
            flippedPieces: [],
            timestamp: new Date(),
            boardState: this.board.grid.map(row => [...row]) // 深拷貝當前棋盤狀態
        };

        this.gameRecord.moves.push(move);
        console.log('記錄跳過回合:', move);
    }

    setupEventListeners() {
        // 棋盤點擊事件
        this.ui.boardElement.addEventListener('click', (event) => {
            if (this.aiThinking || this.gameOver) return;
            // 新流程：AI難度/顏色選擇由 Modal 控制，不再於此檢查
            const cell = event.target.closest('.cell');
            if (!cell) return;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.handleCellClick(row, col);
        });

        // 遊戲模式、AI難度、顏色選擇等按鈕監聽已由 modal.js 控制，這裡移除舊有監聽        // 新遊戲按鈕
        const newGameBtn = document.getElementById('new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                // 由 modal.js 彈窗取得設定後再初始化遊戲
                if (window.gameSettingModal) {
                    window.gameSettingModal.show({}, (settings) => {
                        this.applyGameSettings(settings);
                    });
                } else {
                    // fallback: 直接重置
                    this.resetGame();
                }
            });
        }

        // 模式卡片點擊事件
        document.getElementById('card-human-vs-human')?.addEventListener('click', () => {
            if (window.gameSettingModal) {
                window.gameSettingModal.show({ mode: 'human-vs-human' }, (settings) => {
                    this.applyGameSettings(settings);
                });
            }
        });

        document.getElementById('card-human-vs-ai')?.addEventListener('click', () => {
            if (window.gameSettingModal) {
                window.gameSettingModal.show({ mode: 'human-vs-ai' }, (settings) => {
                    this.applyGameSettings(settings);
                });
            }
        });

        document.getElementById('card-ai-vs-ai')?.addEventListener('click', () => {
            if (window.gameSettingModal) {
                window.gameSettingModal.show({ mode: 'ai-vs-ai' }, (settings) => {
                    this.applyGameSettings(settings);
                });
            }
        });

        // 悔棋按鈕
        const undoBtn = document.getElementById('undo'); if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoMove();
            });
        }
    }

    // 玩家顏色選擇顯示控制
    showPlayerColorSelection(show) {
        // 已由新UI/Modal控制，這裡保留空實作以兼容
    }

    // 設置玩家顏色
    setPlayerColor(color) {
        this.playerColor = color;
        // 由 applyGameSettings 控制重置流程
    }    // 設置遊戲模式
    setGameMode(mode) {
        // 先停止當前的AI循環
        this.stopAILoop();

        this.gameMode = mode;
        this.ui.setModeActive(mode);
        this.aiDifficultyConfirmed = false;
        // 由 applyGameSettings 控制重置流程
    }

    // 設置AI難度
    setAIDifficulty(difficulty, playerType = null) {
        if (this.gameMode === 'ai-vs-ai') {
            if (playerType === 'black') {
                this.blackAI.setDifficulty(difficulty);
            } else if (playerType === 'white') {
                this.whiteAI.setDifficulty(difficulty);
            } else {
                this.ai.setDifficulty(difficulty);
                this.blackAI.setDifficulty(difficulty);
                this.whiteAI.setDifficulty(difficulty);
            }
        } else {
            this.ai.setDifficulty(difficulty);
        }
        this.aiDifficultyConfirmed = false;
        this.aiThinking = false;
    }

    // 確認AI設定
    confirmAISettings() {
        // 已由新UI/Modal流程統一控制
        this.aiDifficultyConfirmed = true;
    }

    // 重置棋盤
    resetBoard() {
        this.board.initialize();
        this.ui.renderBoard(this.board, null);
        this.gameOver = false;

        // 重置悔棋按鈕
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.disabled = true;
        }

        // 重新初始化遊戲記錄
        this.initializeGameRecord();
    }    // 停止AI循環
    stopAILoop() {
        this.aiLoopActive = false;
        if (this.aiLoopTimeout) {
            clearTimeout(this.aiLoopTimeout);
            this.aiLoopTimeout = null;
        }
        // 清除所有可能的 AI 相關 timeout
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }
        console.log('AI循環已停止');
    }    // 初始化遊戲
    resetGame() {
        // 停止所有AI循環
        this.stopAILoop();

        // 取消所有進行中的AI移動
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        // 重置AI思考狀態
        this.aiThinking = false;

        // 重置棋盤
        this.resetBoard();

        // 根據遊戲模式設置AI循環狀態
        if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed) {
            // AI vs AI 模式：啟用AI循環
            this.aiLoopActive = true;
            // 設置短延遲，確保UI更新後再啟动
            setTimeout(() => {
                if (this.aiDifficultyConfirmed && this.gameMode === 'ai-vs-ai') {
                    this.startAIvsAI();
                }
            }, 300);
        } else if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed) {
            // 人機對戰模式：不啟用循環，但允許單次AI移動
            this.aiLoopActive = true;
            if ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                (this.playerColor === 2 && this.board.currentPlayer === 1)) {
                // 如果輪到AI，則啟動AI移動
                setTimeout(() => {
                    if (this.aiDifficultyConfirmed && this.gameMode === 'human-vs-ai') {
                        this.makeAIMove();
                    }
                }, 300);
            }
        } else {
            // 人人對戰模式：禁用AI循環
            this.aiLoopActive = false;
        }
    }

    // 悔棋功能
    undoMove() {
        // 如果沒有移動歷史或遊戲已結束或AI正在思考，則不執行悔棋
        if (this.board.moveHistory.length === 0 || this.gameOver || this.aiThinking) {
            console.log('悔棋被阻止：無歷史記錄、遊戲結束或AI思考中');
            return;
        }

        // AI vs AI 模式不允許悔棋
        if (this.gameMode === 'ai-vs-ai') {
            const cannotUndoText = window.textManager ?
                window.textManager.getText('undo.cannotUndo') :
                '無法悔棋';
            const noUndoMessage = window.textManager ?
                window.textManager.getText('undo.aiVsAiNoUndo') :
                'AI對戰模式不支援悔棋功能。';
            this.ui.showModal(cannotUndoText, noUndoMessage);
            return;
        }

        // 在人機對戰模式下，需要撤銷兩步（AI一步 + 玩家一步）
        if (this.gameMode === 'human-vs-ai') {
            // 確保有足夠的歷史記錄可以撤銷兩步
            if (this.board.moveHistory.length < 2) {
                const cannotUndoText = window.textManager ?
                    window.textManager.getText('undo.cannotUndo') :
                    '無法悔棋';
                const needMinMovesMessage = window.textManager ?
                    window.textManager.getText('undo.needMinimumMoves') :
                    '需要至少完成一輪對戰才能悔棋。';
                this.ui.showModal(cannotUndoText, needMinMovesMessage);
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
                console.log(`人機對戰模式：成功撤銷了 ${undoCount} 步移動`);
            }
        } else if (this.gameMode === 'human-vs-human') {
            // 人人對戰模式：只撤銷最後一步
            if (this.board.undoLastMove()) {
                console.log('人人對戰模式：成功撤銷了最後一步移動');
            }
        }        // 更新棋盤顯示
        this.ui.renderBoard(this.board, null);

        // 更新遊戲狀態
        this.ui.updateGameStatus(this.board.currentPlayer, false, null, this.getGameContext());

        // 如果沒有移動歷史，禁用悔棋按鈕
        if (this.board.moveHistory.length === 0) {
            document.getElementById('undo').disabled = true;
        }

        // 在人機對戰模式下，確保輪到玩家回合
        if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed) {
            // 檢查當前是否為玩家回合，如果不是則需要調整
            const isPlayerTurn = (this.playerColor === this.board.currentPlayer);
            if (!isPlayerTurn) {                // 如果悔棋後輪到AI，再撤銷一步讓玩家繼續
                if (this.board.moveHistory.length > 0 && this.board.undoLastMove()) {
                    this.ui.renderBoard(this.board, null);
                    this.ui.updateGameStatus(this.board.currentPlayer, false, null, this.getGameContext());
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
            }            // 更新UI顯示
            this.ui.updateGameStatus(this.board.currentPlayer, true, winner, this.getGameContext());// 更新遊戲結束狀態
            this.gameOver = true;

            // 停止AI循環
            this.stopAILoop();

            // 記錄遊戲結束信息
            this.gameRecord.endTime = new Date();
            this.gameRecord.winner = winner; this.gameRecord.finalScore = scores;

            // 生成詳細的獲勝信息
            const winnerInfo = this.generateWinnerMessage(winner, scores);// 顯示詳細的遊戲結束模態框
            this.ui.showGameEndModal(
                winnerInfo.title,
                winnerInfo.message,
                [
                    {
                        text: window.textManager ? window.textManager.getText('ui.buttons.confirm') : '確認',
                        type: 'primary',
                        callback: () => {
                            // 確認按鈕回調：可以在這裡添加確認後的邏輯
                            console.log('遊戲結束確認');
                        }
                    }, {
                        text: window.textManager ? window.textManager.getText('ui.buttons.viewRecord') : '查看棋譜',
                        type: 'secondary',
                        callback: () => {
                            // 查看棋譜按鈕回調：顯示重播模態框
                            console.log('顯示重播模態框，遊戲記錄:', this.gameRecord);
                            if (this.ui.showReplayModal) {
                                this.ui.showReplayModal(this.gameRecord);
                            } else {
                                console.warn('showReplayModal 方法未實作');
                                const notImplementedTitle = window.textManager ?
                                    window.textManager.getText('ui.messages.notImplemented') :
                                    '功能未實作';
                                const notImplementedMessage = window.textManager ?
                                    window.textManager.getText('ui.messages.viewRecordNotImplemented') :
                                    '查看棋譜功能尚未實作，敬請期待！';
                                alert(`${notImplementedTitle}\n${notImplementedMessage}`);
                            }
                        }
                    }
                ]
            );

            return true;
        }        // 如果遊戲未結束，更新UI顯示當前玩家
        this.ui.updateGameStatus(this.board.currentPlayer, false, null, this.getGameContext());

        return false;
    }// 新增：統一由 modal.js 回傳設定後套用
    applyGameSettings(settings) {
        console.log('應用遊戲設定:', settings);

        // 停止當前所有AI循環
        this.stopAILoop();

        // settings: { mode, aiLevel, playerColor } 或 { mode, blackAiLevel, whiteAiLevel }
        this.gameMode = settings.mode;

        // 設定玩家顏色（只在人機模式需要）
        if (settings.playerColor) {
            this.playerColor = settings.playerColor === 'black' ? 1 : 2;
        } else {
            this.playerColor = 1; // 預設黑子
        }

        this.aiDifficultyConfirmed = true;

        if (this.gameMode === 'ai-vs-ai') {
            // AI vs AI 模式：分別設定黑白子難度
            this.blackAI.setDifficulty(settings.blackAiLevel || 'medium');
            this.whiteAI.setDifficulty(settings.whiteAiLevel || 'medium');
            console.log(`AI vs AI 模式：黑子難度 ${settings.blackAiLevel}, 白子難度 ${settings.whiteAiLevel}`);
        } else if (this.gameMode === 'human-vs-ai') {
            // 人機模式：使用統一難度
            this.ai.setDifficulty(settings.aiLevel || 'medium');
            this.blackAI.setDifficulty(settings.aiLevel || 'medium');
            this.whiteAI.setDifficulty(settings.aiLevel || 'medium');
        }

        // UI模式高亮
        this.ui.setModeActive(this.gameMode);
        // 重置遊戲
        this.resetGame();

        // 修正：如果是人機對戰且玩家選白子，AI 需先下
        if (
            this.gameMode === 'human-vs-ai' &&
            this.aiDifficultyConfirmed &&
            this.playerColor === 2 && // 玩家選白子
            this.board.currentPlayer === 1 // 黑子先手
        ) {
            setTimeout(() => {
                this.makeAIMove();
            }, 300);
        }
    }    // AI自動下棋
    makeAIMove() {
        // 檢查是否應該停止AI行動
        if (this.gameOver || this.aiThinking || !this.aiLoopActive) {
            console.log('AI移動被阻止 - 遊戲結束、AI思考中或循環已停止');
            return;
        }

        this.aiThinking = true;
        let aiPlayer = this.board.currentPlayer === 1 ? this.blackAI : this.whiteAI;

        this.aiMoveTimeout = setTimeout(() => {
            // 再次檢查循環狀態
            if (!this.aiLoopActive) {
                this.aiThinking = false;
                console.log('AI移動取消 - 循環已停止');
                return;
            } const move = aiPlayer.makeMove(this.board);
            console.log('AI move:', move, 'currentPlayer:', this.board.currentPlayer);
            if (
                Array.isArray(move) &&
                move.length === 2 &&
                typeof move[0] === 'number' &&
                typeof move[1] === 'number' &&
                this.board.isValidMove(move[0], move[1], this.board.currentPlayer)
            ) {
                const [row, col] = move;
                this.handleCellClick(row, col, true); // 確保傳遞 isAI = true
                // aiThinking 會在 handleCellClick 的動畫回調中重置
            } else {                // 沒有有效移動，AI 跳過回合
                this.board.passTurn?.();
                this.ui.renderBoard(this.board, null, () => {
                    // 動畫完成後檢查遊戲狀態
                    this.aiThinking = false; // 重置 AI 思考狀態
                    if (!this.board.hasValidMove(this.board.currentPlayer)) {
                        this.gameOver = true;
                        this.aiLoopActive = false;
                        this.ui.updateGameStatus(null, true, this.board.getWinner ? this.board.getWinner() : null, this.getGameContext());
                    } else if (this.gameMode === 'ai-vs-ai' && this.aiLoopActive) {
                        // AI vs AI 模式繼續下一步
                        setTimeout(() => {
                            this.makeAIMove();
                        }, 300);
                    }
                });
            }
        }, 500);
    }// AI vs AI 模式自動進行
    startAIvsAI() {
        if (this.gameOver) return;

        // 設置AI循環為活動狀態
        this.aiLoopActive = true;

        // 啟動第一步AI移動
        setTimeout(() => {
            if (this.aiLoopActive && !this.gameOver) {
                this.makeAIMove();
            }
        }, 300);
    }

    // 處理棋盤點擊事件
    handleCellClick(row, col, isAI = false) {
        // 檢查是否輪到玩家下棋（在人機对戰模式下）
        if (!isAI && this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed) {
            // 確認是否輪到玩家
            if (this.board.currentPlayer !== this.playerColor) {
                console.log('不是您的回合');
                return;
            }
        }

        // 檢查是否是有效走步
        if (!this.board.isValidMove(row, col, this.board.currentPlayer)) {
            console.log(`無效走步: (${row}, ${col})`);
            return;
        }        // 執行走步
        const result = this.board.makeMove(row, col, this.board.currentPlayer);
        if (result) {            // 記錄移動到遊戲記錄中 (注意：makeMove 已經切換了玩家，所以需要記錄前一個玩家)
            const playerWhoMoved = this.board.currentPlayer === 1 ? 2 : 1;
            this.recordMove(row, col, playerWhoMoved, result.flippedPieces);

            // 更新悔棋按鈕狀態
            const undoButton = document.getElementById('undo');
            if (undoButton) {
                undoButton.disabled = this.board.moveHistory.length === 0;
            }            // 更新UI並等待動畫完成
            this.ui.renderBoard(this.board, result, () => {
                // 動畫完成後的回調函數
                console.log('翻棋動畫完成，準備進行下一步');

                // 重置 AI 思考狀態
                this.aiThinking = false;

                // 檢查遊戲狀態
                if (this.checkGameState()) {
                    return; // 遊戲結束
                }

                // 檢查下一位玩家是否有有效走步
                if (!this.board.hasValidMove(this.board.currentPlayer)) {
                    // 如果沒有有效走步，跳過回合
                    setTimeout(() => {
                        this.skipTurn();
                    }, 300);
                    return;
                }                // 如果是人機對戰模式且輪到AI，執行AI走步
                if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed &&
                    this.board.currentPlayer !== this.playerColor) {
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 300);
                } else if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed && this.aiLoopActive) {
                    // AI對AI模式，繼續AI走步
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 300);
                }
            });
        }
    }    // 跳過回合
    async skipTurn() {
        // 防止在 AI 思考期間重複調用
        if (this.aiThinking || this.gameOver) {
            console.log('skipTurn 被阻止 - AI 思考中或遊戲已結束');
            return false;
        }

        // 如果當前玩家沒有有效移動，則跳過回合
        if (!this.board.hasValidMove(this.board.currentPlayer)) {
            // 準備提示訊息
            const currentPlayerText = window.textManager ?
                window.textManager.getText(this.board.currentPlayer === 1 ? 'game.players.black' : 'game.players.white') :
                (this.board.currentPlayer === 1 ? '黑子' : '白子');
            const nextPlayerText = window.textManager ?
                window.textManager.getText(this.board.currentPlayer === 1 ? 'game.players.white' : 'game.players.black') :
                (this.board.currentPlayer === 1 ? '白子' : '黑子');

            let messageText;
            if (window.textManager) {
                messageText = window.textManager.formatText('notifications.cannotMove', {
                    player: currentPlayerText,
                    nextPlayer: nextPlayerText
                });
            } else {
                messageText = `${currentPlayerText}沒有可走的步，輪到${nextPlayerText}`;
            }

            // 根據遊戲模式決定使用模態框還是通知系統
            if (this.gameMode === 'human-vs-human') {
                // 人類對人類模式：使用模態框，需要用戶確認
                await new Promise(resolve => {
                    this.ui.showModal('無法走步', messageText, resolve);
                });
            } else if (this.gameMode === 'human-vs-ai') {
                // 人類對AI模式：使用通知系統，不阻塞遊戲流程
                this.ui.showInfoNotification('無法走步', messageText, 2500);
                // 添加短暫延遲讓用戶看到通知
                await new Promise(resolve => setTimeout(resolve, 800));
            } else if (this.gameMode === 'ai-vs-ai') {
                // AI對AI模式：使用通知系統，持續時間較短
                this.ui.showInfoNotification('無法走步', messageText, 1500);
                // 添加短暫延遲讓用戶看到通知
                await new Promise(resolve => setTimeout(resolve, 400));
            }            // 記錄跳過回合事件
            this.recordSkip(this.board.currentPlayer); // 記錄當前無法下子的玩家

            // 切換玩家
            this.board.switchPlayer();

            // 重新渲染棋盤以顯示新玩家的可下子位置
            this.ui.renderBoard(this.board, null);            // 更新UI顯示
            this.ui.updateGameStatus(this.board.currentPlayer, false, null, this.getGameContext());

            // 檢查下一個玩家是否也沒有有效移動
            if (!this.board.hasValidMove(this.board.currentPlayer)) {
                // 如果兩個玩家都沒有有效移動，遊戲結束
                this.checkGameState();
                return true;
            }            // 如果是AI回合，執行AI移動
            if (this.gameMode === 'human-vs-ai' && this.aiDifficultyConfirmed &&
                ((this.playerColor === 1 && this.board.currentPlayer === 2) ||
                    (this.playerColor === 2 && this.board.currentPlayer === 1))) {
                setTimeout(() => {
                    if (!this.gameOver) {
                        this.makeAIMove();
                    }
                }, 500);
            } else if (this.gameMode === 'ai-vs-ai' && this.aiDifficultyConfirmed && this.aiLoopActive) {
                setTimeout(() => {
                    if (!this.gameOver && this.aiLoopActive) {
                        this.makeAIMove();
                    }
                }, 500);
            }

            return true;
        }

        return false;
    }

    // 生成詳細的獲勝信息
    generateWinnerMessage(winner, scores) {
        const blackScore = scores.black;
        const whiteScore = scores.white;

        // 基本獲勝信息
        let winnerText = '';
        let detailText = ''; if (winner === null) {
            // 平局
            winnerText = window.textManager ?
                window.textManager.getText('game.result.draw') :
                '平局';
            detailText = `<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
        } else {
            const colorName = winner === 1 ?
                (window.textManager ? window.textManager.getText('game.players.black') : '黑子') :
                (window.textManager ? window.textManager.getText('game.players.white') : '白子');

            // 根據遊戲模式生成不同的獲勝信息
            switch (this.gameMode) {
                case 'human-vs-human':
                    winnerText = `${colorName}獲勝！`;
                    detailText = `<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
                    break;

                case 'human-vs-ai':
                    const isPlayerWin = (winner === this.playerColor);
                    const aiDifficulty = this.getDifficultyDisplayName(this.ai.difficulty); if (isPlayerWin) {
                        winnerText = `恭喜您獲勝！`;
                        detailText = `您(${colorName})擊敗了${aiDifficulty}難度的AI<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
                    } else {
                        winnerText = `AI獲勝！`;
                        const aiColorName = winner === 1 ?
                            (window.textManager ? window.textManager.getText('game.players.black') : '黑子') :
                            (window.textManager ? window.textManager.getText('game.players.white') : '白子');
                        detailText = `${aiDifficulty}難度的AI(${aiColorName})獲得勝利<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
                    }
                    break;

                case 'ai-vs-ai':
                    const blackDifficulty = this.getDifficultyDisplayName(this.blackAI.difficulty);
                    const whiteDifficulty = this.getDifficultyDisplayName(this.whiteAI.difficulty); if (winner === 1) {
                        winnerText = `黑子AI獲勝！`;
                        detailText = `${blackDifficulty}難度的黑子AI擊敗了${whiteDifficulty}難度的白子AI<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
                    } else {
                        winnerText = `白子AI獲勝！`;
                        detailText = `${whiteDifficulty}難度的白子AI擊敗了${blackDifficulty}難度的黑子AI<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
                    }
                    break; default:
                    winnerText = `${colorName}獲勝！`;
                    detailText = `<br>最終比分：黑子 ${blackScore} - ${whiteScore} 白子`;
            }
        }

        return { title: winnerText, message: detailText };
    }

    // 將AI難度轉換為顯示名稱
    getDifficultyDisplayName(difficulty) {
        switch (difficulty) {
            case 'easy': return '簡單';
            case 'medium': return '普通';
            case 'hard': return '困難';
            case 'super-hard': return '超困難';
            default: return '普通';
        }
    }

    // 獲取遊戲上下文信息，用於UI更新
    getGameContext() {
        return {
            gameMode: this.gameMode,
            playerColor: this.playerColor,
            aiThinking: this.aiThinking,
            blackAI: this.blackAI,
            whiteAI: this.whiteAI,
            aiDifficultyConfirmed: this.aiDifficultyConfirmed
        };
    }
}

// filepath: c:\大學資料\大一下\人工智慧導論\final_project\tic_tac_toe\js\game.js
class Game {
    constructor() {
        this.board = new Board();
        this.ai = new AI();
        this.ui = new UI();
        this.storage = window.gameStorage || new GameStorage();

        this.gameMode = 'human'; // 'human' 或 'ai'
        this.currentPlayer = 'X'; // X 總是先手
        this.gameActive = false;
        this.gameHistory = [];
        this.aiDifficulty = 'medium';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.ui.showMainMenu();
    }

    setupEventListeners() {
        // 注意：UI 類別已經處理了所有事件綁定
        // 這裡只需要設置一些 Game 類別特定的事件監聽器

        // 遊戲結束時的處理
        document.addEventListener('gameEnd', (e) => {
            this.handleGameEnd(e.detail);
        });

        // 遊戲重置時的處理
        document.addEventListener('gameReset', () => {
            this.resetGame();
        });
    }

    startGame(mode) {
        this.gameMode = mode;
        this.gameActive = true;
        this.currentPlayer = 'X';  // X 總是先手
        this.gameHistory = [];
        this.gameStartTime = Date.now(); // 記錄遊戲開始時間
        this.board.reset();
        this.ui.updateBoard(this.board);

        console.log(`遊戲開始: 模式=${mode}, 玩家符號=${this.playerSymbol || 'X'}`);

        // 更新遊戲狀態訊息
        if (this.gameMode === 'ai-vs-ai') {
            this.ui.updateGameStatus('AI 對戰開始');
        } else if (this.gameMode === 'ai' && this.playerSymbol === 'O') {
            // 玩家選擇 O，提示 AI 先行
            this.ui.updateGameStatus('AI (X) 回合');
        } else {
            this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
        }

        // AI vs AI 模式：啟動第一個 AI 移動
        if (this.gameMode === 'ai-vs-ai') {
            setTimeout(() => this.makeAIMove(), 800);
        }
        // 人類 vs AI 模式，如果玩家選擇 O (後手)，讓 AI 先行
        else if (this.gameMode === 'ai' && this.playerSymbol === 'O') {
            // 確認玩家是 O 時，AI 應該先行(X)
            setTimeout(() => this.makeAIMove(), 800);
        }
    }
    handleCellClick(index) {
        if (!this.gameActive) return;

        // 檢查是否是正確的玩家回合
        if (this.gameMode === 'ai') {
            // 在人類 vs AI 模式，確認是玩家的回合
            if ((this.playerSymbol === 'X' && this.currentPlayer === 'O') ||
                (this.playerSymbol === 'O' && this.currentPlayer === 'X')) {
                // 如果不是玩家的回合，不處理點擊
                return;
            }
        }

        if (!this.board.makeMove(index, this.currentPlayer)) {
            return;
        }

        // 記錄移動歷史
        this.gameHistory.push({
            index: index,
            player: this.currentPlayer,
            boardState: [...this.board.grid]
        });

        this.ui.updateBoard(this.board);
        this.ui.setAnimating(true);

        // 添加放置動畫
        setTimeout(() => {
            this.ui.setAnimating(false);
        }, 300);        // 檢查遊戲結束
        const winResult = this.board.checkWinner();
        if (winResult) {
            this.endGame(winResult.winner);
            return;
        }

        if (this.board.isFull()) {
            this.endGame('tie');
            return;
        }

        // 切換玩家
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        // 更新遊戲狀態訊息
        if (this.gameMode === 'ai') {
            // 人類 vs AI 模式
            if ((this.playerSymbol === 'X' && this.currentPlayer === 'O') ||
                (this.playerSymbol === 'O' && this.currentPlayer === 'X')) {
                // 輪到 AI 回合
                this.ui.updateGameStatus(`AI 思考中...`);
                setTimeout(() => this.makeAIMove(), 800);
            } else {
                // 輪到玩家回合
                this.ui.updateGameStatus(`玩家回合 (${this.currentPlayer})`);
            }
        } else {
            // 雙人模式
            this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
        }
    }
    async makeAIMove() {
        // 更新 AI 思考狀態
        const currentAI = this.gameMode === 'ai-vs-ai' ?
            `${this.currentPlayer} AI` : 'AI';

        this.ui.updateGameStatus(`${currentAI} 思考中...`);
        this.ui.showAIThinking();

        // 添加延遲讓玩家看到 AI 在思考
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 選擇使用對應的 AI 難度
        let aiDifficulty = this.aiDifficulty;
        if (this.gameMode === 'ai-vs-ai') {
            aiDifficulty = this.currentPlayer === 'X' ? this.aiDifficultyX : this.aiDifficultyO;
            this.ai.setDifficulty(aiDifficulty);
        }

        // 執行 AI 移動
        const move = this.ai.makeMove(this.board, this.currentPlayer);

        if (move !== null && move !== undefined) {
            this.board.makeMove(move, this.currentPlayer);

            // 記錄移動歷史
            this.gameHistory.push({
                index: move,
                player: this.currentPlayer,
                boardState: [...this.board.grid]
            });

            this.ui.updateBoard(this.board);
            this.ui.hideAIThinking();            // 檢查遊戲結束
            const winResult = this.board.checkWinner();
            if (winResult) {
                this.endGame(winResult.winner);
                return;
            }

            if (this.board.isFull()) {
                this.endGame('tie');
                return;
            }// 切換玩家
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

            // 根據不同模式決定下一步
            if (this.gameMode === 'ai-vs-ai') {
                // AI vs AI 模式：繼續下一個 AI 的回合
                this.ui.updateGameStatus(`${this.currentPlayer} AI 回合`);
                setTimeout(() => this.makeAIMove(), 800);
            } else if (this.gameMode === 'ai') {
                // 人類對 AI 模式
                if (this.playerSymbol === 'X' && this.currentPlayer === 'O') {
                    // 如果玩家是 X，AI 是 O，且現在輪到 O
                    setTimeout(() => this.makeAIMove(), 800);
                } else if (this.playerSymbol === 'O' && this.currentPlayer === 'X') {
                    // 如果玩家是 O，AI 是 X，且現在輪到 X
                    setTimeout(() => this.makeAIMove(), 800);
                } else {
                    // 輪到玩家
                    this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
                }
            } else {
                // 輪到玩家
                this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
            }
        }
    } endGame(result) {
        this.gameActive = false;

        let message = '';
        let title = '';
        let isWin = false;

        // 獲取勝利線條（如果有的話）
        const winningResult = this.board.checkWinner();
        const winLine = winningResult ? winningResult.winningLine : null;

        if (result === 'tie') {
            title = window.textManager?.getText('ui.messages.gameDraw', '平局！');
            message = window.textManager?.getText('ui.messages.gameDrawMessage', '遊戲結束，雙方平手！');
        } else if (result === 'X') {
            if (this.gameMode === 'human') {
                title = window.textManager?.getText('ui.messages.gameVsHumanWin', '{player} 玩家獲勝！').replace('{player}', 'X');
                message = '玩家 X 成功連成一線，取得勝利！';
            } else if (this.gameMode === 'ai') {
                // 人類與 AI 對戰
                if (this.playerSymbol === 'X') {
                    title = window.textManager?.getText('ui.messages.gameVsAIWin', '恭喜您獲勝！');
                    message = '恭喜你成功連成一線，戰勝了AI對手！';
                    isWin = true;
                } else {
                    title = window.textManager?.getText('ui.messages.gameVsAILose', 'AI 獲勝！');
                    message = 'AI (X) 成功連成一線，取得勝利！';
                }
            } else if (this.gameMode === 'ai-vs-ai') {
                // AI vs AI 對戰
                title = 'X AI 獲勝！';
                message = `X AI (${this.aiDifficultyX}) 成功連成一線，戰勝了 O AI (${this.aiDifficultyO})！`;
            }
        } else if (result === 'O') {
            if (this.gameMode === 'human') {
                title = window.textManager?.getText('ui.messages.gameVsHumanWin', '{player} 玩家獲勝！').replace('{player}', 'O');
                message = '玩家 O 成功連成一線，取得勝利！';
            } else if (this.gameMode === 'ai') {
                // 人類與 AI 對戰
                if (this.playerSymbol === 'O') {
                    title = window.textManager?.getText('ui.messages.gameVsAIWin', '恭喜您獲勝！');
                    message = '恭喜你成功連成一線，戰勝了AI對手！';
                    isWin = true;
                } else {
                    title = window.textManager?.getText('ui.messages.gameVsAILose', 'AI 獲勝！');
                    message = 'AI (O) 成功連成一線，取得勝利！';
                }
            } else if (this.gameMode === 'ai-vs-ai') {
                // AI vs AI 對戰
                title = 'O AI 獲勝！';
                message = `O AI (${this.aiDifficultyO}) 成功連成一線，戰勝了 X AI (${this.aiDifficultyX})！`;
            }
        }

        console.log(`遊戲結束：結果=${result}, 標題=${title}, 訊息=${message}`);

        // 更新遊戲狀態和顯示結束對話框
        this.ui.updateGameStatus(title);
        this.ui.showGameEndDialog(title, message);

        // 標記獲勝線
        if (winLine) {
            this.ui.highlightWinningLine(winLine);
        }        // 儲存遊戲結果
        let gameMode = this.gameMode;
        let gameResult = result;
        let gameWinner = null;

        // 轉換遊戲模式名稱以匹配 storage.js 期望的格式
        if (this.gameMode === 'human') {
            gameMode = 'human-vs-human';
        } else if (this.gameMode === 'ai') {
            gameMode = 'human-vs-ai';
            // 對於 human-vs-ai 模式，需要轉換結果格式
            if (result === 'tie') {
                gameResult = 'draw';
            } else if ((result === 'X' && this.playerSymbol === 'X') ||
                (result === 'O' && this.playerSymbol === 'O')) {
                gameResult = 'win';
            } else {
                gameResult = 'lose';
            }
        } else if (this.gameMode === 'ai-vs-ai') {
            gameMode = 'ai-vs-ai';
            if (result === 'tie') {
                gameResult = 'draw';
            } else {
                gameWinner = result; // 'X' 或 'O'
            }
        }

        // 對於非 human-vs-ai 模式，設置獲勝者
        if (gameMode !== 'human-vs-ai' && result !== 'tie' && result !== 'draw') {
            gameWinner = result;
        }

        const gameData = {
            mode: gameMode,
            result: gameResult,
            winner: gameWinner,
            difficulty: gameMode === 'human-vs-ai' ? this.aiDifficulty :
                gameMode === 'ai-vs-ai' ? { x: this.aiDifficultyX, o: this.aiDifficultyO } : null,
            gameTime: Date.now() - this.gameStartTime,
            playerSymbol: this.playerSymbol,
            timestamp: Date.now()
        };

        this.storage.saveGameResult(gameData);
    }

    restartGame() {
        this.startGame(this.gameMode);
    }

    returnToMenu() {
        this.gameActive = false;
        // 顯示主選單的邏輯（重新顯示模式選擇）
        document.querySelector('.mode-selection').style.display = 'block';
        document.querySelector('.ai-difficulty').style.display = 'none';
        document.querySelector('.player-symbol-selection').style.display = 'none';
    }

    undoMove() {
        if (this.gameHistory.length === 0 || !this.gameActive) return;

        // 在 AI 模式下，需要撤銷兩步（玩家和 AI）
        const movesToUndo = this.gameMode === 'ai' && this.gameHistory.length >= 2 ? 2 : 1;

        for (let i = 0; i < movesToUndo && this.gameHistory.length > 0; i++) {
            this.gameHistory.pop();
        }

        // 恢復棋盤狀態
        if (this.gameHistory.length > 0) {
            const lastMove = this.gameHistory[this.gameHistory.length - 1];
            this.board.setBoard(lastMove.boardState);
            this.currentPlayer = lastMove.player === 'X' ? 'O' : 'X';
        } else {
            this.board.reset();
            this.currentPlayer = 'X';
        }

        this.ui.updateBoard(this.board);
        this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
    }

    loadSettings() {
        const settings = this.storage.loadSettings();
    }

    // 獲取遊戲統計數據
    getGameStats() {
        return this.storage.loadStats();
    }

    // 重置遊戲統計
    resetStats() {
        return this.storage.resetStats();
    }    // 設置玩家符號
    setPlayerSymbol(symbol) {
        // 設置玩家符號並記錄到控制台
        this.playerSymbol = symbol;
        console.log(`設置玩家符號: ${symbol}`);

        // 重置當前相關邏輯
        if (this.gameMode === 'ai') {
            // 如果是 AI 模式，自動設置 AI 使用的符號
            this.aiSymbol = symbol === 'X' ? 'O' : 'X';
            console.log(`AI 使用符號: ${this.aiSymbol}`);
        }
    }

    // 設置 AI 難度
    setAIDifficulty(difficulty, player = null) {
        if (player) {
            // AI vs AI 模式
            if (player === 'X') {
                this.aiDifficultyX = difficulty;
            } else {
                this.aiDifficultyO = difficulty;
            }
        } else {
            // 人類 vs AI 模式
            this.aiDifficulty = difficulty;
            this.ai.setDifficulty(difficulty);
        }
    }

    // 重新開始遊戲
    restartGame() {
        this.board.reset();
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.gameHistory = [];

        this.ui.updateBoard(this.board);
        this.ui.updateGameStatus(`玩家 ${this.currentPlayer} 的回合`);
        this.ui.showGameBoard();

        // 如果是 AI vs AI 模式，開始 AI 對戰
        if (this.gameMode === 'ai-vs-ai') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    // 重置遊戲（回到主選單）
    resetGame() {
        this.gameActive = false;
        this.board.reset();
        this.currentPlayer = 'X';
        this.gameHistory = [];
        this.ui.showMainMenu();
    }
}

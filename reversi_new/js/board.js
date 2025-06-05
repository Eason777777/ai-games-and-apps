class Board {
    constructor() {
        this.size = 8;
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.currentPlayer = 1; // 1 for black, 2 for white
        this.directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        this.moveHistory = [];
        this.initialize();
    }

    initialize() {
        // Clear the board
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }

        // Set up the initial 4 pieces
        const mid = this.size / 2;
        this.grid[mid - 1][mid - 1] = 2; // white
        this.grid[mid - 1][mid] = 1;   // black
        this.grid[mid][mid - 1] = 1;   // black
        this.grid[mid][mid] = 2;     // white

        this.currentPlayer = 1;      // black goes first
        this.moveHistory = [];
    }

    isValidMove(row, col, player = this.currentPlayer) {
        // Check if the cell is empty
        if (this.grid[row][col] !== 0) {
            return false;
        }

        // Check if the move would flip any opponent pieces
        const opponent = player === 1 ? 2 : 1;
        let flipped = false;

        // Check in all 8 directions
        for (const [dRow, dCol] of this.directions) {
            let r = row + dRow;
            let c = col + dCol;
            let flippableInThisDirection = false;
            const piecesToFlip = [];

            // Look for opponent's pieces followed by own piece
            while (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                if (this.grid[r][c] === 0) {
                    break; // Empty cell, no flip in this direction
                }

                if (this.grid[r][c] === opponent) {
                    piecesToFlip.push([r, c]);
                    r += dRow;
                    c += dCol;
                } else {
                    // Found our own piece after opponent's pieces
                    flippableInThisDirection = piecesToFlip.length > 0;
                    break;
                }
            }

            if (flippableInThisDirection) {
                flipped = true;
                break;
            }
        }

        return flipped;
    }

    getValidMoves(player = this.currentPlayer) {
        const validMoves = [];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.isValidMove(row, col, player)) {
                    validMoves.push([row, col]);
                }
            }
        }

        return validMoves;
    } makeMove(row, col, player = this.currentPlayer) {
        try {
            // 參數有效性檢查
            if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
                console.error(`無效的走步座標: (${row},${col})`);
                return false;
            }

            if (player !== 1 && player !== 2) {
                console.error(`無效的玩家值: ${player}`);
                return false;
            }

            if (!this.isValidMove(row, col, player)) {
                console.log(`無效走步: 玩家 ${player} 在座標 (${row},${col})`);
                return false;
            }

            // 保存當前狀態用於悔棋
            this.saveState();

            // 放置棋子
            this.grid[row][col] = player;

            // 翻轉對手棋子並獲取翻轉信息
            const flippedPieces = this.flipPieces(row, col, player);

            // 切換玩家
            this.currentPlayer = player === 1 ? 2 : 1;
            console.log(`玩家切換為: ${this.currentPlayer === 1 ? '黑方' : '白方'}`);

            // 返回最後一步走步信息和翻轉棋子
            return {
                row: row,
                col: col,
                flippedPieces: flippedPieces
            };
        } catch (error) {
            console.error('走步時發生錯誤:', error);
            return false;
        }
    } flipPieces(row, col, player) {
        const opponent = player === 1 ? 2 : 1;
        const flippedPieces = [];

        for (const [dRow, dCol] of this.directions) {
            let r = row + dRow;
            let c = col + dCol;
            const piecesToFlip = [];

            // 確定翻轉方向類型
            let directionType;
            if (dRow === 0) {
                directionType = 'h'; // 水平方向
            } else if (dCol === 0) {
                directionType = 'v'; // 垂直方向
            } else if (dRow * dCol > 0) {
                directionType = 'd1'; // 從左上到右下的對角線
            } else {
                directionType = 'd2'; // 從右上到左下的對角線
            }

            // Find pieces to flip in this direction
            while (r >= 0 && r < this.size && c >= 0 && c < this.size) {
                if (this.grid[r][c] === 0) {
                    break;
                }

                if (this.grid[r][c] === opponent) {
                    piecesToFlip.push([r, c, directionType]); // 添加方向信息
                    r += dRow;
                    c += dCol;
                } else {
                    // Found our own piece, can flip the collected ones
                    for (const [flipRow, flipCol, dir] of piecesToFlip) {
                        this.grid[flipRow][flipCol] = player;
                        flippedPieces.push([flipRow, flipCol, dir]); // 返回方向信息
                    }
                    break;
                }
            }
        }

        return flippedPieces;
    } saveState() {
        // Create a deep copy of the current grid
        const gridCopy = this.grid.map(row => [...row]);
        this.moveHistory.push({
            grid: gridCopy,
            currentPlayer: this.currentPlayer
        });
    }

    undo() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastState = this.moveHistory.pop();
        this.grid = lastState.grid;
        this.currentPlayer = lastState.currentPlayer;

        return true;
    }

    // 悔棋方法 - 供 game.js 調用
    undoLastMove() {
        return this.undo();
    }

    // 檢查指定玩家是否有合法走步
    hasValidMove(player) {
        // 確保玩家參數有效
        if (player !== 1 && player !== 2) {
            console.error(`hasValidMove: 無效的玩家值: ${player}`);
            return false;
        }

        // 遍歷整個棋盤尋找合法走步
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                try {
                    if (this.isValidMove(row, col, player)) {
                        return true;
                    }
                } catch (error) {
                    console.error(`檢查走步有效性時出錯: (${row},${col}) 玩家: ${player}`, error);
                }
            }
        }
        return false;
    }    // 取得棋盤上黑白子的數量
    getScore() {
        let black = 0;
        let white = 0;

        try {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    if (this.grid[row][col] === 1) {
                        black++;
                    } else if (this.grid[row][col] === 2) {
                        white++;
                    }
                }
            }
        } catch (error) {
            console.error('計算分數時發生錯誤:', error);
            // 返回預設值防止應用崩潰
        }

        return { black, white };
    }    // 切換當前玩家
    switchPlayer() {
        try {
            // 確保當前玩家值有效
            if (this.currentPlayer !== 1 && this.currentPlayer !== 2) {
                console.warn(`switchPlayer: 當前玩家值無效: ${this.currentPlayer}，重置為黑方(1)`);
                this.currentPlayer = 1;
                return;
            }

            // 正常切換玩家
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            console.log(`玩家已切換為: ${this.currentPlayer === 1 ? '黑方' : '白方'}`);
        } catch (error) {
            console.error('切換玩家時發生錯誤:', error);
        }
    }    // 新增：AI 無法下時換手
    passTurn() {
        this.switchPlayer();
    }
    // 判斷遊戲是否結束
    isGameOver() {
        try {
            const blackHasNoMoves = !this.hasValidMove(1);
            const whiteHasNoMoves = !this.hasValidMove(2);

            if (blackHasNoMoves && whiteHasNoMoves) {
                console.log('遊戲結束: 雙方都沒有可行走步');
                return true;
            }
            return false;
        } catch (error) {
            console.error('判斷遊戲是否結束時發生錯誤:', error);
            return false; // 發生錯誤時默認為遊戲未結束
        }
    }
}

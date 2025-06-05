// 井字棋遊戲盤面類別
class Board {
    constructor() {
        this.grid = Array(9).fill(null); // 9格棋盤，null表示空格
        this.currentPlayer = 'X'; // 當前玩家，X先手
    }

    // 重置棋盤
    reset() {
        this.grid = Array(9).fill(null);
        this.currentPlayer = 'X';
    }

    // 檢查指定位置是否為空
    isEmpty(index) {
        return this.grid[index] === null;
    }

    // 在指定位置放置棋子
    makeMove(index, player = this.currentPlayer) {
        if (this.isEmpty(index)) {
            this.grid[index] = player;
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            return true;
        }
        return false;
    }

    // 撤銷上一步
    undoMove(index) {
        if (this.grid[index] !== null) {
            this.grid[index] = null;
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            return true;
        }
        return false;
    }

    // 獲取所有空格位置
    getEmptyPositions() {
        return this.grid.map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);
    }    // 檢查是否有玩家獲勝
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫排
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直排
            [0, 4, 8], [2, 4, 6]             // 對角線
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.grid[a] &&
                this.grid[a] === this.grid[b] &&
                this.grid[a] === this.grid[c]) {

                // 記錄勝利信息
                const winResult = {
                    winner: this.grid[a],
                    winningLine: pattern
                };

                console.log(`檢測到勝利：${this.grid[a]} 在 ${pattern.join(',')} 位置獲勝`);
                return winResult;
            }
        }
        return null;
    }

    // 檢查是否平局
    isDraw() {
        return this.grid.every(cell => cell !== null) && !this.checkWinner();
    }

    // 檢查遊戲是否結束
    isGameOver() {
        return this.checkWinner() !== null || this.isDraw();
    }

    // 評估當前棋盤狀態（用於AI）
    evaluate() {
        const winner = this.checkWinner();
        if (winner) {
            return winner.winner === 'X' ? 10 : -10;
        }
        return 0; // 平局或遊戲未結束
    }

    // 獲取棋盤狀態的字串表示（用於調試）
    toString() {
        let result = '';
        for (let i = 0; i < 9; i += 3) {
            result += `${this.grid[i] || ' '} | ${this.grid[i + 1] || ' '} | ${this.grid[i + 2] || ' '}\n`;
            if (i < 6) result += '---------\n';
        }
        return result;
    }

    // 克隆棋盤（用於AI模擬）
    clone() {
        const newBoard = new Board();
        newBoard.grid = [...this.grid];
        newBoard.currentPlayer = this.currentPlayer;
        return newBoard;
    }

    // 獲取棋盤的雜湊值（用於優化）
    getHash() {
        return this.grid.map(cell => cell || '_').join('');
    }

    // 檢查是否為對稱位置（用於優化）
    isSymmetric() {
        // 檢查水平對稱
        if (this.grid[0] === this.grid[2] && this.grid[3] === this.grid[5] && this.grid[6] === this.grid[8]) {
            return true;
        }
        // 檢查垂直對稱
        if (this.grid[0] === this.grid[6] && this.grid[1] === this.grid[7] && this.grid[2] === this.grid[8]) {
            return true;
        }
        // 檢查對角線對稱
        if (this.grid[0] === this.grid[8] && this.grid[1] === this.grid[3] &&
            this.grid[2] === this.grid[6] && this.grid[5] === this.grid[7]) {
            return true;
        }
        return false;
    }

    // 獲取最佳開局位置
    getBestOpeningMoves() {
        const moveCount = this.grid.filter(cell => cell !== null).length;

        if (moveCount === 0) {
            // 第一步最佳位置：角落或中心
            return [0, 2, 4, 6, 8];
        } else if (moveCount === 1) {
            // 第二步策略
            if (this.grid[4] === null) {
                return [4]; // 中心未被佔據，佔據中心
            } else {
                return [0, 2, 6, 8]; // 中心被佔據，佔據角落
            }
        }

        return this.getEmptyPositions();
    }

    // 檢查是否存在緊急情況（需要阻擋或勝利）
    findCriticalMoves(player) {
        const opponent = player === 'X' ? 'O' : 'X';
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫排
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直排
            [0, 4, 8], [2, 4, 6]             // 對角線
        ];

        const winningMoves = [];
        const blockingMoves = [];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            const line = [this.grid[a], this.grid[b], this.grid[c]];

            // 檢查是否可以獲勝
            if (line.filter(cell => cell === player).length === 2 &&
                line.filter(cell => cell === null).length === 1) {
                const emptyIndex = pattern[line.indexOf(null)];
                winningMoves.push(emptyIndex);
            }

            // 檢查是否需要阻擋對手
            if (line.filter(cell => cell === opponent).length === 2 &&
                line.filter(cell => cell === null).length === 1) {
                const emptyIndex = pattern[line.indexOf(null)];
                blockingMoves.push(emptyIndex);
            }
        }

        return { winningMoves, blockingMoves };
    }

    // 檢查棋盤是否已滿
    isFull() {
        return this.grid.every(cell => cell !== null);
    }

    // 獲取獲勝線條
    getWinningLine() {
        const winner = this.checkWinner();
        return winner ? winner.winningLine : null;
    }
}

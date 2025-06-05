// 井字棋 AI 類別
class AI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.transpositionTable = new Map(); // 用於記憶化搜尋
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.transpositionTable.clear(); // 清空快取
    }

    // 根據難度等級選擇走法
    makeMove(board, player) {
        switch (this.difficulty) {
            case 'easy':
                return this.makeEasyMove(board, player);
            case 'medium':
                return this.makeMediumMove(board, player);
            case 'hard':
                return this.makeHardMove(board, player);
            case 'impossible':
                return this.makeImpossibleMove(board, player);
            default:
                return this.makeMediumMove(board, player);
        }
    }

    // 簡單難度：隨機選擇
    makeEasyMove(board, player) {
        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) return null;

        // 30% 機率選擇最佳步，70% 機率隨機選擇
        if (Math.random() < 0.3) {
            return this.makeMediumMove(board, player);
        }

        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        return emptyPositions[randomIndex];
    }

    // 普通難度：基本策略
    makeMediumMove(board, player) {
        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) return null;

        // 1. 檢查是否可以獲勝
        const { winningMoves, blockingMoves } = board.findCriticalMoves(player);
        if (winningMoves.length > 0) {
            return winningMoves[0];
        }

        // 2. 檢查是否需要阻擋對手
        if (blockingMoves.length > 0) {
            return blockingMoves[0];
        }

        // 3. 優先選擇中心
        if (board.isEmpty(4)) {
            return 4;
        }

        // 4. 選擇角落
        const corners = [0, 2, 6, 8].filter(pos => board.isEmpty(pos));
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. 選擇邊緣
        const edges = [1, 3, 5, 7].filter(pos => board.isEmpty(pos));
        if (edges.length > 0) {
            return edges[Math.floor(Math.random() * edges.length)];
        }

        return emptyPositions[0];
    }

    // 困難難度：使用 Minimax 演算法
    makeHardMove(board, player) {
        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) return null;

        // 使用 Minimax 演算法，但限制深度以增加一些不確定性
        const depth = Math.min(6, emptyPositions.length);
        const { bestMove } = this.minimax(board, depth, true, player, -Infinity, Infinity);

        // 90% 機率選擇最佳步，10% 機率選擇次佳步
        if (Math.random() < 0.9 || !bestMove) {
            return bestMove || emptyPositions[0];
        } else {
            // 找到次佳步
            let secondBestMove = null;
            let secondBestScore = -Infinity;

            for (const move of emptyPositions) {
                if (move === bestMove) continue;

                const tempBoard = board.clone();
                tempBoard.makeMove(move, player);
                const score = this.minimax(tempBoard, depth - 1, false, player, -Infinity, Infinity).score;

                if (score > secondBestScore) {
                    secondBestScore = score;
                    secondBestMove = move;
                }
            }

            return secondBestMove || bestMove || emptyPositions[0];
        }
    }

    // 不可能難度：完美的 Minimax 演算法
    makeImpossibleMove(board, player) {
        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) return null;

        // 使用完整的 Minimax 演算法
        const { bestMove } = this.minimax(board, emptyPositions.length, true, player, -Infinity, Infinity);
        return bestMove || emptyPositions[0];
    }

    // Minimax 演算法實現
    minimax(board, depth, isMaximizing, aiPlayer, alpha, beta) {
        const hash = board.getHash() + depth + isMaximizing + aiPlayer;
        if (this.transpositionTable.has(hash)) {
            return this.transpositionTable.get(hash);
        }

        const winner = board.checkWinner();

        // 終止條件
        if (winner) {
            const score = winner.winner === aiPlayer ? 10 - (9 - depth) : -10 + (9 - depth);
            const result = { score, bestMove: null };
            this.transpositionTable.set(hash, result);
            return result;
        }

        if (board.isDraw() || depth === 0) {
            const result = { score: 0, bestMove: null };
            this.transpositionTable.set(hash, result);
            return result;
        }

        const emptyPositions = board.getEmptyPositions();
        let bestMove = emptyPositions[0];

        if (isMaximizing) {
            let maxScore = -Infinity;

            for (const move of emptyPositions) {
                const tempBoard = board.clone();
                tempBoard.makeMove(move, aiPlayer);

                const { score } = this.minimax(tempBoard, depth - 1, false, aiPlayer, alpha, beta);

                if (score > maxScore) {
                    maxScore = score;
                    bestMove = move;
                }

                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break; // Alpha-Beta 剪枝
                }
            }

            const result = { score: maxScore, bestMove };
            this.transpositionTable.set(hash, result);
            return result;
        } else {
            let minScore = Infinity;
            const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

            for (const move of emptyPositions) {
                const tempBoard = board.clone();
                tempBoard.makeMove(move, humanPlayer);

                const { score } = this.minimax(tempBoard, depth - 1, true, aiPlayer, alpha, beta);

                if (score < minScore) {
                    minScore = score;
                    bestMove = move;
                }

                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break; // Alpha-Beta 剪枝
                }
            }

            const result = { score: minScore, bestMove };
            this.transpositionTable.set(hash, result);
            return result;
        }
    }

    // 評估棋盤位置的策略價值
    evaluatePosition(board, position, player) {
        const opponent = player === 'X' ? 'O' : 'X';
        let score = 0;

        // 位置權重
        const positionWeights = [
            3, 2, 3,
            2, 4, 2,
            3, 2, 3
        ];
        score += positionWeights[position];

        // 檢查該位置能形成的線條
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫排
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直排
            [0, 4, 8], [2, 4, 6]             // 對角線
        ];

        for (const pattern of winPatterns) {
            if (pattern.includes(position)) {
                const line = pattern.map(pos => board.grid[pos]);
                const playerCount = line.filter(cell => cell === player).length;
                const opponentCount = line.filter(cell => cell === opponent).length;
                const emptyCount = line.filter(cell => cell === null).length;

                if (opponentCount === 0) {
                    score += playerCount * 2;
                }
                if (playerCount === 0) {
                    score -= opponentCount * 2;
                }
            }
        }

        return score;
    }

    // 獲取所有可能的最佳移動
    getAllBestMoves(board, player) {
        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) return [];

        const moves = [];
        let bestScore = -Infinity;

        for (const move of emptyPositions) {
            const tempBoard = board.clone();
            tempBoard.makeMove(move, player);
            const score = this.minimax(tempBoard, emptyPositions.length - 1, false, player, -Infinity, Infinity).score;

            if (score > bestScore) {
                bestScore = score;
                moves.length = 0;
                moves.push(move);
            } else if (score === bestScore) {
                moves.push(move);
            }
        }

        return moves;
    }

    // 獲取難度說明
    getDifficultyDescription(difficulty) {
        const descriptions = {
            'easy': '隨機選擇為主，偶爾使用基本策略',
            'medium': '使用基本的攻守策略，優先中心和角落',
            'hard': '使用 Minimax 演算法，偶爾出現失誤',
            'impossible': '完美的 Minimax 演算法，永不出錯'
        };
        return descriptions[difficulty] || descriptions['medium'];
    }

    // 清空快取
    clearCache() {
        this.transpositionTable.clear();
    }

    // 獲取快取統計
    getCacheStats() {
        return {
            size: this.transpositionTable.size,
            maxSize: 10000 // 限制快取大小
        };
    }
}

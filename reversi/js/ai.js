class AI {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    } makeMove(board) {
        switch (this.difficulty) {
            case 'easy':
                return this.makeEasyMove(board);
            case 'medium':
                return this.makeMediumMove(board);
            case 'hard':
                return this.makeHardMove(board);
            case 'super-hard':
                return this.makeSuperHardMove(board);
            default:
                return this.makeEasyMove(board);
        }
    }

    makeEasyMove(board) {
        // 簡單難度: 隨機選擇一個合法步
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            return null;
        }

        // 隨機選一個有效的走法
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    makeMediumMove(board) {
        // 普通難度: 優先選擇角落和邊緣，避免接近角落的位置
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            return null;
        }

        // 棋盤位置評分
        const scoreMap = this.createScoreMap(board.size);

        // 找出得分最高的移動
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const [row, col] of validMoves) {
            const score = scoreMap[row][col];

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [[row, col]];
            } else if (score === bestScore) {
                bestMoves.push([row, col]);
            }
        }

        // 從最佳移動中隨機選一個
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    } makeHardMove(board) {
        // 困難難度: 使用經過改進的極小化極大演算法，加入戰略考量
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            return null;
        }
        console.log(validMoves[0]);
        // 1. 優先下角落 - 先檢查是否有角落可以下
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        for (const [row, col] of validMoves) {
            for (const [cornerRow, cornerCol] of corners) {
                
                if (row === cornerRow && col === cornerCol) {
                    console.log(`選擇角落位置: (${row}, ${col})`);
                    // 如果有角落可以下，直接返回角落位置
                    return [row, col];
                }
            }
        }

        // 2. 避開危險位置 - 特別是 2b、2g、7b、7g（座標[1, 1], [1, 6], [6, 1], [6, 6]）
        const dangerousPositions = [[1, 1], [1, 6], [6, 1], [6, 6]];

        // 過濾掉危險位置
        let safeMoves = validMoves.filter(([row, col]) => {
            return !dangerousPositions.some(([r, c]) => r === row && c === col);
        });

        // 如果過濾後沒有走法了，則使用原來的所有有效走法
        if (safeMoves.length === 0) {
            safeMoves = validMoves;
        }

        // 深度搜尋
        const depth = 4; // 減少深度以加快思考速度
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const [row, col] of safeMoves) {
            // 創建一個臨時的棋盤來模擬走法
            const tempBoard = this.cloneBoard(board);
            tempBoard.makeMove(row, col);

            // 檢查這步棋是否會導致對手可以下在角落
            const opponentCanTakeCorner = this.checkIfOpponentCanTakeCorner(tempBoard);

            // 檢查這步棋是否會翻轉對方在重要位置的棋子
            const willFlipImportantPositions = this.checkIfWillFlipImportantPositions(board, row, col);

            // 計算得分，加入戰略考量
            let score = this.minimax(tempBoard, depth - 1, false, -Infinity, Infinity);

            // 如果這步棋會導致對手可以下在角落，大幅減少分數
            if (opponentCanTakeCorner) {
                score -= 300;
            }

            // 如果這步棋會翻轉對方在重要位置的棋子，大幅減少分數
            // 因為這會讓危險位置的棋子變成己方，對手可能就能下在角落
            if (willFlipImportantPositions) {
                score -= 200;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [[row, col]];
            } else if (score === bestScore) {
                bestMoves.push([row, col]);
            }
        }

        // 從最佳移動中隨機選一個
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        // 如果達到搜尋深度或遊戲結束，評估棋盤狀態
        if (depth === 0 || board.isGameOver()) {
            return this.evaluateBoard(board);
        }

        const currentPlayer = isMaximizing ? board.currentPlayer : (board.currentPlayer === 1 ? 2 : 1);
        const validMoves = board.getValidMoves(currentPlayer);

        // 如果沒有合法步，則跳過這個玩家
        if (validMoves.length === 0) {
            return this.minimax(board, depth - 1, !isMaximizing, alpha, beta);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const [row, col] of validMoves) {
                const tempBoard = this.cloneBoard(board);
                tempBoard.makeMove(row, col, currentPlayer);
                const score = this.minimax(tempBoard, depth - 1, false, alpha, beta);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break; // Alpha-beta 剪枝
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const [row, col] of validMoves) {
                const tempBoard = this.cloneBoard(board);
                tempBoard.makeMove(row, col, currentPlayer);
                const score = this.minimax(tempBoard, depth - 1, true, alpha, beta);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break; // Alpha-beta 剪枝
                }
            }
            return minScore;
        }
    } evaluateBoard(board) {
        // 改進的評估函數綜合考慮：
        // 1. 棋子數量的差距
        // 2. 角落和邊緣的控制
        // 3. 行動力（可走的合法步數）
        // 4. 避免危險位置
        // 5. 防止對手佔領角落
        const scoreMap = this.createScoreMap(board.size);
        let score = 0;

        // 計算位置分數
        for (let row = 0; row < board.size; row++) {
            for (let col = 0; col < board.size; col++) {
                if (board.grid[row][col] === board.currentPlayer) {
                    score += scoreMap[row][col];
                } else if (board.grid[row][col] !== 0) {
                    score -= scoreMap[row][col];
                }
            }
        }

        // 角落擁有額外獎勵
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        for (const [row, col] of corners) {
            if (board.grid[row][col] === board.currentPlayer) {
                score += 200; // 擁有角落的額外獎勵
            } else if (board.grid[row][col] !== 0) {
                score -= 200; // 對手擁有角落的懲罰
            }
        }

        // 檢查危險位置 (2b, 2g, 7b, 7g)
        const dangerousPositions = [[1, 1], [1, 6], [6, 1], [6, 6]];
        for (const [row, col] of dangerousPositions) {
            if (board.grid[row][col] === board.currentPlayer) {
                // 如果相鄰的角落已經被佔領，則減輕危險
                const adjacentCorner = this.getAdjacentCorner(row, col);
                if (board.grid[adjacentCorner[0]][adjacentCorner[1]] !== 0) {
                    // 已經有棋子在角落，減輕懲罰
                    score -= 20;
                } else {
                    // 角落空著，更大的懲罰
                    score -= 100;
                }
            }
        }

        // 考慮行動力
        const playerMoves = board.getValidMoves(board.currentPlayer).length;
        const opponentMoves = board.getValidMoves(board.currentPlayer === 1 ? 2 : 1).length;
        score += (playerMoves - opponentMoves) * 3; // 增加行動力的權重

        // 檢查對手是否能夠佔領角落
        const opponentPlayer = board.currentPlayer === 1 ? 2 : 1;
        const opponentValidMoves = board.getValidMoves(opponentPlayer);
        for (const [row, col] of opponentValidMoves) {
            for (const [cornerRow, cornerCol] of corners) {
                if (row === cornerRow && col === cornerCol) {
                    score -= 300; // 大幅降低分數，因為對手可以佔領角落
                }
            }
        }

        // 遊戲結束時，只看最終棋子數量
        if (board.isGameOver()) {
            const { black, white } = board.getScore();
            const playerScore = board.currentPlayer === 1 ? black : white;
            const opponentScore = board.currentPlayer === 1 ? white : black;

            if (playerScore > opponentScore) {
                return 1000; // 獲勝
            } else if (playerScore < opponentScore) {
                return -1000; // 失敗
            } else {
                return 0; // 平局
            }
        }

        return score;
    }

    getAdjacentCorner(row, col) {
        // 根據危險位置獲取相鄰的角落坐標
        if (row === 1 && col === 1) return [0, 0];
        if (row === 1 && col === 6) return [0, 7];
        if (row === 6 && col === 1) return [7, 0];
        if (row === 6 && col === 6) return [7, 7];
        return [0, 0]; // 預設值，不應該到達這裡
    } createScoreMap(size) {
        // 創建棋盤位置評分表
        // 角落最有價值，接近角落的位置危險，邊緣比中央好
        const scoreMap = Array(size).fill().map(() => Array(size).fill(0));

        // 設置角落分數
        scoreMap[0][0] = 120;
        scoreMap[0][size - 1] = 120;
        scoreMap[size - 1][0] = 120;
        scoreMap[size - 1][size - 1] = 120;

        // 設置接近角落的危險位置分數
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // 邊緣加分
                if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
                    scoreMap[i][j] = Math.max(scoreMap[i][j], 40);
                }

                // 接近角落的位置減分
                if ((i === 0 && j === 1) || (i === 1 && j === 0) || (i === 1 && j === 1)) {
                    scoreMap[i][j] = -30;
                }
                if ((i === 0 && j === size - 2) || (i === 1 && j === size - 1) || (i === 1 && j === size - 2)) {
                    scoreMap[i][j] = -30;
                }
                if ((i === size - 2 && j === 0) || (i === size - 1 && j === 1) || (i === size - 2 && j === 1)) {
                    scoreMap[i][j] = -30;
                }
                if ((i === size - 2 && j === size - 1) || (i === size - 1 && j === size - 2) || (i === size - 2 && j === size - 2)) {
                    scoreMap[i][j] = -30;
                }

                // 2b, 2g, 7b, 7g 這些位置的分數額外降低
                if ((i === 1 && j === 1) || (i === 1 && j === 6) || (i === 6 && j === 1) || (i === 6 && j === 6)) {
                    scoreMap[i][j] = -50; // 更低的分數
                }
            }
        }

        return scoreMap;
    } cloneBoard(board) {
        // 創建一個棋盤的深度複製
        const clone = new Board();
        clone.grid = board.grid.map(row => [...row]);
        clone.currentPlayer = board.currentPlayer;
        return clone;
    }

    checkIfOpponentCanTakeCorner(board) {
        // 檢查對手是否可以下在角落
        const opponentPlayer = board.currentPlayer === 1 ? 2 : 1;
        const opponentMoves = board.getValidMoves(opponentPlayer);
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];

        // 檢查對手的有效走法中是否有角落
        for (const [row, col] of opponentMoves) {
            for (const [cornerRow, cornerCol] of corners) {
                if (row === cornerRow && col === cornerCol) {
                    return true; // 對手可以下在角落
                }
            }
        }

        return false; // 對手不能下在角落
    } checkIfWillFlipImportantPositions(board, row, col) {
        // 檢查這步棋是否會翻轉對方在重要位置的棋子（變成自己的）
        // 如果會翻轉，這是不好的，因為會讓對手有機會下在角落
        const importantPositions = [[1, 1], [1, 6], [6, 1], [6, 6]]; // 2b, 2g, 7b, 7g

        // 創建臨時棋盤來模擬這步棋
        const tempBoard = this.cloneBoard(board);
        const originalBoard = this.cloneBoard(board);

        // 對手玩家
        const opponent = board.currentPlayer === 1 ? 2 : 1;

        // 執行這步棋
        tempBoard.makeMove(row, col);

        // 檢查重要位置的棋子是否被翻轉
        for (const [r, c] of importantPositions) {
            // 如果原本是對手的棋子，現在變成了自己的棋子，表示這個位置被翻轉了
            if (originalBoard.grid[r][c] === opponent && tempBoard.grid[r][c] === board.currentPlayer) {
                console.log(`警告：走法 (${row},${col}) 會翻轉危險位置 (${r},${c}) 的棋子`);
                return true; // 會翻轉對方在重要位置的棋子
            }
        }

        return false; // 不會翻轉對方在重要位置的棋子
    }

    makeSuperHardMove(board) {
        // 超難難度：使用訓練好的強化學習模型
        const validMoves = board.getValidMoves();
        if (validMoves.length === 0) {
            return null;
        }

        // 檢查模型是否已加載
        if (!window.reversiAI || !window.reversiAI.isModelLoaded) {
            console.log("強化學習模型尚未載入完成，回退到困難模式");
            return this.makeHardMove(board);
        }

        try {
            // 使用訓練好的模型獲取最佳走步
            const bestMove = window.reversiAI.getBestMove(board, board.currentPlayer);
            if (bestMove) {
                console.log("強化學習AI選擇走步:", bestMove);
                return bestMove;
            } else {
                console.log("模型未返回有效走步，回退到困難模式");
                return this.makeHardMove(board);
            }
        } catch (error) {
            console.error("強化學習模型執行錯誤:", error);
            // 出錯時回退到困難模式
            return this.makeHardMove(board);
        }
    }
}

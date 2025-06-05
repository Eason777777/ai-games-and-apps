// 黑白棋 AI 模型包裝器
class ReversiAI {
    constructor() {
        // 載入模型權重 (這將由另一個腳本填充)
        this.weights = null;
        this.isModelLoaded = false;

        // 自動加載模型
        this.loadWeights('assets/ai_train_result/strong_reversi_model (1).json')
            .then(success => {
                if (success) {
                    console.log('強化學習模型成功加載');
                    this.isModelLoaded = true;
                }
            })
            .catch(error => console.error('模型加載失敗:', error));
    }

    // 載入模型權重
    async loadWeights(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.weights = await response.json();
            console.log('模型權重已載入');
            console.log('可用的權重鍵:', Object.keys(this.weights));

            // 驗證必要的權重是否存在
            const requiredKeys = ['fc1.weight', 'fc1.bias', 'fc2.weight', 'fc2.bias'];
            const missingKeys = requiredKeys.filter(key => !(key in this.weights));

            if (missingKeys.length > 0) {
                console.warn('缺少必要的權重:', missingKeys);
                console.log('實際權重結構:', this.weights);
            } else {
                console.log('✅ 所有必要的權重都已載入');
                console.log(`fc1 權重維度: ${this.weights['fc1.weight'].length} x ${this.weights['fc1.weight'][0]?.length}`);
                console.log(`fc2 權重維度: ${this.weights['fc2.weight'].length} x ${this.weights['fc2.weight'][0]?.length}`);
            }

            return true;
        } catch (error) {
            console.error('加載模型權重時出錯:', error);
            return false;
        }
    }

    // 獲取走步 (在這裡實現模型推理)
    getBestMove(board, currentPlayer) {
        if (!this.isModelLoaded || !this.weights) {
            console.error('模型未載入，無法做出最佳決策');
            return null;
        }

        // 獲取所有有效移動
        const validMoves = board.getValidMoves(currentPlayer);
        if (validMoves.length === 0) {
            return null;
        }

        // 將棋盤表示轉換為模型輸入格式
        const boardInput = this.boardToModelInput(board, currentPlayer);

        // 評估每個有效移動
        let bestScore = -Infinity;
        let bestMove = null;

        for (const [row, col] of validMoves) {
            // 模擬這一步
            const simBoard = this.cloneBoard(board);
            simBoard.makeMove(row, col, currentPlayer);

            // 評估該移動的得分
            const score = this.evaluatePositionWithModel(simBoard, currentPlayer);

            if (score > bestScore) {
                bestScore = score;
                bestMove = [row, col];
            }
        }

        return bestMove;
    }

    // 將棋盤轉換為模型輸入格式
    boardToModelInput(board, player) {
        const input = new Array(8 * 8 * 3).fill(0);

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = board.grid[row][col];
                const idx = row * 8 + col;

                // 第一個通道: 當前玩家的棋子
                if (cell === player) {
                    input[idx] = 1;
                }

                // 第二個通道: 對手的棋子
                if (cell !== 0 && cell !== player) {
                    input[idx + 64] = 1;
                }

                // 第三個通道: 空格
                if (cell === 0) {
                    input[idx + 128] = 1;
                }
            }
        }

        return input;
    }

    // 使用模型評估位置
    evaluatePositionWithModel(board, player) {
        // 將棋盤轉換為模型輸入
        const input = this.boardToModelInput(board, player);

        // 實現簡易前向傳播
        return this.forwardPass(input);
    }

    // 簡易前向傳播(使用已加載的權重)
    forwardPass(input) {
        if (!this.weights) {
            return 0;
        }

        // 使用模型權重進行推理
        // 適應 PyTorch 模型的原始參數名稱格式
        // fc1: 輸入層到隱藏層, fc2: 隱藏層到輸出層
        try {
            // 從模型中提取權重和偏差 (PyTorch 格式)
            const hiddenWeights = this.weights['fc1.weight'];  // [hidden_size, input_size]
            const hiddenBias = this.weights['fc1.bias'];       // [hidden_size]
            const outputWeights = this.weights['fc2.weight'];  // [output_size, hidden_size]
            const outputBias = this.weights['fc2.bias'];       // [output_size]

            if (!hiddenWeights || !hiddenBias || !outputWeights || !outputBias) {
                console.error('模型權重格式不正確，缺少必要的層');
                return 0;
            }

            // 計算隱藏層 (fc1)
            const hiddenSize = hiddenBias.length;
            const hidden = new Array(hiddenSize).fill(0);

            for (let i = 0; i < hiddenSize; i++) {
                hidden[i] = hiddenBias[i];
                // PyTorch 權重矩陣是 [output, input] 格式
                for (let j = 0; j < input.length; j++) {
                    hidden[i] += input[j] * hiddenWeights[i][j];
                }
                // ReLU 激活函數
                hidden[i] = Math.max(0, hidden[i]);
            }

            // 計算輸出層 (fc2)
            const outputSize = outputBias.length;
            let output = 0;

            if (outputSize === 1) {
                // 單一輸出 (價值評估)
                output = outputBias[0];
                for (let i = 0; i < hiddenSize; i++) {
                    output += hidden[i] * outputWeights[0][i];
                }
                // 使用 sigmoid 激活輸出
                return 1 / (1 + Math.exp(-output));
            } else {
                // 多輸出情況，取第一個輸出作為評估值
                output = outputBias[0];
                for (let i = 0; i < hiddenSize; i++) {
                    output += hidden[i] * outputWeights[0][i];
                }
                // 使用 sigmoid 激活輸出
                return 1 / (1 + Math.exp(-output));
            }
        } catch (error) {
            console.error('模型推理失敗:', error);
            console.error('權重結構:', this.weights ? Object.keys(this.weights) : 'null');
            return 0;
        }
    }

    // 複製棋盤
    cloneBoard(board) {
        const clone = new Board();
        clone.grid = board.grid.map(row => [...row]);
        clone.currentPlayer = board.currentPlayer;
        return clone;
    }
}

// 導出供全局使用
if (typeof module !== 'undefined') {
    module.exports = { ReversiAI };
} else {
    window.ReversiAI = ReversiAI;
}

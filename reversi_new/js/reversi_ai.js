// 黑白棋 AI 模型包裝器
class ReversiAI {
    constructor() {
        this.weights = null;
        this.isModelLoaded = false;
        this.modelType = null; // 'MLP' 或 'ReversiNet'
        this.reversiNet = null; // CNN/ResNet JS 實例
        this.loadWeights('assets/ai_train_result/reversi_ai_model.json')
            .then(success => {
                if (success) {
                    console.log('強化學習模型成功加載');
                    this.isModelLoaded = true;
                }
            })
            .catch(error => console.error('模型加載失敗:', error));
    }

    async loadWeights(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const meta = await response.json();
            // 判斷格式
            if (meta && meta.model_type === 'ReversiNet' && meta.weights) {
                this.weights = meta.weights;
                this.modelType = 'ReversiNet';
                this.reversiNet = new ReversiNetJS(this.weights);
                console.log('載入 ReversiNet 權重');
            } else if (meta && meta['fc1.weight']) {
                this.weights = meta;
                this.modelType = 'MLP';
                console.log('載入 MLP 權重');
            } else {
                this.weights = meta;
                // 嘗試自動判斷
                if (this.weights['fc1.weight']) {
                    this.modelType = 'MLP';
                } else if (this.weights['conv1.weight']) {
                    this.modelType = 'ReversiNet';
                    this.reversiNet = new ReversiNetJS(this.weights);
                } else {
                    throw new Error('未知的模型權重格式');
                }
            }
            return true;
        } catch (error) {
            console.error('加載模型權重時出錯:', error);
            return false;
        }
    }

    getBestMove(board, currentPlayer) {
        if (!this.isModelLoaded || !this.weights) {
            console.error('模型未載入，無法做出最佳決策');
            return null;
        }
        const validMoves = board.getValidMoves(currentPlayer);
        if (validMoves.length === 0) return null;
        let bestScore = -Infinity;
        let bestMove = null;
        for (const [row, col] of validMoves) {
            const simBoard = this.cloneBoard(board);
            simBoard.makeMove(row, col, currentPlayer);
            const score = this.evaluatePositionWithModel(simBoard, currentPlayer);
            if (score > bestScore) {
                bestScore = score;
                bestMove = [row, col];
            }
        }
        return bestMove;
    }

    boardToModelInput(board, player) {
        // 輸出 shape: [3,8,8]
        const input = [[], [], []];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = board.grid[row][col];
                input[0].push(cell === player ? 1 : 0); // 當前玩家
                input[1].push(cell !== 0 && cell !== player ? 1 : 0); // 對手
                input[2].push(cell === 0 ? 1 : 0); // 空格
            }
        }
        // 轉成 [3,8,8]
        return [0, 1, 2].map(ch => {
            const arr = [];
            for (let i = 0; i < 8; i++) arr.push(input[ch].slice(i * 8, (i + 1) * 8));
            return arr;
        });
    }

    evaluatePositionWithModel(board, player) {
        if (this.modelType === 'ReversiNet' && this.reversiNet) {
            const input = this.boardToModelInput(board, player);
            const { value } = this.reversiNet.forward(input);
            return value;
        } else {
            // MLP
            const input = this.boardToModelInput_MLP(board, player);
            return this.forwardPass(input);
        }
    }

    boardToModelInput_MLP(board, player) {
        // shape: [8*8*3]
        const input = new Array(8 * 8 * 3).fill(0);
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = board.grid[row][col];
                const idx = row * 8 + col;
                if (cell === player) input[idx] = 1;
                if (cell !== 0 && cell !== player) input[idx + 64] = 1;
                if (cell === 0) input[idx + 128] = 1;
            }
        }
        return input;
    }

    forwardPass(input) {
        if (!this.weights) return 0;
        try {
            const hiddenWeights = this.weights['fc1.weight'];
            const hiddenBias = this.weights['fc1.bias'];
            const outputWeights = this.weights['fc2.weight'];
            const outputBias = this.weights['fc2.bias'];
            if (!hiddenWeights || !hiddenBias || !outputWeights || !outputBias) {
                console.error('模型權重格式不正確，缺少必要的層');
                return 0;
            }
            const hiddenSize = hiddenBias.length;
            const hidden = new Array(hiddenSize).fill(0);
            for (let i = 0; i < hiddenSize; i++) {
                hidden[i] = hiddenBias[i];
                for (let j = 0; j < input.length; j++) {
                    hidden[i] += input[j] * hiddenWeights[i][j];
                }
                hidden[i] = Math.max(0, hidden[i]);
            }
            const outputSize = outputBias.length;
            let output = 0;
            if (outputSize === 1) {
                output = outputBias[0];
                for (let i = 0; i < hiddenSize; i++) {
                    output += hidden[i] * outputWeights[0][i];
                }
                return 1 / (1 + Math.exp(-output));
            } else {
                output = outputBias[0];
                for (let i = 0; i < hiddenSize; i++) {
                    output += hidden[i] * outputWeights[0][i];
                }
                return 1 / (1 + Math.exp(-output));
            }
        } catch (error) {
            console.error('模型推理失敗:', error);
            return 0;
        }
    }

    cloneBoard(board) {
        const clone = new Board();
        clone.grid = board.grid.map(row => [...row]);
        clone.currentPlayer = board.currentPlayer;
        return clone;
    }
}

// CNN/ResNet JS 前向傳播
class ReversiNetJS {
    constructor(weights) {
        this.w = weights;
    }
    // x: [3,8,8]
    forward(x) {
        // Conv1
        let out = this.conv2d(x, this.w['conv1.weight'], this.w['conv1.bias']);
        out = this.batchNorm2d(out, this.w['bn1.weight'], this.w['bn1.bias'], this.w['bn1.running_mean'], this.w['bn1.running_var']);
        out = this.relu(out);
        // Conv2
        out = this.conv2d(out, this.w['conv2.weight'], this.w['conv2.bias']);
        out = this.batchNorm2d(out, this.w['bn2.weight'], this.w['bn2.bias'], this.w['bn2.running_mean'], this.w['bn2.running_var']);
        out = this.relu(out);
        // Conv3
        out = this.conv2d(out, this.w['conv3.weight'], this.w['conv3.bias']);
        out = this.batchNorm2d(out, this.w['bn3.weight'], this.w['bn3.bias'], this.w['bn3.running_mean'], this.w['bn3.running_var']);
        out = this.relu(out);
        // Res1
        let res = this.resBlock(out, 'res1.0.weight', 'res1.0.bias', 'res1.1.weight', 'res1.1.bias', 'res1.1.running_mean', 'res1.1.running_var',
            'res1.3.weight', 'res1.3.bias', 'res1.4.weight', 'res1.4.bias', 'res1.4.running_mean', 'res1.4.running_var');
        out = this.add(out, res);
        out = this.relu(out);
        // Res2
        res = this.resBlock(out, 'res2.0.weight', 'res2.0.bias', 'res2.1.weight', 'res2.1.bias', 'res2.1.running_mean', 'res2.1.running_var',
            'res2.3.weight', 'res2.3.bias', 'res2.4.weight', 'res2.4.bias', 'res2.4.running_mean', 'res2.4.running_var');
        out = this.add(out, res);
        out = this.relu(out);
        // Policy head
        let policy = this.conv2d(out, this.w['policy_conv.weight'], this.w['policy_conv.bias']);
        policy = this.batchNorm2d(policy, this.w['bn_policy.weight'], this.w['bn_policy.bias'], this.w['bn_policy.running_mean'], this.w['bn_policy.running_var']);
        policy = this.relu(policy);
        policy = this.flatten(policy); // [32*8*8]
        policy = this.linear(policy, this.w['policy_fc.weight'], this.w['policy_fc.bias']); // [64]
        // Value head
        let value = this.conv2d(out, this.w['value_conv.weight'], this.w['value_conv.bias']);
        value = this.batchNorm2d(value, this.w['bn_value.weight'], this.w['bn_value.bias'], this.w['bn_value.running_mean'], this.w['bn_value.running_var']);
        value = this.relu(value);
        value = this.flatten(value); // [32*8*8]
        value = this.linear(value, this.w['value_fc1.weight'], this.w['value_fc1.bias']); // [64]
        value = this.relu1d(value);
        value = this.linear(value, this.w['value_fc2.weight'], this.w['value_fc2.bias']); // [1]
        value = Math.tanh(value[0]);
        return { policy, value };
    }
    // --- 基本運算 ---
    conv2d(x, weight, bias) {
        // x: [in_c, h, w], weight: [out_c, in_c, 3, 3] or [out_c, in_c, 1, 1], bias: [out_c]
        const out_c = weight.length, in_c = weight[0].length, k = weight[0][0].length;
        const h = x[0].length, w = x[0][0].length;
        const pad = Math.floor(k / 2);
        const out = [];
        for (let oc = 0; oc < out_c; oc++) {
            const ch = [];
            for (let i = 0; i < h; i++) {
                const row = [];
                for (let j = 0; j < w; j++) {
                    let sum = bias ? bias[oc] : 0;
                    for (let ic = 0; ic < in_c; ic++) {
                        for (let ki = 0; ki < k; ki++) {
                            for (let kj = 0; kj < k; kj++) {
                                const ni = i + ki - pad, nj = j + kj - pad;
                                if (ni >= 0 && ni < h && nj >= 0 && nj < w) {
                                    sum += x[ic][ni][nj] * weight[oc][ic][ki][kj];
                                }
                            }
                        }
                    }
                    row.push(sum);
                }
                ch.push(row);
            }
            out.push(ch);
        }
        return out;
    }
    batchNorm2d(x, weight, bias, running_mean, running_var, eps = 1e-5) {
        // x: [c,h,w]
        const c = x.length, h = x[0].length, w = x[0][0].length;
        const out = [];
        for (let ch = 0; ch < c; ch++) {
            const arr = [];
            for (let i = 0; i < h; i++) {
                const row = [];
                for (let j = 0; j < w; j++) {
                    let v = x[ch][i][j];
                    v = (v - running_mean[ch]) / Math.sqrt(running_var[ch] + eps);
                    v = v * weight[ch] + bias[ch];
                    row.push(v);
                }
                arr.push(row);
            }
            out.push(arr);
        }
        return out;
    }
    relu(x) {
        // x: [c,h,w]
        return x.map(ch => ch.map(row => row.map(v => Math.max(0, v))));
    }
    relu1d(x) {
        return x.map(v => Math.max(0, v));
    }
    flatten(x) {
        // x: [c,h,w] => [c*h*w]
        const arr = [];
        for (let ch = 0; ch < x.length; ch++)
            for (let i = 0; i < x[0].length; i++)
                for (let j = 0; j < x[0][0].length; j++)
                    arr.push(x[ch][i][j]);
        return arr;
    }
    linear(x, weight, bias) {
        // weight: [out, in], bias: [out]
        const out = [];
        for (let i = 0; i < weight.length; i++) {
            let sum = bias ? bias[i] : 0;
            for (let j = 0; j < x.length; j++) sum += x[j] * weight[i][j];
            out.push(sum);
        }
        return out;
    }
    add(a, b) {
        // a, b: [c,h,w]
        return a.map((ch, i) => ch.map((row, j) => row.map((v, k) => v + b[i][j][k])));
    }
    resBlock(x, w1, b1, bn1w, bn1b, bn1m, bn1v, w2, b2, bn2w, bn2b, bn2m, bn2v) {
        let out = this.conv2d(x, this.w[w1], this.w[b1]);
        out = this.batchNorm2d(out, this.w[bn1w], this.w[bn1b], this.w[bn1m], this.w[bn1v]);
        out = this.relu(out);
        out = this.conv2d(out, this.w[w2], this.w[b2]);
        out = this.batchNorm2d(out, this.w[bn2w], this.w[bn2b], this.w[bn2m], this.w[bn2v]);
        return out;
    }
}

// 導出供全局使用
if (typeof module !== 'undefined') {
    module.exports = { ReversiAI };
} else {
    window.ReversiAI = ReversiAI;
}

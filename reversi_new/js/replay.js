/**
 * 棋譜回放控制器
 * 提供影片播放器般的控制介面來回放整局遊戲
 */
class ReplayController {
    constructor(gameRecord = null) {
        this.gameRecord = gameRecord;        // 完整的遊戲記錄
        this.currentStep = 0;                // 當前播放到第幾步
        this.isPlaying = false;              // 是否正在自動播放
        this.playSpeed = 1;                  // 播放速度 (1x, 2x, 3x)
        this.playInterval = null;            // 自動播放的計時器

        this.replayBoard = new Board();      // 專用於回放的棋盤實例

        this.initializeElements();
        this.setupEventListeners();
        if (this.gameRecord) {
            this.reset();
        }
    }    // 初始化DOM元素引用
    initializeElements() {
        this.modal = document.getElementById('replay-modal');
        this.playBtn = document.getElementById('replay-play');
        this.progressSlider = document.getElementById('replay-progress');
        this.currentStepSpan = document.getElementById('current-step');
        this.totalStepsSpan = document.getElementById('total-steps');
        this.speedSelect = document.getElementById('replay-speed');
        this.blackScoreSpan = document.getElementById('replay-black-score');
        this.whiteScoreSpan = document.getElementById('replay-white-score');
        this.replayBoardElement = document.getElementById('replay-board');

        // 調試：檢查關鍵元素是否存在
        const criticalElements = [
            'replay-modal', 'replay-play', 'replay-progress',
            'current-step', 'total-steps', 'replay-speed',
            'replay-black-score', 'replay-white-score', 'replay-board'
        ];

        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found`);
            }
        });
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 播放控制按鈕
        document.getElementById('replay-start').onclick = () => this.jumpToStart();
        document.getElementById('replay-prev').onclick = () => this.stepBackward();
        this.playBtn.onclick = () => this.togglePlay();
        document.getElementById('replay-next').onclick = () => this.stepForward();
        document.getElementById('replay-end').onclick = () => this.jumpToEnd();
        // 進度條拖拉
        this.progressSlider.oninput = (e) => {
            if (this.gameRecord && this.gameRecord.moves) {
                const step = Math.round((parseInt(e.target.value) / 100) * this.gameRecord.moves.length);
                this.jumpToStep(step);
            }
        };

        // 速度選擇
        this.speedSelect.onchange = (e) => this.setSpeed(parseInt(e.target.value));

        // 關閉按鈕
        this.modal.querySelector('.close-btn').onclick = () => this.close();

        // 點擊模態框背景關閉
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        };
    }    // 重置到初始狀態
    reset() {
        this.currentStep = 0;
        this.isPlaying = false;
        this.playSpeed = 1;
        this.speedSelect.value = "1";
        this.updateUI();
        this.renderCurrentState();
        
        // 確保重置時也正確更新分數顯示
        this.updateCurrentScore();
    }

    // 設置遊戲記錄
    setGameRecord(gameRecord) {
        this.gameRecord = gameRecord;
        this.reset();
        this.updateGameInfo();
    }

    // 播放/暫停切換
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }    // 開始自動播放
    play() {
        if (!this.gameRecord || !this.gameRecord.moves || this.currentStep >= this.gameRecord.moves.length) {
            return; // 已播放完畢或沒有遊戲記錄
        }

        this.isPlaying = true;
        this.updatePlayButton();

        const interval = 1000 / this.playSpeed; // 根據速度計算間隔
        this.playInterval = setInterval(() => {
            if (this.gameRecord && this.gameRecord.moves && this.currentStep < this.gameRecord.moves.length) {
                this.stepForward();
            } else {
                this.pause(); // 播放完畢自動暫停
            }
        }, interval);
    }

    // 暫停播放
    pause() {
        this.isPlaying = false;
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        this.updatePlayButton();
    }    // 前進一步
    stepForward() {
        if (this.gameRecord && this.gameRecord.moves && this.currentStep < this.gameRecord.moves.length) {
            this.currentStep++;
            this.updateUI();
            this.renderCurrentState();
        }
    }

    // 後退一步
    stepBackward() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateUI();
            this.renderCurrentState();
        }
    }

    // 跳到開始
    jumpToStart() {
        this.pause();
        this.currentStep = 0;
        this.updateUI();
        this.renderCurrentState();
    }    // 跳到結束
    jumpToEnd() {
        this.pause();
        if (this.gameRecord && this.gameRecord.moves) {
            this.currentStep = this.gameRecord.moves.length;
        }
        this.updateUI();
        this.renderCurrentState();
    }

    // 跳到指定步數
    jumpToStep(step) {
        this.pause();
        if (this.gameRecord && this.gameRecord.moves) {
            this.currentStep = Math.max(0, Math.min(step, this.gameRecord.moves.length));
        }
        this.updateUI();
        this.renderCurrentState();
    }

    // 設置播放速度
    setSpeed(speed) {
        this.playSpeed = speed;
        if (this.isPlaying) {
            this.pause();
            this.play(); // 重新開始播放以應用新速度
        }
    }    // 渲染當前步數的棋盤狀態
    renderCurrentState() {        if (!this.gameRecord || !this.gameRecord.moves) {
            // 如果沒有遊戲記錄，只渲染空棋盤
            this.replayBoard.initialize();
            this.renderReplayBoard();
            this.updateCurrentScore();
            return;
        }

        // 重置棋盤到初始狀態
        this.replayBoard.initialize();        // 重新播放到當前步數
        for (let i = 0; i < this.currentStep; i++) {
            const move = this.gameRecord.moves[i];
            // 檢查是否為跳過回合（row === -1, col === -1）
            if (move.row === -1 && move.col === -1) {
                // 跳過回合：只切換玩家，不下子
                this.replayBoard.switchPlayer();
            } else {
                // 正常下子
                this.replayBoard.makeMove(move.row, move.col, move.player);
            }
        }        // 渲染棋盤
        this.renderReplayBoard();
        
        // 確保在渲染完成後立即更新分數
        this.updateCurrentScore();
    }// 專門用於回放的棋盤渲染方法
    renderReplayBoard() {
        if (!this.replayBoardElement) return;

        // 清空現有內容，包括可能的標籤
        this.replayBoardElement.innerHTML = '';

        // 移除舊的標籤（如果存在）
        const oldHLabels = document.querySelector('#replay-board .board-labels');
        const oldVLabels = document.querySelector('#replay-board .board-labels-vertical');
        if (oldHLabels) oldHLabels.remove();
        if (oldVLabels) oldVLabels.remove();

        // 創建棋盤標籤
        this.createReplayBoardLabels();

        // 獲取當前玩家的有效移動位置（即時計算）
        const validMoves = this.replayBoard.getValidMoves(this.replayBoard.currentPlayer);

        // 獲取當前步驟的移動信息（用於高亮顯示）
        let currentMove = null;
        if (this.gameRecord && this.gameRecord.moves && this.currentStep > 0) {
            currentMove = this.gameRecord.moves[this.currentStep - 1];
        }

        // 創建棋盤格子
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;                // 如果是有效走步位置，添加標記（只在遊戲未結束且當前玩家有有效移動時顯示）
                if (validMoves.some(move => move[0] === row && move[1] === col) &&
                    this.currentStep < (this.gameRecord?.moves?.length || 0)) {
                    cell.classList.add('valid-move');
                    // 根據當前玩家添加顏色相關的類
                    if (this.replayBoard.currentPlayer === 1) {
                        cell.classList.add('black-turn');
                    } else {
                        cell.classList.add('white-turn');
                    }
                }

                // 如果是當前步驟的移動位置，添加高亮標記
                if (currentMove &&
                    currentMove.row === row &&
                    currentMove.col === col &&
                    currentMove.row !== -1 &&
                    currentMove.col !== -1) {
                    cell.classList.add('last-move');
                }

                const piece = this.replayBoard.grid[row][col];
                if (piece !== 0) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece === 1 ? 'black' : 'white'}`;
                    cell.appendChild(pieceElement);
                }

                this.replayBoardElement.appendChild(cell);
            }
        }
    }

    // 為回放棋盤創建座標標籤
    createReplayBoardLabels() {
        const boardSize = 8;
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        // 創建橫向標籤容器 (a-h)
        const horizontalLabels = document.createElement('div');
        horizontalLabels.className = 'board-labels';

        // 創建縱向標籤容器 (1-8)
        const verticalLabels = document.createElement('div');
        verticalLabels.className = 'board-labels-vertical';

        // 創建橫向標籤 (a-h)
        for (let i = 0; i < boardSize; i++) {
            const label = document.createElement('span');
            label.textContent = alphabet[i];
            horizontalLabels.appendChild(label);
        }

        // 創建縱向標籤 (1-8)
        for (let i = 0; i < boardSize; i++) {
            const label = document.createElement('span');
            label.textContent = (boardSize - i).toString();
            verticalLabels.appendChild(label);
        }

        // 將標籤添加到回放棋盤
        this.replayBoardElement.appendChild(horizontalLabels);
        this.replayBoardElement.appendChild(verticalLabels);
    }    // 更新UI顯示
    updateUI() {
        if (!this.gameRecord || !this.gameRecord.moves) {
            // 如果沒有遊戲記錄，設置預設值
            if (this.progressSlider) this.progressSlider.value = 0;
            if (this.currentStepSpan) this.currentStepSpan.textContent = 0;
            if (this.totalStepsSpan) this.totalStepsSpan.textContent = 0;
            return;
        }

        // 更新進度條
        const progress = this.gameRecord.moves.length > 0 ?
            (this.currentStep / this.gameRecord.moves.length) * 100 : 0;
        if (this.progressSlider) this.progressSlider.value = progress;

        // 更新步數顯示
        if (this.currentStepSpan) this.currentStepSpan.textContent = this.currentStep;
        if (this.totalStepsSpan) this.totalStepsSpan.textContent = this.gameRecord.moves.length;
        // 更新當前比分顯示
        this.updateCurrentScore();

        // 更新按鈕狀態
        const startBtn = document.getElementById('replay-start');
        const prevBtn = document.getElementById('replay-prev');
        const nextBtn = document.getElementById('replay-next');
        const endBtn = document.getElementById('replay-end');

        if (startBtn) startBtn.disabled = this.currentStep === 0;
        if (prevBtn) prevBtn.disabled = this.currentStep === 0;

        if (this.gameRecord && this.gameRecord.moves) {
            if (nextBtn) nextBtn.disabled = this.currentStep >= this.gameRecord.moves.length;
            if (endBtn) endBtn.disabled = this.currentStep >= this.gameRecord.moves.length;
        } else {
            if (nextBtn) nextBtn.disabled = true;
            if (endBtn) endBtn.disabled = true;
        }
    }    // 更新當前比分顯示 - 嚴謹的直接計算方式
    updateCurrentScore() {
        if (!this.blackScoreSpan || !this.whiteScoreSpan) {
            console.warn('Score display elements not found');
            return;
        }

        // 首先驗證棋盤狀態
        if (!this.validateBoardState()) {
            console.error('棋盤狀態驗證失敗，重新初始化棋盤');
            this.renderCurrentState();
            return;
        }

        // 嚴謹計算當前棋盤上的黑白棋數量
        let blackCount = 0;
        let whiteCount = 0;
        let totalPieces = 0;

        // 遍歷整個8x8棋盤，確保計算所有格子
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.replayBoard.grid[row][col];
                if (piece === 1) {
                    blackCount++;
                    totalPieces++;
                } else if (piece === 2) {
                    whiteCount++;
                    totalPieces++;
                }
            }
        }

        // 驗證計算結果的合理性
        if (totalPieces < 4) {
            // 初始狀態應該至少有4顆棋子
            console.warn('Invalid piece count detected, recalculating...');
        }

        // 更新顯示，確保數值為整數
        this.blackScoreSpan.textContent = Math.floor(blackCount);
        this.whiteScoreSpan.textContent = Math.floor(whiteCount);

        // 調試信息（可選）
        if (window.DEBUG_REPLAY) {
            console.log(`Step ${this.currentStep}: Black=${blackCount}, White=${whiteCount}, Total=${totalPieces}`);
        }
    }

    // 驗證棋盤狀態一致性的輔助方法
    validateBoardState() {
        if (!this.replayBoard || !this.replayBoard.grid) {
            console.warn('回放棋盤未正確初始化');
            return false;
        }

        let totalPieces = 0;
        let emptySpaces = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.replayBoard.grid[row][col];
                if (piece === 1 || piece === 2) {
                    totalPieces++;
                } else if (piece === 0) {
                    emptySpaces++;
                } else {
                    console.warn(`棋盤位置 (${row},${col}) 包含無效值: ${piece}`);
                    return false;
                }
            }
        }

        // 檢查總數是否為64
        if (totalPieces + emptySpaces !== 64) {
            console.warn(`棋盤格子總數異常: 棋子${totalPieces} + 空格${emptySpaces} ≠ 64`);
            return false;
        }

        // 在初始狀態應該有4顆棋子，遊戲中應該至少有4顆棋子
        if (this.currentStep === 0 && totalPieces !== 4) {
            console.warn(`初始狀態棋子數量異常: ${totalPieces} ≠ 4`);
            return false;
        }

        return true;
    }

    // 更新遊戲信息顯示
    updateGameInfo() {
        if (!this.gameRecord) return;

        // 更新遊戲模式
        const gameModeElement = document.getElementById('replay-game-mode');
        if (gameModeElement) {
            gameModeElement.textContent = this.formatGameMode(this.gameRecord.gameMode);
        }

        // 更新遊戲結果
        const resultElement = document.getElementById('replay-result');
        if (resultElement && this.gameRecord.winner !== null) {
            const winnerText = this.gameRecord.winner === 1 ? '黑子獲勝' :
                this.gameRecord.winner === 2 ? '白子獲勝' : '平局';
            const finalScore = this.gameRecord.finalScore;
            if (finalScore) {
                resultElement.textContent = `${winnerText} (${finalScore.black}:${finalScore.white})`;
            } else {
                resultElement.textContent = winnerText;
            }
        }
    }

    // 更新播放按鈕圖示
    updatePlayButton() {
        const icon = this.playBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            this.playBtn.title = '暫停';
        } else {
            icon.className = 'fas fa-play';
            this.playBtn.title = '播放';
        }
    }

    // 顯示回放模態框
    show() {
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);

        // 確保棋盤正確渲染
        setTimeout(() => {
            this.renderCurrentState();
        }, 100);
    }

    // 關閉回放模態框
    close() {
        this.pause();
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    // 格式化遊戲模式顯示
    formatGameMode(mode) {
        // 支援顯示AI難度
        if (!this.gameRecord) return '未知模式';
        const aiDifficulty = this.gameRecord.aiDifficulty || '';
        const blackAIDifficulty = this.gameRecord.blackAIDifficulty || '';
        const whiteAIDifficulty = this.gameRecord.whiteAIDifficulty || '';
        switch (mode) {
            case 'human-vs-human':
                return '人類 vs 人類';
            case 'human-vs-ai':
                return aiDifficulty ? `人類 vs AI（${this.formatDifficulty(aiDifficulty)}）` : '人類 vs AI';
            case 'ai-vs-ai':
                if (blackAIDifficulty && whiteAIDifficulty) {
                    return `AI（${this.formatDifficulty(blackAIDifficulty)}） vs AI（${this.formatDifficulty(whiteAIDifficulty)}）`;
                } else {
                    return 'AI vs AI';
                }
            default:
                return '未知模式';
        }
    }
    // 格式化AI難度顯示
    formatDifficulty(difficulty) {
        switch (difficulty) {
            case 'easy': return '簡單';
            case 'medium': return '普通';
            case 'hard': return '困難';
            case 'super-hard': return '超困難';
            default: return '普通';
        }
    }
}

// 全域函數：創建回放控制器
window.createReplayController = function (gameRecord) {
    return new ReplayController(gameRecord);
};

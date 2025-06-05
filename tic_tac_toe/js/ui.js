// 使用者介面管理器
class UI {
    constructor() {
        this.elements = {};
        this.currentGameMode = null;
        this.isAnimating = false;
        this.initializeElements();
        this.bindEvents();
    }

    // 初始化DOM元素
    initializeElements() {
        this.elements = {
            // 模式卡片
            cardHumanVsHuman: document.getElementById('card-human-vs-human'),
            cardHumanVsAI: document.getElementById('card-human-vs-ai'),
            cardAIVsAI: document.getElementById('card-ai-vs-ai'),
            viewRules: document.getElementById('view-rules'),

            // 符號選擇
            playerSymbolSelection: document.getElementById('player-symbol-selection'),
            selectX: document.getElementById('select-x'),
            selectO: document.getElementById('select-o'),

            // AI 難度選擇
            aiDifficulty: document.getElementById('ai-difficulty'),
            singleAIDifficulty: document.getElementById('single-ai-difficulty'),
            aiVsAIDifficulty: document.getElementById('ai-vs-ai-difficulty'),
            confirmAISettings: document.getElementById('confirm-ai-settings'),
            aiVsAIConfirm: document.getElementById('ai-vs-ai-confirm'),

            // 遊戲資訊
            gameStatus: document.getElementById('game-status'),
            xScore: document.getElementById('x-score'),
            oScore: document.getElementById('o-score'),

            // 棋盤
            board: document.getElementById('board'),
            cells: document.querySelectorAll('.cell'),

            // 控制按鈕
            newGame: document.getElementById('new-game'),
            undo: document.getElementById('undo'),

            // 模態框
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalConfirm: document.getElementById('modal-confirm'),
            closeButton: document.querySelector('.close-button')
        };
    }

    // 綁定事件
    bindEvents() {        // 模式卡片選擇
        this.elements.cardHumanVsHuman?.addEventListener('click', () => this.selectGameMode('human-vs-human'));
        this.elements.cardHumanVsAI?.addEventListener('click', () => this.selectGameMode('human-vs-ai'));
        this.elements.cardAIVsAI?.addEventListener('click', () => this.selectGameMode('ai-vs-ai'));
        this.elements.viewRules?.addEventListener('click', () => this.showRules());

        // 統計按鈕
        const viewStatsBtn = document.getElementById('view-stats');
        viewStatsBtn?.addEventListener('click', () => this.showStatsModal());

        // 符號選擇
        this.elements.selectX?.addEventListener('click', () => this.selectPlayerSymbol('X'));
        this.elements.selectO?.addEventListener('click', () => this.selectPlayerSymbol('O'));

        // AI 難度選擇
        this.bindDifficultyEvents();

        // 棋盤點擊
        this.elements.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.onCellClick(index));
        });

        // 控制按鈕
        this.elements.newGame?.addEventListener('click', () => this.onNewGame());
        this.elements.undo?.addEventListener('click', () => this.onUndo());

        // 模態框
        this.elements.closeButton?.addEventListener('click', () => this.closeModal());
        this.elements.modalConfirm?.addEventListener('click', () => this.closeModal());
        this.elements.modal?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });

        // 鍵盤事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // 綁定 AI 難度選擇事件
    bindDifficultyEvents() {
        // 單人 AI 難度
        ['easy', 'medium', 'hard', 'impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty));
        });

        // AI vs AI 難度
        ['x-easy', 'x-medium', 'x-hard', 'x-impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty, 'X'));
        });

        ['o-easy', 'o-medium', 'o-hard', 'o-impossible'].forEach(difficulty => {
            const btn = document.getElementById(difficulty);
            btn?.addEventListener('click', () => this.selectDifficulty(difficulty, 'O'));
        });

        // 確認按鈕
        this.elements.confirmAISettings?.addEventListener('click', () => this.confirmAISettings());
        this.elements.aiVsAIConfirm?.addEventListener('click', () => this.confirmAISettings());
    }    // 選擇遊戲模式
    selectGameMode(mode) {
        this.currentGameMode = mode;

        // 更新卡片樣式
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('active');
        });

        const selectedCard = document.getElementById(`card-${mode}`);
        selectedCard?.classList.add('active');

        // 顯示模式設定模態框
        this.showGameSettingModal(mode);
    }    // 顯示遊戲模式設定模態框
    showGameSettingModal(mode) {
        if (window.gameSettingModal) {
            const defaults = { mode };
            window.gameSettingModal.show(defaults, (settings) => {
                // 模態框確認後的回調
                if (settings.mode === 'human-vs-human') {
                    console.log("啟動人類對戰模式");
                    window.game?.startGame('human');
                } else if (settings.mode === 'human-vs-ai') {
                    console.log("啟動人類 vs AI 模式，玩家符號:", settings.playerSymbol);
                    window.game?.setPlayerSymbol(settings.playerSymbol);
                    window.game?.setAIDifficulty(settings.aiLevel);
                    window.game?.startGame('ai');
                } else if (settings.mode === 'ai-vs-ai') {
                    console.log("啟動 AI vs AI 模式，X 難度:", settings.xAiLevel, "O 難度:", settings.oAiLevel);
                    window.game?.setAIDifficulty(settings.xAiLevel, 'X');
                    window.game?.setAIDifficulty(settings.oAiLevel, 'O');
                    window.game?.startGame('ai-vs-ai');
                }
            });
        } else {
            console.error('Game setting modal not initialized');
            // 降級處理
            if (mode === 'human-vs-human') {
                window.game?.startGame('human');
            }
        }
    }// 這些方法已經移至模態框中處理
    // 保留空方法以維護向後兼容

    // 選擇玩家符號
    selectPlayerSymbol(symbol) {
        // 此方法已移至模態框中處理
    }

    // 選擇 AI 難度
    selectDifficulty(difficulty, player = null) {
        // 此方法已移至模態框中處理
    }

    // 確認 AI 設置
    confirmAISettings() {
        // 此方法已移至模態框中處理
    }

    // 棋盤格子點擊
    onCellClick(index) {
        if (this.isAnimating) return;
        window.game?.handleCellClick(index);
    }

    // 新遊戲
    onNewGame() {
        window.game?.restartGame();
    }

    // 悔棋
    onUndo() {
        window.game?.undoMove();
    }

    // 更新棋盤顯示
    updateBoard(board) {
        this.elements.cells.forEach((cell, index) => {
            const value = board.grid[index];
            cell.textContent = value || '';
            cell.className = 'cell';

            if (value) {
                cell.classList.add(value.toLowerCase());
                cell.classList.add('placing');

                // 移除動畫類別
                setTimeout(() => {
                    cell.classList.remove('placing');
                }, 300);
            }
        });
    }

    // 更新遊戲狀態
    updateGameStatus(status) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = status;
        }
    }

    // 更新分數
    updateScore(xScore, oScore) {
        if (this.elements.xScore) {
            this.elements.xScore.textContent = xScore;
        }
        if (this.elements.oScore) {
            this.elements.oScore.textContent = oScore;
        }
    }

    // 設置撤銷按鈕狀態
    setUndoEnabled(enabled) {
        if (this.elements.undo) {
            this.elements.undo.disabled = !enabled;
        }
    }

    // 高亮獲勝線條
    highlightWinningLine(line) {
        if (!line) return;

        line.forEach(index => {
            this.elements.cells[index]?.classList.add('winning');
        });
    }    // 顯示遊戲結束對話框
    showGameEndDialog(title, message, callback = null) {
        // 確保標題和訊息存在
        if (!title) {
            console.warn("遊戲結束對話框標題為空，設置預設標題");
            title = "遊戲結束";
        }

        if (!message) {
            console.warn("遊戲結束對話框訊息為空，設置預設訊息");
            message = "遊戲已經結束";
        }

        console.log("顯示遊戲結束對話框:", title, message);

        this.showModal(title, message, callback);

        // 簡單的勝利樣式，無動畫
        if (title.includes('獲勝') || title.includes('贏了') || title === '你贏了！' ||
            title.includes('恭喜') || title.includes('勝利')) {
            this.elements.modal?.classList.add('celebrate');
        }
    }// 顯示模態框
    showModal(title, message, callback = null) {
        if (this.elements.modal) {
            // 確保標題和訊息元素存在且有值
            if (this.elements.modalTitle) {
                this.elements.modalTitle.textContent = title;
                this.elements.modalTitle.style.display = title ? 'block' : 'none';
            }

            if (this.elements.modalMessage) {
                // 處理訊息內容，可能包含 markdown
                this.elements.modalMessage.textContent = message;
                this.elements.modalMessage.style.display = message ? 'block' : 'none';
            }

            // 顯示模態框
            this.elements.modal.style.display = 'block';

            // 重設確認按鈕點擊事件
            if (this.elements.modalConfirm) {
                this.elements.modalConfirm.onclick = () => {
                    if (callback) callback();
                    this.closeModal();
                };
            }

            // 記錄模態框內容，方便除錯
            console.log("模態框內容:", {
                title: this.elements.modalTitle?.textContent,
                message: this.elements.modalMessage?.textContent
            });
        } else {
            console.error("模態框元素不存在");
        }
    }    // 關閉模態框
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
            this.elements.modal.classList.remove('celebrate');
        }
    }

    // 顯示規則
    showRules() {
        const title = window.textManager?.getText('modal.gameRules.title', '井字棋遊戲規則');
        const content = window.textManager?.getText('modal.gameRules.content', `
井字棋是一個經典的策略遊戲，規則簡單易懂：

1. 遊戲在 3×3 的棋盤上進行
2. 兩名玩家輪流在空格中放置自己的符號（X 或 O）
3. 率先在橫、直、斜任意方向連成一線者獲勝
4. 如果棋盤填滿而無人獲勝則為平局

**AI 難度說明：**
- 簡單：隨機策略，適合初學者
- 普通：基礎 Minimax 演算法
- 困難：進階 Minimax 演算法
- 不可能：完美 Minimax 演算法，永不出錯
        `);

        this.showModal(title, content);
    }

    // 顯示載入動畫
    showLoading(message = '載入中...') {
        this.updateGameStatus(message);
        this.elements.board?.classList.add('loading');
    }

    // 隱藏載入動畫
    hideLoading() {
        this.elements.board?.classList.remove('loading');
    }

    // 顯示 AI 思考狀態
    showAIThinking(cell = null) {
        this.updateGameStatus('AI 思考中...');
        if (cell !== null) {
            this.elements.cells[cell]?.classList.add('thinking');
        }
    }

    // 隱藏 AI 思考狀態
    hideAIThinking() {
        this.elements.cells.forEach(cell => {
            cell.classList.remove('thinking');
        });
    }

    // 設置動畫狀態
    setAnimating(animating) {
        this.isAnimating = animating;
    }

    // 鍵盤事件處理
    handleKeydown(e) {
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'Enter':
                if (this.elements.modal.style.display === 'block') {
                    this.closeModal();
                }
                break;
            case 'n':
            case 'N':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.onNewGame();
                }
                break;
            case 'z':
            case 'Z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.onUndo();
                }
                break;
        }
    }

    // 添加錯誤動畫
    showError(element) {
        element?.classList.add('error-shake');
        setTimeout(() => {
            element?.classList.remove('error-shake');
        }, 500);
    }

    // 重置UI到初始狀態
    reset() {
        this.elements.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.updateGameStatus('選擇遊戲模式開始');
        this.updateScore(0, 0);
        this.setUndoEnabled(false);
        this.hideLoading();
        this.hideAIThinking();
        this.closeModal();
    }

    // 顯示主選單
    showMainMenu() {
        // 隱藏所有設置面板
        this.elements.playerSymbolSelection.style.display = 'none';
        this.elements.aiDifficulty.style.display = 'none';
        this.elements.singleAIDifficulty.style.display = 'none';
        this.elements.aiVsAIDifficulty.style.display = 'none';

        // 重置遊戲模式按鈕
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('active');
        });

        // 重置棋盤和狀態
        this.reset();
        this.updateGameStatus('選擇遊戲模式開始');
    }

    // 顯示遊戲棋盤
    showGameBoard() {
        // 隱藏所有設置面板
        this.elements.playerSymbolSelection.style.display = 'none';
        this.elements.aiDifficulty.style.display = 'none';
        this.elements.singleAIDifficulty.style.display = 'none';
        this.elements.aiVsAIDifficulty.style.display = 'none';

        // 棋盤已經在 HTML 中顯示，這裡主要是確保設置面板隱藏
    }

    // ========== 統計功能方法 ==========

    // 顯示統計模態框
    showStatsModal() {
        const statsModal = document.getElementById('stats-modal');
        if (!statsModal) {
            console.error('統計模態框不存在');
            return;
        }

        // 更新統計數據
        this.updateStatsDisplay();

        // 顯示模態框
        statsModal.style.display = 'flex';
        statsModal.classList.add('show');

        // 綁定事件
        this.bindStatsModalEvents();
    }    // 更新統計顯示
    updateStatsDisplay() {
        if (!window.gameStorage) return;

        const stats = window.gameStorage.getFormattedStats();

        // 人類對戰統計 
        const humanTotal = document.getElementById('human-total');
        if (humanTotal) {
            humanTotal.textContent = stats.hvh?.games || 0;
        }

        const humanXWins = document.getElementById('human-x-wins');
        if (humanXWins) {
            humanXWins.textContent = stats.hvh?.xWins || 0;
        }

        const humanOWins = document.getElementById('human-o-wins');
        if (humanOWins) {
            humanOWins.textContent = stats.hvh?.oWins || 0;
        }

        const humanDraws = document.getElementById('human-draws');
        if (humanDraws) {
            humanDraws.textContent = stats.hvh?.draws || 0;
        }

        // 挑戰AI統計
        const aiTotal = document.getElementById('ai-total');
        if (aiTotal) {
            aiTotal.textContent = stats.hva?.games || 0;
        }

        const aiWins = document.getElementById('ai-wins');
        if (aiWins) {
            aiWins.textContent = stats.hva?.wins || 0;
        }

        const aiLosses = document.getElementById('ai-losses');
        if (aiLosses) {
            aiLosses.textContent = stats.hva?.losses || 0;
        }

        const aiDraws = document.getElementById('ai-draws');
        if (aiDraws) {
            aiDraws.textContent = stats.hva?.draws || 0;
        }

        const aiWinRate = document.getElementById('ai-win-rate');
        if (aiWinRate) {
            aiWinRate.textContent = `${stats.hva?.winRate || '0.0'}%`;
        }

        // 按難度統計
        const difficultyStats = stats.hva?.difficulties || {};
        ['easy', 'medium', 'hard', 'impossible'].forEach(difficulty => {
            const diffData = difficultyStats[difficulty] || { wins: 0, losses: 0, draws: 0 };

            const winsElement = document.getElementById(`${difficulty}-wins`);
            if (winsElement) {
                winsElement.textContent = diffData.wins;
            }

            const lossesElement = document.getElementById(`${difficulty}-losses`);
            if (lossesElement) {
                lossesElement.textContent = diffData.losses;
            }

            const drawsElement = document.getElementById(`${difficulty}-draws`);
            if (drawsElement) {
                drawsElement.textContent = diffData.draws;
            }
        });        // AI對戰統計
        const avaTotal = document.getElementById('ai-vs-ai-total');
        if (avaTotal) {
            avaTotal.textContent = stats.ava?.games || 0;
        }

        const avaXWins = document.getElementById('ai-vs-ai-x-wins');
        if (avaXWins) {
            avaXWins.textContent = stats.ava?.xWins || 0;
        }

        const avaOWins = document.getElementById('ai-vs-ai-o-wins');
        if (avaOWins) {
            avaOWins.textContent = stats.ava?.oWins || 0;
        }

        const avaDraws = document.getElementById('ai-vs-ai-draws');
        if (avaDraws) {
            avaDraws.textContent = stats.ava?.draws || 0;
        }
    }

    // 綁定統計模態框事件
    bindStatsModalEvents() {
        const statsModal = document.getElementById('stats-modal');
        const statsClose = document.getElementById('stats-modal-close');
        const clearStatsBtn = document.getElementById('clear-stats-btn');
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        const viewHistoryBtn = document.getElementById('view-history-btn');

        // 關閉按鈕
        if (statsClose) {
            statsClose.onclick = () => this.hideStatsModal();
        }

        // 清除統計按鈕
        if (clearStatsBtn) {
            clearStatsBtn.onclick = () => this.confirmClearStats();
        }

        // 清除快取按鈕
        if (clearCacheBtn) {
            clearCacheBtn.onclick = () => this.confirmClearCache();
        }

        // 查看歷史按鈕
        if (viewHistoryBtn) {
            viewHistoryBtn.onclick = () => this.showHistoryModal();
        }

        // 點擊外部關閉
        if (statsModal) {
            statsModal.onclick = (e) => {
                if (e.target === statsModal) {
                    this.hideStatsModal();
                }
            };
        }
    }

    // 隱藏統計模態框
    hideStatsModal() {
        const statsModal = document.getElementById('stats-modal');
        if (statsModal) {
            statsModal.style.display = 'none';
            statsModal.classList.remove('show');
        }
    }    // 確認清除統計
    confirmClearStats() {
        this.showModal(
            '確認清除統計',
            '您確定要清除所有遊戲統計數據嗎？此操作無法撤銷。',
            () => {
                if (window.gameStorage) {
                    window.gameStorage.resetStats();
                    this.updateStatsDisplay();
                    this.showModal('統計已清除', '所有統計數據已成功清除。');
                }
            }
        );
    }

    // 確認清除快取
    confirmClearCache() {
        this.showModal(
            '確認清除快取',
            '您確定要清除所有快取數據嗎？這將包括：\n\n• 遊戲統計數據\n• 遊戲歷史記錄\n• 遊戲設定\n\n此操作無法撤銷，頁面將重新載入。',
            () => {
                if (window.gameStorage) {
                    const success = window.gameStorage.clearAllData();
                    if (success) {
                        this.showModal('快取已清除', '所有快取數據已成功清除。頁面將重新載入...', () => {
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        });
                    } else {
                        this.showModal('清除失敗', '清除快取時發生錯誤，請嘗試手動重新整理頁面。');
                    }
                }
            }
        );
    }

    // 顯示歷史模態框
    showHistoryModal() {
        const historyModal = document.getElementById('history-modal');
        if (!historyModal) {
            console.error('歷史模態框不存在');
            return;
        }

        // 隱藏統計模態框
        this.hideStatsModal();

        // 更新歷史顯示
        this.updateHistoryDisplay();

        // 顯示模態框
        historyModal.style.display = 'flex';
        historyModal.classList.add('show');

        // 綁定事件
        this.bindHistoryModalEvents();
    }

    // 更新歷史顯示
    updateHistoryDisplay() {
        if (!window.gameStorage) return;

        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const history = window.gameStorage.getGameHistory();

        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>暫無遊戲歷史記錄</p>
                </div>
            `;
            return;
        }        // 倒序顯示最新的記錄（不改變原始數組）
        historyList.innerHTML = [...history].reverse().map(record => {
            const date = new Date(record.date);
            const modeIcon = this.getModeIcon(record.mode);
            const modeText = this.getModeText(record.mode);
            const resultText = this.getResultText(record);
            const resultClass = this.getResultClass(record);

            return `
                <div class="history-item">
                    <div class="history-item-info">
                        <div class="history-item-mode">
                            <i class="${modeIcon}"></i>
                            ${modeText}
                        </div>
                        <div class="history-item-details">
                            <div>結果: ${resultText}</div>
                            ${record.difficulty ? `<div>難度: ${this.getDifficultyText(record.difficulty)}</div>` : ''}
                        </div>
                        <div class="history-item-date">
                            ${date.toLocaleString('zh-TW')}
                        </div>
                    </div>
                    <div class="history-item-result ${resultClass}">
                        ${resultText}
                    </div>
                </div>
            `;
        }).join('');
    }    // 綁定歷史模態框事件
    bindHistoryModalEvents() {
        const historyModal = document.getElementById('history-modal');
        const historyClose = document.getElementById('history-modal-close');
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const backToStatsBtn = document.getElementById('back-to-stats-btn');

        // 關閉按鈕
        if (historyClose) {
            historyClose.onclick = () => this.hideHistoryModal();
        }

        // 清除歷史按鈕
        if (clearHistoryBtn) {
            clearHistoryBtn.onclick = () => this.confirmClearHistory();
        }

        // 返回統計按鈕
        if (backToStatsBtn) {
            backToStatsBtn.onclick = () => this.backToStatsModal();
        }

        // 點擊外部關閉
        if (historyModal) {
            historyModal.onclick = (e) => {
                if (e.target === historyModal) {
                    this.hideHistoryModal();
                }
            };
        }
    }

    // 隱藏歷史模態框
    hideHistoryModal() {
        const historyModal = document.getElementById('history-modal');
        if (historyModal) {
            historyModal.style.display = 'none';
            historyModal.classList.remove('show');
        }
    }    // 返回統計模態框
    backToStatsModal() {
        // 隱藏歷史模態框
        this.hideHistoryModal();

        // 顯示統計模態框
        setTimeout(() => {
            this.showStatsModal();
        }, 100); // 短暫延遲確保動畫順暢
    }

    // 確認清除歷史
    confirmClearHistory() {
        // 暫時隱藏歷史模態框以避免z-index問題
        const historyModal = document.getElementById('history-modal');
        const wasHistoryVisible = historyModal && historyModal.style.display !== 'none';

        if (wasHistoryVisible) {
            historyModal.style.display = 'none';
        }

        this.showModal(
            '確認清除歷史',
            '您確定要清除所有遊戲歷史記錄嗎？此操作無法撤銷。',
            () => {
                if (window.gameStorage) {
                    window.gameStorage.clearGameHistory();
                    this.updateHistoryDisplay();
                    this.showModal('歷史已清除', '所有歷史記錄已成功清除。', () => {
                        // 清除完成後重新顯示歷史模態框
                        if (wasHistoryVisible) {
                            setTimeout(() => {
                                this.showHistoryModal();
                            }, 100);
                        }
                    });
                } else if (wasHistoryVisible) {
                    // 如果取消或出錯，重新顯示歷史模態框
                    setTimeout(() => {
                        historyModal.style.display = 'flex';
                    }, 100);
                }
            },
            () => {
                // 取消時重新顯示歷史模態框
                if (wasHistoryVisible) {
                    setTimeout(() => {
                        historyModal.style.display = 'flex';
                    }, 100);
                }
            }
        );
    }

    // 輔助方法：獲取模式圖標
    getModeIcon(mode) {
        const icons = {
            'human-vs-human': 'fas fa-users',
            'human-vs-ai': 'fas fa-robot',
            'ai-vs-ai': 'fas fa-microchip'
        };
        return icons[mode] || 'fas fa-gamepad';
    }

    // 輔助方法：獲取模式文字
    getModeText(mode) {
        const texts = {
            'human-vs-human': '人類對戰',
            'human-vs-ai': '挑戰 AI',
            'ai-vs-ai': 'AI 對戰'
        };
        return texts[mode] || mode;
    }

    // 輔助方法：獲取結果文字
    getResultText(record) {
        if (record.result === 'draw') {
            return '平局';
        } else if (record.result === 'win') {
            return '獲勝';
        } else if (record.result === 'lose') {
            return '失敗';
        }
        return record.result;
    }

    // 輔助方法：獲取結果樣式類
    getResultClass(record) {
        if (record.result === 'draw') {
            return 'result-draw';
        } else if (record.result === 'win') {
            return 'result-win';
        } else if (record.result === 'lose') {
            return 'result-lose';
        }
        return '';
    }

    // 輔助方法：獲取難度文字
    getDifficultyText(difficulty) {
        const texts = {
            'easy': '簡單',
            'medium': '普通',
            'hard': '困難',
            'impossible': '不可能'
        };
        return texts[difficulty] || difficulty;
    }
}
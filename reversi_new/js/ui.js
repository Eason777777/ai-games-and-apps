class UI {
    constructor() {
        this.boardElement = document.getElementById('board');
        this.gameStatus = document.getElementById('game-status');
        this.blackScore = document.getElementById('black-score');
        this.whiteScore = document.getElementById('white-score');

        // 分離的Modal系統
        // 1. 通知Modal (簡單消息和跳過回合)
        this.notificationModal = document.getElementById('notification-modal');
        this.notificationTitle = document.getElementById('notification-title');
        this.notificationMessage = document.getElementById('notification-message');
        this.notificationConfirm = document.getElementById('notification-confirm');
        this.notificationClose = document.getElementById('notification-close');

        // 2. 遊戲規則Modal
        this.rulesModal = document.getElementById('rules-modal');
        this.rulesTitle = document.getElementById('rules-title');
        this.rulesContent = document.getElementById('rules-content');
        this.rulesConfirm = document.getElementById('rules-confirm');
        this.rulesClose = document.getElementById('rules-close');

        // 3. 遊戲結束Modal
        this.gameEndModal = document.getElementById('game-end-modal');
        this.gameEndTitle = document.getElementById('game-end-title');
        this.gameEndMessage = document.getElementById('game-end-message');
        this.gameEndActions = document.getElementById('game-end-actions');
        this.gameEndClose = document.getElementById('game-end-close');

        this.playerInfo = document.querySelector('.player-info');
        this.playerIcon = document.querySelector('.player-icon');

        // 保存上一次的棋盤狀態，用於識別變更的棋子
        this.previousGridState = null;        // 保存最後一步移動的位置
        this.lastMove = null;

        // 動畫同步控制
        this.animationsInProgress = new Set(); // 追蹤進行中的動畫
        this.animationCompletedCallback = null; // 所有動畫完成時的回調函數

        // 存儲當前模態視窗的確認回調函數
        this.currentNotificationCallback = null;
        this.currentRulesCallback = null;// 設置通知Modal關閉按鈕事件
        this.notificationClose.addEventListener('click', () => {
            if (this.currentNotificationCallback) {
                this.currentNotificationCallback();
                this.currentNotificationCallback = null;
            }
            this.hideNotificationModal();
        });

        // 設置遊戲規則Modal關閉按鈕事件
        this.rulesClose.addEventListener('click', () => {
            if (this.currentRulesCallback) {
                this.currentRulesCallback();
                this.currentRulesCallback = null;
            }
            this.hideRulesModal();
        });

        // 設置遊戲結束Modal關閉按鈕事件
        this.gameEndClose.addEventListener('click', () => {
            this.hideGameEndModal();
        });

        // 點擊視窗外部關閉各個Modal
        window.addEventListener('click', (event) => {
            if (event.target === this.notificationModal) {
                if (this.currentNotificationCallback) {
                    this.currentNotificationCallback();
                    this.currentNotificationCallback = null;
                }
                this.hideNotificationModal();
            }

            if (event.target === this.rulesModal) {
                if (this.currentRulesCallback) {
                    this.currentRulesCallback();
                    this.currentRulesCallback = null;
                }
                this.hideRulesModal();
            }

            if (event.target === this.gameEndModal) {
                this.hideGameEndModal();
            }
        });

        // 添加初始的動畫和過渡效果
        this.addInitialAnimations();        // 設置遊戲規則按鈕事件
        const rulesButton = document.getElementById('view-rules');
        if (rulesButton) {
            rulesButton.addEventListener('click', () => {
                this.showGameRules();
            });
        }

        // 設置關於專案按鈕事件
        const aboutButton = document.getElementById('view-about');
        if (aboutButton) {
            aboutButton.addEventListener('click', () => {
                this.showAboutProject();
            });
        }
    }

    // 添加初始動畫效果
    addInitialAnimations() {
        // 讓棋盤有淡入效果
        setTimeout(() => {
            this.boardElement.style.opacity = '1';
        }, 100);

        // 給按鈕添加淡入效果
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
            setTimeout(() => {
                button.classList.add('visible');
            }, 200 + (index * 50));
        });
    } renderBoard(board, lastMove = null, onAnimationsComplete = null) {
        console.log('渲染棋盤:', board);
        // 檢查是否是第一次渲染
        const isFirstRender = !this.boardElement.querySelector('.cell');

        // 獲取當前玩家的有效走步
        const validMoves = board.getValidMoves(board.currentPlayer);

        // 如果棋盤是空的，需要完全重新渲染
        if (isFirstRender) {
            // 清空棋盤
            this.boardElement.innerHTML = '';

            // 移除舊的標籤（如果存在）
            const oldHLabels = document.querySelector('.board-labels');
            const oldVLabels = document.querySelector('.board-labels-vertical');
            if (oldHLabels) oldHLabels.remove();
            if (oldVLabels) oldVLabels.remove();

            // 創建棋盤標籤 (a-h, 1-8)
            this.createBoardLabels();

            // 創建棋盤格子
            for (let row = 0; row < board.size; row++) {
                for (let col = 0; col < board.size; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;                    // 如果是有效走步位置，添加標記
                    if (validMoves.some(move => move[0] === row && move[1] === col)) {
                        cell.classList.add('valid-move');
                        // 根據當前玩家添加顏色相關的類
                        if (board.currentPlayer === 1) {
                            cell.classList.add('black-turn');
                        } else {
                            cell.classList.add('white-turn');
                        }
                    }

                    // 如果有棋子，添加棋子元素
                    if (board.grid[row][col] > 0) {
                        const piece = document.createElement('div');
                        piece.className = `piece ${board.grid[row][col] === 1 ? 'black' : 'white'}`;
                        cell.appendChild(piece);
                    }

                    this.boardElement.appendChild(cell);
                }
            }
        } else {
            // 選擇性更新棋盤，只更新變更的單元格
            for (let row = 0; row < board.size; row++) {
                for (let col = 0; col < board.size; col++) {
                    const cell = this.boardElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    const currentValue = board.grid[row][col];
                    const previousValue = this.previousGridState ? this.previousGridState[row][col] : 0;                    // 更新有效走步標記
                    const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
                    if (isValidMove) {
                        cell.classList.add('valid-move');
                        // 根據當前玩家添加顏色相關的類
                        if (board.currentPlayer === 1) {
                            cell.classList.add('black-turn');
                            cell.classList.remove('white-turn');
                        } else {
                            cell.classList.add('white-turn');
                            cell.classList.remove('black-turn');
                        }
                    } else {
                        cell.classList.remove('valid-move', 'black-turn', 'white-turn');
                    }

                    // 如果棋子變更了，更新它
                    if (currentValue !== previousValue) {
                        const existingPiece = cell.querySelector('.piece');

                        // 計算距離最後一次移動的曼哈頓距離，用於確定動畫延遲
                        let animationDelay = 0;
                        if (lastMove) {
                            const distance = Math.abs(row - lastMove.row) + Math.abs(col - lastMove.col);
                            animationDelay = Math.min(distance * 80, 400); // 最多延遲 400ms
                        }                        // 如果是翻轉棋子（從有棋子變成另一種顏色的棋子）
                        if (existingPiece && previousValue > 0 && currentValue > 0) {
                            // 為了實現延遲動畫效果，我們用 setTimeout 設置樣式類名
                            setTimeout(() => {
                                // 查找這個棋子的翻轉方向
                                let flipDirection = 'h'; // 默認使用水平翻轉

                                if (lastMove && lastMove.flippedPieces && Array.isArray(lastMove.flippedPieces)) {
                                    // 在翻轉棋子列表中查找當前棋子
                                    for (const piece of lastMove.flippedPieces) {
                                        if (Array.isArray(piece) && piece.length >= 3) {
                                            const [flipRow, flipCol, direction] = piece;
                                            if (flipRow === row && flipCol === col && direction) {
                                                flipDirection = direction;
                                                break;
                                            }
                                        }
                                    }
                                }

                                // 創建動畫唯一ID
                                const animationId = `flip-${row}-${col}-${Date.now()}`;

                                // 註冊動畫為進行中
                                this.registerAnimation(animationId);

                                // 根據方向和目標顏色應用對應的翻轉動畫
                                console.log(`翻轉棋子座標: (${row},${col}), 方向: ${flipDirection}, 顏色: ${currentValue === 1 ? '黑' : '白'}`);

                                // 確保清除之前的類名，然後重新應用
                                existingPiece.className = '';

                                // 先添加基本類
                                existingPiece.classList.add('piece');
                                existingPiece.classList.add(currentValue === 1 ? 'black' : 'white');                                // 再添加翻轉動畫類
                                const animationClass = currentValue === 1 ? `flip-black-${flipDirection}` : `flip-white-${flipDirection}`;
                                existingPiece.classList.add(animationClass);

                                // 監聽動畫結束事件
                                const handleAnimationEnd = (event) => {
                                    if (event.target === existingPiece) {
                                        // 清除所有類，只保留基本類
                                        existingPiece.className = '';
                                        existingPiece.classList.add('piece');
                                        existingPiece.classList.add(currentValue === 1 ? 'black' : 'white');

                                        // 移除事件監聽器
                                        existingPiece.removeEventListener('animationend', handleAnimationEnd);

                                        // 標記動畫完成
                                        this.completeAnimation(animationId);
                                    }
                                };

                                // 添加動畫結束事件監聽器
                                existingPiece.addEventListener('animationend', handleAnimationEnd);

                                // 備用：使用定時器作為後備方案（防止animationend事件未觸發）
                                setTimeout(() => {
                                    if (this.animationsInProgress.has(animationId)) {
                                        console.warn(`動畫 ${animationId} 超時，強制完成`);
                                        existingPiece.removeEventListener('animationend', handleAnimationEnd);
                                        this.completeAnimation(animationId);
                                    }
                                }, 600); // 比CSS動畫時間（500ms）稍長

                            }, animationDelay);
                        } else {
                            // 對於新放置的棋子或移除的棋子
                            if (existingPiece) {
                                cell.removeChild(existingPiece);
                            }

                            // 如果現在有棋子，添加新棋子
                            if (currentValue > 0) {
                                const piece = document.createElement('div');
                                // 若為最後一手下的位置，則立即顯示並添加標記類
                                if (lastMove && row === lastMove.row && col === lastMove.col) {
                                    piece.className = `piece ${currentValue === 1 ? 'black' : 'white'} animated`;
                                    cell.appendChild(piece);
                                    cell.classList.add('last-move');
                                } else {
                                    // 若是被翻轉的棋子，則延遲顯示
                                    piece.className = `piece ${currentValue === 1 ? 'black' : 'white'}`;
                                    cell.appendChild(piece);

                                    setTimeout(() => {
                                        piece.className += ' animated';
                                    }, animationDelay);
                                }
                            }
                        }
                    }

                    // 移除上一次移動的標記
                    if (this.lastMove &&
                        row === this.lastMove.row &&
                        col === this.lastMove.col &&
                        (!lastMove || row !== lastMove.row || col !== lastMove.col)) {
                        cell.classList.remove('last-move');
                    }
                }
            }
        }

        // 更新遊戲狀態顯示
        if (board.currentPlayer) {
            const playerIcon = this.playerIcon;
            if (playerIcon) {
                playerIcon.className = 'player-icon ' + (board.currentPlayer === 1 ? 'black-player' : 'white-player');
                playerIcon.innerHTML = board.currentPlayer === 1 ? '<i class="fas fa-user"></i>' : '<i class="fas fa-user"></i>';
            } const gameStatus = this.gameStatus;
            if (gameStatus) {
                const statusText = window.textManager ?
                    window.textManager.getText(board.currentPlayer === 1 ? 'ui.gameStatus.blackTurn' : 'ui.gameStatus.whiteTurn') :
                    (board.currentPlayer === 1 ? '黑方回合' : '白方回合');
                gameStatus.textContent = statusText;
            }
        }

        // 更新分數
        const score = board.getScore ? board.getScore() : { black: 0, white: 0 };
        if (this.blackScore) this.blackScore.textContent = score.black;
        if (this.whiteScore) this.whiteScore.textContent = score.white;        // 保存當前棋盤狀態，用於下次更新比較
        this.previousGridState = board.grid.map(row => [...row]);
        this.lastMove = lastMove;

        // 處理動畫完成回調
        if (onAnimationsComplete) {
            this.waitForAnimationsComplete(onAnimationsComplete);
        }
    } createBoardLabels() {
        const boardSize = 8; // 標準黑白棋棋盤大小
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        // 移除現有的標籤（如果存在）
        const existingHLabels = document.querySelector('.board-labels');
        const existingVLabels = document.querySelector('.board-labels-vertical');
        if (existingHLabels) existingHLabels.remove();
        if (existingVLabels) existingVLabels.remove();

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
        }        // 將標籤添加到棋盤本身（而不是棋盤容器）
        const board = document.getElementById('board');
        if (board) {
            board.appendChild(horizontalLabels);
            board.appendChild(verticalLabels);
        }
    }    // 顯示通知模態視窗 (用於簡單消息和跳過回合)
    showModal(title, message, callback = null) {
        this.notificationTitle.textContent = title;
        this.notificationMessage.textContent = message;
        this.notificationModal.style.display = 'flex';
        this.notificationModal.classList.add('show');

        // 存儲回調函数
        this.currentNotificationCallback = callback;

        // 如果有確認按鈕，設置其事件
        if (this.notificationConfirm) {
            // 先移除所有可能的事件監聽器
            const newConfirmButton = this.notificationConfirm.cloneNode(true);
            this.notificationConfirm.parentNode.replaceChild(newConfirmButton, this.notificationConfirm);
            this.notificationConfirm = newConfirmButton;

            // 添加新的事件監聽器
            this.notificationConfirm.addEventListener('click', () => {
                if (this.currentNotificationCallback) {
                    this.currentNotificationCallback();
                    this.currentNotificationCallback = null;
                }
                this.hideNotificationModal();
            });
        }

        // 顯示模態視窗的淡入動畫
        setTimeout(() => {
            const modalContent = this.notificationModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }

    // 隱藏通知模態視窗
    hideNotificationModal() {
        // 模態視窗淡出效果
        const modalContent = this.notificationModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
        }
        this.notificationModal.classList.remove('show');

        setTimeout(() => {
            this.notificationModal.style.display = 'none';
        }, 300);
    }

    // 通知系統方法
    showNotification(title, message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn('Notification container not found');
            return null;
        }

        const notification = this.createNotificationElement(title, message, type, duration);
        container.appendChild(notification);

        // 觸發入場動畫
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 設置自動消失
        let timeoutId;
        if (duration > 0) {
            timeoutId = setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        // 為通知添加點擊關閉功能
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (timeoutId) clearTimeout(timeoutId);
                this.hideNotification(notification);
            });
        }

        return notification;
    }

    createNotificationElement(title, message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // 設置進度條動畫持續時間
        if (duration > 0) {
            notification.style.setProperty('--duration', `${duration}ms`);
        } const closeLabel = window.textManager ?
            window.textManager.getText('notifications.closeNotification') :
            '關閉通知';

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${this.escapeHtml(title)}</div>
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" aria-label="${closeLabel}">×</button>
        `;

        return notification;
    }

    hideNotification(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.remove('show');
        notification.classList.add('hide');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // HTML轉義函數，防止XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 清除所有通知
    clearAllNotifications() {
        const container = document.getElementById('notification-container');
        if (container) {
            const notifications = container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.hideNotification(notification);
            });
        }
    }

    // 便捷方法
    showInfoNotification(title, message, duration = 3000) {
        return this.showNotification(title, message, 'info', duration);
    }

    showSuccessNotification(title, message, duration = 3000) {
        return this.showNotification(title, message, 'success', duration);
    }

    showWarningNotification(title, message, duration = 4000) {
        return this.showNotification(title, message, 'warning', duration);
    }

    showErrorNotification(title, message, duration = 5000) {
        return this.showNotification(title, message, 'error', duration);
    }

    // 設置難度按鈕活動狀態
    setDifficultyActive(playerType, difficulty) {
        // 新UI流程下，仍需高亮對應的難度卡片或按鈕
        if (!difficulty) return;
        // 單一AI難度
        if (!playerType || playerType === 'single') {
            document.querySelectorAll('.difficulty-card, .difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const btn = document.getElementById(difficulty);
            if (btn) btn.classList.add('active');
        } else if (playerType === 'black') {
            document.querySelectorAll('.black-ai-card, .black-ai-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const btn = document.getElementById('black-' + difficulty);
            if (btn) btn.classList.add('active');
        } else if (playerType === 'white') {
            document.querySelectorAll('.white-ai-card, .white-ai-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const btn = document.getElementById('white-' + difficulty);
            if (btn) btn.classList.add('active');
        }
    }

    // 設置遊戲模式活動狀態
    setModeActive(modeId) {
        // 新UI流程下，仍需高亮對應的模式卡片或按鈕
        document.querySelectorAll('.mode-card, #human-vs-human, #human-vs-ai, #ai-vs-ai').forEach(btn => {
            btn.classList.remove('active');
        });
        const btn = document.getElementById(modeId);
        if (btn) btn.classList.add('active');
    }

    // 顯示AI難度選項
    showAIDifficultyOptions(show, gameMode = 'human-vs-ai') {
        // 新UI/Modal流程下，AI難度選項顯示由 modal.js 控制，這裡保留兼容性但不再操作舊區塊
    }    // 顯示遊戲規則
    showGameRules() {
        fetch('assets/rule.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('無法加載遊戲規則');
                }
                return response.text();
            })
            .then(rules => {
                // 替換換行符為HTML換行
                const formattedRules = this.formatRules(rules);
                const title = window.textManager ?
                    window.textManager.getText('notifications.gameRulesTitle') :
                    '黑白棋遊戲規則';
                this.showModalWithHTML(title, formattedRules, null, true);
            }).catch(error => {
                console.error('加載遊戲規則出錯:', error);
                const errorTitle = window.textManager ?
                    window.textManager.getText('notifications.error') :
                    '錯誤';
                const errorMsg = window.textManager ?
                    window.textManager.getText('notifications.loadError') :
                    '載入失敗，請稍後再試';
                this.showModal(errorTitle, errorMsg);
            });
    }

    // 格式化規則文本
    formatRules(rulesText) {
        // 簡化的 Markdown 格式化，依賴 markdown.css 進行樣式
        const lines = rulesText.split('\n');
        let formattedHtml = '';
        let inList = false;
        let listType = '';

        for (const line of lines) {
            const trimmedLine = line.trim();

            // 跳過空行
            if (!trimmedLine) {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                formattedHtml += '<br>';
                continue;
            }            // 處理標題 (# ## ### ####)
            if (trimmedLine.startsWith('# ')) {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                let titleContent = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<h1>${titleContent}</h1>`;
            } else if (trimmedLine.startsWith('## ')) {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                let titleContent = trimmedLine.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<h2>${titleContent}</h2>`;
            } else if (trimmedLine.startsWith('### ')) {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                let titleContent = trimmedLine.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<h3>${titleContent}</h3>`;
            } else if (trimmedLine.startsWith('#### ')) {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }
                let titleContent = trimmedLine.substring(5).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<h4>${titleContent}</h4>`;
            }// 處理無序列表項 (- *)
            else if (trimmedLine.match(/^[*\-]\s/)) {
                if (!inList || listType !== 'ul') {
                    if (inList) {
                        formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    }
                    formattedHtml += '<ul>';
                    inList = true;
                    listType = 'ul';
                }
                // 處理列表項中的粗體標記 (**text**)
                let listContent = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<li>${listContent}</li>`;
            }            // 處理有序列表項 (1. 2. 3.)
            else if (trimmedLine.match(/^\d+\.\s/)) {
                if (!inList || listType !== 'ol') {
                    if (inList) {
                        formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    }
                    formattedHtml += '<ol>';
                    inList = true;
                    listType = 'ol';
                }
                // 處理列表項中的粗體標記 (**text**)
                let listContent = trimmedLine.substring(trimmedLine.indexOf('.') + 2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formattedHtml += `<li>${listContent}</li>`;
            }
            // 處理普通段落
            else {
                if (inList) {
                    formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = '';
                }

                // 處理粗體標記 (**text**)
                let processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                formattedHtml += `<p>${processedLine}</p>`;
            }
        }

        // 確保所有開放的列表都已關閉
        if (inList) {
            formattedHtml += listType === 'ul' ? '</ul>' : '</ol>';
        }

        return formattedHtml;
    }    // 顯示帶HTML內容的模態視窗 (用於遊戲規則)
    showModalWithHTML(title, htmlContent, callback = null, isGameRules = false) {
        if (isGameRules) {
            // 遊戲規則專用顯示：在模態視窗內容中顯示，支持雙重滾輪設計
            this.rulesTitle.style.display = 'none'; // 隱藏標題，因為 Markdown 內容已有標題
            this.rulesContent.innerHTML = htmlContent;
            this.rulesModal.style.display = 'flex';
            this.rulesModal.classList.add('show');
            this.rulesModal.classList.add('rules-modal');
            // 為規則內容添加 Markdown 容器類別
            this.rulesContent.classList.add('markdown-content');

            // 顯示底部按鈕區域，讓使用者可以點擊「知道了」按鈕
            const rulesActions = this.rulesModal.querySelector('#rules-actions');
            if (rulesActions) {
                rulesActions.style.display = 'flex';
            }
        } else {
            // 一般模態視窗顯示
            this.rulesTitle.textContent = title;
            this.rulesTitle.style.display = 'block';
            this.rulesContent.innerHTML = htmlContent;
            this.rulesModal.style.display = 'flex';
            this.rulesModal.classList.add('show');
            this.rulesModal.classList.remove('rules-modal');
            this.rulesContent.classList.remove('markdown-content');

            // 顯示底部按鈕區域
            const rulesActions = this.rulesModal.querySelector('#rules-actions');
            if (rulesActions) {
                rulesActions.style.display = 'flex';
            }
        }

        // 存儲回調函數
        this.currentRulesCallback = callback;

        // 如果有確認按鈕，設置其事件
        if (this.rulesConfirm) {
            // 先移除所有可能的事件監聽器
            const newConfirmButton = this.rulesConfirm.cloneNode(true);
            this.rulesConfirm.parentNode.replaceChild(newConfirmButton, this.rulesConfirm);
            this.rulesConfirm = newConfirmButton;

            // 添加新的事件監聽器
            this.rulesConfirm.addEventListener('click', () => {
                if (this.currentRulesCallback) {
                    this.currentRulesCallback();
                    this.currentRulesCallback = null;
                }
                this.hideRulesModal();
            });
        }

        // 顯示模態視窗的淡入動畫
        setTimeout(() => {
            const modalContent = this.rulesModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }    // 隱藏遊戲規則模態視窗
    hideRulesModal() {
        // 模態視窗淡出效果
        const modalContent = this.rulesModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
        }
        this.rulesModal.classList.remove('show');
        this.rulesModal.classList.remove('rules-modal'); // 移除遊戲規則特殊樣式

        // 重置模態視窗狀態
        this.rulesTitle.style.display = 'block'; // 恢復標題顯示
        this.rulesContent.classList.remove('markdown-content'); // 移除 Markdown 樣式

        // 恢復底部按鈕區域顯示
        const rulesActions = this.rulesModal.querySelector('#rules-actions');
        if (rulesActions) {
            rulesActions.style.display = 'flex';
        }        setTimeout(() => {
            this.rulesModal.style.display = 'none';
        }, 300);
    }    // 顯示關於本專案
    showAboutProject() {
        console.log('準備顯示專案資訊');
        // 從 Markdown 文件讀取內容
        fetch('./about.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('無法加載專案資訊');
                }
                return response.text();
            })
            .then(markdownContent => {
                console.log('成功讀取 about.md:', markdownContent.substring(0, 100) + '...');
                const title = '關於本專案';
                const htmlContent = this.convertMarkdownToHtml(markdownContent);
                this.showAboutModal(title, htmlContent);
            })
            .catch(error => {
                console.error('加載專案資訊出錯:', error);
                const errorTitle = window.textManager ?
                    window.textManager.getText('notifications.error') :
                    '錯誤';
                const errorMsg = '無法載入專案資訊，請確認 about.md 文件存在並重新整理頁面';
                this.showAboutModal(errorTitle, `<p style="color: #dc3545;">${errorMsg}</p>`);
            });
    }// 簡單的 Markdown 轉 HTML 函數
    convertMarkdownToHtml(markdown) {
        let html = markdown
            // 處理標題
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 處理圖片 (必須在連結之前處理)
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
            // 處理連結
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 處理粗體和斜體
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 處理代碼塊
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // 處理引用塊
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // 處理無序列表
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            // 處理有序列表
            .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
            // 處理水平線
            .replace(/^---$/gm, '<hr>')
            // 處理換行
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // 包裝列表項目
        html = html.replace(/(<li>.*<\/li>)/gs, function(match) {
            // 檢查是否已經在 ul 或 ol 標籤中
            if (!match.includes('<ul>') && !match.includes('<ol>')) {
                return '<ul>' + match + '</ul>';
            }
            return match;
        });

        // 清理連續的 blockquote 標籤
        html = html.replace(/(<\/blockquote>)<br>(<blockquote>)/g, '$1$2');

        // 包裝段落
        if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    // 顯示關於專案模態框
    showAboutModal(title, htmlContent) {
        const aboutModal = document.getElementById('about-modal');
        const aboutTitle = document.getElementById('about-title');
        const aboutContent = document.getElementById('about-content');
        const aboutClose = document.getElementById('about-close');
        const aboutConfirm = document.getElementById('about-confirm');

        if (!aboutModal || !aboutTitle || !aboutContent) {
            console.error('關於專案模態框元素未找到');
            return;
        }

        // 設置內容
        aboutTitle.textContent = title;
        aboutContent.innerHTML = htmlContent;
        aboutContent.classList.add('markdown-content');

        // 顯示模態框
        aboutModal.style.display = 'flex';
        aboutModal.classList.add('show');

        // 關閉按鈕事件
        if (aboutClose) {
            aboutClose.onclick = () => this.hideAboutModal();
        }

        // 確認按鈕事件
        if (aboutConfirm) {
            aboutConfirm.onclick = () => this.hideAboutModal();
        }

        // 點擊外部區域關閉
        aboutModal.onclick = (e) => {
            if (e.target === aboutModal) {
                this.hideAboutModal();
            }
        };

        // 顯示動畫
        setTimeout(() => {
            const modalContent = aboutModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }

    // 隱藏關於專案模態框
    hideAboutModal() {
        const aboutModal = document.getElementById('about-modal');
        if (!aboutModal) return;

        // 淡出效果
        const modalContent = aboutModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
        }

        aboutModal.classList.remove('show');
        
        setTimeout(() => {
            aboutModal.style.display = 'none';
        }, 300);
    }

    // 更新遊戲狀態顯示
    updateGameStatus(currentPlayer, isGameOver = false, winner = null, gameContext = null) {
        if (this.gameStatus) {
            if (isGameOver) {
                let statusText;
                if (winner === null) {
                    statusText = window.textManager ?
                        window.textManager.getText('ui.gameStatus.draw') :
                        '遊戲結束 - 平局';
                    this.playerIcon.className = 'player-icon';
                    this.playerIcon.innerHTML = '<i class="fas fa-handshake"></i>';
                } else {
                    const winnerKey = winner === 1 ? 'ui.gameStatus.blackWins' : 'ui.gameStatus.whiteWins';
                    statusText = window.textManager ?
                        window.textManager.getText(winnerKey) :
                        `遊戲結束 - ${winner === 1 ? '黑方' : '白方'}獲勝`;

                    this.playerIcon.className = `player-icon ${winner === 1 ? 'black-player' : 'white-player'}`;
                    this.playerIcon.innerHTML = '<i class="fas fa-trophy"></i>';
                }
                this.gameStatus.textContent = statusText;
            } else {
                // 根據遊戲模式和上下文生成狀態文字
                let statusText;
                const playerColor = currentPlayer === 1 ? '黑方' : '白方';

                if (gameContext) {
                    const { gameMode, playerColor: humanPlayerColor, aiThinking, blackAI, whiteAI } = gameContext;

                    if (gameMode === 'ai-vs-ai') {
                        // AI 對戰模式
                        const currentAI = currentPlayer === 1 ? blackAI : whiteAI;
                        const aiDifficultyName = this.getDifficultyDisplayName(currentAI?.difficulty || 'medium');

                        if (aiThinking) {
                            statusText = `${playerColor}(${aiDifficultyName}AI)回合，AI思考中...`;
                        } else {
                            statusText = `${playerColor}(${aiDifficultyName}AI)回合`;
                        }
                    } else if (gameMode === 'human-vs-ai') {
                        // 人機對戰模式
                        const isPlayerTurn = (currentPlayer === humanPlayerColor);

                        if (isPlayerTurn) {
                            statusText = '你的回合';
                        } else {
                            const aiDifficultyName = this.getDifficultyDisplayName(
                                (currentPlayer === 1 ? blackAI : whiteAI)?.difficulty || 'medium'
                            );

                            if (aiThinking) {
                                statusText = `${playerColor}(${aiDifficultyName}AI)回合，AI思考中...`;
                            } else {
                                statusText = `${playerColor}(${aiDifficultyName}AI)回合`;
                            }
                        }
                    } else {
                        // 人人對戰模式
                        statusText = `${playerColor}回合`;
                    }
                } else {
                    // 沒有上下文信息時的默認顯示
                    const statusKey = currentPlayer === 1 ? 'ui.gameStatus.blackTurn' : 'ui.gameStatus.whiteTurn';
                    statusText = window.textManager ?
                        window.textManager.getText(statusKey) :
                        `${playerColor}回合`;
                }

                this.gameStatus.textContent = statusText;

                this.playerIcon.className = `player-icon ${currentPlayer === 1 ? 'black-player' : 'white-player'}`;

                // 根據遊戲模式設置不同的圖標
                if (gameContext && gameContext.gameMode === 'human-vs-ai' && currentPlayer === gameContext.playerColor) {
                    this.playerIcon.innerHTML = '<i class="fas fa-user"></i>';
                } else if (gameContext && (gameContext.gameMode === 'ai-vs-ai' ||
                    (gameContext.gameMode === 'human-vs-ai' && currentPlayer !== gameContext.playerColor))) {
                    this.playerIcon.innerHTML = '<i class="fas fa-robot"></i>';
                } else {
                    this.playerIcon.innerHTML = '<i class="fas fa-user"></i>';
                }
            }
        }
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
    }// 顯示遊戲結束模態視窗（支援多個按鈕）
    showGameEndModal(title, message, buttons = []) {
        this.gameEndTitle.textContent = title;
        this.gameEndMessage.innerHTML = message;

        // 清空並重新設置按鈕區域
        if (this.gameEndActions) {
            this.gameEndActions.innerHTML = '';

            // 創建按鈕
            buttons.forEach((buttonConfig, index) => {
                const button = document.createElement('button');
                button.className = 'modal-button';
                button.textContent = buttonConfig.text;

                // 為不同按鈕設置不同的樣式類
                if (buttonConfig.type === 'primary') {
                    button.classList.add('primary');
                } else if (buttonConfig.type === 'secondary') {
                    button.classList.add('secondary');
                }

                // 設置按鈕點擊事件
                button.addEventListener('click', () => {
                    if (buttonConfig.callback) {
                        buttonConfig.callback();
                    }
                    this.hideGameEndModal();
                });

                this.gameEndActions.appendChild(button);
            });
        }

        // 顯示模態視窗
        this.gameEndModal.style.display = 'flex';
        this.gameEndModal.classList.add('show');

        // 顯示模態視窗的淡入動畫
        setTimeout(() => {
            const modalContent = this.gameEndModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }

    // 隱藏遊戲結束模態視窗
    hideGameEndModal() {
        // 模態視窗淡出效果
        const modalContent = this.gameEndModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
        }
        this.gameEndModal.classList.remove('show');

        setTimeout(() => {
            this.gameEndModal.style.display = 'none';
        }, 300);
    }

    // 測試方法：用於測試遊戲結束模態視窗
    testGameEndModal() {
        this.showGameEndModal(
            '測試：遊戲結束',
            '這是一個測試模態視窗，用來驗證多按鈕功能。<br><br><strong>測試內容：</strong><br>• 按鈕佈局<br>• 樣式顯示<br>• 點擊回調',
            [
                {
                    text: '確認',
                    type: 'primary',
                    callback: () => {
                        console.log('主要按鈕被點擊');
                        alert('主要按鈕測試成功！');
                    }
                },
                {
                    text: '次要選項',
                    type: 'secondary',
                    callback: () => {
                        console.log('次要按鈕被點擊');
                        alert('次要按鈕測試成功！');
                    }
                },
                {
                    text: '其他',
                    type: 'secondary',
                    callback: () => {
                        console.log('第三個按鈕被點擊');
                        alert('第三個按鈕測試成功！');
                    }
                }
            ]
        );
    }

    // 顯示重播模態框
    showReplayModal(gameRecord) {
        console.log('顯示重播模態框', gameRecord);

        if (!gameRecord || !gameRecord.moves || gameRecord.moves.length === 0) {
            this.showModal('無法回放', '沒有可回放的棋譜記錄');
            return;
        }

        // 顯示重播模態框
        const replayModal = document.getElementById('replay-modal');
        if (!replayModal) {
            console.error('找不到重播模態框元素');
            return;
        }

        // 初始化重播控制器
        if (!window.replayController) {
            window.replayController = new ReplayController();
        }

        // 設置遊戲記錄
        window.replayController.setGameRecord(gameRecord);

        // 顯示模態框
        replayModal.style.display = 'flex';
        replayModal.classList.add('show');

        // 設置關閉按鈕事件
        const closeBtn = replayModal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                replayModal.style.display = 'none';
                replayModal.classList.remove('show');
            };
        }        // 點擊模態框外部關閉
        replayModal.onclick = (e) => {
            if (e.target === replayModal) {
                replayModal.style.display = 'none';
                replayModal.classList.remove('show');
            }
        };
    }

    // ========== 動畫同步控制方法 ==========

    // 註冊一個動畫為進行中
    registerAnimation(animationId) {
        this.animationsInProgress.add(animationId);
        console.log(`動畫註冊: ${animationId}, 當前進行中: ${this.animationsInProgress.size}`);
    }

    // 標記一個動畫為完成
    completeAnimation(animationId) {
        this.animationsInProgress.delete(animationId);
        console.log(`動畫完成: ${animationId}, 剩餘進行中: ${this.animationsInProgress.size}`);

        // 如果所有動畫都完成了，執行回調
        if (this.animationsInProgress.size === 0 && this.animationCompletedCallback) {
            console.log('所有動畫完成，執行回調');
            const callback = this.animationCompletedCallback;
            this.animationCompletedCallback = null;
            setTimeout(callback, 50); // 短暫延遲確保動畫徹底完成
        }
    }

    // 等待所有動畫完成
    waitForAnimationsComplete(callback) {
        if (this.animationsInProgress.size === 0) {
            // 沒有進行中的動畫，立即執行回調
            console.log('沒有進行中的動畫，立即執行回調');
            setTimeout(callback, 50);
        } else {
            // 有動畫進行中，設置回調等待
            console.log(`等待 ${this.animationsInProgress.size} 個動畫完成`);
            this.animationCompletedCallback = callback;
        }
    }

    // 清除所有動畫狀態（用於遊戲重置）
    clearAllAnimations() {
        this.animationsInProgress.clear();
        this.animationCompletedCallback = null;
        console.log('清除所有動畫狀態');
    }
}

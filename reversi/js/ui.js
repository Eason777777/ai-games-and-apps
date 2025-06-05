class UI {
    constructor() {
        this.boardElement = document.getElementById('board');
        this.gameStatus = document.getElementById('game-status');
        this.blackScore = document.getElementById('black-score');
        this.whiteScore = document.getElementById('white-score');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.closeButton = document.querySelector('.close-button');
        this.playerInfo = document.querySelector('.player-info');
        this.playerIcon = document.querySelector('.player-icon');

        // 保存上一次的棋盤狀態，用於識別變更的棋子
        this.previousGridState = null;

        // 保存最後一步移動的位置
        this.lastMove = null;

        // 是否啟用音效
        this.soundEnabled = true;

        // 存儲當前模態視窗的確認回調函數
        this.currentModalCallback = null;

        // 設置模態視窗關閉按鈕事件
        this.closeButton.addEventListener('click', () => {
            // 如果有回調函數，先執行再關閉模態視窗
            if (this.currentModalCallback) {
                this.currentModalCallback();
                this.currentModalCallback = null;
            }
            this.hideModal();
        });

        // 點擊視窗外部關閉模態視窗
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                // 如果有回調函數，先執行再關閉模態視窗
                if (this.currentModalCallback) {
                    this.currentModalCallback();
                    this.currentModalCallback = null;
                }
                this.hideModal();
            }
        });

        // 添加初始的動畫和過渡效果
        this.addInitialAnimations();

        // 設置遊戲規則按鈕事件
        const rulesButton = document.getElementById('view-rules');
        if (rulesButton) {
            rulesButton.addEventListener('click', () => {
                this.showGameRules();
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
    }

    renderBoard(board, lastMove = null) {
        console.log('渲染棋盤:', board);
        // 檢查是否是第一次渲染
        const isFirstRender = !this.boardElement.querySelector('.cell');

        // 獲取當前玩家的有效移動位置
        const validMoves = board.getValidMoves(board.currentPlayer);
        console.log('當前有效走步:', validMoves);

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
                    cell.dataset.col = col;

                    // 如果是有效走步位置，添加標記
                    if (validMoves.some(move => move[0] === row && move[1] === col)) {
                        cell.classList.add('valid-move');
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
                    const previousValue = this.previousGridState ? this.previousGridState[row][col] : 0;

                    // 更新有效走步標記
                    const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
                    if (isValidMove) {
                        cell.classList.add('valid-move');
                    } else {
                        cell.classList.remove('valid-move');
                    }

                    // 如果棋子變更了，更新它
                    if (currentValue !== previousValue) {
                        const existingPiece = cell.querySelector('.piece');

                        // 計算距離最後一次移動的曼哈頓距離，用於確定動畫延遲
                        let animationDelay = 0;
                        if (lastMove) {
                            const distance = Math.abs(row - lastMove.row) + Math.abs(col - lastMove.col);
                            animationDelay = Math.min(distance * 80, 400); // 最多延遲 400ms
                        }

                        // 如果是翻轉棋子（從有棋子變成另一種顏色的棋子）
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

                                // 根據方向和目標顏色應用對應的翻轉動畫
                                // 增加調試輸出
                                console.log(`翻轉棋子座標: (${row},${col}), 方向: ${flipDirection}, 顏色: ${currentValue === 1 ? '黑' : '白'}`);

                                // 確保清除之前的類名，然後重新應用
                                existingPiece.className = '';

                                // 先添加基本類
                                existingPiece.classList.add('piece');
                                existingPiece.classList.add(currentValue === 1 ? 'black' : 'white');

                                // 再添加翻轉動畫類
                                existingPiece.classList.add(currentValue === 1 ? `flip-black-${flipDirection}` : `flip-white-${flipDirection}`);

                                // 播放翻轉音效
                                if (window.audioManager && this.soundEnabled) {
                                    window.audioManager.play('flip');
                                }

                                // 確保翻轉動畫完成後正確���示最終狀態
                                setTimeout(() => {
                                    // 清除所有類，只保留基本類
                                    existingPiece.className = '';
                                    existingPiece.classList.add('piece');
                                    existingPiece.classList.add(currentValue === 1 ? 'black' : 'white');
                                }, 500); // 延遲與動畫持續時間相同
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
            }

            const gameStatus = this.gameStatus;
            if (gameStatus) {
                gameStatus.textContent = board.currentPlayer === 1 ? '黑方回合' : '白方回合';
            }
        }

        // 更新分數
        const score = board.getScore ? board.getScore() : { black: 0, white: 0 };
        if (this.blackScore) this.blackScore.textContent = score.black;
        if (this.whiteScore) this.whiteScore.textContent = score.white;

        // 保存當前棋盤狀態，用於下次更新比較
        this.previousGridState = board.grid.map(row => [...row]);
        this.lastMove = lastMove;
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
    }

    // 顯示模態視窗
    showModal(title, message, callback = null) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');

        // 存儲回調函數
        this.currentModalCallback = callback;

        // 如果有確認按鈕，設置其事件
        if (this.modalConfirm) {
            // 先移除所有可能的事件監聽器
            const newConfirmButton = this.modalConfirm.cloneNode(true);
            this.modalConfirm.parentNode.replaceChild(newConfirmButton, this.modalConfirm);
            this.modalConfirm = newConfirmButton;

            // 添加新的事件監聽器
            this.modalConfirm.addEventListener('click', () => {
                if (this.currentModalCallback) {
                    this.currentModalCallback();
                    this.currentModalCallback = null;
                }
                this.hideModal();
            });
        }

        // 顯示模態視窗的淡入動畫
        setTimeout(() => {
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }    // 隱藏模態視窗
    hideModal() {
        // 模態視窗淡出效果
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
        }
        this.modal.classList.remove('show');
        this.modal.classList.remove('rules-modal'); // 移除遊戲規則特殊樣式

        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    // 設置難度按鈕活動狀態
    setDifficultyActive(playerType, difficulty) {
        // 判斷是為特定顏色設置難度還是統一設置
        if (playerType === 'black') {
            // 黑子AI難度設置
            document.querySelectorAll('.black-ai-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            if (difficulty) {
                const btnId = `black-${difficulty}`;
                const btn = document.getElementById(btnId);
                if (btn) btn.classList.add('active');
            }
        } else if (playerType === 'white') {
            // 白子AI難度設置
            document.querySelectorAll('.white-ai-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            if (difficulty) {
                const btnId = `white-${difficulty}`;
                const btn = document.getElementById(btnId);
                if (btn) btn.classList.add('active');
            }
        } else {
            // 普通模式（人機對戰）的難度設置
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                if (btn.id !== 'confirm-ai-settings' &&
                    !btn.classList.contains('black-ai-btn') &&
                    !btn.classList.contains('white-ai-btn')) {
                    btn.classList.remove('active');
                }
            });
            if (difficulty) {
                const btn = document.getElementById(difficulty);
                if (btn) btn.classList.add('active');
            }
        }
    }

    // 設置遊戲模式活動狀態
    setModeActive(modeId) {
        // 將所有模式按鈕設置為非活動狀態
        document.querySelectorAll('#human-vs-human, #human-vs-ai, #ai-vs-ai').forEach(btn => {
            btn.classList.remove('active');
        });

        // 設置選定的模式按鈕為活動狀態
        document.getElementById(modeId).classList.add('active');

        // 根據模式切換難度設置區域
        const singleAIDifficulty = document.getElementById('single-ai-difficulty');
        const aiVsAIDifficulty = document.getElementById('ai-vs-ai-difficulty');

        if (singleAIDifficulty && aiVsAIDifficulty) {
            if (modeId === 'ai-vs-ai') {
                singleAIDifficulty.style.display = 'none';
                aiVsAIDifficulty.style.display = 'block';
            } else {
                singleAIDifficulty.style.display = 'flex';
                aiVsAIDifficulty.style.display = 'none';
            }
        }
    }

    // 顯示AI難度選項
    showAIDifficultyOptions(show, gameMode = 'human-vs-ai') {
        const aiDifficulty = document.getElementById('ai-difficulty');
        const singleAIDifficulty = document.getElementById('single-ai-difficulty');
        const aiVsAIDifficulty = document.getElementById('ai-vs-ai-difficulty');

        if (!aiDifficulty) return;

        if (show) {
            aiDifficulty.style.display = 'block';

            // 根據遊戲模式顯示對應的難度設定區域
            if (gameMode === 'ai-vs-ai') {
                if (singleAIDifficulty) singleAIDifficulty.style.display = 'none';
                if (aiVsAIDifficulty) aiVsAIDifficulty.style.display = 'block';

                // 在 AI vs AI 模式下，添加這個類來適應雙AI設置的布局
                if (aiDifficulty) aiDifficulty.classList.add('dual-ai-mode');
            } else {
                if (singleAIDifficulty) singleAIDifficulty.style.display = 'flex';
                if (aiVsAIDifficulty) aiVsAIDifficulty.style.display = 'none';

                // 在其他模式下，移除這個類
                if (aiDifficulty) aiDifficulty.classList.remove('dual-ai-mode');
            }
        } else {
            aiDifficulty.style.display = 'none';
        }
    }    // 顯示遊戲規則
    showGameRules() {
        fetch('assets/rule.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('無法加載遊戲規則');
                }
                return response.text();
            })
            .then(rules => {
                // 替換換行符為HTML換行
                const formattedRules = this.formatRules(rules);
                this.showModalWithHTML('黑白棋遊戲規則', formattedRules, null, true);
            })
            .catch(error => {
                console.error('加載遊戲規則出錯:', error);
                this.showModal('錯誤', '無法加載遊戲規則，請稍後再試。');
            });
    }

    // 格式化規則文本
    formatRules(rulesText) {
        // 將文本拆分為行
        const lines = rulesText.split('\n');
        let formattedHtml = '';
        let inList = false;

        for (const line of lines) {
            // 處理標題 (# ## ###)
            if (line.startsWith('# ')) {
                formattedHtml += `<h2>${line.substring(2)}</h2>`;
            } else if (line.startsWith('## ')) {
                formattedHtml += `<h3>${line.substring(3)}</h3>`;
            } else if (line.startsWith('### ')) {
                formattedHtml += `<h4>${line.substring(4)}</h4>`;
            }
            // 處理列表項 (- * 1. 2.)
            else if (line.match(/^[*\-]\s/)) {
                // 如果還不在列表中，開始一個新的無序列表
                if (!inList) {
                    formattedHtml += '<ul>';
                    inList = true;
                }
                formattedHtml += `<li>${line.substring(2)}</li>`;
            } else if (line.match(/^\d+\.\s/)) {
                // 如果還不在列表中，開始一個新的有序列表
                if (!inList) {
                    formattedHtml += '<ol>';
                    inList = true;
                }
                formattedHtml += `<li>${line.substring(line.indexOf('.') + 2)}</li>`;
            } else {
                // 結束當前列表（如果有）
                if (inList) {
                    formattedHtml += inList === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                }
                // 處理普通段落
                if (line.trim()) {
                    formattedHtml += `<p>${line}</p>`;
                } else {
                    formattedHtml += '<br>';
                }
            }
        }

        // 確保所有開放的列表都已關閉
        if (inList) {
            formattedHtml += inList === 'ul' ? '</ul>' : '</ol>';
        }

        return formattedHtml;
    }    // 顯示帶HTML內容的模態視窗
    showModalWithHTML(title, htmlContent, callback = null, isGameRules = false) {
        this.modalTitle.textContent = title;
        this.modalMessage.innerHTML = htmlContent;
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');

        // 為遊戲規則模態視窗添加特殊類別
        if (isGameRules) {
            this.modal.classList.add('rules-modal');
        } else {
            this.modal.classList.remove('rules-modal');
        }

        // 存儲回調函數
        this.currentModalCallback = callback;

        // 如果有確認按鈕，設置其事件
        if (this.modalConfirm) {
            // 先移除所有可能的事件監聽器
            const newConfirmButton = this.modalConfirm.cloneNode(true);
            this.modalConfirm.parentNode.replaceChild(newConfirmButton, this.modalConfirm);
            this.modalConfirm = newConfirmButton;

            // 添加新的事件監聽器
            this.modalConfirm.addEventListener('click', () => {
                if (this.currentModalCallback) {
                    this.currentModalCallback();
                    this.currentModalCallback = null;
                }
                this.hideModal();
            });
        }

        // 顯示模態視窗的淡入動畫
        setTimeout(() => {
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        }, 10);
    }

    // 更新遊戲狀態顯示
    updateGameStatus(currentPlayer, isGameOver = false, winner = null) {
        if (this.gameStatus) {
            if (isGameOver) {
                if (winner === null) {
                    this.gameStatus.textContent = '遊戲結束 - 平局';
                    this.playerIcon.className = 'player-icon';
                    this.playerIcon.innerHTML = '<i class="fas fa-handshake"></i>';
                } else {
                    const winnerText = winner === 1 ? '黑方' : '白方';
                    this.gameStatus.textContent = `遊戲結束 - ${winnerText}獲勝`;

                    this.playerIcon.className = `player-icon ${winner === 1 ? 'black-player' : 'white-player'}`;
                    this.playerIcon.innerHTML = '<i class="fas fa-trophy"></i>';
                }
            } else {
                const currentPlayerText = currentPlayer === 1 ? '黑方' : '白方';
                this.gameStatus.textContent = `${currentPlayerText}回合`;

                this.playerIcon.className = `player-icon ${currentPlayer === 1 ? 'black-player' : 'white-player'}`;
                this.playerIcon.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    }
}

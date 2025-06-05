// Matching Game Module
class MatchingManager {
    constructor() {
        this.dataManager = null;
        this.gameWords = [];
        this.cards = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.isGameActive = false;
        this.unit = 'all';
        this.wordCount = 12;
        this.init();
    }

    /**
     * 設置數據管理器
     */
    setDataManager(dataManager) {
        this.dataManager = dataManager;
        this.initialize();
    }

    init() {
        this.bindEvents();
    }

    initialize() {
        this.setupControls();
    }

    bindEvents() {
        // Unit selector
        const unitSelector = document.getElementById('matchingUnit');
        if (unitSelector) {
            unitSelector.addEventListener('change', (e) => {
                this.unit = e.target.value;
            });
        }

        // Word count input
        const countInput = document.getElementById('matchingCount');
        if (countInput) {
            countInput.addEventListener('change', (e) => {
                this.wordCount = Math.max(4, Math.min(20, parseInt(e.target.value) || 12));
                // Ensure even number for pairs
                if (this.wordCount % 2 !== 0) {
                    this.wordCount--;
                }
                e.target.value = this.wordCount;
            });
        }

        // Start game button
        const startBtn = document.getElementById('startMatching');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Play again button
        const playAgainBtn = document.getElementById('playAgain');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.startGame();
                window.navigationManager.hideResult();
            });
        }
    }

    setupControls() {
        // Load saved preferences
        const savedUnit = localStorage.getItem('matchingUnit');
        const savedCount = localStorage.getItem('matchingCount');

        if (savedUnit) {
            const unitSelector = document.getElementById('matchingUnit');
            if (unitSelector) {
                unitSelector.value = savedUnit;
                this.unit = savedUnit;
            }
        }

        if (savedCount) {
            const countInput = document.getElementById('matchingCount');
            if (countInput) {
                countInput.value = savedCount;
                this.wordCount = parseInt(savedCount);
            }
        }
    }

    startGame() {
        // Save preferences
        localStorage.setItem('matchingUnit', this.unit);
        localStorage.setItem('matchingCount', this.wordCount.toString());        // Get words for the game
        if (!this.dataManager) return;
        const availableWords = this.dataManager.getWordsByUnit(this.unit);
        if (availableWords.length === 0) {
            window.navigationManager.showNotification('沒有可用的單字', 'error');
            return;
        }        // Select random words (half the card count since each word creates 2 cards)
        const pairCount = Math.floor(this.wordCount / 2);
        this.gameWords = this.dataManager.getRandomWords(pairCount, this.unit);

        if (this.gameWords.length < pairCount) {
            window.navigationManager.showNotification(
                `單字數量不足，只能創建 ${this.gameWords.length * 2} 張卡片`,
                'warning'
            );
        }

        this.createCards();
        this.renderGame();
        this.startTimer();
        this.updateStats();

        this.isGameActive = true;
        this.matchedPairs = 0;
        this.selectedCards = [];

        window.navigationManager.showNotification('遊戲開始！', 'success', 2000);
    }

    createCards() {
        this.cards = [];

        // Create pairs of cards for each word
        this.gameWords.forEach((word, index) => {
            // English card
            this.cards.push({
                id: `en-${index}`,
                content: word.english,
                type: 'english',
                wordIndex: index,
                isMatched: false,
                isSelected: false
            });

            // Chinese card
            this.cards.push({
                id: `zh-${index}`,
                content: word.chinese,
                type: 'chinese',
                wordIndex: index,
                isMatched: false,
                isSelected: false
            });
        });

        // Shuffle cards
        this.cards = this.cards.sort(() => Math.random() - 0.5);
    }

    renderGame() {
        const grid = document.getElementById('matchingGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Calculate grid columns based on card count
        const columns = Math.ceil(Math.sqrt(this.cards.length));
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'matching-card';
            cardElement.dataset.cardId = card.id;
            cardElement.textContent = card.content;

            cardElement.addEventListener('click', () => {
                this.selectCard(card);
            });

            grid.appendChild(cardElement);
        });
    }

    selectCard(card) {
        if (!this.isGameActive || card.isMatched || card.isSelected) {
            return;
        }

        // Find card element
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (!cardElement) return;

        // Select the card
        card.isSelected = true;
        cardElement.classList.add('selected');
        this.selectedCards.push(card);

        // Check if we have two selected cards
        if (this.selectedCards.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.selectedCards;

        // Check if cards match (same word index but different types)
        if (card1.wordIndex === card2.wordIndex && card1.type !== card2.type) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        // Mark cards as matched
        card1.isMatched = true;
        card2.isMatched = true;

        const cardElement1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const cardElement2 = document.querySelector(`[data-card-id="${card2.id}"]`);

        if (cardElement1 && cardElement2) {
            setTimeout(() => {
                cardElement1.classList.remove('selected');
                cardElement2.classList.remove('selected');
                cardElement1.classList.add('matched');
                cardElement2.classList.add('matched');
            }, 500);
        }

        this.matchedPairs++;
        this.selectedCards = [];
        this.updateStats();

        // Check if game is complete
        if (this.matchedPairs === this.gameWords.length) {
            setTimeout(() => {
                this.endGame();
            }, 1000);
        }

        // Show word details for educational value
        const word = this.gameWords[card1.wordIndex];
        this.showWordDetails(word);
    }

    handleMismatch(card1, card2) {
        const cardElement1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const cardElement2 = document.querySelector(`[data-card-id="${card2.id}"]`);

        if (cardElement1 && cardElement2) {
            // Show wrong animation
            cardElement1.classList.add('wrong');
            cardElement2.classList.add('wrong');

            setTimeout(() => {
                // Reset cards
                card1.isSelected = false;
                card2.isSelected = false;
                cardElement1.classList.remove('selected', 'wrong');
                cardElement2.classList.remove('selected', 'wrong');
            }, 1000);
        }

        this.selectedCards = [];
    }

    showWordDetails(word) {
        // Create a temporary notification with word details
        const notification = document.createElement('div');
        notification.className = 'word-detail-notification';
        notification.innerHTML = `
            <div class="word-detail-content">
                <h4>${word.english} - ${word.chinese}</h4>
                <p>${word.definition}</p>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #667eea',
            borderRadius: '10px',
            padding: '15px 20px',
            maxWidth: '400px',
            zIndex: '9999',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            opacity: '0',
            transition: 'all 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    startTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        if (!this.gameStartTime) return;

        const elapsed = Date.now() - this.gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timerElement = document.getElementById('gameTime');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateStats() {
        const matchedElement = document.getElementById('matchedCount');
        const remainingElement = document.getElementById('remainingCount');

        if (matchedElement) {
            matchedElement.textContent = this.matchedPairs;
        }

        if (remainingElement) {
            remainingElement.textContent = this.gameWords.length - this.matchedPairs;
        }
    }

    endGame() {
        this.isGameActive = false;

        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        const elapsed = Date.now() - this.gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update final time display
        const finalTimeElement = document.getElementById('finalTime');
        if (finalTimeElement) {
            finalTimeElement.textContent = timeString;
        }        // Save game result
        this.saveGameResult(elapsed);

        // Show result overlay
        window.navigationManager.showResult('matchingResult');
    }

    saveGameResult(duration) {
        const gameData = {
            date: new Date().toISOString(),
            duration: duration,
            wordCount: this.gameWords.length,
            unit: this.unit,
            type: 'matching'
        };

        const gameHistory = JSON.parse(localStorage.getItem('matchingHistory') || '[]');
        gameHistory.push(gameData);

        // Keep only last 50 games
        if (gameHistory.length > 50) {
            gameHistory.splice(0, gameHistory.length - 50);
        }

        localStorage.setItem('matchingHistory', JSON.stringify(gameHistory));
    }

    handleKeyboard(e) {
        if (window.navigationManager.currentPage !== 'matching') return;

        switch (e.key) {
            case 'Enter':
                if (!this.isGameActive) {
                    e.preventDefault();
                    this.startGame();
                }
                break;
            case 'Escape':
                if (this.isGameActive) {
                    e.preventDefault();
                    this.confirmQuitGame();
                }
                break;
        }
    }

    confirmQuitGame() {
        if (confirm('確定要退出當前遊戲嗎？')) {
            this.isGameActive = false;
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
                this.gameTimer = null;
            }
            this.renderGame(); // Reset the display
            window.navigationManager.showNotification('遊戲已退出', 'info');
        }
    }

    /**
     * 用設定初始化配對遊戲
     */
    initializeWithSettings(settings) {
        // 設定單元
        this.unit = settings.units.length > 0 ? settings.units.join(',') : 'all';

        // 設定單字數量
        if (settings.wordCount) {
            this.wordCount = Math.max(4, Math.min(20, settings.wordCount));
            // 確保是偶數以便配對
            if (this.wordCount % 2 !== 0) {
                this.wordCount--;
            }
        }

        // 更新UI
        this.updateUIFromSettings();

        // 自動開始遊戲
        this.startGame();
    }

    /**
     * 根據設定更新UI
     */
    updateUIFromSettings() {
        // 更新單元選擇器
        const unitSelector = document.getElementById('matchingUnit');
        if (unitSelector) {
            unitSelector.value = this.unit;
        }

        // 更新單字數量
        const countInput = document.getElementById('matchingCount');
        if (countInput) {
            countInput.value = this.wordCount;
        }
    }

    // Game analysis and statistics
    getGameStats() {
        const history = JSON.parse(localStorage.getItem('matchingHistory') || '[]');

        if (history.length === 0) {
            return {
                totalGames: 0,
                averageDuration: 0,
                bestTime: 0,
                totalWords: 0
            };
        }

        const totalDuration = history.reduce((sum, game) => sum + game.duration, 0);
        const bestTime = Math.min(...history.map(game => game.duration));
        const totalWords = history.reduce((sum, game) => sum + game.wordCount, 0);

        return {
            totalGames: history.length,
            averageDuration: Math.round(totalDuration / history.length),
            bestTime: bestTime,
            totalWords: totalWords
        };
    }

    showGameStats() {
        const stats = this.getGameStats();

        if (stats.totalGames === 0) {
            window.navigationManager.showNotification('還沒有遊戲記錄', 'info');
            return;
        }

        const avgMinutes = Math.floor(stats.averageDuration / 60000);
        const avgSeconds = Math.floor((stats.averageDuration % 60000) / 1000);
        const bestMinutes = Math.floor(stats.bestTime / 60000);
        const bestSeconds = Math.floor((stats.bestTime % 60000) / 1000);

        const message = `
            遊戲統計：
            總遊戲次數：${stats.totalGames}
            平均時間：${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}
            最佳時間：${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}
            總練習單字：${stats.totalWords}
        `;

        alert(message);
    }

    // Hint system for difficult games
    giveHint() {
        if (!this.isGameActive || this.selectedCards.length === 0) return;

        const selectedCard = this.selectedCards[0];
        const matchingCard = this.cards.find(card =>
            card.wordIndex === selectedCard.wordIndex &&
            card.type !== selectedCard.type &&
            !card.isMatched
        );

        if (matchingCard) {
            const matchingElement = document.querySelector(`[data-card-id="${matchingCard.id}"]`);
            if (matchingElement) {
                // Highlight the matching card briefly
                matchingElement.style.border = '3px solid #ffd700';
                matchingElement.style.animation = 'pulse 0.5s ease-in-out 3';

                setTimeout(() => {
                    matchingElement.style.border = '';
                    matchingElement.style.animation = '';
                }, 2000);
            }
        }
    }
}

// Add pulse animation to CSS (inline style for this module)
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .word-detail-notification .word-detail-content h4 {
        margin-bottom: 8px;
        color: #4a5568;
        font-size: 1.1rem;
    }
    
    .word-detail-notification .word-detail-content p {
        margin: 0;
        color: #718096;
        font-size: 0.9rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);



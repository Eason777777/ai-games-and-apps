// Definition Matching Game Module
class DefinitionMatchingManager {
    constructor() {
        this.dataManager = null;
        this.gameWords = [];
        this.selectedDefinition = null;
        this.selectedWord = null;
        this.matchedPairs = 0;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.isGameActive = false;
        this.unit = 'all';
        this.definitionCount = 10;
        this.totalDefinitions = 0;
        this.totalWords = 0;
        this.gameAnswers = []; // 儲存本輪的答案
        this.init();
    }

    /**
     * 設置數據管理器
     */
    setDataManager(dataManager) {
        this.dataManager = dataManager;
        this.initialize();
    } init() {
        this.bindEvents();
        this.handleResponsive();
    }

    initialize() {
        this.setupControls();
        this.populateUnitSelector();
    }

    handleResponsive() {
        // 視窗大小變化時重新調整布局
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.adjustLayoutForScreen();
            }, 250);
        });

        // 初始調整
        this.adjustLayoutForScreen();
    }

    adjustLayoutForScreen() {
        if (!this.isGameActive) return;

        const container = document.querySelector('.definition-matching-container');
        if (!container) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // 針對橫向模式和小螢幕調整
        if (screenHeight < 600 && window.orientation !== undefined) {
            // 橫向模式
            const grids = container.querySelectorAll('.definitions-grid, .words-grid-matching');
            grids.forEach(grid => {
                grid.style.maxHeight = '25vh';
            });
        } else if (screenWidth < 768) {
            // 直向小螢幕模式
            const grids = container.querySelectorAll('.definitions-grid, .words-grid-matching');
            grids.forEach(grid => {
                if (screenWidth < 480) {
                    grid.style.maxHeight = '30vh';
                } else {
                    grid.style.maxHeight = '40vh';
                }
            });
        } else {
            // 桌面模式
            const grids = container.querySelectorAll('.definitions-grid, .words-grid-matching');
            grids.forEach(grid => {
                grid.style.maxHeight = '60vh';
            });
        }
    }

    bindEvents() {
        // Unit selector
        const unitSelector = document.getElementById('definitionMatchingUnit');
        if (unitSelector) {
            unitSelector.addEventListener('change', (e) => {
                this.unit = e.target.value;
            });
        }

        // Definition count input
        const countInput = document.getElementById('definitionCount');
        if (countInput) {
            countInput.addEventListener('change', (e) => {
                this.definitionCount = Math.max(6, Math.min(20, parseInt(e.target.value) || 10));
                e.target.value = this.definitionCount;
            });
        }

        // Start game button
        const startBtn = document.getElementById('startDefinitionMatching');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Play again button
        const playAgainBtn = document.getElementById('playDefinitionAgain');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.startGame();
                window.navigationManager.hideResult();
            });
        }

        // Show answers button
        const showAnswersBtn = document.getElementById('showAnswers');
        if (showAnswersBtn) {
            showAnswersBtn.addEventListener('click', () => {
                this.showAnswers();
            });
        }

        // Modal close
        const answersModal = document.getElementById('answersModal');
        if (answersModal) {
            const closeBtn = answersModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    answersModal.classList.add('hidden');
                });
            }
        }
    }

    setupControls() {
        // Load saved preferences
        const savedUnit = localStorage.getItem('definitionMatchingUnit');
        const savedCount = localStorage.getItem('definitionCount');

        if (savedUnit) {
            const unitSelector = document.getElementById('definitionMatchingUnit');
            if (unitSelector) {
                unitSelector.value = savedUnit;
                this.unit = savedUnit;
            }
        }

        if (savedCount) {
            const countInput = document.getElementById('definitionCount');
            if (countInput) {
                countInput.value = savedCount;
                this.definitionCount = parseInt(savedCount);
            }
        }
    }

    populateUnitSelector() {
        if (!this.dataManager) return;

        const unitSelector = document.getElementById('definitionMatchingUnit');
        if (!unitSelector) return;

        // Clear existing options except 'all'
        unitSelector.innerHTML = '<option value="all">所有單元</option>';

        // Add unit options
        this.dataManager.units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            unitSelector.appendChild(option);
        });

        // Restore saved selection
        const savedUnit = localStorage.getItem('definitionMatchingUnit');
        if (savedUnit) {
            unitSelector.value = savedUnit;
            this.unit = savedUnit;
        }
    }

    startGame() {
        // Save preferences
        localStorage.setItem('definitionMatchingUnit', this.unit);
        localStorage.setItem('definitionCount', this.definitionCount.toString());

        // Get words for the game
        if (!this.dataManager) return;
        const availableWords = this.dataManager.getWordsByUnit(this.unit);
        if (availableWords.length === 0) {
            window.navigationManager.showNotification('沒有可用的單字', 'error');
            return;
        }

        // Select random words for the game
        const selectedWords = this.getRandomWords(availableWords, this.definitionCount);
        if (selectedWords.length < this.definitionCount) {
            window.navigationManager.showNotification(
                `單字數量不足，只能選擇 ${selectedWords.length} 個單字`,
                'warning'
            );
        }

        this.gameWords = selectedWords;
        this.gameAnswers = [...selectedWords]; // 儲存答案
        this.initializeGame();
    }

    getRandomWords(words, count) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    } initializeGame() {
        this.matchedPairs = 0;
        this.selectedDefinition = null;
        this.selectedWord = null;
        this.isGameActive = true;
        this.totalDefinitions = this.gameWords.length;
        this.totalWords = this.gameWords.length + 2; // 比字義多2個單字

        // 清除任何殘留的狀態
        this.clearAllStates();

        this.startTimer();
        this.setupGameBoard();
        this.updateStats();
    } setupGameBoard() {
        const definitionsGrid = document.getElementById('definitionsGrid');
        const wordsGrid = document.getElementById('definitionWordsGrid');

        if (!definitionsGrid || !wordsGrid) return;

        // Clear grids
        definitionsGrid.innerHTML = '';
        wordsGrid.innerHTML = '';

        // Create definition cards
        this.gameWords.forEach((word, index) => {
            const card = this.createDefinitionCard(word, index);
            definitionsGrid.appendChild(card);
        });        // Create word cards (包含正確答案 + 2個額外單字)
        const wordCards = this.createWordCards();
        wordCards.forEach(card => {
            wordsGrid.appendChild(card);
        });

        // 調整響應式布局
        setTimeout(() => {
            this.adjustLayoutForScreen();
        }, 100);
    } createDefinitionCard(word, index) {
        const card = document.createElement('div');
        card.className = 'definition-card';
        card.dataset.index = index;
        card.dataset.word = word.english;

        card.innerHTML = `
            <div class="card-content">
                <p class="definition-text">${word.definition}</p>
            </div>
        `;

        // 添加觸控事件處理
        card.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectDefinition(card, index);
        });

        // 觸控設備的反饋
        card.addEventListener('touchstart', (e) => {
            card.style.transform = 'scale(0.98)';
        });

        card.addEventListener('touchend', (e) => {
            setTimeout(() => {
                card.style.transform = '';
            }, 100);
        });

        return card;
    } createWordCards() {
        // 獲取額外的2個單字
        const allWords = this.dataManager.getWordsByUnit(this.unit);
        const excludeWords = this.gameWords.map(w => w.english);
        const extraWords = allWords
            .filter(w => !excludeWords.includes(w.english))
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        // 合併正確答案和額外單字
        const allWordCards = [...this.gameWords, ...extraWords];

        // 隨機排序
        const shuffledWords = allWordCards.sort(() => Math.random() - 0.5);

        return shuffledWords.map((word, index) => {
            const card = document.createElement('div');
            card.className = 'word-card';
            card.dataset.word = word.english;

            card.innerHTML = `
                <div class="card-content">
                    <p class="word-text">${word.english}</p>
                </div>
            `;

            // 添加觸控事件處理
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectWord(card, word.english);
            });

            // 觸控設備的反饋
            card.addEventListener('touchstart', (e) => {
                card.style.transform = 'scale(0.98)';
            });

            card.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    card.style.transform = '';
                }, 100);
            });

            return card;
        });
    } selectDefinition(card, index) {
        // 立即清除所有錯誤和選擇狀態
        this.clearAllStates();

        // Select current card
        card.classList.add('selected');
        this.selectedDefinition = {
            card: card,
            index: index,
            word: this.gameWords[index]
        };

        this.checkMatch();
    } selectWord(card, word) {
        // 立即清除所有錯誤和選擇狀態
        this.clearAllStates();

        // Select current card
        card.classList.add('selected');
        this.selectedWord = {
            card: card,
            word: word
        };

        this.checkMatch();
    } checkMatch() {
        if (!this.selectedDefinition || !this.selectedWord) return;

        const isCorrect = this.selectedDefinition.word.english === this.selectedWord.word;

        if (isCorrect) {
            this.handleCorrectMatch();
        } else {
            this.handleIncorrectMatch();
        }
    }

    handleCorrectMatch() {
        // Mark as matched
        this.selectedDefinition.card.classList.add('matched');
        this.selectedWord.card.classList.add('matched');

        // Remove click events
        this.selectedDefinition.card.style.pointerEvents = 'none';
        this.selectedWord.card.style.pointerEvents = 'none';

        this.matchedPairs++;
        this.updateStats();

        // Reset selections
        this.selectedDefinition = null;
        this.selectedWord = null;

        // Check if game is complete
        if (this.matchedPairs === this.totalDefinitions) {
            this.endGame();
        }

        window.navigationManager.showNotification('配對正確！', 'success', 1500);
    } handleIncorrectMatch() {
        // 先清除選擇狀態，避免和錯誤狀態衝突
        this.selectedDefinition.card.classList.remove('selected');
        this.selectedWord.card.classList.remove('selected');

        // 添加錯誤狀態和動畫
        this.selectedDefinition.card.classList.add('error');
        this.selectedWord.card.classList.add('error');

        // 設置較短的錯誤顯示時間，讓用戶能更快重新選擇
        setTimeout(() => {
            this.selectedDefinition.card.classList.remove('error');
            this.selectedWord.card.classList.remove('error');
        }, 600); // 從1000ms縮短到600ms

        // 立即重置選擇，讓用戶可以馬上重新選擇
        this.selectedDefinition = null;
        this.selectedWord = null;

        window.navigationManager.showNotification('配對錯誤，請重試', 'error', 1000);
    }

    updateStats() {
        const matchedElement = document.getElementById('definitionMatchedCount');
        const remainingElement = document.getElementById('definitionRemainingCount');

        if (matchedElement) {
            matchedElement.textContent = this.matchedPairs;
        }

        if (remainingElement) {
            remainingElement.textContent = this.totalDefinitions - this.matchedPairs;
        }
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
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const timeElement = document.getElementById('definitionGameTime');
        if (timeElement) {
            timeElement.textContent =
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    endGame() {
        this.isGameActive = false;
        clearInterval(this.gameTimer);

        const finalTime = document.getElementById('definitionFinalTime');
        const timeElement = document.getElementById('definitionGameTime');

        if (finalTime && timeElement) {
            finalTime.textContent = timeElement.textContent;
        }

        setTimeout(() => {
            window.navigationManager.showResult('definitionMatchingResult');
        }, 1000);
    }

    showAnswers() {
        const modal = document.getElementById('answersModal');
        const content = document.getElementById('answersContent');

        if (!modal || !content) return;

        content.innerHTML = '';

        this.gameAnswers.forEach((word, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            answerItem.innerHTML = `
                <div class="answer-word">${word.english}</div>
                <div class="answer-definition">${word.definition}</div>
                <div class="answer-chinese">${word.chinese}</div>
            `;
            content.appendChild(answerItem);
        });

        modal.classList.remove('hidden');
    }

    handleKeyboard(e) {
        if (!this.isGameActive) return;

        // ESC to clear selections
        if (e.key === 'Escape') {
            document.querySelectorAll('.definition-card.selected, .word-card.selected').forEach(card => {
                card.classList.remove('selected');
            });
            this.selectedDefinition = null;
            this.selectedWord = null;
        }
    }

    /**
     * 清除所有卡片的選擇和錯誤狀態
     */
    clearAllStates() {
        // 清除所有選擇狀態
        document.querySelectorAll('.definition-card.selected, .word-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        // 清除所有錯誤狀態
        document.querySelectorAll('.definition-card.error, .word-card.error').forEach(card => {
            card.classList.remove('error');
        });
    }

    /**
     * 用設定初始化字義配對遊戲
     */
    initializeWithSettings(settings) {
        // 設定單元
        this.unit = settings.units.length > 0 ? settings.units.join(',') : 'all';

        // 設定字義數量
        if (settings.wordCount) {
            this.definitionCount = Math.max(6, Math.min(20, settings.wordCount));
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
        const unitSelector = document.getElementById('definitionMatchingUnit');
        if (unitSelector) {
            unitSelector.value = this.unit;
        }

        // 更新字義數量
        const countInput = document.getElementById('definitionCount');
        if (countInput) {
            countInput.value = this.definitionCount;
        }
    }
}



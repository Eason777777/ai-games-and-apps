// Quizlet Style Review Module
class QuizletManager {
    constructor() {
        this.dataManager = null;
        this.currentWords = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.mode = 'word-chinese';
        this.selectedUnits = ['all'];
        this.difficultyFilter = null;
        this.init();
    }

    /**
     * 設置數據管理器
     */
    setDataManager(dataManager) {
        this.dataManager = dataManager;
        this.initialize();
    }

    /**
     * 獲取數據管理器的安全方法
     */
    get data() {
        return this.dataManager || window.dataManager;
    }

    init() {
        this.bindEvents();
    } initialize() {
        this.setupUnitCheckboxes();
        this.loadWords();
        this.updateModeSelector();
        this.initializeDifficultyFilter();
    }

    initializeDifficultyFilter() {
        // Set default "全部" filter as active
        const allFilter = document.querySelector('.filter-option[data-difficulty=""]');
        if (allFilter) {
            allFilter.classList.add('active');
        }

        // Clear any existing difficulty filter
        this.difficultyFilter = null;
    } bindEvents() {
        // Mode selector (now radio buttons)
        const modeRadios = document.querySelectorAll('input[name="quizletMode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.mode = e.target.value;
                    this.showCurrentCard();
                }
            });
        });

        // Shuffle button
        const shuffleBtn = document.getElementById('shuffleCards');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.shuffleWords();
            });
        }

        // Filter buttons (now .filter-option)
        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.closest('.filter-option').dataset.difficulty;
                this.toggleDifficultyFilter(difficulty);
            });
        });

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        this.bindCardEvents();
    } loadWords() {
        if (!this.dataManager) {
            console.warn('DataManager not available yet');
            return;
        }        // Get words based on selected units
        let words = [];
        if (this.selectedUnits.includes('all')) {
            words = this.dataManager.getWordsByUnit('all');
        } else {
            // Use the improved getWordsByUnit method that supports multiple units
            const unitsString = this.selectedUnits.join(',');
            words = this.dataManager.getWordsByUnit(unitsString);
        }

        // Apply difficulty filter if set
        if (this.difficultyFilter) {
            words = words.filter(word => {
                const difficulty = this.dataManager.getWordDifficulty(word);
                return difficulty === this.difficultyFilter;
            });
        }

        this.currentWords = words;

        if (this.currentWords.length === 0) {
            this.showEmptyState();
            this.updateFilterStatus();
            return;
        }

        this.currentIndex = 0;
        this.isFlipped = false;

        // Force show the current card to ensure it updates
        this.showCurrentCard();
        this.updateProgress();
        this.updateFilterStatus();
    }

    shuffleWords() {
        this.currentWords = [...this.currentWords].sort(() => Math.random() - 0.5);
        this.currentIndex = 0;
        this.isFlipped = false;
        this.showCurrentCard();
        window.navigationManager.showNotification('單字已重新排序', 'success', 2000);
    } showCurrentCard() {
        if (this.currentWords.length === 0) return;

        const word = this.currentWords[this.currentIndex];
        const flashcard = document.getElementById('flashcard');
        const frontElement = document.getElementById('cardFront');
        const backElement = document.getElementById('cardBack');
        const flashcardContainer = document.querySelector('.flashcard-container');

        if (!word || !flashcard || !frontElement || !backElement) return;

        // Ensure flashcard container shows the normal flashcard structure
        if (flashcardContainer && flashcardContainer.innerHTML.includes('empty-state')) {
            // Restore the original flashcard HTML structure
            flashcardContainer.innerHTML = `
                <div class="flashcard" id="flashcard">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="card-content">
                                <p id="cardFront">點擊開始複習</p>
                            </div>
                        </div>
                        <div class="card-back">
                            <div class="card-content">
                                <p id="cardBack">答案會顯示在這裡</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-controls">
                    <button id="prevCard" class="btn-secondary">
                        <i class="fas fa-chevron-left"></i> 上一張
                    </button>
                    <div class="card-info">
                        <span id="cardProgress">1 / 1</span>
                    </div>
                    <button id="nextCard" class="btn-primary">
                        下一張 <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="difficulty-controls">
                    <button class="difficulty-btn" data-difficulty="easy">
                        <i class="fas fa-check"></i> 簡單
                    </button>
                    <button class="difficulty-btn" data-difficulty="medium">
                        <i class="fas fa-circle"></i> 普通
                    </button>
                    <button class="difficulty-btn" data-difficulty="hard">
                        <i class="fas fa-times"></i> 困難
                    </button>
                </div>
            `;

            // Re-bind events for the restored elements
            this.bindCardEvents();
        }

        // Reset flip state
        this.isFlipped = false;
        const flashcardElement = document.getElementById('flashcard');
        if (flashcardElement) {
            flashcardElement.classList.remove('flipped');
        }

        // Set content based on mode
        const { front, back } = this.getCardContent(word);
        const frontEl = document.getElementById('cardFront');
        const backEl = document.getElementById('cardBack');

        if (frontEl) frontEl.innerHTML = front;
        if (backEl) backEl.innerHTML = back;

        this.updateProgress();
    }

    getCardContent(word) {
        switch (this.mode) {
            case 'word-chinese':
                return {
                    front: `<h3>${word.english}</h3>`,
                    back: `<h3>${word.chinese}</h3><p class="definition">${word.definition}</p>`
                };
            case 'chinese-word':
                return {
                    front: `<h3>${word.chinese}</h3>`,
                    back: `<h3>${word.english}</h3><p class="definition">${word.definition}</p>`
                };
            case 'definition-word':
                return {
                    front: `<p class="definition">${word.definition}</p>`,
                    back: `<h3>${word.english}</h3><p class="chinese">${word.chinese}</p>`
                };
            case 'word-definition':
                return {
                    front: `<h3>${word.english}</h3><p class="chinese">${word.chinese}</p>`,
                    back: `<p class="definition">${word.definition}</p>`
                };
            default:
                return {
                    front: `<h3>${word.english}</h3>`,
                    back: `<h3>${word.chinese}</h3>`
                };
        }
    } flipCard() {
        if (this.currentWords.length === 0) return;

        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        this.isFlipped = !this.isFlipped;

        // 強制重繪以避免在平板上的殘留文字問題
        flashcard.style.transform = 'translateZ(0)';

        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }

        // 確保GPU加速和重繪
        requestAnimationFrame(() => {
            flashcard.style.transform = '';
        });
    } nextCard() {
        if (this.currentWords.length === 0) return;

        // If card is flipped, flip back first
        if (this.isFlipped) {
            this.flipCard();
            setTimeout(() => {
                this.currentIndex = (this.currentIndex + 1) % this.currentWords.length;
                this.showCurrentCard();
                this.animateCardChange();
            }, 300); // Wait for flip animation
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.currentWords.length;
            this.showCurrentCard();
            this.animateCardChange();
        }
    }

    previousCard() {
        if (this.currentWords.length === 0) return;

        // If card is flipped, flip back first
        if (this.isFlipped) {
            this.flipCard();
            setTimeout(() => {
                this.currentIndex = this.currentIndex === 0 ? this.currentWords.length - 1 : this.currentIndex - 1;
                this.showCurrentCard();
                this.animateCardChange();
            }, 300); // Wait for flip animation
        } else {
            this.currentIndex = this.currentIndex === 0 ? this.currentWords.length - 1 : this.currentIndex - 1;
            this.showCurrentCard();
            this.animateCardChange();
        }
    }

    animateCardChange() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        flashcard.style.transform = 'scale(0.95)';
        flashcard.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            flashcard.style.transform = 'scale(1)';
        }, 200);
    } markDifficulty(difficulty) {
        if (this.currentWords.length === 0) return; const word = this.currentWords[this.currentIndex];
        if (this.dataManager) {
            this.dataManager.setWordDifficulty(word, difficulty);
        }

        // Visual feedback
        const btn = document.querySelector(`.difficulty-btn[data-difficulty="${difficulty}"]`);
        if (btn) {
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }

        // Show appropriate message
        const messages = {
            easy: '標記為簡單',
            medium: '標記為普通',
            hard: '標記為困難'
        };

        window.navigationManager.showNotification(messages[difficulty], 'success', 1500);

        // Auto advance for easy words
        if (difficulty === 'easy') {
            setTimeout(() => {
                this.nextCard();
            }, 500);
        }
    }

    updateProgress() {
        const progressElement = document.getElementById('cardProgress');
        if (progressElement && this.currentWords.length > 0) {
            progressElement.textContent = `${this.currentIndex + 1} / ${this.currentWords.length}`;
        }
    }

    updateModeSelector() {
        // This could be expanded to remember user preferences
        const modeSelector = document.getElementById('quizletMode');
        if (modeSelector) {
            // Load saved mode from localStorage
            const savedMode = localStorage.getItem('quizletMode');
            if (savedMode) {
                modeSelector.value = savedMode;
                this.mode = savedMode;
            }

            // Save mode when changed
            modeSelector.addEventListener('change', () => {
                localStorage.setItem('quizletMode', modeSelector.value);
            });
        }
    }

    showEmptyState() {
        const frontElement = document.getElementById('cardFront');
        const backElement = document.getElementById('cardBack');
        const progressElement = document.getElementById('cardProgress');

        if (frontElement) {
            frontElement.innerHTML = '<p>沒有找到單字</p><p>請選擇其他單元</p>';
        }
        if (backElement) {
            backElement.innerHTML = '<p>請檢查資料載入狀態</p>';
        }
        if (progressElement) {
            progressElement.textContent = '0 / 0';
        }
    }

    handleKeyboard(e) {
        if (window.navigationManager.currentPage !== 'quizlet') return;

        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.flipCard();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextCard();
                break;
            case '1':
                if (!e.ctrlKey) {
                    e.preventDefault();
                    this.markDifficulty('hard');
                }
                break;
            case '2':
                if (!e.ctrlKey) {
                    e.preventDefault();
                    this.markDifficulty('medium');
                }
                break;
            case '3':
                if (!e.ctrlKey) {
                    e.preventDefault();
                    this.markDifficulty('easy');
                }
                break;
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.shuffleWords();
                }
                break;
        }
    }

    // Study session analytics
    startStudySession() {
        this.sessionStartTime = Date.now();
        this.sessionCardCount = 0;
        this.sessionDifficulties = { easy: 0, medium: 0, hard: 0 };
    }

    endStudySession() {
        if (!this.sessionStartTime) return;

        const duration = Date.now() - this.sessionStartTime;
        const sessionData = {
            duration: duration,
            cardCount: this.sessionCardCount,
            difficulties: this.sessionDifficulties,
            mode: this.mode,
            unit: this.unit,
            date: new Date().toISOString()
        };

        // Save session data
        const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
        sessions.push(sessionData);
        localStorage.setItem('studySessions', JSON.stringify(sessions));

        // Show session summary
        this.showSessionSummary(sessionData);
    }

    showSessionSummary(sessionData) {
        const minutes = Math.floor(sessionData.duration / 60000);
        const seconds = Math.floor((sessionData.duration % 60000) / 1000);

        window.navigationManager.showNotification(
            `學習完成！時間：${minutes}:${seconds.toString().padStart(2, '0')}，練習：${sessionData.cardCount} 張卡片`,
            'success',
            5000
        );
    }    // Quick review of difficult words
    reviewDifficultWords() {
        if (!this.dataManager) return;
        const difficultWords = this.dataManager.getDifficultWords();
        if (difficultWords.length === 0) {
            window.navigationManager.showNotification('沒有標記為困難的單字', 'info');
            return;
        }

        this.currentWords = difficultWords;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.showCurrentCard();
        window.navigationManager.showNotification(`載入 ${difficultWords.length} 個困難單字`, 'success');
    }    // Export study progress
    exportProgress() {
        if (!this.dataManager) return;
        const progress = {
            totalWords: this.dataManager.words.length,
            learnedWords: this.dataManager.learnedWords.size,
            units: this.dataManager.units,
            difficulties: {},
            sessions: JSON.parse(localStorage.getItem('studySessions') || '[]')
        };        // Get difficulty data for all words
        this.dataManager.words.forEach(word => {
            const key = `${word.unit}-${word.english}`;
            progress.difficulties[key] = this.dataManager.getWordDifficulty(word);
        });

        const dataStr = JSON.stringify(progress, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `vocabulary_progress_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    } setupUnitCheckboxes() {
        if (!this.dataManager) return;

        const checkboxContainer = document.getElementById('quizletUnitCheckboxes');
        if (!checkboxContainer) return;

        // Get all units
        const units = this.dataManager.getUnits();

        // Clear existing checkboxes except "全選"
        checkboxContainer.innerHTML = '';

        // Re-add "全選" checkbox with new structure
        const allLabel = document.createElement('label');
        allLabel.className = 'unit-option';
        allLabel.innerHTML = `
            <input type="checkbox" value="all" checked>
            <span class="checkmark"></span>
            <span class="text">全選</span>
        `;
        checkboxContainer.appendChild(allLabel);

        // Add unit checkboxes with new structure
        units.forEach(unit => {
            const label = document.createElement('label');
            label.className = 'unit-option';
            label.innerHTML = `
                <input type="checkbox" value="${unit}">
                <span class="checkmark"></span>
                <span class="text">${unit}</span>
            `;
            checkboxContainer.appendChild(label);
        });

        // Bind events
        this.bindUnitCheckboxEvents();
    } bindUnitCheckboxEvents() {
        const checkboxContainer = document.getElementById('quizletUnitCheckboxes');
        if (!checkboxContainer) return;

        const allCheckbox = checkboxContainer.querySelector('input[value="all"]');
        const unitCheckboxes = checkboxContainer.querySelectorAll('input:not([value="all"])');

        // Handle "全選" checkbox
        if (allCheckbox) {
            allCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                unitCheckboxes.forEach(cb => cb.checked = isChecked);
                this.updateSelectedUnits();
            });
        }

        // Handle unit checkboxes
        unitCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedUnits();

                // Update "全選" checkbox state
                if (allCheckbox) {
                    const allChecked = Array.from(unitCheckboxes).every(cb => cb.checked);
                    const noneChecked = Array.from(unitCheckboxes).every(cb => !cb.checked);

                    allCheckbox.checked = allChecked;
                    allCheckbox.indeterminate = !allChecked && !noneChecked;
                }
            });
        });
    }

    updateSelectedUnits() {
        const checkboxContainer = document.getElementById('quizletUnitCheckboxes');
        if (!checkboxContainer) return;

        const checkedBoxes = checkboxContainer.querySelectorAll('input:checked'); this.selectedUnits = Array.from(checkedBoxes).map(cb => cb.value);

        // If no units selected, select all
        if (this.selectedUnits.length === 0 || this.selectedUnits.includes('all')) {
            this.selectedUnits = ['all'];
        }

        this.loadWords();
    } toggleDifficultyFilter(difficulty) {
        const filterBtn = document.querySelector(`.filter-option[data-difficulty="${difficulty}"]`);
        if (!filterBtn) return;

        // Check if this filter is already active
        const isCurrentlyActive = filterBtn.classList.contains('active');

        // Clear all filters
        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.classList.remove('active');
        });

        // If it wasn't active, activate it; if it was active, set to "all"
        if (!isCurrentlyActive) {
            filterBtn.classList.add('active');
            this.difficultyFilter = difficulty === '' ? null : difficulty;
        } else {
            // If clicking the same filter, reset to "all"
            const allFilterBtn = document.querySelector('.filter-option[data-difficulty=""]');
            if (allFilterBtn) {
                allFilterBtn.classList.add('active');
            }
            this.difficultyFilter = null;
        }

        this.loadWords();
        this.updateFilterStatus();
    } clearAllFilters() {
        // Clear difficulty filter
        this.difficultyFilter = null;
        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.classList.remove('active');
        });

        // Set "全部" filter as active
        const allFilter = document.querySelector('.filter-option[data-difficulty=""]');
        if (allFilter) {
            allFilter.classList.add('active');
        }

        // Reset unit selection to all
        const checkboxContainer = document.getElementById('quizletUnitCheckboxes');
        if (checkboxContainer) {
            const allCheckbox = checkboxContainer.querySelector('input[value="all"]');
            const unitCheckboxes = checkboxContainer.querySelectorAll('input:not([value="all"])');

            if (allCheckbox) allCheckbox.checked = true;
            unitCheckboxes.forEach(cb => cb.checked = false);

            this.selectedUnits = ['all'];
        }

        this.loadWords();
        this.updateFilterStatus();
        window.navigationManager.showNotification('已清除所有篩選條件', 'info', 2000);
    } showFilterStatus() {
        let statusText = '';
        const totalWords = this.currentWords.length;

        // Unit status
        if (this.selectedUnits.includes('all')) {
            statusText = '所有單元';
        } else {
            statusText = `${this.selectedUnits.length} 個單元`;
        }

        // Difficulty status
        if (this.difficultyFilter) {
            const difficultyNames = {
                'hard': '困難',
                'medium': '普通',
                'easy': '簡單'
            };
            statusText += ` · ${difficultyNames[this.difficultyFilter]}單字`;
        }

        statusText += ` · 共 ${totalWords} 個單字`;

        // Update progress to show filter status
        const progressElement = document.getElementById('cardProgress');
        if (progressElement && totalWords > 0) {
            progressElement.title = statusText;
        }

        // Show notification for filter changes
        if (this.difficultyFilter || !this.selectedUnits.includes('all')) {
            window.navigationManager.showNotification(statusText, 'info', 2000);
        }
    }

    updateFilterStatus() {
        const filterStatusElement = document.getElementById('filterStatus');
        if (!filterStatusElement) return;

        let statusText = '';
        const totalWords = this.currentWords.length;

        // Build status text
        if (this.difficultyFilter) {
            const difficultyNames = {
                'hard': '困難',
                'medium': '普通',
                'easy': '簡單'
            };
            statusText = `${difficultyNames[this.difficultyFilter]} (${totalWords})`;
        } else if (!this.selectedUnits.includes('all')) {
            statusText = `${this.selectedUnits.length} 個單元 (${totalWords})`;
        } else {
            statusText = `共 ${totalWords} 個單字`;
        }

        filterStatusElement.textContent = statusText;

        // Update progress title
        const progressElement = document.getElementById('cardProgress');
        if (progressElement) {
            progressElement.title = statusText;
        }
    }

    showEmptyState() {
        const flashcardContainer = document.querySelector('.flashcard-container');
        if (!flashcardContainer) return;

        let emptyMessage = '';
        let suggestions = [];

        if (this.difficultyFilter) {
            const difficultyNames = {
                'hard': '困難',
                'medium': '普通',
                'easy': '簡單'
            };
            emptyMessage = `沒有找到標記為「${difficultyNames[this.difficultyFilter]}」的單字`;
            suggestions = [
                '嘗試選擇其他難度等級',
                '先學習一些單字並標記難度',
                '清除篩選條件查看所有單字'
            ];
        } else if (!this.selectedUnits.includes('all')) {
            emptyMessage = `選中的單元沒有單字`;
            suggestions = [
                '檢查是否選擇了正確的單元',
                '選擇「全選」查看所有單字',
                '確認資料檔案是否正確載入'
            ];
        } else {
            emptyMessage = '沒有找到可複習的單字';
            suggestions = [
                '檢查單字資料檔案是否存在',
                '重新載入頁面嘗試解決問題',
                '聯繫管理員獲取協助'
            ];
        }

        flashcardContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>${emptyMessage}</h3>
                <p>您可以嘗試以下操作：</p>
                <div class="suggestions">
                    <h4>建議：</h4>
                    <ul>
                        ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Update filter status
        this.updateFilterStatus();
    }

    bindCardEvents() {
        // Flashcard click
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => {
                this.flipCard();
            });
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prevCard');
        const nextBtn = document.getElementById('nextCard');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousCard();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextCard();
            });
        }

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
                this.markDifficulty(difficulty);
            });
        });
    }

    /**
     * 用設定初始化 Quizlet
     */    initializeWithSettings(settings) {
        // 設定單元
        this.selectedUnits = settings.units.length > 0 ? settings.units : ['all'];

        // 設定模式
        if (settings.mode) {
            this.mode = settings.mode;
        }

        // 設定難度篩選
        if (settings.difficulty !== undefined) {
            this.difficultyFilter = settings.difficulty || null;
        }

        // 更新UI並載入單字
        this.updateUIFromSettings();
        this.loadWords();
        this.showCurrentCard();
    }

    /**
     * 根據設定更新UI
     */
    updateUIFromSettings() {
        // 更新單元選擇
        const unitCheckboxes = document.querySelectorAll('#quizletUnitCheckboxes input[type="checkbox"]');
        unitCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'all') {
                checkbox.checked = this.selectedUnits.includes('all');
            } else {
                checkbox.checked = this.selectedUnits.includes(checkbox.value);
            }
        });

        // 更新模式選擇
        const modeRadios = document.querySelectorAll('input[name="quizletMode"]');
        modeRadios.forEach(radio => {
            radio.checked = radio.value === this.mode;
        });

        // 更新難度篩選
        const filterButtons = document.querySelectorAll('.filter-option');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === (this.difficultyFilter || '')) {
                btn.classList.add('active');
            }
        });
    }
}



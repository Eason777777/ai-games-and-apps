// Browse Words Module
class BrowseManager {
    constructor() {
        this.dataManager = null;
        this.currentWords = [];
        this.filteredWords = [];
        this.currentUnit = 'all';
        this.searchQuery = '';
        this.sortBy = 'unit';
        this.sortOrder = 'asc';
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
    }

    initialize() {
        this.loadWords();
        this.setupControls();
    }

    bindEvents() {
        // Unit selector
        const unitSelector = document.getElementById('browseUnit');
        if (unitSelector) {
            unitSelector.addEventListener('change', (e) => {
                this.currentUnit = e.target.value;
                this.filterAndDisplayWords();
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.filterAndDisplayWords();
            });

            // Clear search on escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.searchQuery = '';
                    this.filterAndDisplayWords();
                }
            });
        }

        // Reset search button
        const resetBtn = document.getElementById('resetSearch');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = '';
                }
                this.searchQuery = '';
                this.currentUnit = 'all';
                const unitSelector = document.getElementById('browseUnit');
                if (unitSelector) {
                    unitSelector.value = 'all';
                }
                this.filterAndDisplayWords();
            });
        }

        // Modal events
        this.bindModalEvents();
    } bindModalEvents() {
        // Modal close
        const modal = document.getElementById('wordModal');
        const closeBtn = modal?.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.navigationManager.closeModal();
            });
        }

        // Mark as learned button
        const markLearnedBtn = document.getElementById('markAsLearned');
        if (markLearnedBtn) {
            markLearnedBtn.addEventListener('click', () => {
                this.toggleLearnedStatus();
            });
        }
    }

    setupControls() {
        // Load saved preferences
        const savedUnit = localStorage.getItem('browseUnit');
        if (savedUnit) {
            const unitSelector = document.getElementById('browseUnit');
            if (unitSelector) {
                unitSelector.value = savedUnit;
                this.currentUnit = savedUnit;
            }
        }
    } loadWords() {
        const dataManager = this.dataManager || window.dataManager;
        if (!dataManager || !dataManager.words) {
            console.warn('DataManager or words not available yet');
            return;
        }
        this.currentWords = dataManager.words;
        this.filterAndDisplayWords();
    }

    filterAndDisplayWords() {
        // Save current unit preference
        localStorage.setItem('browseUnit', this.currentUnit);

        // Start with all words
        let words = [...this.currentWords];

        // Filter by unit
        if (this.currentUnit !== 'all') {
            words = words.filter(word => word.unit === this.currentUnit);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            words = words.filter(word =>
                word.english.toLowerCase().includes(query) ||
                word.chinese.includes(this.searchQuery) ||
                word.definition.toLowerCase().includes(query)
            );
        }

        // Sort words
        words = this.sortWords(words);

        this.filteredWords = words;
        this.displayWords();
    }

    sortWords(words) {
        return words.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortBy) {
                case 'unit':
                    aValue = a.unit;
                    bValue = b.unit;
                    break;
                case 'english':
                    aValue = a.english.toLowerCase();
                    bValue = b.english.toLowerCase();
                    break;
                case 'chinese':
                    aValue = a.chinese;
                    bValue = b.chinese;
                    break; case 'learned':
                    aValue = this.dataManager ? (this.dataManager.isLearned(a) ? 1 : 0) : 0;
                    bValue = this.dataManager ? (this.dataManager.isLearned(b) ? 1 : 0) : 0;
                    break;
                default:
                    aValue = a.english.toLowerCase();
                    bValue = b.english.toLowerCase();
            }

            if (this.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }

    displayWords() {
        const grid = document.getElementById('wordsGrid');
        if (!grid) return;

        if (this.filteredWords.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        grid.innerHTML = '';

        this.filteredWords.forEach(word => {
            const card = this.createWordCard(word);
            grid.appendChild(card);
        });

        // Add scroll to top after filtering
        grid.scrollTop = 0;
    } createWordCard(word) {
        const card = document.createElement('div');
        card.className = 'browse-word-card';
        card.dataset.wordId = `${word.unit}-${word.english}`; const isLearned = window.dataManager.isLearned(word);
        const difficulty = window.dataManager.getWordDifficulty(word);

        card.innerHTML = `
            <div class="unit">${word.unit}</div>
            <h3>${word.english}</h3>
            <p class="definition">${word.definition}</p>
            <p class="chinese">${word.chinese}</p>
            <div class="word-status">
                ${isLearned ? '<span class="status-badge learned">已學習</span>' : ''}
                ${difficulty !== 'medium' ? `<span class="status-badge difficulty-${difficulty}">${this.getDifficultyText(difficulty)}</span>` : ''}
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => {
            this.openWordModal(word);
        });

        // Add visual feedback
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });

        return card;
    }

    getDifficultyText(difficulty) {
        switch (difficulty) {
            case 'easy': return '簡單';
            case 'hard': return '困難';
            default: return '普通';
        }
    } getEmptyStateHTML() {
        if (this.searchQuery) {
            return `
                <div class="browse-empty-state">
                    <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 20px;"></i>
                    <h3>找不到匹配的單字</h3>
                    <p>試試其他搜尋關鍵字或清除篩選條件</p>
                    <button onclick="window.browseManager.clearSearch()" class="btn-primary">清除搜尋</button>
                </div>
            `;
        } else {
            return `
                <div class="browse-empty-state">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 20px;"></i>
                    <h3>沒有單字資料</h3>
                    <p>請檢查資料載入狀態或選擇其他單元</p>
                </div>
            `;
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchQuery = '';
        this.filterAndDisplayWords();
    }

    openWordModal(word) {
        this.currentModalWord = word;

        // Update modal content
        document.getElementById('modalWord').textContent = word.english;
        document.getElementById('modalDefinition').textContent = word.definition;
        document.getElementById('modalChinese').textContent = word.chinese;

        // Update button states
        this.updateModalButtons(word);

        // Show modal
        window.navigationManager.openModal('wordModal');
    } updateModalButtons(word) {
        const markLearnedBtn = document.getElementById('markAsLearned');

        if (markLearnedBtn) {
            const isLearned = window.dataManager.isLearned(word);
            markLearnedBtn.textContent = isLearned ? '取消已學習' : '標記為已學習';
            markLearnedBtn.className = isLearned ? 'btn-secondary' : 'btn-primary';
        }
    }

    toggleLearnedStatus() {
        if (!this.currentModalWord) return;

        const word = this.currentModalWord;
        const isLearned = window.dataManager.isLearned(word);

        if (isLearned) {
            window.dataManager.markAsUnlearned(word);
            window.navigationManager.showNotification('已取消學習標記', 'info');
        } else {
            window.dataManager.markAsLearned(word);
            window.navigationManager.showNotification('已標記為已學習', 'success');
        }

        // Update modal buttons
        this.updateModalButtons(word);

        // Refresh display
        this.displayWords();
    }    // Advanced filtering options
    showOnlyLearned() {
        this.filteredWords = this.filteredWords.filter(word =>
            window.dataManager.isLearned(word)
        );
        this.displayWords();
    }

    showOnlyUnlearned() {
        this.filteredWords = this.filteredWords.filter(word =>
            !window.dataManager.isLearned(word)
        );
        this.displayWords();
    } showOnlyDifficult() {
        this.filteredWords = this.filteredWords.filter(word =>
            window.dataManager.getWordDifficulty(word) === 'hard'
        );
        this.displayWords();
    }

    // Sorting methods
    setSortBy(sortBy) {
        if (this.sortBy === sortBy) {
            // Toggle sort order if same column
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            this.sortOrder = 'asc';
        }

        this.filterAndDisplayWords();
    }

    // Bulk operations
    markAllAsLearned() {
        if (this.filteredWords.length === 0) return;

        if (confirm(`確定要將所有 ${this.filteredWords.length} 個單字標記為已學習嗎？`)) {
            this.filteredWords.forEach(word => {
                window.dataManager.markAsLearned(word);
            });

            this.displayWords();
            window.navigationManager.showNotification(
                `已標記 ${this.filteredWords.length} 個單字為已學習`,
                'success'
            );
        }
    }

    // Export functionality
    exportFilteredWords() {
        if (this.filteredWords.length === 0) {
            window.navigationManager.showNotification('沒有單字可以匯出', 'warning');
            return;
        }

        const csvContent = this.generateCSV(this.filteredWords);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `filtered_words_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        window.navigationManager.showNotification('單字已匯出', 'success');
    }

    generateCSV(words) {
        const headers = ['Unit', 'English', 'Definition', 'Chinese', 'Learned', 'Difficulty'];
        const rows = words.map(word => [
            word.unit,
            word.english,
            `"${word.definition}"`,
            word.chinese,
            window.dataManager.isLearned(word) ? 'Yes' : 'No',
            window.dataManager.getWordDifficulty(word)
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }    // Statistics for current filter
    getFilterStats() {
        const total = this.filteredWords.length;
        const learned = this.filteredWords.filter(word =>
            window.dataManager.isLearned(word)
        ).length;
        const difficult = this.filteredWords.filter(word =>
            window.dataManager.getWordDifficulty(word) === 'hard'
        ).length;

        return {
            total,
            learned,
            difficult,
            learnedPercentage: total > 0 ? Math.round((learned / total) * 100) : 0
        };
    } showFilterStats() {
        const stats = this.getFilterStats();
        const message = `
            當前篩選結果統計：
            總單字數：${stats.total}
            已學習：${stats.learned} (${stats.learnedPercentage}%)
            困難：${stats.difficult}
        `;

        alert(message);
    }

    // Search history
    saveSearchHistory(query) {
        if (!query.trim()) return;

        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');

        // Remove if already exists
        const index = history.indexOf(query);
        if (index > -1) {
            history.splice(index, 1);
        }

        // Add to beginning
        history.unshift(query);

        // Keep only last 10 searches
        if (history.length > 10) {
            history.pop();
        }

        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }
}

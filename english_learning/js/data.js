// Data Management Module
class DataManager {
    constructor() {
        this.words = [];
        this.units = [];
        this.learnedWords = new Set();
        this.loadLearnedWords();
    }

    /**
     * 初始化數據管理器
     */
    async init() {
        console.log('開始載入CSV檔案...');
        return await this.loadCSV();
    }

    async loadCSV() {
        try {
            const response = await fetch('assets/words_and_definitions.csv');
            const csvText = await response.text();

            // Parse CSV
            const lines = csvText.split('\n');
            const headers = lines[0].split(',');

            this.words = [];
            this.units = new Set();

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = this.parseCSVLine(line);
                    if (values.length >= 4) {
                        const word = {
                            unit: values[0],
                            english: values[1],
                            definition: values[2],
                            chinese: values[3]
                        };
                        this.words.push(word);
                        this.units.add(values[0]);
                    }
                }
            }

            this.units = Array.from(this.units).sort();
            console.log(`Loaded ${this.words.length} words from ${this.units.length} units`);
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error loading CSV:', error);
            // Fallback with demo data
            this.loadDemoData();
            return false;
        }
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    }

    loadDemoData() {
        this.words = [
            {
                unit: "Unit5",
                english: "fallout",
                definition: "the adverse results or effects of a situation or action",
                chinese: "不良影響"
            },
            {
                unit: "Unit5",
                english: "affluent",
                definition: "having a lot of money and a good standard of living; wealthy",
                chinese: "富裕的"
            },
            {
                unit: "Unit5",
                english: "dweller",
                definition: "a person who lives in a particular place",
                chinese: "居住者"
            },
            {
                unit: "Unit6",
                english: "innovative",
                definition: "featuring new methods; advanced and original",
                chinese: "創新的"
            },
            {
                unit: "Unit6",
                english: "sustainable",
                definition: "able to be maintained at a certain rate or level",
                chinese: "可持續的"
            }
        ];

        this.units = ["Unit5", "Unit6"];
        this.updateStats();
    }

    getAllWords() {
        return this.words;
    }

    /**
     * 獲取已學習的單字
     */
    getLearnedWords() {
        return this.words.filter(word => this.isLearned(word));
    } getWordsByUnit(unit) {
        if (unit === 'all') {
            return this.words;
        }

        // 支援多選單元（以逗號分隔）
        if (unit.includes(',')) {
            const selectedUnits = unit.split(',').map(u => u.trim());
            return this.words.filter(word => selectedUnits.includes(word.unit));
        }

        return this.words.filter(word => word.unit === unit);
    }

    getRandomWords(count, unit = 'all') {
        const words = this.getWordsByUnit(unit);
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    markAsLearned(word) {
        const key = `${word.unit}-${word.english}`;
        this.learnedWords.add(key);
        this.saveLearnedWords();
        this.updateStats();
    }

    markAsUnlearned(word) {
        const key = `${word.unit}-${word.english}`;
        this.learnedWords.delete(key);
        this.saveLearnedWords();
        this.updateStats();
    }

    isLearned(word) {
        const key = `${word.unit}-${word.english}`;
        return this.learnedWords.has(key);
    }

    saveLearnedWords() {
        localStorage.setItem('learnedWords', JSON.stringify([...this.learnedWords]));
    }

    loadLearnedWords() {
        const saved = localStorage.getItem('learnedWords');
        if (saved) {
            this.learnedWords = new Set(JSON.parse(saved));
        }
    }

    updateStats() {
        const totalWordsElement = document.getElementById('totalWords');
        const learnedWordsElement = document.getElementById('learnedWords');

        if (totalWordsElement) {
            totalWordsElement.textContent = this.words ? this.words.length : 0;
        }

        if (learnedWordsElement) {
            learnedWordsElement.textContent = this.learnedWords ? this.learnedWords.size : 0;
        }

        // 更新所有單元選擇器
        this.updateUnitSelectors();
    }

    updateUnitSelectors() {
        // 如果 units 還未加載，暫時不更新選擇器
        if (!this.units || this.units.length === 0) {
            return;
        } const selectors = [
            'quizletUnit',
            'matchingUnit',
            'definitionMatchingUnit',
            'quizUnit',
            'browseUnit'
        ];

        selectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                // 保存當前選擇
                const currentValue = selector.value;

                // 清除選項
                selector.innerHTML = '<option value="all">所有單元</option>';

                // 添加單元選項
                this.units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    selector.appendChild(option);
                });

                // 恢復選擇
                if (currentValue && this.units.includes(currentValue)) {
                    selector.value = currentValue;
                }
            }
        });
    }

    searchWords(query) {
        const lowerQuery = query.toLowerCase();
        return this.words.filter(word =>
            word.english.toLowerCase().includes(lowerQuery) ||
            word.chinese.includes(query) ||
            word.definition.toLowerCase().includes(lowerQuery)
        );
    } populateUnitSelectors() {
        const selectors = ['quizletUnit', 'matchingUnit', 'definitionMatchingUnit', 'quizUnit', 'browseUnit'];

        selectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                // Clear existing options except "all"
                while (selector.children.length > 1) {
                    selector.removeChild(selector.lastChild);
                }

                // Add unit options
                this.units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    selector.appendChild(option);
                });
            }
        });
    }

    // Statistics and analytics
    getUnitProgress(unit) {
        const unitWords = this.getWordsByUnit(unit);
        const learnedCount = unitWords.filter(word => this.isLearned(word)).length;
        return {
            total: unitWords.length,
            learned: learnedCount,
            percentage: unitWords.length > 0 ? Math.round((learnedCount / unitWords.length) * 100) : 0
        };
    }

    getOverallProgress() {
        return {
            total: this.words.length,
            learned: this.learnedWords.size,
            percentage: this.words.length > 0 ? Math.round((this.learnedWords.size / this.words.length) * 100) : 0
        };
    }

    /**
     * 獲取所有單元列表
     */
    getUnits() {
        return this.units || [];
    }

    // Difficulty tracking (simple implementation)
    getDifficultWords() {
        const difficultyData = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
        return this.words.filter(word => {
            const key = `${word.unit}-${word.english}`;
            return difficultyData[key] === 'hard';
        });
    }

    setWordDifficulty(word, difficulty) {
        const difficultyData = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
        const key = `${word.unit}-${word.english}`;
        difficultyData[key] = difficulty;
        localStorage.setItem('wordDifficulty', JSON.stringify(difficultyData));
    }

    getWordDifficulty(word) {
        const difficultyData = JSON.parse(localStorage.getItem('wordDifficulty') || '{}');
        const key = `${word.unit}-${word.english}`;
        return difficultyData[key] || 'medium';
    }
}

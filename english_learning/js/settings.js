// Settings Manager
class SettingsManager {
    constructor() {
        this.currentPage = null;
        this.settings = {};
        this.savedSettings = this.loadSettingsFromStorage();
        this.init();
    }

    // 從 localStorage 載入已保存的設定
    loadSettingsFromStorage() {
        try {
            const saved = localStorage.getItem('vocabularyAppSettings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading settings from storage:', error);
            return {};
        }
    }

    // 將設定保存到 localStorage
    saveSettingsToStorage(settings) {
        try {
            // 合併新設定到已保存的設定中
            this.savedSettings[settings.page] = settings;
            localStorage.setItem('vocabularyAppSettings', JSON.stringify(this.savedSettings));
            console.log('Settings saved for page:', settings.page);
        } catch (error) {
            console.error('Error saving settings to storage:', error);
        }
    }

    // 獲取指定頁面的已保存設定
    getSavedSettings(pageName) {
        return this.savedSettings[pageName] || null;
    } init() {
        // 綁定確認按鈕事件
        document.getElementById('confirmSettings').addEventListener('click', () => {
            this.confirmSettings();
        });

        // ESC 鍵關閉模態框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                closeSettingsModal();
            }
        });

        // 移動端響應式處理
        this.handleMobileInteractions();
    }

    handleMobileInteractions() {
        // 觸控設備的模態框外點擊關閉
        document.addEventListener('touchstart', (e) => {
            const modal = document.getElementById('settingsModal');
            if (modal && modal.classList.contains('show')) {
                const content = modal.querySelector('.settings-content');
                if (!content.contains(e.target)) {
                    closeSettingsModal();
                }
            }
        });

        // 視窗大小變化時調整模態框
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.adjustModalForScreen();
            }, 250);
        });
    }

    adjustModalForScreen() {
        if (!this.isModalOpen()) return;

        const modal = document.getElementById('settingsModal');
        const content = modal.querySelector('.settings-content');

        if (window.innerWidth < 768) {
            // 移動端調整
            content.style.maxHeight = '85vh';
            content.style.width = '95%';
        } else {
            // 桌面端調整
            content.style.maxHeight = '80vh';
            content.style.width = '';
        }
    }

    isModalOpen() {
        const modal = document.getElementById('settingsModal');
        return modal && modal.classList.contains('show');
    }    // 開啟設定模態框
    openModal(pageName) {
        this.currentPage = pageName;
        const modal = document.getElementById('settingsModal');
        const title = document.getElementById('settingsTitle');
        const body = document.getElementById('settingsBody');

        // 設定標題
        const pageConfig = this.getPageConfig(pageName);
        title.innerHTML = `<i class="${pageConfig.icon}"></i> ${pageConfig.title}`;

        // 生成設定內容
        body.innerHTML = this.generateSettingsHTML(pageName);

        // 顯示模態框
        modal.classList.add('show');

        // 初始化設定
        this.initializeSettings(pageName);

        // 調整響應式布局
        setTimeout(() => {
            this.adjustModalForScreen();
        }, 100);
    }

    // 關閉設定模態框
    closeModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
        this.currentPage = null;
        this.settings = {};
    }    // 獲取頁面配置
    getPageConfig(pageName) {
        const configs = {
            'quizlet': {
                title: 'Quizlet 複習設定',
                icon: 'fas fa-layer-group'
            },
            'matching': {
                title: '配對遊戲設定',
                icon: 'fas fa-puzzle-piece'
            },
            'definition-matching': {
                title: '字義配對設定',
                icon: 'fas fa-link'
            },
            'quiz': {
                title: '測驗練習設定',
                icon: 'fas fa-question-circle'
            }
        };
        return configs[pageName] || { title: '功能設定', icon: 'fas fa-cog' };
    }

    // 生成設定HTML
    generateSettingsHTML(pageName) {
        switch (pageName) {
            case 'quizlet':
                return this.generateQuizletSettings();
            case 'matching':
                return this.generateMatchingSettings();
            case 'definition-matching':
                return this.generateDefinitionMatchingSettings();
            case 'quiz':
                return this.generateQuizSettings();
            default:
                return '<p>未知的設定類型</p>';
        }
    }    // Quizlet 設定
    generateQuizletSettings() {
        // 計算每個難度等級的單字數量
        const difficultyCounts = this.getDifficultyCounts();

        // 檢查已保存的設定
        const savedSettings = this.getSavedSettings('quizlet');

        return `
            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-list-ul"></i>
                    選擇單元
                </div>
                <div class="unit-selection" id="quizletUnits">
                    <!-- 動態生成 -->
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-book"></i>
                    學習模式
                </div>
                <div class="unit-selection">
                    <label class="radio-option ${!savedSettings || savedSettings.mode === 'word-chinese' ? 'checked' : ''}">
                        <input type="radio" name="quizletMode" value="word-chinese" ${!savedSettings || savedSettings.mode === 'word-chinese' ? 'checked' : ''}>
                        <span>單字 → 中文</span>
                    </label>
                    <label class="radio-option ${savedSettings && savedSettings.mode === 'chinese-word' ? 'checked' : ''}">
                        <input type="radio" name="quizletMode" value="chinese-word" ${savedSettings && savedSettings.mode === 'chinese-word' ? 'checked' : ''}>
                        <span>中文 → 單字</span>
                    </label>
                    <label class="radio-option ${savedSettings && savedSettings.mode === 'definition-word' ? 'checked' : ''}">
                        <input type="radio" name="quizletMode" value="definition-word" ${savedSettings && savedSettings.mode === 'definition-word' ? 'checked' : ''}>
                        <span>定義 → 單字</span>
                    </label>
                    <label class="radio-option ${savedSettings && savedSettings.mode === 'word-definition' ? 'checked' : ''}">
                        <input type="radio" name="quizletMode" value="word-definition" ${savedSettings && savedSettings.mode === 'word-definition' ? 'checked' : ''}>
                        <span>單字 → 定義</span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-filter"></i>
                    難度篩選
                </div>
                <div class="unit-selection">
                    <label class="radio-option ${!savedSettings || savedSettings.difficulty === '' || savedSettings.difficulty === undefined ? 'checked' : ''}">
                        <input type="radio" name="difficulty" value="" ${!savedSettings || savedSettings.difficulty === '' || savedSettings.difficulty === undefined ? 'checked' : ''}>
                        <span>全部 (${difficultyCounts.total})</span>
                    </label>
                    <label class="radio-option ${difficultyCounts.hard === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'hard' ? 'checked' : ''}">
                        <input type="radio" name="difficulty" value="hard" ${difficultyCounts.hard === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'hard' ? 'checked' : ''}>
                        <span>困難 (${difficultyCounts.hard})</span>
                    </label>
                    <label class="radio-option ${difficultyCounts.medium === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'medium' ? 'checked' : ''}">
                        <input type="radio" name="difficulty" value="medium" ${difficultyCounts.medium === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'medium' ? 'checked' : ''}>
                        <span>普通 (${difficultyCounts.medium})</span>
                    </label>
                    <label class="radio-option ${difficultyCounts.easy === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'easy' ? 'checked' : ''}">
                        <input type="radio" name="difficulty" value="easy" ${difficultyCounts.easy === 0 ? 'disabled' : ''} ${savedSettings && savedSettings.difficulty === 'easy' ? 'checked' : ''}>
                        <span>簡單 (${difficultyCounts.easy})</span>
                    </label>
                </div>
            </div>
        `;
    }

    // 計算不同難度等級的單字數量
    getDifficultyCounts() {
        if (!window.dataManager || !window.dataManager.words) {
            return { total: 0, hard: 0, medium: 0, easy: 0 };
        }

        const words = window.dataManager.words;
        let hardCount = 0;
        let mediumCount = 0;
        let easyCount = 0;

        words.forEach(word => {
            const difficulty = window.dataManager.getWordDifficulty(word);
            switch (difficulty) {
                case 'hard':
                    hardCount++;
                    break;
                case 'easy':
                    easyCount++;
                    break;
                default: // 'medium'
                    mediumCount++;
                    break;
            }
        });

        return {
            total: words.length,
            hard: hardCount,
            medium: mediumCount,
            easy: easyCount
        };
    }    // 配對遊戲設定
    generateMatchingSettings() {
        const savedSettings = this.getSavedSettings('matching');
        const defaultWordCount = savedSettings && savedSettings.wordCount ? savedSettings.wordCount : 12;

        return `
            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-list-ul"></i>
                    選擇單元
                </div>
                <div class="unit-selection" id="matchingUnits">
                    <!-- 動態生成 -->
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-hashtag"></i>
                    單字數量
                </div>
                <div class="number-input-group">
                    <input type="number" id="matchingWordCount" class="number-input" min="4" max="20" value="${defaultWordCount}">
                    <span>個 (4-20)</span>
                </div>
            </div>
        `;
    }    // 字義配對設定
    generateDefinitionMatchingSettings() {
        const savedSettings = this.getSavedSettings('definition-matching');
        const defaultWordCount = savedSettings && savedSettings.wordCount ? savedSettings.wordCount : 10;

        return `
            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-list-ul"></i>
                    選擇單元
                </div>
                <div class="unit-selection" id="definitionMatchingUnits">
                    <!-- 動態生成 -->
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-hashtag"></i>
                    字義數量
                </div>
                <div class="number-input-group">
                    <input type="number" id="definitionWordCount" class="number-input" min="6" max="20" value="${defaultWordCount}">
                    <span>個 (6-20)</span>
                </div>
            </div>
        `;
    }

    // 測驗練習設定    
    generateQuizSettings() {
        const savedSettings = this.getSavedSettings('quiz');
        const defaultQuestionCount = savedSettings && savedSettings.questionCount ? savedSettings.questionCount : 20;
        const savedQuizType = savedSettings && savedSettings.quizType ? savedSettings.quizType : 'multiple-choice';

        // 為不同的測驗類型設定預設選中狀態
        const multipleChoiceChecked = savedQuizType === 'multiple-choice' ? 'checked' : '';
        const fillBlankChecked = savedQuizType === 'fill-blank' ? 'checked' : '';
        const trueFalseChecked = savedQuizType === 'true-false' ? 'checked' : '';

        const multipleChoiceClass = savedQuizType === 'multiple-choice' ? 'radio-option checked' : 'radio-option';
        const fillBlankClass = savedQuizType === 'fill-blank' ? 'radio-option checked' : 'radio-option';
        const trueFalseClass = savedQuizType === 'true-false' ? 'radio-option checked' : 'radio-option';

        return `
            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-list-ul"></i>
                    選擇單元
                </div>
                <div class="unit-selection" id="quizUnits">
                    <!-- 動態生成 -->
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-question"></i>
                    測驗類型
                </div>
                <div class="unit-selection">
                    <label class="${multipleChoiceClass}">
                        <input type="radio" name="quizType" value="multiple-choice" ${multipleChoiceChecked}>
                        <span>選擇題</span>
                    </label>
                    <label class="${fillBlankClass}">
                        <input type="radio" name="quizType" value="fill-blank" ${fillBlankChecked}>
                        <span>填空題</span>
                    </label>
                    <label class="${trueFalseClass}">
                        <input type="radio" name="quizType" value="true-false" ${trueFalseChecked}>
                        <span>是非題</span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <div class="section-label">
                    <i class="fas fa-hashtag"></i>
                    題目數量
                </div>
                <div class="number-input-group">
                    <input type="number" id="quizQuestionCount" class="number-input" min="5" max="50" value="${defaultQuestionCount}">
                    <span>題 (5-50)</span>
                </div>
            </div>
        `;
    }    // 初始化設定
    initializeSettings(pageName) {
        // 稍微延遲生成，確保DOM已準備好
        setTimeout(() => {
            // 生成單元選擇
            this.generateUnitOptions(pageName);

            // 如果是 Quizlet 頁面，更新難度計數
            if (pageName === 'quizlet') {
                this.updateDifficultyCounts();
            }

            // 載入已保存的設定
            this.loadSavedSettingsToUI(pageName);

            // 綁定選項事件
            this.bindSettingsEvents();
        }, 100);
    }

    // 將已保存的設定載入到 UI
    loadSavedSettingsToUI(pageName) {
        const savedSettings = this.getSavedSettings(pageName);
        if (!savedSettings) {
            console.log('No saved settings found for page:', pageName);
            return;
        }

        console.log('Loading saved settings for page:', pageName, savedSettings);

        // 載入單元選擇
        if (savedSettings.units && savedSettings.units.length > 0) {
            this.restoreUnitSelection(savedSettings.units);
        }

        // 根據頁面類型載入特定設定
        switch (pageName) {
            case 'quizlet':
                this.restoreQuizletSettings(savedSettings);
                break;
            case 'matching':
                this.restoreMatchingSettings(savedSettings);
                break;
            case 'definition-matching':
                this.restoreDefinitionMatchingSettings(savedSettings);
                break;
            case 'quiz':
                this.restoreQuizSettings(savedSettings);
                break;
        }
    }

    // 恢復單元選擇
    restoreUnitSelection(savedUnits) {
        // 先取消全選
        const allCheckbox = document.querySelector('.unit-selection input[value="all"]');
        const allLabel = allCheckbox?.closest('.unit-checkbox');
        if (allCheckbox) {
            allCheckbox.checked = false;
            allLabel?.classList.remove('checked');
        }

        // 取消所有單元選擇
        const unitCheckboxes = document.querySelectorAll('.unit-selection input[type="checkbox"]:not([value="all"])');
        unitCheckboxes.forEach(cb => {
            cb.checked = false;
            const label = cb.closest('.unit-checkbox');
            label?.classList.remove('checked');
        });

        // 恢復選中的單元
        savedUnits.forEach(unit => {
            const checkbox = document.querySelector(`.unit-selection input[value="${unit}"]`);
            const label = checkbox?.closest('.unit-checkbox');
            if (checkbox) {
                checkbox.checked = true;
                label?.classList.add('checked');
            }
        });

        // 檢查是否需要設定全選
        const checkedCount = savedUnits.length;
        const totalCount = unitCheckboxes.length;
        if (checkedCount === totalCount && allCheckbox) {
            allCheckbox.checked = true;
            allLabel?.classList.add('checked');
        }
    }

    // 恢復 Quizlet 設定
    restoreQuizletSettings(savedSettings) {
        // 恢復學習模式
        if (savedSettings.mode) {
            const modeRadio = document.querySelector(`input[name="quizletMode"][value="${savedSettings.mode}"]`);
            const modeLabel = modeRadio?.closest('.radio-option');
            if (modeRadio) {
                // 先移除所有選中狀態
                document.querySelectorAll('input[name="quizletMode"]').forEach(radio => {
                    radio.checked = false;
                    radio.closest('.radio-option')?.classList.remove('checked');
                });
                // 設定選中狀態
                modeRadio.checked = true;
                modeLabel?.classList.add('checked');
            }
        }

        // 恢復難度篩選
        if (savedSettings.difficulty !== undefined) {
            const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${savedSettings.difficulty}"]`);
            const difficultyLabel = difficultyRadio?.closest('.radio-option');
            if (difficultyRadio && !difficultyRadio.disabled) {
                // 先移除所有選中狀態
                document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
                    radio.checked = false;
                    radio.closest('.radio-option')?.classList.remove('checked');
                });
                // 設定選中狀態
                difficultyRadio.checked = true;
                difficultyLabel?.classList.add('checked');
            }
        }
    }

    // 恢復配對遊戲設定
    restoreMatchingSettings(savedSettings) {
        if (savedSettings.wordCount) {
            const wordCountInput = document.getElementById('matchingWordCount');
            if (wordCountInput) {
                wordCountInput.value = savedSettings.wordCount;
            }
        }
    }

    // 恢復字義配對設定
    restoreDefinitionMatchingSettings(savedSettings) {
        if (savedSettings.wordCount) {
            const wordCountInput = document.getElementById('definitionWordCount');
            if (wordCountInput) {
                wordCountInput.value = savedSettings.wordCount;
            }
        }
    }

    // 恢復測驗練習設定
    restoreQuizSettings(savedSettings) {
        // 恢復測驗類型
        if (savedSettings.type) {
            const typeRadio = document.querySelector(`input[name="quizType"][value="${savedSettings.type}"]`);
            const typeLabel = typeRadio?.closest('.radio-option');
            if (typeRadio) {
                // 先移除所有選中狀態
                document.querySelectorAll('input[name="quizType"]').forEach(radio => {
                    radio.checked = false;
                    radio.closest('.radio-option')?.classList.remove('checked');
                });
                // 設定選中狀態
                typeRadio.checked = true;
                typeLabel?.classList.add('checked');
            }
        }

        // 恢復題目數量
        if (savedSettings.questionCount) {
            const questionCountInput = document.getElementById('quizQuestionCount');
            if (questionCountInput) {
                questionCountInput.value = savedSettings.questionCount;
            }
        }
    }    // 生成單元選項
    generateUnitOptions(pageName) {
        const containerId = this.getUnitContainerId(pageName);
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }

        // 先嘗試從dataManager獲取
        let units = [];
        if (window.dataManager && window.dataManager.getUnits) {
            units = window.dataManager.getUnits();
        }

        // 如果dataManager還沒準備好，使用默認單元
        if (!units || units.length === 0) {
            units = ['Unit 5', 'Unit 6', 'Unit 7', 'Unit 8'];
        }

        // 檢查是否有已保存的設定
        const savedSettings = this.getSavedSettings(pageName);
        const hasValidSavedUnits = savedSettings && savedSettings.units && savedSettings.units.length > 0;

        let html = `
            <label class="unit-checkbox ${!hasValidSavedUnits ? 'checked' : ''}">
                <input type="checkbox" value="all" ${!hasValidSavedUnits ? 'checked' : ''}>
                <span>全選</span>
            </label>
        `;

        units.forEach(unit => {
            html += `
                <label class="unit-checkbox ${!hasValidSavedUnits ? 'checked' : ''}">
                    <input type="checkbox" value="${unit}" ${!hasValidSavedUnits ? 'checked' : ''}>
                    <span>${unit}</span>
                </label>
            `;
        });

        container.innerHTML = html;
        console.log(`Generated ${units.length} unit options for ${pageName} (has saved settings: ${hasValidSavedUnits})`);
    }// 獲取單元容器ID
    getUnitContainerId(pageName) {
        const containerMap = {
            'quizlet': 'quizletUnits',
            'matching': 'matchingUnits',
            'definition-matching': 'definitionMatchingUnits',
            'quiz': 'quizUnits'
        };
        return containerMap[pageName];
    }// 綁定設定事件
    bindSettingsEvents() {
        // 單元選擇邏輯
        const unitCheckboxes = document.querySelectorAll('.unit-selection input[type="checkbox"]');
        unitCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleUnitSelection(e);
            });
        });

        // 選項視覺效果（複選框）
        const allCheckboxes = document.querySelectorAll('.unit-checkbox input');
        allCheckboxes.forEach(input => {
            input.addEventListener('change', (e) => {
                const label = e.target.closest('.unit-checkbox');
                if (e.target.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
            });
        });        // 單選選項視覺效果
        const radioInputs = document.querySelectorAll('.radio-option input[type="radio"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                // 檢查是否為禁用的選項
                const label = e.target.closest('.radio-option');
                if (label.classList.contains('disabled')) {
                    e.preventDefault();
                    e.target.checked = false;
                    return;
                }

                // 移除同名選項的 checked 類別
                const name = e.target.name;
                document.querySelectorAll(`.radio-option input[name="${name}"]`).forEach(radio => {
                    const radioLabel = radio.closest('.radio-option');
                    radioLabel.classList.remove('checked');
                });

                // 為選中的選項添加 checked 類別
                label.classList.add('checked');
            });

            // 點擊禁用選項時的提示
            input.addEventListener('click', (e) => {
                const label = e.target.closest('.radio-option');
                if (label.classList.contains('disabled')) {
                    e.preventDefault();
                    e.target.checked = false;

                    // 顯示提示信息
                    if (window.navigationManager) {
                        const difficultyText = label.querySelector('span').textContent;
                        window.navigationManager.showNotification(
                            `目前沒有${difficultyText.split(' ')[0]}等級的單字`,
                            'info',
                            2000
                        );
                    }
                }
            });
        });
    }

    // 處理單元選擇
    handleUnitSelection(e) {
        const allCheckbox = document.querySelector('.unit-selection input[value="all"]');
        const unitCheckboxes = document.querySelectorAll('.unit-selection input[type="checkbox"]:not([value="all"])');

        if (e.target.value === 'all') {
            // 全選/取消全選
            unitCheckboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const label = cb.closest('.unit-checkbox');
                if (cb.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
            });
        } else {
            // 檢查是否所有單元都被選中
            const allSelected = Array.from(unitCheckboxes).every(cb => cb.checked);
            allCheckbox.checked = allSelected;
            const allLabel = allCheckbox.closest('.unit-checkbox');
            if (allSelected) {
                allLabel.classList.add('checked');
            } else {
                allLabel.classList.remove('checked');
            }
        }
    }    // 確認設定
    confirmSettings() {
        const settings = this.collectSettings();

        if (!this.validateSettings(settings)) {
            return;
        }

        // 保存設定到 localStorage
        this.saveSettingsToStorage(settings);

        this.applySettings(settings);
        this.closeModal();
    }

    // 收集設定
    collectSettings() {
        const settings = {
            page: this.currentPage,
            units: []
        };

        // 收集單元選擇
        const unitCheckboxes = document.querySelectorAll('.unit-selection input[type="checkbox"]:checked:not([value="all"])');
        settings.units = Array.from(unitCheckboxes).map(cb => cb.value);

        switch (this.currentPage) {
            case 'quizlet':
                settings.mode = document.querySelector('input[name="quizletMode"]:checked')?.value;
                settings.difficulty = document.querySelector('input[name="difficulty"]:checked')?.value;
                break;
            case 'matching':
                settings.wordCount = parseInt(document.getElementById('matchingWordCount')?.value) || 12;
                break;
            case 'definition-matching':
                settings.wordCount = parseInt(document.getElementById('definitionWordCount')?.value) || 10;
                break;
            case 'quiz':
                settings.type = document.querySelector('input[name="quizType"]:checked')?.value;
                settings.questionCount = parseInt(document.getElementById('quizQuestionCount')?.value) || 20;
                break;
        }

        return settings;
    }

    // 驗證設定
    validateSettings(settings) {
        if (settings.units.length === 0) {
            alert('請至少選擇一個單元！');
            return false;
        }

        // 特定頁面的驗證
        switch (settings.page) {
            case 'matching':
                if (settings.wordCount < 4 || settings.wordCount > 20) {
                    alert('單字數量必須在 4-20 之間！');
                    return false;
                }
                break;
            case 'definition-matching':
                if (settings.wordCount < 6 || settings.wordCount > 20) {
                    alert('字義數量必須在 6-20 之間！');
                    return false;
                }
                break;
            case 'quiz':
                if (settings.questionCount < 5 || settings.questionCount > 50) {
                    alert('題目數量必須在 5-50 之間！');
                    return false;
                }
                break;
        }

        return true;
    }

    // 應用設定
    applySettings(settings) {
        switch (settings.page) {
            case 'quizlet':
                this.applyQuizletSettings(settings);
                break;
            case 'matching':
                this.applyMatchingSettings(settings);
                break;
            case 'definition-matching':
                this.applyDefinitionMatchingSettings(settings);
                break;
            case 'quiz':
                this.applyQuizSettings(settings);
                break;
        }
    }

    // 應用 Quizlet 設定
    applyQuizletSettings(settings) {
        if (window.quizletManager) {
            window.quizletManager.initializeWithSettings(settings);
        }
    }

    // 應用配對遊戲設定
    applyMatchingSettings(settings) {
        if (window.matchingManager) {
            window.matchingManager.initializeWithSettings(settings);
        }
    }

    // 應用字義配對設定
    applyDefinitionMatchingSettings(settings) {
        if (window.definitionMatchingManager) {
            window.definitionMatchingManager.initializeWithSettings(settings);
        }
    }

    // 應用測驗練習設定
    applyQuizSettings(settings) {
        if (window.quizManager) {
            window.quizManager.initializeWithSettings(settings);
        }
    }

    // 更新難度計數顯示
    updateDifficultyCounts() {
        if (this.currentPage !== 'quizlet') return;

        const difficultyCounts = this.getDifficultyCounts();

        // 更新全部選項的數量
        const allOption = document.querySelector('input[name="difficulty"][value=""] + span');
        if (allOption) {
            allOption.textContent = `全部 (${difficultyCounts.total})`;
        }

        // 更新困難選項
        const hardOption = document.querySelector('input[name="difficulty"][value="hard"] + span');
        const hardLabel = document.querySelector('input[name="difficulty"][value="hard"]').closest('.radio-option');
        if (hardOption && hardLabel) {
            hardOption.textContent = `困難 (${difficultyCounts.hard})`;
            if (difficultyCounts.hard === 0) {
                hardLabel.classList.add('disabled');
                hardLabel.querySelector('input').disabled = true;
            } else {
                hardLabel.classList.remove('disabled');
                hardLabel.querySelector('input').disabled = false;
            }
        }

        // 更新普通選項
        const mediumOption = document.querySelector('input[name="difficulty"][value="medium"] + span');
        const mediumLabel = document.querySelector('input[name="difficulty"][value="medium"]').closest('.radio-option');
        if (mediumOption && mediumLabel) {
            mediumOption.textContent = `普通 (${difficultyCounts.medium})`;
            if (difficultyCounts.medium === 0) {
                mediumLabel.classList.add('disabled');
                mediumLabel.querySelector('input').disabled = true;
            } else {
                mediumLabel.classList.remove('disabled');
                mediumLabel.querySelector('input').disabled = false;
            }
        }

        // 更新簡單選項
        const easyOption = document.querySelector('input[name="difficulty"][value="easy"] + span');
        const easyLabel = document.querySelector('input[name="difficulty"][value="easy"]').closest('.radio-option');
        if (easyOption && easyLabel) {
            easyOption.textContent = `簡單 (${difficultyCounts.easy})`;
            if (difficultyCounts.easy === 0) {
                easyLabel.classList.add('disabled');
                easyLabel.querySelector('input').disabled = true;
            } else {
                easyLabel.classList.remove('disabled');
                easyLabel.querySelector('input').disabled = false;
            }
        }
    }
}
// 全域函數
function openSettingsModal(pageName) {
    if (window.settingsManager) {
        window.settingsManager.openModal(pageName);
    }
}

function closeSettingsModal() {
    if (window.settingsManager) {
        window.settingsManager.closeModal();
    }
}

// 初始化設定管理器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
        console.log('Settings manager initialized');
    });
} else {
    window.settingsManager = new SettingsManager();
    console.log('Settings manager initialized immediately');
}

// 確保全域函數可用
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;

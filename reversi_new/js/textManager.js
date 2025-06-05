// 文字管理器 - 從JSON載入並管理所有UI文字
class TextManager {
    constructor() {
        this.texts = null; this.fallbackTexts = {
            'welcome.title': '黑白棋',
            'welcome.subtitle': 'Minimax AI 智能系統',
            'ui.buttons.newGame': '新遊戲',
            'ui.buttons.viewRules': '查看規則'
        };
    }

    // 載入文字資源
    async loadTexts() {
        try {
            const response = await fetch('assets/description.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.texts = await response.json();
            console.log('文字資源載入成功');
            return true;
        } catch (error) {
            console.error('載入文字資源失敗:', error);
            return false;
        }
    }

    // 獲取文字，支援路徑如 "welcome.title"
    getText(path, defaultText = '') {
        if (!this.texts) {
            return this.fallbackTexts[path] || defaultText || path;
        }

        const keys = path.split('.');
        let current = this.texts;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return this.fallbackTexts[path] || defaultText || path;
            }
        }

        return current || defaultText || path;
    }

    // 替換文字中的變數，如 "{player}" 
    formatText(path, variables = {}, defaultText = '') {
        let text = this.getText(path, defaultText);

        for (const [key, value] of Object.entries(variables)) {
            text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }

        return text;
    }    // 更新UI中的所有文字
    updateUI() {
        if (!this.texts) return;

        // 更新歡迎區域
        this.updateElement('.welcome-title', 'welcome.title');
        this.updateElement('.welcome-subtitle', 'welcome.subtitle');
        this.updateElement('.welcome-description', 'welcome.description');

        // 更新模式卡片
        this.updateElement('[data-mode="human-vs-human"] .mode-title', 'modes.humanVsHuman.title');
        this.updateElement('[data-mode="human-vs-human"] .mode-description', 'modes.humanVsHuman.description');

        this.updateElement('[data-mode="human-vs-ai"] .mode-title', 'modes.humanVsAI.title');
        this.updateElement('[data-mode="human-vs-ai"] .mode-description', 'modes.humanVsAI.description');

        this.updateElement('[data-mode="ai-vs-ai"] .mode-title', 'modes.aiVsAI.title');
        this.updateElement('[data-mode="ai-vs-ai"] .mode-description', 'modes.aiVsAI.description');

        // 更新推薦標籤
        this.updateElement('.mode-recommend', 'modes.humanVsAI.recommend');        // 更新按鈕文字
        this.updateElement('#view-rules', 'ui.buttons.viewRules');
        this.updateElement('#view-about', 'ui.buttons.viewAbout');
        this.updateElement('#new-game', 'ui.buttons.newGame');
        this.updateElement('#undo', 'ui.buttons.undo');

        // 更新遊戲狀態 (初始狀態)
        this.updateElement('#game-status', 'ui.gameStatus.blackTurn');

        // 更新模態框文字
        this.updateElement('.modal-setting-title', 'modal.newGameSettings');
        this.updateElement('#modal-setting-confirm', 'modal.startGame');
        this.updateElement('#modal-confirm', 'modal.confirm');

        // 更新模態框標籤
        this.updateModalLabels();
        this.updateModalOptions();        // 更新頁腳
        this.updateElement('.footer p', 'footer.copyright');

        console.log('UI文字更新完成');
    }

    // 更新模態框標籤
    updateModalLabels() {
        const labels = document.querySelectorAll('.modal-setting-label');
        if (labels[0]) labels[0].textContent = this.getText('modal.selectMode');
        if (labels[1]) labels[1].textContent = this.getText('modal.aiDifficulty');
        if (labels[2]) labels[2].textContent = this.getText('modal.playerColor');
    }

    // 更新模態框選項
    updateModalOptions() {
        // 更新模式選項
        const modeButtons = document.querySelectorAll('.modal-setting-option.mode');
        modeButtons.forEach(button => {
            const mode = button.dataset.mode;
            if (mode === 'human-vs-human') {
                button.childNodes[1].textContent = ' ' + this.getText('modes.humanVsHuman.title');
            } else if (mode === 'human-vs-ai') {
                button.childNodes[1].textContent = ' ' + this.getText('modes.humanVsAI.title');
            } else if (mode === 'ai-vs-ai') {
                button.childNodes[1].textContent = ' ' + this.getText('modes.aiVsAI.title');
            }
        });

        // 更新AI難度選項
        const aiButtons = document.querySelectorAll('.modal-setting-option.ai');
        aiButtons.forEach(button => {
            const level = button.dataset.level;
            button.textContent = this.getAIDifficultyText(level.replace('-', ''));
        });

        // 更新顏色選項
        const colorButtons = document.querySelectorAll('.modal-setting-option.color');
        colorButtons.forEach(button => {
            const color = button.dataset.color;
            if (color === 'black') {
                button.textContent = this.getText('modal.blackFirst');
            } else if (color === 'white') {
                button.textContent = this.getText('modal.whiteSecond');
            }
        });
    }

    // 輔助方法：更新單個元素的文字
    updateElement(selector, textPath) {
        const element = document.querySelector(selector);
        if (element) {
            const text = this.getText(textPath);
            if (text) {
                element.textContent = text;
            }
        }
    }

    // 獲取AI難度描述
    getAIDifficultyText(difficulty) {
        return this.getText(`ui.aiDifficulty.${difficulty}`, difficulty);
    }

    // 獲取AI難度詳細描述
    getAIDifficultyDescription(difficulty) {
        return this.getText(`ui.aiDifficultyDescription.${difficulty}`, '');
    }    // 獲取遊戲狀態文字
    getGameStatusText(status, winner = null) {
        if (status === 'gameOver') {
            if (winner === null) {
                return this.getText('ui.gameStatus.draw');
            } else if (winner === 1) {
                return this.getText('ui.gameStatus.blackWins');
            } else {
                return this.getText('ui.gameStatus.whiteWins');
            }
        }
        return this.getText(`ui.gameStatus.${status}`);
    }
}

// 全域文字管理器實例
window.textManager = new TextManager();

// 文字管理器 - 從JSON載入並管理所有UI文字
class TextManager {
    constructor() {
        this.texts = null; this.fallbackTexts = {
            'welcome.title': '井字棋',
            'welcome.subtitle': 'Minimax AI 智能系統',
            'ui.buttons.newGame': '新遊戲',
            'ui.buttons.viewRules': '查看規則',
            'ui.buttons.viewStats': '查看統計',
            'modal.newGameSettings': '新遊戲設定',
            'modal.selectMode': '選擇模式',
            'modal.selectAILevel': '選擇 AI 難度',
            'modal.selectSymbol': '選擇您的符號',
            'modal.startGame': '開始遊戲',
            'modal.close': '關閉'
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

        if (typeof text === 'string') {
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`{${key}}`, 'g');
                text = text.replace(regex, variables[key]);
            });
        }

        return text;
    }

    // 更新所有帶有 data-text 屬性的元素
    updateAllElements() {
        if (!this.texts) {
            console.warn('文字資源尚未載入，無法更新元素');
            return;
        }

        // 更新所有帶有 data-text 屬性的元素
        const elements = document.querySelectorAll('[data-text]');
        elements.forEach(element => {
            const textPath = element.getAttribute('data-text');
            const text = this.getText(textPath);

            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // 更新標題
        const titleElement = document.querySelector('title[data-text]');
        if (titleElement) {
            const titlePath = titleElement.getAttribute('data-text');
            document.title = this.getText(titlePath);
        }

        console.log('所有文字元素已更新');
    }

    // 設定特定元素的文字
    setElementText(selector, textPath, variables = {}) {
        const element = document.querySelector(selector);
        if (element) {
            const text = this.formatText(textPath, variables);
            element.textContent = text;
        }
    }

    // 設定多個元素的文字
    setElementsText(mappings) {
        mappings.forEach(({ selector, textPath, variables = {} }) => {
            this.setElementText(selector, textPath, variables);
        });
    }
}

// 全域文字管理器實例
window.textManager = new TextManager();

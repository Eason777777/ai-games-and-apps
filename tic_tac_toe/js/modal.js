// modal.js - 專責管理新遊戲設定彈窗
// 提供開啟、關閉、互動、取得設定值等功能

class GameSettingModal {
    constructor() {
        this.modal = null;
        this.currentMode = null;
        this.selectedAiLevel = 'medium'; // 預設 AI 難度
        this.selectedXAiLevel = 'medium'; // 預設 X AI 難度
        this.selectedOAiLevel = 'medium'; // 預設 O AI 難度
        this.selectedPlayerSymbol = 'X'; // 預設玩家符號
        this.onConfirm = null;
    } init() {
        this.modal = document.getElementById('modal-setting');
        if (!this.modal) {
            console.error('Modal setting element not found');
            return;
        }

        // 關閉按鈕
        const closeBtn = this.modal.querySelector('.modal-setting-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide();
            closeBtn.title = '關閉'; // 默認標題
        }

        // 標題設置 - 無條件確保標題顯示
        const titleElement = this.modal.querySelector('.modal-setting-title');
        if (titleElement) {
            // 無條件設置標題，確保顯示
            titleElement.textContent = '新遊戲設定';
            titleElement.style.display = 'block';
            console.log("模態框標題已設置:", titleElement.textContent);
        } else {
            console.error("找不到模態框標題元素");
        }

        // 檢查模式標籤
        const modeLabel = this.modal.querySelector('.modal-setting-group.mode .modal-setting-label');
        if (modeLabel) {
            modeLabel.textContent = '選擇模式';
            modeLabel.style.display = 'block';
            console.log("模式標籤已設置:", modeLabel.textContent);
        } else {
            console.error("找不到模式標籤元素");
        }

        // 確認按鈕
        const confirmBtn = this.modal.querySelector('#modal-setting-confirm');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                if (this.onConfirm) this.onConfirm(this.getSettings());
                this.hide();
            };
        }

        // 設定事件監聽器
        this.setupEventListeners();
    } show(defaults = {}, onConfirm = null) {
        this.onConfirm = onConfirm;
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');

        // 預設選擇，確保顯示預設值
        if (defaults.mode) {
            this.selectMode(defaults.mode);
        }

        // 顯示預設 AI 難度
        this.selectAI(this.selectedAiLevel); // 顯示預設 medium 難度
        this.selectXAI(this.selectedXAiLevel); // 顯示預設 X AI medium 難度
        this.selectOAI(this.selectedOAiLevel); // 顯示預設 O AI medium 難度

        // 顯示預設玩家符號
        this.selectSymbol(this.selectedPlayerSymbol); // 顯示預設 X 符號

        // 如果有傳入參數，則覆蓋預設值
        if (defaults.aiLevel) this.selectAI(defaults.aiLevel);
        if (defaults.playerSymbol) this.selectSymbol(defaults.playerSymbol);
    }

    hide() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('show');
    }

    getSettings() {
        return {
            mode: this.currentMode,
            aiLevel: this.selectedAiLevel,
            xAiLevel: this.selectedXAiLevel,
            oAiLevel: this.selectedOAiLevel,
            playerSymbol: this.selectedPlayerSymbol
        };
    }

    setupEventListeners() {
        // 模式選擇
        const modeButtons = this.modal.querySelectorAll('.modal-setting-option.mode');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.selectMode(mode);
            });
        });

        // AI 難度選擇 (單人模式)
        const aiButtons = this.modal.querySelectorAll('.modal-setting-option.ai');
        aiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectAI(btn.dataset.level);
            });
        });

        // X AI 難度選擇 (AI vs AI)
        const xAiButtons = this.modal.querySelectorAll('.modal-setting-option.x-ai');
        xAiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectXAI(btn.dataset.level);
            });
        });

        // O AI 難度選擇 (AI vs AI)
        const oAiButtons = this.modal.querySelectorAll('.modal-setting-option.o-ai');
        oAiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectOAI(btn.dataset.level);
            });
        });

        // 玩家符號選擇
        const symbolButtons = this.modal.querySelectorAll('.modal-setting-option.symbol');
        symbolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectSymbol(btn.dataset.symbol);
            });
        });
    }

    selectMode(mode) {
        this.currentMode = mode;

        // 更新按鈕樣式
        const modeButtons = this.modal.querySelectorAll('.modal-setting-option.mode');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        // 顯示/隱藏相應的設置組
        const aiGroup = this.modal.querySelector('.modal-setting-group.ai');
        const xoAiGroup = this.modal.querySelector('.modal-setting-group.xo-ai');
        const symbolGroup = this.modal.querySelector('.modal-setting-group.symbol');

        if (mode === 'human-vs-human') {
            aiGroup.style.display = 'none';
            xoAiGroup.style.display = 'none';
            symbolGroup.style.display = 'none';
        } else if (mode === 'human-vs-ai') {
            aiGroup.style.display = 'block';
            xoAiGroup.style.display = 'none';
            symbolGroup.style.display = 'block';
        } else if (mode === 'ai-vs-ai') {
            aiGroup.style.display = 'none';
            xoAiGroup.style.display = 'block';
            symbolGroup.style.display = 'none';
        }
    }

    selectAI(level) {
        this.selectedAiLevel = level;

        // 更新按鈕樣式
        const aiButtons = this.modal.querySelectorAll('.modal-setting-option.ai');
        aiButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
    }

    selectXAI(level) {
        this.selectedXAiLevel = level;

        // 更新按鈕樣式
        const xAiButtons = this.modal.querySelectorAll('.modal-setting-option.x-ai');
        xAiButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
    }

    selectOAI(level) {
        this.selectedOAiLevel = level;

        // 更新按鈕樣式
        const oAiButtons = this.modal.querySelectorAll('.modal-setting-option.o-ai');
        oAiButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
    }

    selectSymbol(symbol) {
        this.selectedPlayerSymbol = symbol;

        // 更新按鈕樣式
        const symbolButtons = this.modal.querySelectorAll('.modal-setting-option.symbol');
        symbolButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.symbol === symbol) {
                btn.classList.add('active');
            }
        });
    } updateModalContent() {
        // 如果沒有文字管理器，我們也要直接設置默認文字
        const textManager = window.textManager || {
            getText: (key, defaultText) => defaultText
        };

        // 標題 - 確保存在且設置
        const titleElement = this.modal.querySelector('.modal-setting-title');
        if (titleElement) {
            titleElement.textContent = textManager.getText('modal.newGameSettings', '新遊戲設定');
            console.log("設置模態框標題:", titleElement.textContent);
        } else {
            console.warn("找不到模態框標題元素");
        }

        // 關閉按鈕標題
        const closeBtn = this.modal.querySelector('.modal-setting-close');
        if (closeBtn) {
            closeBtn.title = textManager.getText('modal.close', '關閉');
        }

        // 確認按鈕
        const confirmBtn = document.getElementById('modal-setting-confirm');
        if (confirmBtn) {
            confirmBtn.textContent = window.textManager.getText('modal.startGame', '開始遊戲');
        }

        // 模式標籤
        const modeLabel = this.modal.querySelector('.modal-setting-group.mode .modal-setting-label');
        if (modeLabel) {
            modeLabel.textContent = window.textManager.getText('modal.selectMode', '選擇模式');
        }

        // 更新模式按鈕文字
        const modeButtons = this.modal.querySelectorAll('.modal-setting-option.mode');
        modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            let text = '';
            if (mode === 'human-vs-human') {
                text = window.textManager.getText('modes.humanVsHuman.title', '人類對戰');
            } else if (mode === 'human-vs-ai') {
                text = window.textManager.getText('modes.humanVsAI.title', '挑戰 AI');
            } else if (mode === 'ai-vs-ai') {
                text = window.textManager.getText('modes.aiVsAI.title', 'AI 對戰');
            }
            // 保持圖標並添加文字
            const icon = btn.querySelector('i');
            if (icon) {
                btn.innerHTML = '';
                btn.appendChild(icon.cloneNode(true));
                btn.appendChild(document.createTextNode(' ' + text));
            } else {
                btn.textContent = text;
            }
        });        // AI 難度標籤
        const aiLabel = this.modal.querySelector('.modal-setting-group.ai .modal-setting-label');
        if (aiLabel) {
            aiLabel.textContent = window.textManager.getText('modal.selectAILevel', '選擇 AI 難度');
        }

        // 更新 AI 難度按鈕文字
        const aiButtons = this.modal.querySelectorAll('.modal-setting-option.ai');
        aiButtons.forEach(btn => {
            const level = btn.dataset.level;
            let text = '';
            if (level === 'easy') {
                text = window.textManager.getText('difficulty.easy', '簡單');
            } else if (level === 'medium') {
                text = window.textManager.getText('difficulty.medium', '普通');
            } else if (level === 'hard') {
                text = window.textManager.getText('difficulty.hard', '困難');
            } else if (level === 'impossible') {
                text = window.textManager.getText('difficulty.impossible', '不可能');
            }
            btn.textContent = text;
        });        // X 玩家 AI 難度標籤
        const xAiLabel = this.modal.querySelector('.modal-setting-group.xo-ai .x-ai-label');
        if (xAiLabel) {
            xAiLabel.textContent = window.textManager.getText('modal.xAiLevel', 'X AI 難度');
        }

        // O 玩家 AI 難度標籤
        const oAiLabel = this.modal.querySelector('.modal-setting-group.xo-ai .o-ai-label');
        if (oAiLabel) {
            oAiLabel.textContent = window.textManager.getText('modal.oAiLevel', 'O AI 難度');
        }

        // 更新符號選擇按鈕文字
        const symbolButtons = this.modal.querySelectorAll('.modal-setting-option.symbol');
        symbolButtons.forEach(btn => {
            const symbol = btn.dataset.symbol;
            if (symbol === 'X') {
                btn.textContent = window.textManager.getText('game.symbols.xFirst', 'X (先手)');
            } else if (symbol === 'O') {
                btn.textContent = window.textManager.getText('game.symbols.oSecond', 'O (後手)');
            }
        });        // 玩家符號選擇標籤
        const symbolLabel = this.modal.querySelector('.modal-setting-group.symbol .modal-setting-label');
        if (symbolLabel) {
            symbolLabel.textContent = window.textManager.getText('modal.selectSymbol', '選擇您的符號');
        }

        // AI vs AI 設定標籤
        const aiVsAiLabel = this.modal.querySelector('.modal-setting-group.xo-ai .modal-setting-label');
        if (aiVsAiLabel) {
            aiVsAiLabel.textContent = window.textManager.getText('modal.aiVsAiLevel', '選擇 AI vs AI 難度');
        }
    }
}

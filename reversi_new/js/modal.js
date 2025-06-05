// modal.js - 專責管理新遊戲設定彈窗
// 提供開啟、關閉、互動、取得設定值等功能

class GameSettingModal {
    constructor() {
        this.modal = null;
        this.currentMode = null;
        this.selectedAiLevel = null;
        this.selectedBlackAiLevel = null;
        this.selectedWhiteAiLevel = null;
        this.selectedPlayerColor = null;
        this.onConfirm = null;
    }

    init() {
        this.modal = document.getElementById('modal-setting');
        if (!this.modal) {
            console.error('Modal setting element not found');
            return;
        }        // 關閉按鈕
        const closeBtn = this.modal.querySelector('.modal-setting-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide();
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
    }

    show(defaults = {}, onConfirm = null) {
        this.onConfirm = onConfirm;
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');

        // 預設選擇
        if (defaults.mode) this.selectMode(defaults.mode);
        if (defaults.aiLevel) this.selectAI(defaults.aiLevel);
        if (defaults.playerColor) this.selectColor(defaults.playerColor);
    }

    hide() {
        this.modal.style.display = 'none';
        this.modal.classList.remove('show');
    } selectMode(mode) {
        this.currentMode = mode;
        this.modal.querySelectorAll('.modal-setting-option.mode').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // 更新 modal 內容以支援不同模式
        this.updateModalContent();
        // 為不同模式設定預設值
        if (mode === 'human-vs-ai') {
            if (!this.selectedAiLevel) this.selectAI('medium');
            if (!this.selectedPlayerColor) this.selectColor('black');
        } else if (mode === 'ai-vs-ai') {
            if (!this.selectedBlackAiLevel) this.selectedBlackAiLevel = 'medium';
            if (!this.selectedWhiteAiLevel) this.selectedWhiteAiLevel = 'medium';
        }
    } selectAI(level) {
        this.selectedAiLevel = level;
        this.modal.querySelectorAll('.modal-setting-option.ai').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
    }

    selectColor(color) {
        this.selectedPlayerColor = color;
        this.modal.querySelectorAll('.modal-setting-option.color').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    } updateModalContent(preselect = {}) {
        // 更新關閉按鈕的 title 屬性
        const closeBtn = this.modal.querySelector('.modal-setting-close');
        if (closeBtn) {
            const closeText = window.textManager ? window.textManager.getText('modal.close') : '關閉';
            closeBtn.title = closeText;
        }

        // 更新模態框標題
        const modalTitle = this.modal.querySelector('.modal-setting-title');
        if (modalTitle) {
            const titleText = window.textManager ? window.textManager.getText('modal.newGameSettings') : '新遊戲設定';
            modalTitle.textContent = titleText;
        }

        // 更新確認按鈕文字
        const confirmBtn = this.modal.querySelector('#modal-setting-confirm');
        if (confirmBtn) {
            const confirmText = window.textManager ? window.textManager.getText('modal.startGame') : '開始遊戲';
            confirmBtn.textContent = confirmText;
        }

        // 模式標籤
        const modeLabel = this.modal.querySelector('.modal-setting-group.mode .modal-setting-label');
        if (modeLabel) {
            const selectModeText = window.textManager ? window.textManager.getText('modal.selectMode') : '選擇模式';
            modeLabel.textContent = selectModeText;
        }

        // 更新模式按鈕文字
        const modeButtons = this.modal.querySelectorAll('.modal-setting-option.mode');
        modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            let text = '';
            if (mode === 'human-vs-human') {
                text = window.textManager ? window.textManager.getText('modes.humanVsHuman.title') : '人類對戰';
            } else if (mode === 'human-vs-ai') {
                text = window.textManager ? window.textManager.getText('modes.humanVsAI.title') : '挑戰 AI';
            } else if (mode === 'ai-vs-ai') {
                text = window.textManager ? window.textManager.getText('modes.aiVsAI.title') : 'AI 對戰';
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
        });

        // 更新顏色選擇按鈕文字
        const colorButtons = this.modal.querySelectorAll('.modal-setting-option.color');
        colorButtons.forEach(btn => {
            const color = btn.dataset.color;
            if (color === 'black') {
                const text = window.textManager ? window.textManager.getText('modal.blackFirst') : '黑子 (先手)';
                btn.textContent = text;
            } else if (color === 'white') {
                const text = window.textManager ? window.textManager.getText('modal.whiteSecond') : '白子 (後手)';
                btn.textContent = text;
            }
        });

        // 更新顏色選擇組的標籤
        const colorGroup = this.modal.querySelector('.modal-setting-group.color');
        if (colorGroup) {
            colorGroup.style.display = (this.currentMode === 'human-vs-ai') ? 'block' : 'none';

            const colorLabel = colorGroup.querySelector('.modal-setting-label');
            if (colorLabel) {
                const playerColorText = window.textManager ? window.textManager.getText('modal.playerColor') : '選擇您的棋子顏色';
                colorLabel.textContent = playerColorText;
            }
        }

        // AI 難度選項
        const aiGroup = this.modal.querySelector('.modal-setting-group.ai');
        if (this.currentMode === 'human-vs-ai') {
            aiGroup.style.display = 'block';
            // 恢復原始的人機模式 AI 難度選項
            const aiDifficultyText = window.textManager ? window.textManager.getText('modal.aiDifficulty') : 'AI 難度';
            const easyText = window.textManager ? window.textManager.getText('ui.aiDifficulty.easy') : '簡單';
            const mediumText = window.textManager ? window.textManager.getText('ui.aiDifficulty.medium') : '普通';
            const hardText = window.textManager ? window.textManager.getText('ui.aiDifficulty.hard') : '困難';
            const superHardText = window.textManager ? window.textManager.getText('ui.aiDifficulty.superHard') : '超難';

            aiGroup.innerHTML = `
                <span class="modal-setting-label">${aiDifficultyText}</span>
                <div class="modal-setting-options">
                    <button class="modal-setting-option ai" data-level="easy">${easyText}</button>
                    <button class="modal-setting-option ai" data-level="medium">${mediumText}</button>
                    <button class="modal-setting-option ai" data-level="hard">${hardText}</button>
                    <button class="modal-setting-option ai" data-level="super-hard">${superHardText}</button>
                </div>
            `;
            // 設定預設選項或恢復之前選擇的難度
            const currentLevel = this.selectedAiLevel || 'medium';
            const targetBtn = aiGroup.querySelector(`.ai[data-level="${currentLevel}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        } else if (this.currentMode === 'ai-vs-ai') {
            aiGroup.style.display = 'block';
            const blackAiDifficultyText = window.textManager ? window.textManager.getText('modal.blackAiDifficulty') : '黑子 AI 難度';
            const whiteAiDifficultyText = window.textManager ? window.textManager.getText('modal.whiteAiDifficulty') : '白子 AI 難度';
            const easyText = window.textManager ? window.textManager.getText('ui.aiDifficulty.easy') : '簡單';
            const mediumText = window.textManager ? window.textManager.getText('ui.aiDifficulty.medium') : '普通';
            const hardText = window.textManager ? window.textManager.getText('ui.aiDifficulty.hard') : '困難';
            const superHardText = window.textManager ? window.textManager.getText('ui.aiDifficulty.superHard') : '超難';

            aiGroup.innerHTML = `
                <span class="modal-setting-label">${blackAiDifficultyText}</span>
                <div class="modal-setting-options">
                    <button class="modal-setting-option ai-black" data-level="easy">${easyText}</button>
                    <button class="modal-setting-option ai-black" data-level="medium">${mediumText}</button>
                    <button class="modal-setting-option ai-black" data-level="hard">${hardText}</button>
                    <button class="modal-setting-option ai-black" data-level="super-hard">${superHardText}</button>
                </div>
                <div style="margin-top: 12px;">
                    <span class="modal-setting-label">${whiteAiDifficultyText}</span>
                    <div class="modal-setting-options">
                        <button class="modal-setting-option ai-white" data-level="easy">${easyText}</button>
                        <button class="modal-setting-option ai-white" data-level="medium">${mediumText}</button>
                        <button class="modal-setting-option ai-white" data-level="hard">${hardText}</button>
                        <button class="modal-setting-option ai-white" data-level="super-hard">${superHardText}</button>
                    </div>
                </div>            `;
            // 設定預設選項
            const blackLevel = this.selectedBlackAiLevel || 'medium';
            const whiteLevel = this.selectedWhiteAiLevel || 'medium';

            const blackBtn = aiGroup.querySelector(`.ai-black[data-level="${blackLevel}"]`);
            if (blackBtn) blackBtn.classList.add('active');

            const whiteBtn = aiGroup.querySelector(`.ai-white[data-level="${whiteLevel}"]`);
            if (whiteBtn) whiteBtn.classList.add('active');

            // 更新內部狀態
            this.selectedBlackAiLevel = blackLevel;
            this.selectedWhiteAiLevel = whiteLevel;
        } else {
            aiGroup.style.display = 'none';
        }
    } setupEventListeners() {
        // 使用事件委託來處理所有按鈕點擊
        this.modal.addEventListener('click', (e) => {
            // 模式選擇
            if (e.target.classList.contains('modal-setting-option') && e.target.classList.contains('mode')) {
                this.modal.querySelectorAll('.modal-setting-option.mode').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectMode(e.target.dataset.mode);
            }

            // 顏色選擇 (人機模式)
            if (e.target.classList.contains('modal-setting-option') && e.target.classList.contains('color')) {
                this.modal.querySelectorAll('.modal-setting-option.color').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectColor(e.target.dataset.color);
            }

            // AI 難度選擇 (人機模式)
            if (e.target.classList.contains('ai') && !e.target.classList.contains('ai-black') && !e.target.classList.contains('ai-white')) {
                this.modal.querySelectorAll('.modal-setting-option.ai').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectedAiLevel = e.target.dataset.level;
            }

            // 黑子 AI 難度選擇 (AI vs AI 模式)
            if (e.target.classList.contains('ai-black')) {
                this.modal.querySelectorAll('.modal-setting-option.ai-black').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectedBlackAiLevel = e.target.dataset.level;
            }

            // 白子 AI 難度選擇 (AI vs AI 模式)
            if (e.target.classList.contains('ai-white')) {
                this.modal.querySelectorAll('.modal-setting-option.ai-white').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                this.selectedWhiteAiLevel = e.target.dataset.level;
            }
        });
    }

    getSettings() {
        if (this.currentMode === 'ai-vs-ai') {
            return {
                mode: this.currentMode,
                blackAiLevel: this.selectedBlackAiLevel || 'medium',
                whiteAiLevel: this.selectedWhiteAiLevel || 'medium'
            };
        } else {
            return {
                mode: this.currentMode,
                aiLevel: this.selectedAiLevel || 'medium',
                playerColor: this.selectedPlayerColor || 'black'
            };
        }
    }
}

window.GameSettingModal = GameSettingModal;

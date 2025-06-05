/**
 * 主應用程式 - 英文單字複習系統
 * 初始化所有模組並協調啟動
 */

class VocabularyApp {
    constructor() {
        this.initialized = false;
        this.modules = {};
    }

    /**
     * 初始化應用程式
     */
    async init() {
        try {
            // 顯示載入畫面
            this.showLoadingScreen();            // 初始化數據管理模組
            console.log('正在初始化數據管理模組...');
            this.modules.data = new DataManager();
            await this.modules.data.init();            // 初始化各功能模組
            console.log('正在初始化功能模組...');
            this.modules.quizlet = new QuizletManager();
            this.modules.matching = new MatchingManager();
            this.modules.definitionMatching = new DefinitionMatchingManager();
            this.modules.quiz = new QuizManager();
            this.modules.browse = new BrowseManager();

            // 設置全域引用
            window.dataManager = this.modules.data;
            window.quizletManager = this.modules.quizlet;
            window.matchingManager = this.modules.matching;
            window.definitionMatchingManager = this.modules.definitionMatching;
            window.quizManager = this.modules.quiz;
            window.browseManager = this.modules.browse;            // 初始化導航模組
            console.log('正在初始化導航模組...');
            this.modules.navigation = new NavigationManager();

            // 設置導航模組的全域引用
            window.navigationManager = this.modules.navigation;// 設置數據管理器給各模組
            this.modules.quizlet.setDataManager(this.modules.data);
            this.modules.matching.setDataManager(this.modules.data);
            this.modules.definitionMatching.setDataManager(this.modules.data);
            this.modules.quiz.setDataManager(this.modules.data);
            this.modules.browse.setDataManager(this.modules.data);

            // 確保瀏覽頁面立即顯示單字
            setTimeout(() => {
                if (this.modules.browse && this.modules.browse.loadWords) {
                    this.modules.browse.loadWords();
                }
            }, 100);            // 設置全域鍵盤快捷鍵
            this.setupGlobalKeyboardShortcuts();

            // 設置頁面變更事件
            this.setupPageChangeHandlers();            // 設置清除快取按鈕事件
            this.setupClearCacheButton();

            // 設置關於本專案按鈕事件
            this.setupAboutButton();

            // 隱藏載入畫面，顯示主畫面
            this.hideLoadingScreen();

            // 標記為已初始化
            this.initialized = true;

            console.log('應用程式初始化完成！');

            // 顯示歡迎訊息
            this.showWelcomeMessage();

        } catch (error) {
            console.error('應用程式初始化失敗:', error);
            this.showErrorMessage('應用程式初始化失敗，請重新載入頁面。');
        }
    }

    /**
     * 顯示載入畫面
     */
    showLoadingScreen() {
        const loadingHtml = `
            <div id="loading-screen" class="loading-screen">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>載入英文單字複習系統</h2>
                    <p>正在準備您的學習環境...</p>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', loadingHtml);

        // 模擬載入進度
        setTimeout(() => {
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }, 1000);
    }

    /**
     * 隱藏載入畫面
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    /**
     * 設置全域鍵盤快捷鍵
     */
    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + 數字鍵切換頁面
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const pageMap = {
                    '1': 'home',
                    '2': 'quizlet',
                    '3': 'matching',
                    '4': 'quiz',
                    '5': 'browse'
                };

                if (pageMap[e.key]) {
                    e.preventDefault();
                    this.modules.navigation.navigateTo(pageMap[e.key]);
                }
            }

            // F1 顯示幫助
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelpModal();
            }

            // ESC 關閉模態框
            if (e.key === 'Escape') {
                this.modules.navigation.closeAllModals();
            }
        });
    }

    /**
     * 設置頁面變更處理器
     */
    setupPageChangeHandlers() {
        // 監聽頁面變更事件
        document.addEventListener('pageChanged', (e) => {
            const { from, to } = e.detail;
            console.log(`頁面從 ${from} 切換到 ${to}`);

            // 更新頁面統計
            this.updatePageStats(to);
        });
    }

    /**
     * 更新頁面統計
     */
    updatePageStats(page) {
        const stats = JSON.parse(localStorage.getItem('pageStats') || '{}');
        stats[page] = (stats[page] || 0) + 1;
        stats.lastVisited = page;
        stats.lastVisitTime = new Date().toISOString();
        localStorage.setItem('pageStats', JSON.stringify(stats));
    }

    /**
     * 顯示歡迎訊息
     */
    showWelcomeMessage() {
        const totalWords = this.modules.data.getAllWords().length;
        const learnedWords = this.modules.data.getLearnedWords().length;
        const progressPercent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

        const message = `歡迎使用英文單字複習系統！總單字數：${totalWords} 個 已學會：${learnedWords} 個 (${progressPercent}%)`;

        this.modules.navigation.showNotification(message, 'success', 5000);
    }

    /**
     * 顯示錯誤訊息
     */
    showErrorMessage(message) {
        const errorHtml = `
            <div class="error-screen">
                <div class="error-content">
                    <h2>❌ 錯誤</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">重新載入</button>
                </div>
            </div>
        `;

        document.body.innerHTML = errorHtml;
    }

    /**
     * 顯示幫助模態框
     */
    showHelpModal() {
        const helpContent = `
            <h3>🎯 功能介紹</h3>
            <ul>
                <li><strong>閃卡複習：</strong>類似 Quizlet 的單字卡複習</li>
                <li><strong>配對遊戲：</strong>中英文連連看遊戲</li>
                <li><strong>測驗練習：</strong>多種題型的測驗練習</li>
                <li><strong>瀏覽單字：</strong>搜尋和管理單字</li>
            </ul>
            
            <h3>⌨️ 快捷鍵</h3>
            <ul>
                <li><strong>Alt + 1-5：</strong>切換頁面</li>
                <li><strong>F1：</strong>顯示此幫助</li>
                <li><strong>ESC：</strong>關閉模態框</li>
                <li><strong>空白鍵：</strong>翻轉閃卡（在閃卡模式）</li>
                <li><strong>方向鍵：</strong>導航閃卡</li>
            </ul>
            
            <h3>📊 學習功能</h3>
            <ul>
                <li>自動追蹤學習進度</li>
                <li>難度評級系統</li>
                <li>錯誤答案複習</li>
                <li>學習統計和匯出</li>
            </ul>
        `;

        this.modules.navigation.showModal('使用說明', helpContent);
    }

    /**
     * 獲取應用程式統計
     */
    getAppStats() {
        if (!this.initialized) return null;

        const data = this.modules.data;
        const pageStats = JSON.parse(localStorage.getItem('pageStats') || '{}'); return {
            totalWords: data.getAllWords().length,
            learnedWords: data.getLearnedWords().length,
            sessionStats: data.getSessionStats(),
            pageStats: pageStats,
            lastSession: data.getLastSessionInfo()
        };
    }

    /**
     * 重置應用程式數據
     */
    resetAppData() {
        if (confirm('確定要重置所有學習進度嗎？此操作無法復原。')) {
            localStorage.clear();
            location.reload();
        }
    }

    /**
     * 匯出學習數據
     */
    exportLearningData() {
        const stats = this.getAppStats();
        const data = {
            exportTime: new Date().toISOString(),
            appStats: stats,
            learnedWords: this.modules.data.getLearnedWords(),
            userProgress: this.modules.data.getUserProgress()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabulary_learning_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }    /**
     * 設置清除快取按鈕事件
     */
    setupClearCacheButton() {
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.showClearCacheConfirmation();
            });
        }
    }

    /**
     * 設置關於本專案按鈕事件
     */
    setupAboutButton() {
        const aboutBtn = document.getElementById('aboutBtn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                this.showAboutModal();
            });
        }
    }

    /**
     * 顯示關於本專案模態視窗
     */
    async showAboutModal() {
        const modal = document.getElementById('aboutModal');
        const aboutContent = document.getElementById('aboutContent');

        if (modal && aboutContent) {
            // 顯示模態視窗
            modal.classList.remove('hidden');
            modal.classList.add('show');

            // 顯示載入指示器
            aboutContent.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    載入中...
                </div>
            `; try {
                // 載入 about.md 內容
                const aboutText = await this.loadAboutContent();

                // 將 Markdown 轉換為 HTML
                const htmlContent = this.markdownToHtml(aboutText);

                // 顯示內容
                aboutContent.innerHTML = htmlContent;
            } catch (error) {
                console.error('載入 about.md 內容失敗:', error);
                aboutContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>載入失敗</h3>
                        <p>無法載入專案說明文件，請檢查網路連接或聯繫開發者。</p>
                        <p class="error-detail">錯誤詳情：${error.message}</p>
                    </div>
                `;
            }
        }

        // 設置關閉事件
        this.setupAboutModalEvents();
    }    /**
     * 載入 about.md 內容
     */
    async loadAboutContent() {
        try {
            const response = await fetch('./about.md');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            // 如果無法載入檔案，提供備用內容
            return this.getBackupAboutContent();
        }
    }    /**
     * 簡單的 Markdown 轉 HTML 轉換器
     */
    markdownToHtml(markdown) {
        let html = markdown;

        // 先處理代碼塊（避免其他規則影響）
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // 行內代碼
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // 標題轉換
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

        // 粗體
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 斜體
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 連結
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 圖片
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');        // 引用
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

        // 水平分隔線
        html = html.replace(/^---$/gm, '<hr>');
        html = html.replace(/^\*\*\*$/gm, '<hr>');
        html = html.replace(/^___$/gm, '<hr>');

        // 處理列表 - 分別處理有序和無序列表
        const lines = html.split('\n');
        const processedLines = [];
        let inList = false;
        let listType = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim(); // 先去除前後空白

            // 檢查是否為列表項目 - 改進正則表達式以處理更多情況
            const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
            const orderedMatch = line.match(/^\d+\.\s+(.+)$/);

            if (unorderedMatch) {
                if (!inList || listType !== 'ul') {
                    if (inList) processedLines.push(`</${listType}>`);
                    processedLines.push('<ul class="about-list">');
                    inList = true;
                    listType = 'ul';
                }
                processedLines.push(`  <li>${unorderedMatch[1]}</li>`);
            } else if (orderedMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) processedLines.push(`</${listType}>`);
                    processedLines.push('<ol class="about-list">');
                    inList = true;
                    listType = 'ol';
                }
                processedLines.push(`  <li>${orderedMatch[1]}</li>`);
            } else {
                if (inList) {
                    processedLines.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                // 保留原始行，包括空行
                processedLines.push(lines[i]);
            }
        }

        // 如果最後還在列表中，要關閉列表
        if (inList) {
            processedLines.push(`</${listType}>`);
        }

        html = processedLines.join('\n');

        // 處理段落 - 將連續的非 HTML 行包裝在 <p> 標籤中
        html = html.replace(/\n{2,}/g, '\n\n'); // 標準化換行
        const paragraphs = html.split('\n\n');
        const processedParagraphs = paragraphs.map(para => {
            para = para.trim();
            if (!para) return '';

            // 如果已經是 HTML 標籤，直接返回
            if (para.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/)) {
                return para;
            }

            // 如果包含 HTML 標籤但不是以標籤開始，可能是混合內容
            if (para.includes('<')) {
                return para;
            }

            // 普通文字包裝在 p 標籤中
            return `<p>${para}</p>`;
        });

        html = processedParagraphs.filter(p => p).join('\n\n');

        // 清理多餘的段落標籤
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ol>)/g, '$1');
        html = html.replace(/(<\/ol>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');

        return html;
    }    /**
     * 備用的關於內容
     */
    getBackupAboutContent() {
        return `# 英文單字複習系統

## 📚 專案簡介

這是一個專為學習英文單字設計的網頁應用程式，提供多種學習模式和練習方式，幫助使用者有效記憶和複習英文單字。

## ✨ 主要功能

### 🏠 首頁
- 顯示學習統計資料
- 快速訪問各種學習模式
- 清除快取功能

### 📖 瀏覽單字
- 完整的單字清單瀏覽
- 中英文對照顯示
- 搜尋和篩選功能
- 標記學習狀態

### 🧠 測驗模式
- 英翻中測驗
- 中翻英測驗
- 即時評分系統
- 查看答案功能

### 🔗 配對遊戲
- 單字與中文配對
- 互動式拖拽操作
- 計時挑戰

### 📝 定義配對
- 單字與定義配對
- 提升理解能力
- 遊戲化學習體驗

### 📚 Quizlet模式
- 卡片式學習
- 翻轉顯示功能
- 逐一複習單字

## 🛠️ 技術特色

- **響應式設計**：支援桌面和行動裝置
- **離線快取**：使用 localStorage 儲存學習進度
- **CSV 資料匯入**：支援自訂單字清單
- **現代化介面**：使用 Font Awesome 圖示和優美的 CSS 設計
- **純前端技術**：無需伺服器，可直接在瀏覽器中運行

## 📱 使用方式

1. **開始學習**：選擇任一學習模式開始
2. **瀏覽單字**：查看完整單字清單
3. **進行測驗**：測試你的學習成果
4. **遊戲練習**：透過配對遊戲加強記憶
5. **追蹤進度**：查看學習統計

## 🎯 學習建議

- **定期複習**：建議每天花 10-15 分鐘練習
- **多模式學習**：結合不同的學習模式提升效果
- **標記重點**：將困難的單字標記為重點複習
- **查看答案**：測驗後記得查看答案了解錯誤

## 💡 提示

- 使用「清除快取」功能可重置所有學習進度
- 支援鍵盤快捷鍵操作提升學習效率
- 建議在安靜的環境中專心學習

---

*祝你學習愉快！ 💪*`;
    }

    /**
     * 設置關於模態視窗事件
     */
    setupAboutModalEvents() {
        const modal = document.getElementById('aboutModal');
        const closeBtn = document.getElementById('closeAboutModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeAboutModal();
            });
        }

        if (modal) {
            // 點擊背景關閉
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAboutModal();
                }
            });
        }

        // ESC 鍵關閉
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeAboutModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * 關閉關於模態視窗
     */
    closeAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    /**
     * 顯示清除快取確認對話框
     */
    showClearCacheConfirmation() {
        const confirmed = confirm(
            '確定要清除所有快取資料嗎？\n\n這將包括：\n' +
            '• 已學習的單字記錄\n' +
            '• 單字難度標記\n' +
            '• 學習進度資料\n' +
            '• 偏好設定\n\n' +
            '此操作無法復原！'
        );

        if (confirmed) {
            this.clearCache();
        }
    }

    /**
     * 清除所有快取資料
     */
    clearCache() {
        try {
            // 確認要清除的 localStorage 項目
            const itemsToRemove = [
                'learnedWords',          // 已學習單字
                'wordDifficulty',        // 單字難度設定
                'studySessions',         // 學習時段記錄
                'quizletMode',          // Quizlet 模式偏好
                'browseUnit',           // 瀏覽單元偏好
                'quizUnit',             // 測驗單元偏好
                'quizType',             // 測驗類型偏好
                'quizCount',            // 測驗題目數量偏好
                'matchingUnit',         // 配對遊戲單元偏好
                'userPreferences'       // 其他用戶偏好
            ];

            // 清除指定的 localStorage 項目
            itemsToRemove.forEach(item => {
                localStorage.removeItem(item);
            });

            // 清除 sessionStorage（如果有使用）
            sessionStorage.clear();

            // 重置各模組的狀態
            if (this.modules.data) {
                this.modules.data.learnedWords = new Set();
                this.modules.data.updateStats();
            }

            // 重新初始化各模組
            if (this.modules.quizlet) {
                this.modules.quizlet.selectedUnits = ['all'];
                this.modules.quizlet.difficultyFilter = null;
                this.modules.quizlet.mode = 'word-chinese';
            }

            if (this.modules.browse) {
                this.modules.browse.currentUnit = 'all';
                this.modules.browse.searchQuery = '';
            }

            if (this.modules.quiz) {
                this.modules.quiz.unit = 'all';
                this.modules.quiz.quizType = 'multiple-choice';
                this.modules.quiz.questionCount = 20;
            }

            if (this.modules.matching) {
                this.modules.matching.unit = 'all';
                this.modules.matching.pairCount = 12;
            }

            // 顯示成功訊息
            if (this.modules.navigation) {
                this.modules.navigation.showNotification(
                    '快取已成功清除！頁面將重新載入...',
                    'success',
                    3000
                );
            }

            // 3秒後重新載入頁面
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (error) {
            console.error('清除快取時發生錯誤:', error);
            if (this.modules.navigation) {
                this.modules.navigation.showNotification(
                    '清除快取時發生錯誤，請手動重新整理頁面',
                    'error',
                    5000
                );
            } else {
                alert('清除快取時發生錯誤，請手動重新整理頁面');
            }
        }
    }
}

// 當 DOM 載入完成時初始化應用程式
document.addEventListener('DOMContentLoaded', async () => {
    // 創建全域應用程式實例
    window.vocabularyApp = new VocabularyApp();

    // 初始化應用程式
    await window.vocabularyApp.init();
});

// 匯出給其他模組使用
window.VocabularyApp = VocabularyApp;

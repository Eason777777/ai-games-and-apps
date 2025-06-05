// Navigation Module
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showPage('home');
    }

    bindEvents() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.closest('.nav-btn').dataset.page;
                this.showPage(page);
            });
        });

        // Mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const page = e.target.closest('.mode-card').dataset.page;
                this.showPage(page);
            });
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
        if (activeBtn && activeBtn.classList.contains('nav-btn')) {
            activeBtn.classList.add('active');
        }

        this.currentPage = pageName;

        // Page-specific initialization
        this.initializePage(pageName);
    } initializePage(pageName) {
        // 功能頁面需要設定的列表
        const pagesNeedingSettings = ['quizlet', 'matching', 'definition-matching', 'quiz'];

        // 如果是需要設定的頁面，自動開啟設定模態框
        if (pagesNeedingSettings.includes(pageName)) {
            // 延遲一下讓頁面切換完成
            setTimeout(() => {
                if (window.settingsManager) {
                    window.settingsManager.openModal(pageName);
                }
            }, 100);
        }

        switch (pageName) {
            case 'quizlet':
                if (window.quizletManager) {
                    window.quizletManager.initialize();
                }
                break;
            case 'matching':
                if (window.matchingManager) {
                    window.matchingManager.initialize();
                }
                break;
            case 'definition-matching':
                if (window.definitionMatchingManager) {
                    window.definitionMatchingManager.initialize();
                }
                break;
            case 'quiz':
                if (window.quizManager) {
                    window.quizManager.initialize();
                }
                break;
            case 'browse':
                if (window.browseManager) {
                    window.browseManager.initialize();
                }
                break;
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = '';
    }

    showResult(resultId) {
        const result = document.getElementById(resultId);
        if (result) {
            result.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideResult() {
        document.querySelectorAll('.result-overlay').forEach(overlay => {
            overlay.classList.add('hidden');
        });
        document.body.style.overflow = '';
    }

    handleKeyboard(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.showPage('home');
                    break;
                case '2':
                    e.preventDefault();
                    this.showPage('quizlet');
                    break;
                case '3':
                    e.preventDefault();
                    this.showPage('matching');
                    break; case '4':
                    e.preventDefault();
                    this.showPage('definition-matching');
                    break;
                case '5':
                    e.preventDefault();
                    this.showPage('quiz');
                    break;
                case '6':
                    e.preventDefault();
                    this.showPage('browse');
                    break;
            }
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            this.closeModal();
            this.hideResult();
        }

        // Page-specific keyboard shortcuts
        this.handlePageKeyboard(e);
    } handlePageKeyboard(e) {
        switch (this.currentPage) {
            case 'quizlet':
                if (window.quizletManager) {
                    window.quizletManager.handleKeyboard(e);
                }
                break;
            case 'matching':
                if (window.matchingManager) {
                    window.matchingManager.handleKeyboard(e);
                }
                break;
            case 'definition-matching':
                if (window.definitionMatchingManager) {
                    window.definitionMatchingManager.handleKeyboard(e);
                }
                break;
            case 'quiz':
                if (window.quizManager) {
                    window.quizManager.handleKeyboard(e);
                }
                break;
        }
    }

    // Utility methods
    showLoading(message = '載入中...') {
        // Create or show loading overlay
        let loader = document.getElementById('loadingOverlay');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loadingOverlay';
            loader.className = 'result-overlay';
            loader.innerHTML = `
                <div class="result-content">
                    <div class="loading-spinner"></div>
                    <p id="loadingMessage">${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        }

        document.getElementById('loadingMessage').textContent = message;
        loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        // Set type-specific styles
        switch (type) {
            case 'success':
                notification.style.background = '#38a169';
                break;
            case 'error':
                notification.style.background = '#e53e3e';
                break;
            case 'warning':
                notification.style.background = '#dd6b20';
                break;
            default:
                notification.style.background = '#667eea';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;

            element.style.opacity = Math.min(progress, 1);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;

            element.style.opacity = 1 - Math.min(progress, 1);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }

        requestAnimationFrame(animate);
    }

    slideIn(element, direction = 'left', duration = 300) {
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };

        element.style.transform = transforms[direction];
        element.style.display = 'block';

        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;

            const currentTransform = transforms[direction].replace(/[-\d.]+/,
                (100 - (progress * 100)) * (direction === 'left' || direction === 'up' ? -1 : 1));
            element.style.transform = progress >= 1 ? 'translate(0)' : currentTransform;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
}

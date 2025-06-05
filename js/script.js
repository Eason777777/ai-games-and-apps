// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const modal = document.getElementById('gameModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.querySelector('.close');
const navLinks = document.querySelectorAll('.nav-link');

// 動態設置浮動符號位置，避免重疊
function positionFloatingIcons() {
    const iconItems = document.querySelectorAll('.icon-item');
    if (iconItems.length === 0) return;

    const container = document.querySelector('.floating-icons');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const iconSize = 80; // 符號大小
    const minDistancePercent = 25; // 最小距離百分比

    const positions = [];

    // 為每個符號生成不重疊的位置（使用百分比）
    iconItems.forEach((icon, index) => {
        let position;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            position = {
                x: Math.random() * 80 + 5, // 5% 到 85% 之間
                y: Math.random() * 80 + 5  // 5% 到 85% 之間
            };
            attempts++;
        } while (attempts < maxAttempts && positions.some(pos => {
            const distance = Math.sqrt(Math.pow(pos.x - position.x, 2) + Math.pow(pos.y - position.y, 2));
            return distance < minDistancePercent;
        }));

        positions.push(position);

        // 應用位置（使用百分比）
        icon.style.position = 'absolute';
        icon.style.left = `${position.x}%`;
        icon.style.top = `${position.y}%`;

        // 設置隨機動畫延遲
        icon.style.animationDelay = `${index * 1.2 + Math.random() * 1.5}s`;

        // 添加隨機動畫持續時間變化，讓每個符號的浮動速度稍有不同
        icon.style.animationDuration = `${5 + Math.random() * 2}s`;
    });
}

// 頁面載入完成後執行位置設置
document.addEventListener('DOMContentLoaded', () => {
    // 等待 CSS 載入完成
    setTimeout(positionFloatingIcons, 100);

    // 視窗大小變化時重新計算位置
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(positionFloatingIcons, 300);
    });
});

// Mobile Navigation Toggle
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Game Info Modal Functions
function showGameInfo(gameType) {
    let content = '';
    if (gameType === 'reversi') {
        content = `
            <h2><i class="fas fa-chess-board"></i> 黑白棋 (Reversi)</h2>
            <div class="game-info-content">
                <h3>遊戲特色</h3>
                <ul>
                    <li><strong>Minimax AI</strong>：採用經典的遊戲樹搜索演算法</li>
                    <li><strong>多種遊戲模式</strong>：人類 vs 人類、人類 vs AI</li>
                    <li><strong>精美動畫</strong>：流暢的棋子翻轉動畫和音效</li>
                    <li><strong>難度調整</strong>：多種 AI 難度等級可選</li>
                    <li><strong>即時計分</strong>：動態顯示雙方棋子數量</li>
                </ul>
                <h3>技術實作</h3>
                <ul>
                    <li>使用 JavaScript 實作完整的黑白棋遊戲邏輯</li>
                    <li>Minimax 演算法實現 AI 對手智能</li>
                    <li>CSS 動畫提供流暢的視覺效果</li>
                    <li>響應式設計，支援桌面和移動設備</li>
                </ul>
                <div class="modal-actions">
                    <a href="reversi/index.html" class="btn btn-primary">
                        <i class="fas fa-play"></i>
                        開始遊戲
                    </a>
                </div>
            </div>
        `;
    } else if (gameType === 'reversi_new') {
        content = `
            <h2><i class="fas fa-chess-board"></i> 黑白棋進階版 (Reversi New)</h2>
            <div class="game-info-content">
                <h3>遊戲特色</h3>
                <ul>
                    <li><strong>優化UI設計</strong>：全新的視覺設計和使用者介面</li>
                    <li><strong>增強動畫效果</strong>：更流暢的動畫和轉場效果</li>
                    <li><strong>改良的AI系統</strong>：基於 Minimax 演算法的智能 AI 對手</li>
                    <li><strong>多語言界面</strong>：支援繁體中文界面</li>
                    <li><strong>歡迎介面</strong>：提供友善的遊戲選擇界面</li>
                    <li><strong>關於頁面</strong>：包含專案介紹和規則說明</li>
                </ul>
                <h3>技術亮點</h3>
                <ul>
                    <li>採用模組化設計，程式碼更易維護</li>
                    <li>CSS Grid 和 Flexbox 打造響應式設計</li>
                    <li>JSON 配置檔案管理界面文字</li>
                    <li>優化的 Minimax 演算法實作</li>
                </ul>
                <div class="modal-actions">
                    <a href="reversi_new/index.html" class="btn btn-primary">
                        <i class="fas fa-play"></i>
                        開始遊戲
                    </a>
                </div>
            </div>
        `;
    } else if (gameType === 'english_learning') {
        content = `
            <h2><i class="fas fa-book"></i> 英語學習應用</h2>
            <div class="game-info-content">
                <h3>應用特色</h3>
                <ul>
                    <li><strong>多樣化學習模式</strong>：包含單詞測驗、配對遊戲、字義配對等</li>
                    <li><strong>Quizlet 複習模式</strong>：翻卡片式的單字複習系統</li>
                    <li><strong>即時反饋</strong>：立即顯示答案正確性</li>
                    <li><strong>基本統計</strong>：顯示總單字數和已學習數量</li>
                    <li><strong>個人化設定</strong>：自訂各種學習模式的顯示選項</li>
                </ul>
                <h3>學習功能</h3>
                <ul>
                    <li><strong>單詞測驗</strong>：選擇題形式的詞彙測驗</li>
                    <li><strong>配對遊戲</strong>：中英文單詞配對挑戰</li>
                    <li><strong>字義配對</strong>：英文單詞與定義配對</li>
                    <li><strong>詞彙瀏覽</strong>：系統化瀏覽和複習詞彙</li>
                    <li><strong>Quizlet 模式</strong>：卡片式單詞學習</li>
                </ul>
                <h3>技術實作</h3>
                <ul>
                    <li>使用 CSV 格式管理詞彙數據</li>
                    <li>本地儲存學習進度和設定</li>
                    <li>響應式設計支援多種設備</li>
                    <li>模組化 JavaScript 架構</li>
                </ul>
                <div class="modal-actions">
                    <a href="english_learning/index.html" class="btn btn-primary">
                        <i class="fas fa-book-open"></i>
                        開始學習
                    </a>
                </div>
            </div>
        `;
    } else if (gameType === 'tictactoe') {
        content = `
            <h2><i class="fas fa-th"></i> 井字遊戲 (Tic-tac-toe)</h2>            <div class="game-info-content">
                <h3>遊戲特色</h3>
                <ul>
                    <li><strong>Minimax AI</strong>：採用經典的遊戲樹搜索演算法</li>
                    <li><strong>四種難度</strong>：簡單、普通、困難、不可能</li>
                    <li><strong>多種模式</strong>：支援人類 vs 人類、人類 vs AI、AI vs AI 模式</li>
                    <li><strong>智能優化</strong>：Alpha-Beta 剪枝提升 AI 計算效率</li>
                    <li><strong>視覺效果</strong>：流暢的移動動畫和勝利連線動畫</li>
                    <li><strong>數據持久化</strong>：自動保存遊戲設定</li>
                </ul>
                <h3>技術亮點</h3>
                <ul>
                    <li>純原生 JavaScript 實現，無外部依賴</li>
                    <li>模組化架構設計</li>
                    <li>響應式設計，支援各種設備</li>
                    <li>現代化卡片式 UI 設計</li>
                    <li>Local Storage 數據持久化</li>
                </ul>                <h3>AI 難度等級</h3>
                <ul>
                    <li><strong>簡單</strong>：隨機移動，適合初學者練習</li>
                    <li><strong>普通</strong>：基礎策略，會阻止玩家獲勝</li>
                    <li><strong>困難</strong>：進階策略，主動尋求獲勝機會</li>
                    <li><strong>不可能</strong>：完整 Minimax 算法，理論上不會犯錯</li>
                </ul>
                <div class="modal-actions">
                    <a href="tic_tac_toe/index.html" class="btn btn-primary">
                        <i class="fas fa-play"></i>
                        開始遊戲
                    </a>
                </div>
            </div>
        `;
    }

    modalContent.innerHTML = content;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Modal Event Listeners
closeBtn?.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.game-card, .stat-card, .tech-category');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Stats counter animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = stat.textContent.replace('%', '');
        const isPercentage = stat.textContent.includes('%');
        let current = 0;
        const increment = target / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            stat.textContent = Math.floor(current) + (isPercentage ? '%' : '');
        }, 40);
    });
}

// Trigger stats animation when section is visible
const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// Floating particles effect (optional enhancement)
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat ${5 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
        `;
        hero.appendChild(particle);
    }
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-1000px) rotate(720deg);
            opacity: 0;
        }
    }
    
    .progress-bar {
        background: #e9ecef;
        border-radius: 10px;
        height: 10px;
        margin: 1rem 0;
        overflow: hidden;
    }
    
    .progress {
        background: linear-gradient(45deg, #667eea, #764ba2);
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }
    
    .game-info-content h3 {
        color: #667eea;
        margin: 1.5rem 0 1rem 0;
        font-size: 1.2rem;
    }
    
    .game-info-content ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    
    .game-info-content li {
        margin: 0.5rem 0;
        line-height: 1.6;
    }
    
    .modal-actions {
        margin-top: 2rem;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Initialize particles effect
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

// Add loading states for better UX
function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 載入中...';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1000);
}

// Add click handlers for play buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-play')) {
        showLoading(e.target.closest('.btn-play'));
    }
});

console.log('🎮 AI 智能平台主頁已載入完成！');
console.log('🤖 使用 GitHub Copilot 開發');
console.log('🎯 人工智慧導論期末專案');

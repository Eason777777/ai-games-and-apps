// 遊戲存儲管理器
class GameStorage {
    constructor() {
        this.storageKey = 'ticTacToeGame';
        this.statsKey = 'ticTacToeStats';
        this.settingsKey = 'ticTacToeSettings';
    }

    // 保存遊戲狀態
    saveGameState(gameState) {
        try {
            const data = {
                board: gameState.board,
                currentPlayer: gameState.currentPlayer,
                gameMode: gameState.gameMode,
                playerSymbol: gameState.playerSymbol,
                aiDifficulty: gameState.aiDifficulty,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存遊戲狀態失敗:', e);
            return false;
        }
    }

    // 載入遊戲狀態
    loadGameState() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;

            const gameState = JSON.parse(data);

            // 檢查數據是否過期（24小時）
            if (Date.now() - gameState.timestamp > 24 * 60 * 60 * 1000) {
                this.clearGameState();
                return null;
            }

            return gameState;
        } catch (e) {
            console.error('載入遊戲狀態失敗:', e);
            return null;
        }
    }

    // 清除遊戲狀態
    clearGameState() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (e) {
            console.error('清除遊戲狀態失敗:', e);
            return false;
        }
    }

    // 保存遊戲統計
    saveStats(stats) {
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('保存統計數據失敗:', e);
            return false;
        }
    }

    // 載入遊戲統計
    loadStats() {
        try {
            const data = localStorage.getItem(this.statsKey);
            if (!data) {
                return this.getDefaultStats();
            }

            return { ...this.getDefaultStats(), ...JSON.parse(data) };
        } catch (e) {
            console.error('載入統計數據失敗:', e);
            return this.getDefaultStats();
        }
    }

    // 獲取預設統計數據
    getDefaultStats() {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            gamesDraw: 0,
            winStreak: 0,
            bestWinStreak: 0,
            totalPlayTime: 0,
            averageGameTime: 0,
            aiWins: {
                easy: 0,
                medium: 0,
                hard: 0,
                impossible: 0
            },
            aiLosses: {
                easy: 0,
                medium: 0,
                hard: 0,
                impossible: 0
            }
        };
    }

    // 更新統計數據
    updateStats(result, difficulty = null, gameTime = 0) {
        const stats = this.loadStats();

        stats.gamesPlayed++;
        stats.totalPlayTime += gameTime;
        stats.averageGameTime = stats.totalPlayTime / stats.gamesPlayed;

        switch (result) {
            case 'win':
                stats.gamesWon++;
                stats.winStreak++;
                stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.winStreak);
                if (difficulty) {
                    stats.aiWins[difficulty] = (stats.aiWins[difficulty] || 0) + 1;
                }
                break;
            case 'lose':
                stats.gamesLost++;
                stats.winStreak = 0;
                if (difficulty) {
                    stats.aiLosses[difficulty] = (stats.aiLosses[difficulty] || 0) + 1;
                }
                break;
            case 'draw':
                stats.gamesDraw++;
                stats.winStreak = 0;
                break;
        }

        this.saveStats(stats);
        return stats;
    }

    // 重置統計數據
    resetStats() {
        const defaultStats = this.getDefaultStats();
        this.saveStats(defaultStats);
        return defaultStats;
    }

    // 保存設置
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('保存設置失敗:', e);
            return false;
        }
    }

    // 載入設置
    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            if (!data) {
                return this.getDefaultSettings();
            }

            return { ...this.getDefaultSettings(), ...JSON.parse(data) };
        } catch (e) {
            console.error('載入設置失敗:', e);
            return this.getDefaultSettings();
        }
    }

    // 獲取預設設置
    getDefaultSettings() {
        return {
            soundEnabled: true,
            animationsEnabled: true,
            autoSave: true,
            theme: 'default',
            showHints: true,
            aiThinkingTime: 1000,
            language: 'zh-TW'
        };
    }

    // 更新設置
    updateSetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        this.saveSettings(settings);
        return settings;
    }

    // 保存遊戲歷史
    saveGameHistory(gameData) {
        try {
            const historyKey = 'ticTacToeHistory';
            let history = JSON.parse(localStorage.getItem(historyKey) || '[]');

            history.unshift({
                ...gameData,
                timestamp: Date.now(),
                id: Date.now().toString()
            });

            // 只保留最近100場遊戲
            if (history.length > 100) {
                history = history.slice(0, 100);
            }

            localStorage.setItem(historyKey, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('保存遊戲歷史失敗:', e);
            return false;
        }
    }

    // 載入遊戲歷史
    loadGameHistory() {
        try {
            const historyKey = 'ticTacToeHistory';
            const data = localStorage.getItem(historyKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('載入遊戲歷史失敗:', e);
            return [];
        }
    }

    // 清除遊戲歷史
    clearGameHistory() {
        try {
            localStorage.removeItem('ticTacToeHistory');
            return true;
        } catch (e) {
            console.error('清除遊戲歷史失敗:', e);
            return false;
        }
    }

    // 導出數據
    exportData() {
        try {
            const data = {
                stats: this.loadStats(),
                settings: this.loadSettings(),
                history: this.loadGameHistory(),
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tic-tac-toe-data-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (e) {
            console.error('導出數據失敗:', e);
            return false;
        }
    }

    // 導入數據
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.stats) this.saveStats(data.stats);
                    if (data.settings) this.saveSettings(data.settings);
                    if (data.history) {
                        localStorage.setItem('ticTacToeHistory', JSON.stringify(data.history));
                    }

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('讀取文件失敗'));
            reader.readAsText(file);
        });
    }

    // 檢查存儲空間
    checkStorageSpace() {
        try {
            const test = 'storageTest';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 獲取存儲使用情況
    getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.includes('ticTacToe')) {
                    total += localStorage[key].length;
                }
            }
            return {
                used: total,
                available: 5 * 1024 * 1024 - total, // 假設 5MB 限制
                percentage: (total / (5 * 1024 * 1024)) * 100
            };
        } catch (e) {
            return { used: 0, available: 0, percentage: 0 };
        }
    }
}

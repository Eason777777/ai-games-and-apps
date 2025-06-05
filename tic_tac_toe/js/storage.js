// 遊戲存儲管理器
class GameStorage {
    constructor() {
        this.statsKey = 'ticTacToeStats';
        this.settingsKey = 'ticTacToeSettings';
        this.historyKey = 'ticTacToeHistory';
    }

    // 記錄遊戲結果
    saveGameResult(gameData) {
        try {
            // 更新統計數據
            this.updateStats(gameData);
            // 保存到歷史記錄
            const gameRecord = {
                date: new Date().toISOString(),
                mode: gameData.mode,
                result: gameData.result,
                winner: gameData.winner,
                difficulty: gameData.difficulty,
                gameTime: gameData.gameTime,
                playerSymbol: gameData.playerSymbol,
                timestamp: Date.now()
            };

            const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
            history.unshift(gameRecord);

            // 只保留最近50場遊戲記錄
            if (history.length > 50) {
                history.splice(50);
            }

            localStorage.setItem(this.historyKey, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('保存遊戲記錄失敗:', e);
            return false;
        }
    }    // 獲取遊戲歷史記錄
    getGameHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
        } catch (e) {
            console.error('載入遊戲歷史失敗:', e);
            return [];
        }
    }

    // 清除遊戲歷史
    clearGameHistory() {
        try {
            localStorage.removeItem(this.historyKey);
            return true;
        } catch (e) {
            console.error('清除遊戲歷史失敗:', e);
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
    }    // 獲取預設統計數據
    getDefaultStats() {
        return {
            // 按模式分類統計
            humanVsHuman: {
                gamesPlayed: 0,
                xWins: 0,
                oWins: 0,
                draws: 0
            },
            humanVsAI: {
                gamesPlayed: 0,
                humanWins: 0,
                aiWins: 0,
                draws: 0,
                // 按AI難度分類
                byDifficulty: {
                    easy: { wins: 0, losses: 0, draws: 0 },
                    medium: { wins: 0, losses: 0, draws: 0 },
                    hard: { wins: 0, losses: 0, draws: 0 },
                    impossible: { wins: 0, losses: 0, draws: 0 }
                }
            },
            aiVsAI: {
                gamesPlayed: 0,
                xWins: 0,
                oWins: 0,
                draws: 0
            }
        };
    }    // 更新統計數據
    updateStats(gameData) {
        const stats = this.loadStats();
        const { result, mode, difficulty = null, winner = null } = gameData;

        // 按遊戲模式更新統計
        switch (mode) {
            case 'human-vs-human':
                stats.humanVsHuman.gamesPlayed++;
                if (result === 'draw') {
                    stats.humanVsHuman.draws++;
                } else if (winner === 'X') {
                    stats.humanVsHuman.xWins++;
                } else if (winner === 'O') {
                    stats.humanVsHuman.oWins++;
                }
                break;

            case 'human-vs-ai':
                stats.humanVsAI.gamesPlayed++;
                if (result === 'draw') {
                    stats.humanVsAI.draws++;
                    if (difficulty) {
                        stats.humanVsAI.byDifficulty[difficulty].draws++;
                    }
                } else if (result === 'win') {
                    stats.humanVsAI.humanWins++;
                    if (difficulty) {
                        stats.humanVsAI.byDifficulty[difficulty].wins++;
                    }
                } else if (result === 'lose') {
                    stats.humanVsAI.aiWins++;
                    if (difficulty) {
                        stats.humanVsAI.byDifficulty[difficulty].losses++;
                    }
                }
                break;

            case 'ai-vs-ai':
                stats.aiVsAI.gamesPlayed++;
                if (result === 'draw') {
                    stats.aiVsAI.draws++;
                } else if (winner === 'X') {
                    stats.aiVsAI.xWins++;
                } else if (winner === 'O') {
                    stats.aiVsAI.oWins++;
                }
                break;
        }

        this.saveStats(stats);
        return stats;
    }// 重置統計數據
    resetStats() {
        try {
            const defaultStats = this.getDefaultStats();
            localStorage.setItem(this.statsKey, JSON.stringify(defaultStats));
            return defaultStats;
        } catch (e) {
            console.error('重置統計數據失敗:', e);
            return this.getDefaultStats();
        }
    }

    // 清除所有數據
    clearAllData() {
        try {
            localStorage.removeItem(this.statsKey);
            localStorage.removeItem(this.historyKey);
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (e) {
            console.error('清除所有數據失敗:', e);
            return false;
        }
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
    }    // 獲取預設設置
    getDefaultSettings() {
        return {
            animationsEnabled: true,
            theme: 'default',
            showHints: true,
            aiThinkingTime: 1000,
            language: 'zh-TW',
            lastPlayedMode: 'human-vs-ai',
            lastDifficulty: 'medium',
            lastPlayerSymbol: 'X'
        };
    }

    // 更新設置
    updateSetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        this.saveSettings(settings);
        return settings;
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
    }    // 獲取存儲使用情況
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
    }    // 格式化統計數據供顯示使用
    getFormattedStats() {
        const stats = this.loadStats();

        return {
            // 人類 vs 人類模式統計
            hvh: {
                games: stats.humanVsHuman.gamesPlayed,
                xWins: stats.humanVsHuman.xWins,
                oWins: stats.humanVsHuman.oWins,
                draws: stats.humanVsHuman.draws
            },

            // 人類 vs AI模式統計  
            hva: {
                games: stats.humanVsAI.gamesPlayed,
                wins: stats.humanVsAI.humanWins,
                losses: stats.humanVsAI.aiWins,
                draws: stats.humanVsAI.draws,
                winRate: stats.humanVsAI.gamesPlayed > 0 ?
                    ((stats.humanVsAI.humanWins / stats.humanVsAI.gamesPlayed) * 100).toFixed(1) : '0.0',
                difficulties: stats.humanVsAI.byDifficulty
            },

            // AI vs AI模式統計
            ava: {
                games: stats.aiVsAI.gamesPlayed,
                xWins: stats.aiVsAI.xWins,
                oWins: stats.aiVsAI.oWins,
                draws: stats.aiVsAI.draws
            }
        };
    }
}

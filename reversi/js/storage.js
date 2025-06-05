class GameStorage {
    constructor() {
        this.storageKey = 'reversiGameSave';
    }

    saveGame(gameState) {
        try {
            // 格式化日期時間
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            // 建立有時間標記的存檔資料
            const saveData = {
                ...gameState,
                savedAt: dateStr,
                timestamp: now.getTime()
            };

            // 獲取之前的存檔列表
            const saves = this.getSavedGames() || [];

            // 添加新存檔 (最多保留5個)
            saves.unshift(saveData);
            if (saves.length > 5) {
                saves.pop();
            }

            // 保存到localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
            return true;
        } catch (error) {
            console.error('保存遊戲失敗:', error);
            return false;
        }
    }

    getSavedGames() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : [];
        } catch (error) {
            console.error('讀取遊戲存檔失敗:', error);
            return [];
        }
    }

    loadGame(index = 0) {
        const saves = this.getSavedGames();
        if (saves.length > index) {
            return saves[index];
        }
        return null;
    }

    deleteSave(index) {
        try {
            const saves = this.getSavedGames();
            if (saves.length > index) {
                saves.splice(index, 1);
                localStorage.setItem(this.storageKey, JSON.stringify(saves));
                return true;
            }
            return false;
        } catch (error) {
            console.error('刪除存檔失敗:', error);
            return false;
        }
    }

    clearAllSaves() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('清除所有存檔失敗:', error);
            return false;
        }
    }
}

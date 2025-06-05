class AudioManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;

        // 預加載音效
        this.loadSounds();

        // 初始從localStorage讀取音效設置
        this.loadSettings();
    } loadSounds() {
        // 棋子放置音效
        this.sounds.place = new Audio('./audio/place.mp3');

        // 棋子翻轉音效
        this.sounds.flip = new Audio('./audio/flip.mp3');

        // 遊戲勝利音效
        this.sounds.win = new Audio('./audio/win.mp3');

        // 遊戲結束音效
        this.sounds.gameOver = new Audio('./audio/game_over.mp3');

        // 無效移動音效
        this.sounds.invalid = new Audio('./audio/invalid.mp3');

        // 悔棋音效
        this.sounds.undo = new Audio('./audio/undo.mp3');

        // 設置所有音效音量
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
        });
    }

    loadSettings() {
        // 從localStorage讀取靜音設置
        const savedMuteState = localStorage.getItem('reversiSoundMuted');
        if (savedMuteState !== null) {
            this.isMuted = JSON.parse(savedMuteState);

            // 更新UI
            const muteButton = document.getElementById('mute-button');
            if (muteButton) {
                muteButton.innerText = this.isMuted ? '🔇 音效：關' : '🔊 音效：開';
            }
        }
    }

    saveSettings() {
        // 保存靜音設置到localStorage
        localStorage.setItem('reversiSoundMuted', JSON.stringify(this.isMuted));
    }

    play(soundName) {
        // 如果靜音，則不播放音效
        if (this.isMuted) return;

        const sound = this.sounds[soundName];
        if (sound) {
            // 重置音效，使其可以連續播放
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn(`無法播放音效 ${soundName}: ${error.message}`);
            });
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveSettings();

        // 更新按鈕文字
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.innerText = this.isMuted ? '🔇 音效：關' : '🔊 音效：開';
        }

        return this.isMuted;
    }

    setVolume(volume) {
        // 設置所有音效的音量 (0.0 - 1.0)
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }
}

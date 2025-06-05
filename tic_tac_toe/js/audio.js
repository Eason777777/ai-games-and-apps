// 音效管理器
class AudioManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.initializeSounds();
    }

    // 初始化音效
    initializeSounds() {
        // 使用 Web Audio API 生成音效
        this.audioContext = null;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支援，音效功能將被禁用');
            this.enabled = false;
            return;
        }

        // 創建各種音效
        this.createSounds();
    }

    // 創建音效
    createSounds() {
        // 棋子放置音效
        this.sounds.place = () => this.createTone(800, 0.1, 'sine');

        // 勝利音效
        this.sounds.win = () => this.createMelody([
            { freq: 523, duration: 0.2 },
            { freq: 659, duration: 0.2 },
            { freq: 784, duration: 0.3 }
        ]);

        // 平局音效
        this.sounds.draw = () => this.createTone(300, 0.5, 'sawtooth');

        // 錯誤音效
        this.sounds.error = () => this.createTone(200, 0.2, 'square');

        // 按鈕點擊音效
        this.sounds.click = () => this.createTone(1000, 0.05, 'sine');

        // AI 思考音效
        this.sounds.thinking = () => this.createTone(400, 0.1, 'triangle');

        // 新遊戲音效
        this.sounds.newGame = () => this.createMelody([
            { freq: 440, duration: 0.1 },
            { freq: 523, duration: 0.1 },
            { freq: 659, duration: 0.2 }
        ]);
    }

    // 創建單音調音效
    createTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            // 音量包絡
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('音效播放失敗:', e);
        }
    }

    // 創建旋律
    createMelody(notes) {
        if (!this.enabled || !this.audioContext) return;

        let currentTime = this.audioContext.currentTime;

        notes.forEach(note => {
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(note.freq, currentTime);
                oscillator.type = 'sine';

                // 音量包絡
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);

                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration);

                currentTime += note.duration;
            } catch (e) {
                console.warn('旋律播放失敗:', e);
            }
        });
    }

    // 播放音效
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;

        // 確保 AudioContext 處於活動狀態
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.sounds[soundName]();
    }

    // 切換音效開關
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 設置音效開關
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // 獲取音效狀態
    isEnabled() {
        return this.enabled;
    }

    // 播放棋子放置音效
    playPlace() {
        this.play('place');
    }

    // 播放勝利音效
    playWin() {
        this.play('win');
    }

    // 播放平局音效
    playDraw() {
        this.play('draw');
    }

    // 播放錯誤音效
    playError() {
        this.play('error');
    }

    // 播放按鈕點擊音效
    playClick() {
        this.play('click');
    }

    // 播放 AI 思考音效
    playThinking() {
        this.play('thinking');
    }

    // 播放新遊戲音效
    playNewGame() {
        this.play('newGame');
    }

    // 初始化用戶互動（解決 Chrome 自動播放限制）
    initUserInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 釋放資源
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.sounds = {};
    }
}

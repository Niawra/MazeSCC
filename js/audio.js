// Audio System for MAZE RUN using Web Audio API
// Completely self-contained, no external audio files required!

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('maze_run_muted') === 'true';
        this.musicEnabled = localStorage.getItem('maze_run_music') === 'true';
        this.musicInterval = null;
        this.currentTrackNote = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('maze_run_muted', this.muted);
        if (this.muted && this.musicInterval) {
            this.stopMusic();
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // Play a single 8-bit tone
    playTone(freq, type = 'square', duration = 0.08, volume = 0.15, slideTo = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio playTone error", e);
        }
    }

    // 8-bit footstep sound
    playStep() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        // Soft click/blip
        this.playTone(180 + Math.random() * 40, 'triangle', 0.04, 0.08, 90);
    }

    // Wall bump sound
    playBump() {
        if (this.muted) return;
        this.init();
        this.playTone(90, 'square', 0.06, 0.1, 40);
    }

    // Key collected arpeggio
    playKey() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'square', 0.1, 0.18);
            }, idx * 70);
        });
    }

    // Exit unlocked chime
    playUnlock() {
        if (this.muted) return;
        this.init();
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.15, 0.2);
            }, idx * 90);
        });
    }

    // Level complete victory jingle
    playLevelComplete() {
        if (this.muted) return;
        this.init();
        const notes = [
            { f: 523.25, d: 100 }, // C5
            { f: 659.25, d: 100 }, // E5
            { f: 783.99, d: 100 }, // G5
            { f: 1046.50, d: 250 } // C6
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, 'triangle', n.d / 1000, 0.25);
            }, delay);
            delay += n.d + 30;
        });
    }

    // Grand game victory fanfare
    playVictory() {
        if (this.muted) return;
        this.init();
        const melody = [
            { f: 523.25, d: 120 }, // C5
            { f: 523.25, d: 120 }, // C5
            { f: 523.25, d: 120 }, // C5
            { f: 659.25, d: 250 }, // E5
            { f: 587.33, d: 120 }, // D5
            { f: 659.25, d: 120 }, // E5
            { f: 783.99, d: 400 }  // G5
        ];
        let delay = 0;
        melody.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, 'square', n.d / 1000, 0.22);
            }, delay);
            delay += n.d + 40;
        });
    }

    // Monster hit / reset ouch sound
    playMonsterHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        // Harsh downward zap
        this.playTone(320, 'sawtooth', 0.25, 0.25, 60);
        setTimeout(() => {
            this.playTone(150, 'sawtooth', 0.15, 0.2, 40);
        }, 120);
    }

    // Hint sparkle chime
    playHint() {
        if (this.muted) return;
        this.init();
        const notes = [880, 1174.66, 1396.91, 1760]; // A5, D6, F6, A6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sine', 0.08, 0.15);
            }, idx * 60);
        });
    }

    // UI Click blip
    playClick() {
        if (this.muted) return;
        this.init();
        this.playTone(480, 'square', 0.04, 0.12, 600);
    }
}

// Global audio instance
const sounds = new SoundManager();

// MAZE RUN — Main Game Engine
// Dual-Map Architecture (Cyber Labyrinth & Shadow Labyrinth) with 6 Progressive Levels
// Pairs HTML5 Canvas rendering with crisp grid logic, procedural generation, audio, and responsive touch controls.

class MazeRunGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // State & Navigation
        this.state = 'START'; // 'START', 'SELECT', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'VICTORY'
        this.currentMapId = 'cyber'; // 'cyber' or 'shadow'
        this.currentLevelNumber = 1; // 1, 2, or 3
        this.selectedTabMapId = 'cyber';

        this.level = null;
        this.grid = [];
        this.width = 0;
        this.height = 0;
        this.tileSize = 32;

        // Entities
        this.player = {
            gridX: 0,
            gridY: 0,
            renderX: 0,
            renderY: 0,
            targetX: 0,
            targetY: 0,
            isMoving: false,
            moveProgress: 0,
            dir: 'down',
            walkPhase: 0,
            invulnerableTimer: 0
        };

        this.key = { x: 0, y: 0 };
        this.exit = { x: 0, y: 0 };
        this.hasKey = false;
        this.monsters = [];

        // Input buffering
        this.queuedDirection = null;
        this.currentKeyHeld = null;

        // Gameplay metrics
        this.steps = 0;
        this.hintsRemaining = 3;
        this.hintPath = null;
        this.hintTimer = 0;
        this.elapsedTime = 0;
        this.lastFrameTime = performance.now();
        this.isTimerRunning = false;

        // Overall Campaign Stats for current run
        this.levelResults = [];
        this.totalScore = 0;

        // Visual effects
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;
        this.flashTimer = 0;
        this.particles = [];
        this.toastTimer = 0;

        // Mobile touch tracking
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Animation frame handle
        this.rafId = null;

        this.initDOM();
        this.bindEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start render loop
        this.loop = this.loop.bind(this);
        this.rafId = requestAnimationFrame(this.loop);
    }

    initDOM() {
        // UI Elements
        this.dom = {
            screenStart: document.getElementById('screen-start'),
            screenSelect: document.getElementById('screen-select'),
            screenGame: document.getElementById('screen-game'),
            modalHowToPlay: document.getElementById('modal-how-to-play'),
            modalPause: document.getElementById('modal-pause'),
            modalLevelComplete: document.getElementById('modal-level-complete'),
            modalVictory: document.getElementById('modal-victory'),
            toast: document.getElementById('toast'),

            // Select Screen elements
            tabCyber: document.getElementById('tab-map-cyber'),
            tabShadow: document.getElementById('tab-map-shadow'),
            tabCyberStars: document.getElementById('tab-cyber-stars'),
            tabShadowStars: document.getElementById('tab-shadow-stars'),
            mapBannerTitle: document.getElementById('map-banner-title'),
            mapBannerDesc: document.getElementById('map-banner-desc'),
            bannerProgress: document.getElementById('banner-progress'),
            bannerScore: document.getElementById('banner-score'),
            levelCardsContainer: document.getElementById('level-cards-container'),
            btnSelectBack: document.getElementById('btn-select-back'),
            btnResetProgress: document.getElementById('btn-reset-progress'),

            // HUD
            hudLevelTitle: document.getElementById('hud-level-title'),
            hudTimer: document.getElementById('hud-timer'),
            hudSteps: document.getElementById('hud-steps'),
            hudKey: document.getElementById('hud-key'),
            hudExit: document.getElementById('hud-exit'),
            btnHint: document.getElementById('btn-hint'),
            btnPause: document.getElementById('btn-pause'),
            btnRestart: document.getElementById('btn-restart'),
            btnHudMap: document.getElementById('btn-hud-map'),
            btnMute: document.getElementById('btn-mute'),

            // Victory modal elements
            victorySubtitle: document.getElementById('victory-subtitle'),
            victoryNextMapCallout: document.getElementById('victory-next-map-callout'),

            // D-Pad buttons
            dpadUp: document.getElementById('dpad-up'),
            dpadDown: document.getElementById('dpad-down'),
            dpadLeft: document.getElementById('dpad-left'),
            dpadRight: document.getElementById('dpad-right')
        };

        this.updateMuteButtonUI();
    }

    bindEvents() {
        // Start Game -> Open Map Select
        document.getElementById('btn-start-game').addEventListener('click', () => {
            sounds.playClick();
            this.showMapSelectScreen(this.currentMapId);
        });

        // How to Play modal
        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalHowToPlay.classList.remove('hidden');
        });
        document.getElementById('btn-close-how-to-play').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalHowToPlay.classList.add('hidden');
        });

        // Map Select Screen
        if (this.dom.btnSelectBack) {
            this.dom.btnSelectBack.addEventListener('click', () => {
                sounds.playClick();
                this.showStartScreen();
            });
        }
        if (this.dom.tabCyber) {
            this.dom.tabCyber.addEventListener('click', () => {
                sounds.playClick();
                this.renderSelectScreen('cyber');
            });
        }
        if (this.dom.tabShadow) {
            this.dom.tabShadow.addEventListener('click', () => {
                sounds.playClick();
                this.renderSelectScreen('shadow');
            });
        }
        if (this.dom.btnResetProgress) {
            this.dom.btnResetProgress.addEventListener('click', () => {
                if (confirm("Reset all stars, times, and records for both maps?")) {
                    sounds.playClick();
                    ProgressionManager.resetProgress();
                    this.renderSelectScreen(this.selectedTabMapId);
                    this.showToast("Progress Reset!", 1500);
                }
            });
        }

        // HUD Buttons
        this.dom.btnHint.addEventListener('click', () => this.triggerHint());
        this.dom.btnRestart.addEventListener('click', () => this.restartLevel(true));
        this.dom.btnPause.addEventListener('click', () => this.togglePause());
        if (this.dom.btnHudMap) {
            this.dom.btnHudMap.addEventListener('click', () => {
                sounds.playClick();
                this.showMapSelectScreen(this.currentMapId);
            });
        }
        this.dom.btnMute.addEventListener('click', () => this.toggleMute());

        // Pause Modal
        document.getElementById('btn-resume').addEventListener('click', () => {
            sounds.playClick();
            this.togglePause();
        });
        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalPause.classList.add('hidden');
            this.restartLevel(true);
        });
        const btnPauseNew = document.getElementById('btn-pause-new-maze');
        if (btnPauseNew) {
            btnPauseNew.addEventListener('click', () => {
                sounds.playClick();
                this.dom.modalPause.classList.add('hidden');
                this.restartLevel(true);
            });
        }
        const btnPauseMap = document.getElementById('btn-pause-map-select');
        if (btnPauseMap) {
            btnPauseMap.addEventListener('click', () => {
                sounds.playClick();
                this.dom.modalPause.classList.add('hidden');
                this.showMapSelectScreen(this.currentMapId);
            });
        }
        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalPause.classList.add('hidden');
            this.showStartScreen();
        });

        // Level Complete Modal
        document.getElementById('btn-next-level').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalLevelComplete.classList.add('hidden');
            this.nextLevel();
        });
        const btnCompleteMap = document.getElementById('btn-complete-map-select');
        if (btnCompleteMap) {
            btnCompleteMap.addEventListener('click', () => {
                sounds.playClick();
                this.dom.modalLevelComplete.classList.add('hidden');
                this.showMapSelectScreen(this.currentMapId);
            });
        }

        // Victory Modal
        document.getElementById('btn-play-again').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalVictory.classList.add('hidden');
            this.startMapLevel(this.currentMapId, 1, true);
        });
        const btnVictoryMap = document.getElementById('btn-victory-map-select');
        if (btnVictoryMap) {
            btnVictoryMap.addEventListener('click', () => {
                sounds.playClick();
                this.dom.modalVictory.classList.add('hidden');
                this.showMapSelectScreen(this.currentMapId);
            });
        }
        document.getElementById('btn-victory-menu').addEventListener('click', () => {
            sounds.playClick();
            this.dom.modalVictory.classList.add('hidden');
            this.showStartScreen();
        });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch D-Pad Controls
        const setupDpadButton = (btn, dir) => {
            if (!btn) return;
            const handlePress = (e) => {
                e.preventDefault();
                sounds.init();
                btn.classList.add('pressed');
                this.requestMove(dir);
                if (navigator.vibrate) navigator.vibrate(15);
            };
            const handleRelease = (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
                if (this.currentKeyHeld === dir) {
                    this.currentKeyHeld = null;
                }
            };
            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('touchend', handleRelease, { passive: false });
            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('mouseup', handleRelease);
            btn.addEventListener('mouseleave', handleRelease);
        };

        setupDpadButton(this.dom.dpadUp, 'up');
        setupDpadButton(this.dom.dpadDown, 'down');
        setupDpadButton(this.dom.dpadLeft, 'left');
        setupDpadButton(this.dom.dpadRight, 'right');

        // Touch Swipe gestures on Canvas
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const diffX = e.changedTouches[0].clientX - this.touchStartX;
                const diffY = e.changedTouches[0].clientY - this.touchStartY;
                const minSwipe = 25;

                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (Math.abs(diffX) > minSwipe) {
                        this.requestMove(diffX > 0 ? 'right' : 'left');
                    }
                } else {
                    if (Math.abs(diffY) > minSwipe) {
                        this.requestMove(diffY > 0 ? 'down' : 'up');
                    }
                }
            }
        }, { passive: true });
    }

    handleKeyDown(e) {
        // Prevent default scrolling for game keys
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyH', 'KeyP', 'KeyR', 'KeyM', 'Escape', 'Space'];
        if (gameKeys.includes(e.code)) {
            e.preventDefault();
        }

        sounds.init();

        if (this.state === 'PLAYING') {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.currentKeyHeld = 'up';
                    this.requestMove('up');
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.currentKeyHeld = 'down';
                    this.requestMove('down');
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.currentKeyHeld = 'left';
                    this.requestMove('left');
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.currentKeyHeld = 'right';
                    this.requestMove('right');
                    break;
                case 'KeyH':
                    this.triggerHint();
                    break;
                case 'KeyR':
                    this.restartLevel(true);
                    break;
                case 'KeyM':
                    this.showMapSelectScreen(this.currentMapId);
                    break;
                case 'KeyP':
                case 'Escape':
                    this.togglePause();
                    break;
            }
        } else if (this.state === 'PAUSED') {
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            }
        }
    }

    handleKeyUp(e) {
        const keyDirMap = {
            'ArrowUp': 'up', 'KeyW': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left',
            'ArrowRight': 'right', 'KeyD': 'right'
        };
        const dir = keyDirMap[e.code];
        if (dir && this.currentKeyHeld === dir) {
            this.currentKeyHeld = null;
        }
    }

    toggleMute() {
        sounds.toggleMute();
        this.updateMuteButtonUI();
    }

    updateMuteButtonUI() {
        if (sounds.isMuted()) {
            this.dom.btnMute.innerHTML = '🔇 <span class="btn-label">Muted</span>';
            this.dom.btnMute.classList.add('muted');
        } else {
            this.dom.btnMute.innerHTML = '🔊 <span class="btn-label">Sound</span>';
            this.dom.btnMute.classList.remove('muted');
        }
    }

    showStartScreen() {
        this.state = 'START';
        this.isTimerRunning = false;
        this.dom.screenStart.classList.remove('hidden');
        if (this.dom.screenSelect) this.dom.screenSelect.classList.add('hidden');
        this.dom.screenGame.classList.add('hidden');
    }

    showMapSelectScreen(mapId = null) {
        this.state = 'SELECT';
        this.isTimerRunning = false;
        this.dom.screenStart.classList.add('hidden');
        if (this.dom.screenSelect) this.dom.screenSelect.classList.remove('hidden');
        this.dom.screenGame.classList.add('hidden');
        this.dom.modalPause.classList.add('hidden');
        this.dom.modalLevelComplete.classList.add('hidden');
        this.dom.modalVictory.classList.add('hidden');

        this.renderSelectScreen(mapId || this.currentMapId);
    }

    renderSelectScreen(activeMapId = 'cyber') {
        this.selectedTabMapId = activeMapId;

        // Update active tab buttons
        if (this.dom.tabCyber && this.dom.tabShadow) {
            this.dom.tabCyber.classList.toggle('active', activeMapId === 'cyber');
            this.dom.tabShadow.classList.toggle('active', activeMapId === 'shadow');

            const cyberStats = ProgressionManager.getMapStats('cyber');
            const shadowStats = ProgressionManager.getMapStats('shadow');

            this.dom.tabCyberStars.innerText = '★'.repeat(cyberStats.totalStars) + '☆'.repeat(Math.max(0, 9 - cyberStats.totalStars));
            this.dom.tabShadowStars.innerText = '★'.repeat(shadowStats.totalStars) + '☆'.repeat(Math.max(0, 9 - shadowStats.totalStars));
        }

        const mapDef = MAP_DEFINITIONS[activeMapId] || MAP_DEFINITIONS.cyber;
        const mapStats = ProgressionManager.getMapStats(activeMapId);

        // Update Banner
        if (this.dom.mapBannerTitle) {
            this.dom.mapBannerTitle.innerText = `${mapDef.name.toUpperCase()}`;
            this.dom.mapBannerTitle.style.color = mapDef.accentColor;
            this.dom.mapBannerDesc.innerText = mapDef.description;
            this.dom.bannerProgress.innerText = `Completed: ${mapStats.completedCount}/3`;
            this.dom.bannerScore.innerText = `Score: ${mapStats.totalScore}`;
        }

        // Render Level Cards
        if (this.dom.levelCardsContainer) {
            this.dom.levelCardsContainer.innerHTML = '';

            const levelSpecs = [
                {
                    lvl: 1,
                    difficulty: "EASY",
                    size: "21x21 GRID",
                    monsters: "0 Sentry",
                    targets: "15+ Dead Ends • 15+ Junctions"
                },
                {
                    lvl: 2,
                    difficulty: "MEDIUM",
                    size: "27x27 GRID",
                    monsters: activeMapId === 'cyber' ? "1 Sentry (Grumble)" : "1 Sentry (Nightshade)",
                    targets: "30+ Dead Ends • 30+ Junctions"
                },
                {
                    lvl: 3,
                    difficulty: "EXTREME",
                    size: "35x35 GRID",
                    monsters: activeMapId === 'cyber' ? "2 Sentries (Spike, Phantom)" : "2 Sentries (Vortex, Specter)",
                    targets: "45+ Dead Ends • 50+ Junctions"
                }
            ];

            levelSpecs.forEach(spec => {
                const lvlNum = spec.lvl;
                const isUnlocked = ProgressionManager.isLevelUnlocked(activeMapId, lvlNum);
                const isCompleted = (mapStats.completedCount >= lvlNum);
                const starsCount = mapStats.stars[String(lvlNum)] || 0;
                const bestTime = mapStats.bestTimes[String(lvlNum)];
                const bestSteps = mapStats.bestSteps[String(lvlNum)];

                const card = document.createElement('div');
                card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} theme-${activeMapId}`;

                const header = document.createElement('div');
                header.className = 'level-card-header';
                header.innerHTML = `
                    <span class="level-num-badge">LEVEL ${lvlNum}</span>
                    <span class="badge ${isUnlocked ? (isCompleted ? 'badge-success' : 'badge-warning') : 'badge-danger'}">
                        ${isUnlocked ? (isCompleted ? '✓ COMPLETED' : 'UNLOCKED') : '🔒 LOCKED'}
                    </span>
                `;

                const body = document.createElement('div');
                body.className = 'level-card-body';
                body.innerHTML = `
                    <div class="level-card-title">${spec.difficulty} — ${spec.size}</div>
                    <div class="level-card-subtitle">👾 ${spec.monsters}</div>
                    <div class="level-specs">
                        <span class="spec-tag">${spec.targets}</span>
                    </div>
                    <div class="level-record-box">
                        <div class="record-stars">${'★'.repeat(starsCount)}${'☆'.repeat(3 - starsCount)}</div>
                        <div class="record-line">⏱️ Best Time: <span class="record-val">${bestTime ? this.formatTime(bestTime) : '--:--'}</span></div>
                        <div class="record-line">👟 Best Steps: <span class="record-val">${bestSteps !== undefined ? bestSteps : '--'}</span></div>
                    </div>
                `;

                const playBtn = document.createElement('button');
                playBtn.className = `btn btn-play-level ${isUnlocked ? (isCompleted ? 'btn-secondary' : 'btn-primary') : 'btn-outline'}`;
                playBtn.disabled = !isUnlocked;
                playBtn.innerHTML = isUnlocked
                    ? (isCompleted ? `🔄 REPLAY LEVEL ${lvlNum}` : `▶ PLAY LEVEL ${lvlNum}`)
                    : `🔒 LOCKED (Beat L${lvlNum - 1})`;

                if (isUnlocked) {
                    playBtn.addEventListener('click', () => {
                        sounds.playClick();
                        this.startMapLevel(activeMapId, lvlNum, true);
                    });
                }

                card.appendChild(header);
                card.appendChild(body);
                card.appendChild(playBtn);
                this.dom.levelCardsContainer.appendChild(card);
            });
        }
    }

    /**
     * Backward compatible startLevel
     */
    startLevel(index, newVariation = false) {
        this.startMapLevel('cyber', index + 1, newVariation);
    }

    /**
     * Primary level starter for both maps
     * @param {string} mapId ('cyber' or 'shadow')
     * @param {number} levelNumber (1, 2, or 3)
     * @param {boolean} newVariation
     */
    startMapLevel(mapId = 'cyber', levelNumber = 1, newVariation = false) {
        this.currentMapId = mapId;
        this.currentLevelNumber = levelNumber;

        this.level = getLevelDefinition(mapId, levelNumber, newVariation);
        if (!this.level) {
            console.error(`Failed to load level ${mapId} ${levelNumber}`);
            return;
        }

        if (levelNumber === 1) {
            this.levelResults = [];
            this.totalScore = 0;
        }

        this.dom.screenStart.classList.add('hidden');
        if (this.dom.screenSelect) this.dom.screenSelect.classList.add('hidden');
        this.dom.screenGame.classList.remove('hidden');
        this.dom.modalLevelComplete.classList.add('hidden');
        this.dom.modalVictory.classList.add('hidden');
        this.dom.modalPause.classList.add('hidden');

        this.setupLevel();
        this.state = 'PLAYING';
        this.isTimerRunning = true;
        this.lastFrameTime = performance.now();

        // Level intro toast
        this.showToast(`[${mapId.toUpperCase()}] ${this.level.instructions}`, 3500);
    }

    setupLevel() {
        const map = this.level.map;
        this.height = map.length;
        this.width = map[0].length;
        this.grid = [];

        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                const char = map[y][x];
                if (char === '#') {
                    row.push(1); // Wall
                } else {
                    row.push(0); // Floor
                    if (char === 'S') {
                        this.startPos = { x, y };
                        this.player.gridX = x;
                        this.player.gridY = y;
                        this.player.renderX = x;
                        this.player.renderY = y;
                        this.player.targetX = x;
                        this.player.targetY = y;
                        this.player.isMoving = false;
                        this.player.moveProgress = 0;
                        this.player.dir = 'down';
                        this.player.invulnerableTimer = 0;
                    } else if (char === 'K') {
                        this.key = { x, y };
                    } else if (char === 'E') {
                        this.exit = { x, y };
                    }
                }
            }
            this.grid.push(row);
        }

        this.hasKey = false;
        this.steps = 0;
        this.elapsedTime = 0;
        this.hintsRemaining = 3;
        this.hintPath = null;
        this.hintTimer = 0;
        this.queuedDirection = null;
        this.particles = [];

        // Monsters setup
        this.monsters = (this.level.monsters || []).map(m => ({
            ...m,
            wpIndex: 0,
            dir: 1, // 1 forward, -1 backward
            x: m.waypoints[0].x,
            y: m.waypoints[0].y,
            targetX: m.waypoints[0].x,
            targetY: m.waypoints[0].y,
            progress: 0
        }));

        this.updateHUD();
        this.resize();
    }

    restartLevel(newVariation = true) {
        sounds.playClick();
        if (newVariation) {
            this.level = getLevelDefinition(this.currentMapId, this.currentLevelNumber, true);
        }
        this.setupLevel();
        this.state = 'PLAYING';
        this.isTimerRunning = true;
        this.lastFrameTime = performance.now();
        this.showToast(newVariation ? "🎲 New Maze Generated!" : "Level Restarted!", 1800);
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.isTimerRunning = false;
            this.dom.modalPause.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.isTimerRunning = true;
            this.lastFrameTime = performance.now();
            this.dom.modalPause.classList.add('hidden');
        }
    }

    triggerHint() {
        if (this.state !== 'PLAYING') return;
        if (this.hintsRemaining <= 0) {
            this.showToast("No hints left for this level!", 1500);
            return;
        }

        const target = this.hasKey ? this.exit : this.key;
        const currentCoord = { x: this.player.gridX, y: this.player.gridY };
        const fullPath = Pathfinder.findPath(this.grid, this.width, this.height, currentCoord, target);

        if (!fullPath || fullPath.length <= 1) {
            this.showToast("You're already at the objective!", 1500);
            return;
        }

        // Highlight next 8-10 steps
        this.hintPath = fullPath.slice(1, 10);
        this.hintTimer = 5.0; // 5 seconds display
        this.hintsRemaining--;
        sounds.playHint();

        const targetName = this.hasKey ? "Exit Portal 🚪" : "Golden Key 🔑";
        this.showToast(`Hint activated: Route towards ${targetName}!`, 2000);
        this.updateHUD();
    }

    requestMove(dir) {
        if (this.state !== 'PLAYING') return;

        this.player.dir = dir;

        if (this.player.isMoving) {
            this.queuedDirection = dir;
            return;
        }

        const deltas = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 }
        };

        const { dx, dy } = deltas[dir];
        const nextX = this.player.gridX + dx;
        const nextY = this.player.gridY + dy;

        // Check bounds & wall
        if (nextX < 0 || nextX >= this.width || nextY < 0 || nextY >= this.height || this.grid[nextY][nextX] === 1) {
            sounds.playBump();
            this.shakeTimer = 0.08;
            this.shakeMagnitude = 2;
            return;
        }

        // Valid move
        this.player.isMoving = true;
        this.player.moveProgress = 0;
        this.player.targetX = nextX;
        this.player.targetY = nextY;
        this.steps++;
        sounds.playStep();
        this.updateHUD();
    }

    updatePlayerMovement(dt) {
        if (!this.player.isMoving) {
            if (this.queuedDirection) {
                const nextDir = this.queuedDirection;
                this.queuedDirection = null;
                this.requestMove(nextDir);
            } else if (this.currentKeyHeld) {
                this.requestMove(this.currentKeyHeld);
            }
            return;
        }

        const stepDuration = 0.11; // 110ms per tile step
        this.player.moveProgress += dt / stepDuration;
        this.player.walkPhase += dt * 10;

        if (this.player.moveProgress >= 1.0) {
            this.player.gridX = this.player.targetX;
            this.player.gridY = this.player.targetY;
            this.player.renderX = this.player.gridX;
            this.player.renderY = this.player.gridY;
            this.player.isMoving = false;
            this.player.moveProgress = 0;

            this.checkTileEvents();

            if (this.queuedDirection) {
                const nextDir = this.queuedDirection;
                this.queuedDirection = null;
                this.requestMove(nextDir);
            } else if (this.currentKeyHeld) {
                this.requestMove(this.currentKeyHeld);
            }
        } else {
            const p = this.player.moveProgress;
            this.player.renderX = this.player.gridX + (this.player.targetX - this.player.gridX) * p;
            this.player.renderY = this.player.gridY + (this.player.targetY - this.player.gridY) * p;
        }
    }

    checkTileEvents() {
        const px = this.player.gridX;
        const py = this.player.gridY;

        // Key collection
        if (!this.hasKey && px === this.key.x && py === this.key.y) {
            this.hasKey = true;
            sounds.playKey();
            this.showToast("🔑 Golden Key Collected! The Exit is Unlocked!", 2500);
            this.spawnSparkleParticles(px, py, 15, '#ffd700');
            this.updateHUD();
        }

        // Exit reached
        if (px === this.exit.x && py === this.exit.y) {
            if (this.hasKey) {
                this.completeLevel();
            } else {
                sounds.playBump();
                this.showToast("🚪 The Exit is Locked! Find the Key first!", 2000);
            }
        }
    }

    updateMonsters(dt) {
        for (const m of this.monsters) {
            const speed = m.speed || 1.6;
            m.progress += dt * speed;

            const currentWp = m.waypoints[m.wpIndex];
            const nextWpIndex = m.wpIndex + m.dir;
            const nextWp = m.waypoints[nextWpIndex];

            if (m.progress >= 1.0) {
                m.progress = 0;
                m.wpIndex = nextWpIndex;
                m.x = nextWp.x;
                m.y = nextWp.y;

                if (m.wpIndex >= m.waypoints.length - 1) {
                    m.dir = -1;
                } else if (m.wpIndex <= 0) {
                    m.dir = 1;
                }
            } else {
                m.x = currentWp.x + (nextWp.x - currentWp.x) * m.progress;
                m.y = currentWp.y + (nextWp.y - currentWp.y) * m.progress;
            }

            // Check collision with player
            if (this.player.invulnerableTimer <= 0) {
                const dist = Math.hypot(this.player.renderX - m.x, this.player.renderY - m.y);
                if (dist < 0.65) {
                    this.onMonsterHit(m);
                    break;
                }
            }
        }
    }

    onMonsterHit(monster) {
        sounds.playMonsterHit();
        this.shakeTimer = 0.35;
        this.shakeMagnitude = 8;
        this.flashTimer = 0.25;

        // Reset player to level start
        this.player.gridX = this.startPos.x;
        this.player.gridY = this.startPos.y;
        this.player.renderX = this.startPos.x;
        this.player.renderY = this.startPos.y;
        this.player.targetX = this.startPos.x;
        this.player.targetY = this.startPos.y;
        this.player.isMoving = false;
        this.player.moveProgress = 0;
        this.player.invulnerableTimer = 1.6;
        this.queuedDirection = null;

        this.spawnSparkleParticles(this.player.gridX, this.player.gridY, 12, '#ff3366');
        this.showToast(`Caught by ${monster.name}! Returned to Start! 👾`, 2500);
    }

    completeLevel() {
        this.state = 'LEVEL_COMPLETE';
        this.isTimerRunning = false;
        sounds.playLevelComplete();

        const levelTime = this.elapsedTime;
        const levelSteps = this.steps;
        const hintsUsed = 3 - this.hintsRemaining;

        // Score calculation
        const baseScore = 1000;
        const timeBonus = Math.max(0, Math.round((this.level.parTime - levelTime) * 25));
        const stepBonus = Math.max(0, Math.round((this.level.parSteps - levelSteps) * 15));
        const hintBonus = this.hintsRemaining * 100;
        const levelScore = baseScore + timeBonus + stepBonus + hintBonus;

        // Stars
        let stars = 1;
        if (levelTime <= this.level.parTime && levelSteps <= this.level.parSteps) {
            stars = 3;
        } else if (levelTime <= this.level.parTime * 1.5 || levelSteps <= this.level.parSteps * 1.5) {
            stars = 2;
        }

        const result = {
            mapId: this.currentMapId,
            levelNumber: this.currentLevelNumber,
            title: this.level.title,
            time: levelTime,
            steps: levelSteps,
            hintsUsed,
            score: levelScore,
            stars
        };
        this.levelResults.push(result);
        this.totalScore += levelScore;

        // Save progress to ProgressionManager
        ProgressionManager.markLevelComplete(this.currentMapId, this.currentLevelNumber, result);

        if (this.currentLevelNumber >= 3) {
            // Conquered all 3 levels of this map!
            setTimeout(() => {
                this.showVictoryScreen();
            }, 600);
        } else {
            // Show Level Complete modal
            setTimeout(() => {
                this.showLevelCompleteModal(result);
            }, 500);
        }
    }

    showLevelCompleteModal(res) {
        document.getElementById('complete-title').innerText = `${this.level.title} COMPLETED!`;
        document.getElementById('complete-time').innerText = this.formatTime(res.time);
        document.getElementById('complete-steps').innerText = res.steps;
        document.getElementById('complete-score').innerText = res.score;
        document.getElementById('complete-stars').innerText = "★".repeat(res.stars) + "☆".repeat(3 - res.stars);

        this.dom.modalLevelComplete.classList.remove('hidden');
    }

    nextLevel() {
        if (this.currentLevelNumber < 3) {
            this.startMapLevel(this.currentMapId, this.currentLevelNumber + 1, true);
        } else {
            this.showVictoryScreen();
        }
    }

    showVictoryScreen() {
        this.state = 'VICTORY';
        this.isTimerRunning = false;
        sounds.playVictory();

        let totalTime = 0;
        let totalSteps = 0;
        let totalStars = 0;

        this.levelResults.forEach(r => {
            totalTime += r.time;
            totalSteps += r.steps;
            totalStars += r.stars;
        });

        document.getElementById('victory-total-time').innerText = this.formatTime(totalTime);
        document.getElementById('victory-total-steps').innerText = totalSteps;
        document.getElementById('victory-total-score').innerText = this.totalScore;

        const mapName = this.currentMapId === 'cyber' ? "CYBER LABYRINTH" : "SHADOW LABYRINTH";
        if (this.dom.victorySubtitle) {
            this.dom.victorySubtitle.innerText = `YOU CONQUERED THE ${mapName}!`;
        }

        // Check if other map is not completed yet, show callout
        const otherMapId = this.currentMapId === 'cyber' ? 'shadow' : 'cyber';
        const otherStats = ProgressionManager.getMapStats(otherMapId);
        if (this.dom.victoryNextMapCallout) {
            if (!otherStats.isCompleted) {
                const nextMapName = otherMapId === 'cyber' ? "MAP 1: CYBER LABYRINTH" : "MAP 2: SHADOW LABYRINTH";
                this.dom.victoryNextMapCallout.innerHTML = `
                    <p class="callout-title">READY FOR THE NEXT CHALLENGE?</p>
                    <p class="callout-desc">Master <strong>${nextMapName}</strong> to become the true Maze Champion!</p>
                `;
                this.dom.victoryNextMapCallout.classList.remove('hidden');
            } else {
                this.dom.victoryNextMapCallout.innerHTML = `
                    <p class="callout-title" style="color: #00ff88;">👑 DOUBLE CHAMPION!</p>
                    <p class="callout-desc">You have conquered BOTH Cyber &amp; Shadow Labyrinths!</p>
                `;
                this.dom.victoryNextMapCallout.classList.remove('hidden');
            }
        }

        // Rank determination
        let rank = "S: MAZE LEGEND";
        let rankColor = "#ffd700";
        if (this.totalScore >= 3800) {
            rank = "S+: ULTIMATE RUNNER 👑";
            rankColor = "#00ff88";
        } else if (this.totalScore >= 3200) {
            rank = "S: MASTER ESCAPER ⭐";
            rankColor = "#ffd700";
        } else if (this.totalScore >= 2600) {
            rank = "A: SPEED RUNNER ⚡";
            rankColor = "#00f0ff";
        } else {
            rank = "B: CLEVER EXPLORER 🧭";
            rankColor = "#d946ef";
        }

        const rankEl = document.getElementById('victory-rank');
        rankEl.innerText = rank;
        rankEl.style.color = rankColor;

        // Spawn victory confetti
        this.spawnConfetti();

        this.dom.modalVictory.classList.remove('hidden');
    }

    spawnSparkleParticles(gridX, gridY, count, color) {
        const cx = gridX * this.tileSize + this.tileSize / 2;
        const cy = gridY * this.tileSize + this.tileSize / 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 90;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 1.0
            });
        }
    }

    spawnConfetti() {
        const colors = ['#00f0ff', '#00ff88', '#ffd700', '#ff007f', '#ffffff'];
        for (let i = 0; i < 70; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -10 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 80,
                vy: 50 + Math.random() * 120,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 2.5 + Math.random() * 1.5,
                maxLife: 4.0
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    showToast(message, durationMs = 2500) {
        this.dom.toast.innerText = message;
        this.dom.toast.classList.remove('hidden');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.dom.toast.classList.add('hidden');
        }, durationMs);
    }

    updateHUD() {
        if (!this.level) return;

        const mapTag = this.currentMapId === 'cyber' ? 'CYBER' : 'SHADOW';
        this.dom.hudLevelTitle.innerText = `[${mapTag}] ${this.level.title}: ${this.level.subtitle}`;
        this.dom.hudLevelTitle.style.color = this.level.accentColor || '#00f0ff';
        this.dom.hudSteps.innerText = `Steps: ${this.steps}`;
        this.dom.hudTimer.innerText = this.formatTime(this.elapsedTime);

        // Key indicator
        if (this.hasKey) {
            this.dom.hudKey.innerHTML = '🔑 <span class="badge badge-success">FOUND</span>';
            this.dom.hudExit.innerHTML = '🚪 <span class="badge badge-success">OPEN</span>';
        } else {
            this.dom.hudKey.innerHTML = '🔑 <span class="badge badge-warning">LOCKED</span>';
            this.dom.hudExit.innerHTML = '🚪 <span class="badge badge-danger">LOCKED</span>';
        }

        // Hint button
        this.dom.btnHint.innerHTML = `💡 Hint (${this.hintsRemaining}/3)`;
        if (this.hintsRemaining <= 0) {
            this.dom.btnHint.classList.add('disabled');
        } else {
            this.dom.btnHint.classList.remove('disabled');
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const tenths = Math.floor((seconds % 1) * 10);
        const mm = String(mins).padStart(2, '0');
        const ss = String(secs).padStart(2, '0');
        return `${mm}:${ss}.${tenths}`;
    }

    resize() {
        if (!this.width || !this.height) return;

        // Container bounds
        const container = document.getElementById('canvas-container');
        const availWidth = container.clientWidth - 16;
        const availHeight = container.clientHeight - 16;

        // Calculate optimal tile size
        const maxTileW = Math.floor(availWidth / this.width);
        const maxTileH = Math.floor(availHeight / this.height);
        this.tileSize = Math.max(12, Math.min(52, Math.min(maxTileW, maxTileH)));

        // Set canvas dimensions
        this.canvas.width = this.width * this.tileSize;
        this.canvas.height = this.height * this.tileSize;
    }

    // Main Game Loop
    loop(currentTime) {
        const dt = Math.min(0.1, (currentTime - this.lastFrameTime) / 1000);
        this.lastFrameTime = currentTime;

        if (this.state === 'PLAYING') {
            // Update Timer
            this.elapsedTime += dt;
            this.dom.hudTimer.innerText = this.formatTime(this.elapsedTime);

            // Update Hint countdown
            if (this.hintTimer > 0) {
                this.hintTimer -= dt;
                if (this.hintTimer <= 0) {
                    this.hintPath = null;
                }
            }

            // Update invulnerability
            if (this.player.invulnerableTimer > 0) {
                this.player.invulnerableTimer -= dt;
            }

            // Update Entities
            this.updatePlayerMovement(dt);
            this.updateMonsters(dt);
        }

        // Screen Shake & Flash
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        this.updateParticles(dt);
        this.render(currentTime / 1000);

        this.rafId = requestAnimationFrame(this.loop);
    }

    render(time) {
        if (!this.level || !this.grid.length) return;

        const ctx = this.ctx;
        ctx.save();

        // Screen shake
        if (this.shakeTimer > 0) {
            const sx = (Math.random() - 0.5) * this.shakeMagnitude * 2;
            const sy = (Math.random() - 0.5) * this.shakeMagnitude * 2;
            ctx.translate(sx, sy);
        }

        // Clear canvas
        ctx.fillStyle = this.level.floorFill;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Maze Grid (Floors and Walls)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                if (this.grid[y][x] === 1) {
                    const neighbors = {
                        top: y > 0 && this.grid[y - 1][x] === 1,
                        bottom: y < this.height - 1 && this.grid[y + 1][x] === 1,
                        left: x > 0 && this.grid[y][x - 1] === 1,
                        right: x < this.width - 1 && this.grid[y][x + 1] === 1
                    };
                    sprites.drawWall(ctx, px, py, this.tileSize, {
                        wallFill: this.level.wallFill,
                        wallBorder: this.level.wallBorder,
                        wallHighlight: this.level.wallHighlight
                    }, neighbors);
                } else {
                    sprites.drawFloor(ctx, px, py, this.tileSize, {
                        floorFill: this.level.floorFill,
                        floorDot: this.level.floorDot
                    });
                }
            }
        }

        // 2. Draw Hint Path (if active)
        if (this.hintPath) {
            sprites.drawHintPath(ctx, this.hintPath, this.tileSize, time);
        }

        // 3. Draw Exit Portal / Door
        sprites.drawExit(ctx, this.exit.x * this.tileSize, this.exit.y * this.tileSize, this.tileSize, this.hasKey, time);

        // 4. Draw Key (if not yet collected)
        if (!this.hasKey) {
            sprites.drawKey(ctx, this.key.x * this.tileSize, this.key.y * this.tileSize, this.tileSize, time);
        }

        // 5. Draw Monsters
        for (const m of this.monsters) {
            sprites.drawMonster(ctx, m, this.tileSize, time);
        }

        // 6. Draw Player
        sprites.drawPlayer(
            ctx,
            this.player.renderX * this.tileSize,
            this.player.renderY * this.tileSize,
            this.tileSize,
            this.player.dir,
            this.player.walkPhase,
            this.player.invulnerableTimer > 0
        );

        // 7. Draw Particles
        for (const p of this.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;

        // 8. Flash Screen Red on Monster Hit
        if (this.flashTimer > 0) {
            ctx.fillStyle = `rgba(255, 0, 60, ${this.flashTimer * 1.5})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.restore();
    }
}

// Instantiate game on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new MazeRunGame();
});

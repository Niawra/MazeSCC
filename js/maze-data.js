// Level definitions and Progression Manager for MAZE RUN
// Supports 2 distinct maps (Cyber Labyrinth & Shadow Labyrinth) with 6 progressive levels.

const MAP_DEFINITIONS = {
    cyber: {
        id: "cyber",
        name: "Cyber Labyrinth",
        theme: "Futuristic Neon",
        subtitle: "Geometric Neon Grid",
        description: "High-tech grid with 90° circuit turns, dense electronic walls, and sentry drones.",
        accentColor: "#00f0ff",
        wallFill: "#07192d",
        wallBorder: "#00f0ff",
        wallHighlight: "#7cf7ff",
        floorFill: "#040a16",
        floorDot: "#0f2c4f"
    },
    shadow: {
        id: "shadow",
        name: "Shadow Labyrinth",
        theme: "Dark Mysterious Void",
        subtitle: "Organic Void Catacombs",
        description: "Dark, unpredictable void labyrinth with organic branching paths and phantom demons.",
        accentColor: "#d946ef",
        wallFill: "#1a0826",
        wallBorder: "#c084fc",
        wallHighlight: "#f472b6",
        floorFill: "#0c0214",
        floorDot: "#310d4a"
    }
};

class ProgressionManager {
    static get STORAGE_KEY() {
        return 'maze_run_progression_v2';
    }

    static _memoryStore = null;

    static getDefaultProgress() {
        return {
            cyber: {
                unlockedLevel: 1,
                completedLevels: [],
                stars: {},
                bestTimes: {},
                bestSteps: {},
                bestScores: {}
            },
            shadow: {
                unlockedLevel: 1,
                completedLevels: [],
                stars: {},
                bestTimes: {},
                bestSteps: {},
                bestScores: {}
            }
        };
    }

    static getProgress() {
        try {
            if (typeof localStorage === 'undefined') {
                if (!this._memoryStore) {
                    this._memoryStore = this.getDefaultProgress();
                }
                return JSON.parse(JSON.stringify(this._memoryStore));
            }
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return this.getDefaultProgress();
            const parsed = JSON.parse(raw);
            const def = this.getDefaultProgress();
            return {
                cyber: { ...def.cyber, ...(parsed.cyber || {}) },
                shadow: { ...def.shadow, ...(parsed.shadow || {}) }
            };
        } catch (e) {
            return this.getDefaultProgress();
        }
    }

    static saveProgress(progress) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
            } else {
                this._memoryStore = JSON.parse(JSON.stringify(progress));
            }
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    static isLevelUnlocked(mapId, levelNum) {
        if (levelNum === 1) return true;
        const prog = this.getProgress();
        const mapProg = prog[mapId] || prog.cyber;
        return (mapProg.unlockedLevel || 1) >= levelNum;
    }

    static markLevelComplete(mapId, levelNum, stats) {
        const prog = this.getProgress();
        if (!prog[mapId]) prog[mapId] = this.getDefaultProgress()[mapId];
        const mapProg = prog[mapId];

        if (!mapProg.completedLevels.includes(levelNum)) {
            mapProg.completedLevels.push(levelNum);
        }

        if (levelNum >= mapProg.unlockedLevel && levelNum < 3) {
            mapProg.unlockedLevel = levelNum + 1;
        }

        const lvlStr = String(levelNum);
        const oldStars = mapProg.stars[lvlStr] || 0;
        if (stats.stars > oldStars) mapProg.stars[lvlStr] = stats.stars;

        const oldTime = mapProg.bestTimes[lvlStr] || Infinity;
        if (stats.time < oldTime) mapProg.bestTimes[lvlStr] = stats.time;

        const oldSteps = mapProg.bestSteps[lvlStr] || Infinity;
        if (stats.steps < oldSteps) mapProg.bestSteps[lvlStr] = stats.steps;

        const oldScore = mapProg.bestScores[lvlStr] || 0;
        if (stats.score > oldScore) mapProg.bestScores[lvlStr] = stats.score;

        this.saveProgress(prog);
        return prog;
    }

    static getMapStats(mapId) {
        const prog = this.getProgress();
        const mapProg = prog[mapId] || this.getDefaultProgress()[mapId];
        let totalStars = 0;
        let totalScore = 0;
        for (let l = 1; l <= 3; l++) {
            totalStars += (mapProg.stars[String(l)] || 0);
            totalScore += (mapProg.bestScores[String(l)] || 0);
        }
        return {
            unlockedLevel: mapProg.unlockedLevel || 1,
            completedCount: (mapProg.completedLevels || []).length,
            isCompleted: (mapProg.completedLevels || []).includes(3),
            totalStars,
            totalScore,
            stars: mapProg.stars || {},
            bestTimes: mapProg.bestTimes || {},
            bestSteps: mapProg.bestSteps || {},
            bestScores: mapProg.bestScores || {}
        };
    }

    static resetProgress() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.STORAGE_KEY);
            }
            this._memoryStore = null;
        } catch (e) {}
    }
}

// Master deterministic level cache
const MASTER_LEVELS_CACHE = {};

function getLevelDefinition(arg1 = 'cyber', arg2 = 1, arg3 = false) {
    let mapId = 'cyber';
    let levelNum = 1;
    let generateVariation = false;

    if (typeof arg1 === 'string') {
        mapId = arg1;
        levelNum = typeof arg2 === 'number' ? arg2 : 1;
        generateVariation = !!arg3;
    } else if (typeof arg1 === 'number') {
        mapId = 'cyber';
        levelNum = arg1;
        generateVariation = !!arg2;
    }

    let Gen = typeof MazeGenerator !== 'undefined' ? MazeGenerator : null;
    if (!Gen && typeof require !== 'undefined') {
        try {
            Gen = require('./maze-generator').MazeGenerator;
        } catch (e) {
            Gen = null;
        }
    }

    if (generateVariation && Gen) {
        const procedural = Gen.generate(mapId, levelNum);
        if (procedural) return procedural;
    }

    const cacheKey = `${mapId}_${levelNum}`;
    if (MASTER_LEVELS_CACHE[cacheKey]) {
        return MASTER_LEVELS_CACHE[cacheKey];
    }

    if (Gen) {
        const masterSeed = 1000 + levelNum * 37 + (mapId === 'shadow' ? 500 : 0);
        const master = Gen.generate(mapId, levelNum, masterSeed);
        if (master) {
            MASTER_LEVELS_CACHE[cacheKey] = master;
            return master;
        }
    }

    return null;
}

// Prepopulate MAZE_LEVELS array for backward compatibility
const MAZE_LEVELS = [
    getLevelDefinition('cyber', 1),
    getLevelDefinition('cyber', 2),
    getLevelDefinition('cyber', 3)
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MAP_DEFINITIONS,
        ProgressionManager,
        MAZE_LEVELS,
        getLevelDefinition
    };
}

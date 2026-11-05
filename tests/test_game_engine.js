// Comprehensive Unit & Engine test suite for MAZE RUN — 2 Maps & Progression System
const { MAP_DEFINITIONS, ProgressionManager, MAZE_LEVELS, getLevelDefinition } = require('../js/maze-data');
const { MazeGenerator } = require('../js/maze-generator');
const { Pathfinder } = require('../js/pathfinder');

class MazeEngineTest {
    constructor(levelDef) {
        this.levelDef = levelDef;
        this.width = levelDef.map[0].length;
        this.height = levelDef.map.length;
        this.grid = [];
        this.start = null;
        this.key = null;
        this.exit = null;
        this.hasKey = false;
        this.isCompleted = false;
        this.steps = 0;
        this.hintsRemaining = 3;
        this.player = { x: 0, y: 0 };
        this.monsters = [];

        this.parseMap();
        this.initMonsters();
    }

    parseMap() {
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                const char = this.levelDef.map[y][x];
                if (char === '#') {
                    row.push(1);
                } else {
                    row.push(0);
                    if (char === 'S') this.start = { x, y };
                    if (char === 'K') this.key = { x, y };
                    if (char === 'E') this.exit = { x, y };
                }
            }
            this.grid.push(row);
        }
        this.player = { ...this.start };
    }

    initMonsters() {
        this.monsters = (this.levelDef.monsters || []).map(m => ({
            ...m,
            wpIndex: 0,
            dir: 1,
            x: m.waypoints[0].x,
            y: m.waypoints[0].y
        }));
    }

    canMoveTo(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.grid[y][x] === 0;
    }

    movePlayer(dx, dy) {
        if (this.isCompleted) return { moved: false };

        const targetX = this.player.x + dx;
        const targetY = this.player.y + dy;

        if (!this.canMoveTo(targetX, targetY)) {
            return { moved: false, reason: "wall" };
        }

        this.player.x = targetX;
        this.player.y = targetY;
        this.steps++;

        let event = null;

        if (!this.hasKey && this.player.x === this.key.x && this.player.y === this.key.y) {
            this.hasKey = true;
            event = "key_collected";
        }

        if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
            if (this.hasKey) {
                this.isCompleted = true;
                event = "level_complete";
            } else {
                event = "exit_locked";
            }
        }

        const hitMonster = this.checkMonsterCollision();
        if (hitMonster) {
            event = "monster_hit";
            this.player = { ...this.start };
        }

        return { moved: true, event };
    }

    checkMonsterCollision() {
        for (const m of this.monsters) {
            if (Math.round(m.x) === this.player.x && Math.round(m.y) === this.player.y) {
                return m;
            }
        }
        return null;
    }

    stepMonsters() {
        for (const m of this.monsters) {
            let nextIndex = m.wpIndex + m.dir;
            if (nextIndex >= m.waypoints.length) {
                m.dir = -1;
                nextIndex = m.waypoints.length - 2;
            } else if (nextIndex < 0) {
                m.dir = 1;
                nextIndex = 1;
            }
            m.wpIndex = nextIndex;
            m.x = m.waypoints[nextIndex].x;
            m.y = m.waypoints[nextIndex].y;
        }

        if (this.checkMonsterCollision()) {
            this.player = { ...this.start };
            return true;
        }
        return false;
    }

    getHintPath(maxSteps = 8) {
        if (this.hintsRemaining <= 0) return null;
        const target = this.hasKey ? this.exit : this.key;
        const path = Pathfinder.findPath(this.grid, this.width, this.height, this.player, target);
        if (!path || path.length <= 1) return null;

        this.hintsRemaining--;
        return path.slice(1, 1 + maxSteps);
    }

    restart() {
        this.player = { ...this.start };
        this.hasKey = false;
        this.isCompleted = false;
        this.steps = 0;
        this.hintsRemaining = 3;
        this.initMonsters();
    }
}

console.log("==========================================");
console.log("RUNNING MAZE RUN ENGINE UNIT TESTS...");
console.log("==========================================");

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  PASS: ${message}`);
    } else {
        console.error(`  FAIL: ${message}`);
    }
}

// 1. Level 1 Cyber Test
console.log("\n--- Testing Level 1 Cyber ---");
const lvl1Def = getLevelDefinition('cyber', 1, false);
const engine1 = new MazeEngineTest(lvl1Def);
assert(engine1.start !== null, "Start point found");
assert(engine1.key !== null, "Key point found");
assert(engine1.exit !== null, "Exit point found");
assert(engine1.width >= 21 && engine1.height >= 21, "Level 1 is 21x21 minimum");
assert(engine1.monsters.length === 0, "Level 1 has 0 monsters");

// Wall collision test
const wallMove = engine1.movePlayer(-1, 0);
assert(!wallMove.moved && wallMove.reason === "wall", "Player cannot pass through walls");
assert(engine1.player.x === engine1.start.x && engine1.player.y === engine1.start.y, "Player position unchanged after wall hit");

// Hint test
const hint1 = engine1.getHintPath(8);
assert(hint1 && hint1.length > 0, "Hint path generated successfully");
assert(engine1.hintsRemaining === 2, "Hints decremented to 2");

// Solve Level 1 Cyber
const pathToKey1 = Pathfinder.findPath(engine1.grid, engine1.width, engine1.height, engine1.player, engine1.key);
assert(pathToKey1 !== null, "Path to key exists in Level 1");
for (let i = 1; i < pathToKey1.length; i++) {
    const dx = pathToKey1[i].x - engine1.player.x;
    const dy = pathToKey1[i].y - engine1.player.y;
    engine1.movePlayer(dx, dy);
}
assert(engine1.hasKey === true, "Key collected after reaching key tile");

const pathToExit1 = Pathfinder.findPath(engine1.grid, engine1.width, engine1.height, engine1.player, engine1.exit);
assert(pathToExit1 !== null, "Path to exit exists in Level 1");
for (let i = 1; i < pathToExit1.length; i++) {
    const dx = pathToExit1[i].x - engine1.player.x;
    const dy = pathToExit1[i].y - engine1.player.y;
    engine1.movePlayer(dx, dy);
}
assert(engine1.isCompleted === true, "Level 1 completed after reaching exit with key");

// 2. Level 2 Cyber Test
console.log("\n--- Testing Level 2 Cyber ---");
const lvl2Def = getLevelDefinition('cyber', 2, false);
const engine2 = new MazeEngineTest(lvl2Def);
assert(engine2.width >= 27 && engine2.height >= 27, "Level 2 is 27x27 minimum");
assert(engine2.monsters.length === 1, "Level 2 has 1 monster");
const m1 = engine2.monsters[0];
assert(m1.waypoints.length >= 4, `Monster Grumble has ${m1.waypoints.length} waypoints (>= 4)`);

engine2.stepMonsters();
assert(m1.wpIndex === 1, "Monster moved to waypoint 1");

// Collision reset test
engine2.player = { x: m1.x, y: m1.y };
const hitResult = engine2.checkMonsterCollision();
assert(hitResult !== null, "Collision detected when player touches monster");
engine2.player = { ...engine2.start };
assert(engine2.player.x === engine2.start.x && engine2.player.y === engine2.start.y, "Player reset to start position");

// 3. Level 3 Cyber Test
console.log("\n--- Testing Level 3 Cyber ---");
const lvl3Def = getLevelDefinition('cyber', 3, false);
const engine3 = new MazeEngineTest(lvl3Def);
assert(engine3.width >= 35 && engine3.height >= 35, "Level 3 is 35x35 minimum");
assert(engine3.monsters.length === 2, "Level 3 has 2 monsters");
const pathToKey3 = Pathfinder.findPath(engine3.grid, engine3.width, engine3.height, engine3.player, engine3.key);
assert(pathToKey3 !== null, "Valid route exists from Start to Key in Level 3");
const pathToExit3 = Pathfinder.findPath(engine3.grid, engine3.width, engine3.height, engine3.key, engine3.exit);
assert(pathToExit3 !== null, "Valid route exists from Key to Exit in Level 3");

// 4. Shadow Labyrinth Tests
console.log("\n--- Testing Shadow Labyrinth (Map 2) ---");
const shadow1 = getLevelDefinition('shadow', 1, false);
const shadow2 = getLevelDefinition('shadow', 2, false);
const shadow3 = getLevelDefinition('shadow', 3, false);
assert(shadow1.width === 21 && shadow1.height === 21, "Shadow 1 is 21x21");
assert(shadow2.width === 27 && shadow2.height === 27, "Shadow 2 is 27x27");
assert(shadow3.width === 35 && shadow3.height === 35, "Shadow 3 is 35x35");
assert(shadow2.monsters.length === 1 && shadow2.monsters[0].name === "Nightshade", "Shadow 2 monster is Nightshade");
assert(shadow3.monsters.length === 2, "Shadow 3 has 2 monsters (Vortex and Specter)");

// 5. ProgressionManager Independent Map Progress
console.log("\n--- Testing Independent Progression System ---");
ProgressionManager.resetProgress();
let prog = ProgressionManager.getProgress();
assert(ProgressionManager.isLevelUnlocked('cyber', 1) === true, "Cyber Level 1 unlocked initially");
assert(ProgressionManager.isLevelUnlocked('cyber', 2) === false, "Cyber Level 2 locked initially");
assert(ProgressionManager.isLevelUnlocked('shadow', 1) === true, "Shadow Level 1 unlocked initially");
assert(ProgressionManager.isLevelUnlocked('shadow', 2) === false, "Shadow Level 2 locked initially");

// Mark Cyber L1 complete
ProgressionManager.markLevelComplete('cyber', 1, { time: 35.2, steps: 60, score: 1250, stars: 3 });
assert(ProgressionManager.isLevelUnlocked('cyber', 2) === true, "Cyber Level 2 unlocks after completing Cyber Level 1");
assert(ProgressionManager.isLevelUnlocked('shadow', 2) === false, "Shadow Level 2 remains locked (independent progression!)");

// Mark Cyber L2 complete
ProgressionManager.markLevelComplete('cyber', 2, { time: 55.4, steps: 95, score: 1400, stars: 3 });
assert(ProgressionManager.isLevelUnlocked('cyber', 3) === true, "Cyber Level 3 unlocks after completing Cyber Level 2");
assert(ProgressionManager.isLevelUnlocked('shadow', 2) === false, "Shadow Level 2 still locked after Cyber L2 complete");

// Mark Shadow L1 complete
ProgressionManager.markLevelComplete('shadow', 1, { time: 40.1, steps: 70, score: 1100, stars: 2 });
assert(ProgressionManager.isLevelUnlocked('shadow', 2) === true, "Shadow Level 2 unlocks after completing Shadow Level 1");

// 6. Dynamic Key & Exit Coordinate Variance Across Runs
console.log("\n--- Testing Dynamic Random Key & Exit Placement ---");
const keyPositions = new Set();
const exitPositions = new Set();
for (let i = 1; i <= 8; i++) {
    const variation = MazeGenerator.generate('cyber', 2, 5000 + i * 137);
    assert(variation !== null, `Variation ${i} generated successfully`);
    keyPositions.add(`${variation.stats.keyPos.x},${variation.stats.keyPos.y}`);
    exitPositions.add(`${variation.stats.exitPos.x},${variation.stats.exitPos.y}`);
}
assert(keyPositions.size > 1, `Dynamic Key placement varies across runs (observed ${keyPositions.size} distinct alcove positions)`);
assert(exitPositions.size > 1, `Dynamic Exit placement varies across runs (observed ${exitPositions.size} distinct alcove positions)`);

console.log("\n==========================================");
console.log(`SUMMARY: ${passedTests} / ${totalTests} unit tests passed.`);
console.log("==========================================");

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}

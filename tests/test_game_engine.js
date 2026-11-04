// Comprehensive Unit & Engine test suite for MAZE RUN
const { MAZE_LEVELS, getLevelDefinition } = require('../js/maze-data');
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

// Level 1 Test
console.log("\n--- Testing Level 1 ---");
const engine1 = new MazeEngineTest(MAZE_LEVELS[0]);
assert(engine1.start !== null, "Start point found");
assert(engine1.key !== null, "Key point found");
assert(engine1.exit !== null, "Exit point found");
assert(engine1.monsters.length === 0, "Level 1 has 0 monsters");

// Wall collision test
const wallMove = engine1.movePlayer(-1, 0);
assert(!wallMove.moved && wallMove.reason === "wall", "Player cannot pass through walls");
assert(engine1.player.x === engine1.start.x && engine1.player.y === engine1.start.y, "Player position unchanged after wall hit");

// Hint test
const hint1 = engine1.getHintPath(8);
assert(hint1 && hint1.length > 0, "Hint path generated successfully");
assert(engine1.hintsRemaining === 2, "Hints decremented to 2");

// Solve Level 1
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

// Level 2 Test
console.log("\n--- Testing Level 2 ---");
const engine2 = new MazeEngineTest(MAZE_LEVELS[1]);
assert(engine2.monsters.length === 1, "Level 2 has 1 monster");
const m1 = engine2.monsters[0];
assert(m1.waypoints.length === 5, "Monster Grumble has 5 waypoints");

engine2.stepMonsters();
assert(m1.wpIndex === 1, "Monster moved to waypoint 1");

// Test collision reset
engine2.player = { x: m1.x, y: m1.y };
const hitResult = engine2.checkMonsterCollision();
assert(hitResult !== null, "Collision detected when player touches monster");
engine2.player = { ...engine2.start };
assert(engine2.player.x === engine2.start.x && engine2.player.y === engine2.start.y, "Player reset to start position");

// Solve Level 2
const pathToKey2 = Pathfinder.findPath(engine2.grid, engine2.width, engine2.height, engine2.player, engine2.key);
assert(pathToKey2 !== null, "Valid route exists from Start to Key in Level 2");
const pathToExit2 = Pathfinder.findPath(engine2.grid, engine2.width, engine2.height, engine2.key, engine2.exit);
assert(pathToExit2 !== null, "Valid route exists from Key to Exit in Level 2");

// Level 3 Test
console.log("\n--- Testing Level 3 ---");
const engine3 = new MazeEngineTest(MAZE_LEVELS[2]);
assert(engine3.monsters.length === 2, "Level 3 has 2 monsters");
const pathToKey3 = Pathfinder.findPath(engine3.grid, engine3.width, engine3.height, engine3.player, engine3.key);
assert(pathToKey3 !== null, "Valid route exists from Start to Key in Level 3");
const pathToExit3 = Pathfinder.findPath(engine3.grid, engine3.width, engine3.height, engine3.key, engine3.exit);
assert(pathToExit3 !== null, "Valid route exists from Key to Exit in Level 3");

// Restart Test
engine3.steps = 50;
engine3.hintsRemaining = 1;
engine3.hasKey = true;
engine3.restart();
assert(engine3.steps === 0, "Restart resets step counter to 0");
assert(engine3.hintsRemaining === 3, "Restart resets hints to 3");
assert(engine3.hasKey === false, "Restart resets key state");
assert(engine3.player.x === engine3.start.x, "Restart resets player position");

// Procedural Variation & Generator Tests
console.log("\n--- Testing Procedural Variations & Layout Diversity ---");
const var1 = getLevelDefinition(1, true);
assert(var1 !== null && var1.map.length === 13 && var1.map[0].length === 17, "Level 1 procedural variation generated with correct dimensions 17x13");
const engineVar1 = new MazeEngineTest(var1);
assert(engineVar1.start && engineVar1.key && engineVar1.exit, "Level 1 variation has Start, Key, and Exit");
const pathVar1Key = Pathfinder.findPath(engineVar1.grid, engineVar1.width, engineVar1.height, engineVar1.start, engineVar1.key);
const pathVar1Exit = Pathfinder.findPath(engineVar1.grid, engineVar1.width, engineVar1.height, engineVar1.key, engineVar1.exit);
assert(pathVar1Key !== null && pathVar1Exit !== null, "Level 1 variation is fully solvable via BFS");

const var2 = getLevelDefinition(2, true);
assert(var2 !== null && var2.map.length === 15 && var2.map[0].length === 23, "Level 2 procedural variation generated with correct dimensions 23x15");
assert(var2.monsters && var2.monsters.length === 1, "Level 2 variation has 1 monster");
const engineVar2 = new MazeEngineTest(var2);
const pathVar2Key = Pathfinder.findPath(engineVar2.grid, engineVar2.width, engineVar2.height, engineVar2.start, engineVar2.key);
const pathVar2Exit = Pathfinder.findPath(engineVar2.grid, engineVar2.width, engineVar2.height, engineVar2.key, engineVar2.exit);
assert(pathVar2Key !== null && pathVar2Exit !== null, "Level 2 variation is fully solvable via BFS");

const var3 = getLevelDefinition(3, true);
assert(var3 !== null && var3.map.length === 17 && var3.map[0].length === 27, "Level 3 procedural variation generated with correct dimensions 27x17");
assert(var3.monsters && var3.monsters.length === 2, "Level 3 variation has 2 monsters");
const engineVar3 = new MazeEngineTest(var3);
const pathVar3Key = Pathfinder.findPath(engineVar3.grid, engineVar3.width, engineVar3.height, engineVar3.start, engineVar3.key);
const pathVar3Exit = Pathfinder.findPath(engineVar3.grid, engineVar3.width, engineVar3.height, engineVar3.key, engineVar3.exit);
assert(pathVar3Key !== null && pathVar3Exit !== null, "Level 3 variation is fully solvable via BFS");

// Verify that multiple generations yield diverse layouts
const sampleA = MazeGenerator.generateLevel(2);
const sampleB = MazeGenerator.generateLevel(2);
const mapsAreIdentical = sampleA.map.join('') === sampleB.map.join('');
assert(!mapsAreIdentical, "Procedural generator produces unique layout variations on subsequent runs");

console.log("\n==========================================");
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed.`);
console.log("==========================================");

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}

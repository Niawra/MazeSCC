// Full Suite Validator for MAZE RUN — 2 Maps & 6 Levels
const { MAP_DEFINITIONS, getLevelDefinition } = require('../js/maze-data');
const { MazeGenerator } = require('../js/maze-generator');

function testLevel(level, mapId, levelNum, label = "Master") {
    const title = `[${mapId.toUpperCase()}] Level ${levelNum}: ${level.title} — ${level.subtitle} [${label}]`;
    const map = level.map;
    const monsters = level.monsters || [];
    const h = map.length;
    const w = map[0].length;
    const grid = map.map(r => r.split(''));

    let S, K, E;
    let has2x2 = false;
    let deadEndsCount = 0;
    let junctionsCount = 0;

    for (let y = 0; y < h; y++) {
        if (map[y].length !== w) throw new Error(`${title} row ${y} length mismatch: got ${map[y].length}, expected ${w}`);
        for (let x = 0; x < w; x++) {
            if (grid[y][x] === 'S') S = { x, y };
            if (grid[y][x] === 'K') K = { x, y };
            if (grid[y][x] === 'E') E = { x, y };

            // Floor metrics
            if (grid[y][x] !== '#') {
                let open = 0;
                for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    if (y + dy >= 0 && y + dy < h && x + dx >= 0 && x + dx < w && grid[y + dy][x + dx] !== '#') {
                        open++;
                    }
                }
                if (open === 1) deadEndsCount++;
                if (open >= 3) junctionsCount++;
            }

            // Check for wide open 2x2 floor patches
            if (y < h - 1 && x < w - 1) {
                const c00 = grid[y][x] !== '#';
                const c10 = grid[y + 1][x] !== '#';
                const c01 = grid[y][x + 1] !== '#';
                const c11 = grid[y + 1][x + 1] !== '#';
                if (c00 && c10 && c01 && c11) has2x2 = true;
            }
        }
    }

    if (!S || !K || !E) {
        console.error(`  FAIL: Missing S, K, or E in ${title}`);
        return false;
    }

    // Check Key is in an enclosed alcove (3 walls around it)
    let keyOpenNeighbors = 0;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (grid[K.y + dy][K.x + dx] !== '#') keyOpenNeighbors++;
    }

    // Check Exit is in an enclosed alcove (3 walls around it)
    let exitOpenNeighbors = 0;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (grid[E.y + dy][E.x + dx] !== '#') exitOpenNeighbors++;
    }

    function bfs(from, to) {
        const q = [[from.x, from.y]];
        const vis = Array.from({ length: h }, () => Array(w).fill(false));
        const parent = Array.from({ length: h }, () => Array(w).fill(null));
        vis[from.y][from.x] = true;
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (q.length > 0) {
            const [cx, cy] = q.shift();
            if (cx === to.x && cy === to.y) {
                const path = [];
                let curr = [cx, cy];
                while (curr) {
                    path.push({ x: curr[0], y: curr[1] });
                    curr = parent[curr[1]][curr[0]];
                }
                path.reverse();
                return path;
            }
            for (const [dx, dy] of dirs) {
                const nx = cx + dx, ny = cy + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx] !== '#' && !vis[ny][nx]) {
                    vis[ny][nx] = true;
                    parent[ny][nx] = [cx, cy];
                    q.push([nx, ny]);
                }
            }
        }
        return null;
    }

    const sToK = bfs(S, K);
    const kToE = bfs(K, E);

    // Difficulty target thresholds
    const targets = {
        1: { minW: 21, minH: 21, minDead: 15, minJunc: 15, monsters: 0 },
        2: { minW: 27, minH: 27, minDead: 30, minJunc: 30, monsters: 1 },
        3: { minW: 35, minH: 35, minDead: 45, minJunc: 50, monsters: 2 }
    }[levelNum];

    const sizeOk = w >= targets.minW && h >= targets.minH;
    const deadOk = deadEndsCount >= targets.minDead;
    const juncOk = junctionsCount >= targets.minJunc;
    const monsterCountOk = monsters.length >= targets.monsters;

    console.log(`\n--------------------------------------------`);
    console.log(`[${title}]`);
    console.log(`Grid Size: ${w}x${h} (Req: ${targets.minW}x${targets.minH}) -> ${sizeOk ? 'PASS' : 'FAIL'}`);
    console.log(`Start: (${S.x}, ${S.y}), Key: (${K.x}, ${K.y}), Exit: (${E.x}, ${E.y})`);
    console.log(`Start -> Key BFS: ${sToK ? sToK.length + ' steps' : 'FAILED'}`);
    console.log(`Key -> Exit BFS:   ${kToE ? kToE.length + ' steps' : 'FAILED'}`);
    console.log(`Dead-ends: ${deadEndsCount} (Min ${targets.minDead}) -> ${deadOk ? 'PASS' : 'FAIL'}`);
    console.log(`Junctions: ${junctionsCount} (Min ${targets.minJunc}) -> ${juncOk ? 'PASS' : 'FAIL'}`);
    console.log(`2x2 Open Void Check: ${has2x2 ? 'FAIL (has 2x2 voids)' : 'PASS (strictly 1-tile corridors)'}`);
    console.log(`Key Alcove Enclosure: ${keyOpenNeighbors === 1 ? 'PASS (surrounded by 3 walls)' : 'OPEN (' + keyOpenNeighbors + ' exits)'}`);
    console.log(`Exit Alcove Enclosure: ${exitOpenNeighbors === 1 ? 'PASS (surrounded by 3 walls)' : 'OPEN (' + exitOpenNeighbors + ' exits)'}`);

    let monsterOk = true;
    monsters.forEach(m => {
        m.waypoints.forEach((wp, idx) => {
            if (grid[wp.y][wp.x] === '#') {
                console.error(`  FAIL: ${m.name} waypoint ${idx} (${wp.x}, ${wp.y}) is in a wall!`);
                monsterOk = false;
            }
        });
        if (monsterOk) {
            console.log(`  Monster ${m.name}: ${m.waypoints.length} waypoints verified open.`);
        }
    });

    const passed = sToK && kToE && !has2x2 && keyOpenNeighbors === 1 && exitOpenNeighbors === 1 &&
                   sizeOk && deadOk && juncOk && monsterCountOk && monsterOk;

    if (!passed) {
        console.error(`  --> FAILED SUITE VERIFICATION for ${title}`);
    }
    return passed;
}

let allOk = true;

console.log("=================================================");
console.log("VERIFYING 6 MASTER LABYRINTHS (2 MAPS x 3 LEVELS)");
console.log("=================================================");

for (const mapId of ['cyber', 'shadow']) {
    for (let lvlNum = 1; lvlNum <= 3; lvlNum++) {
        const level = getLevelDefinition(mapId, lvlNum, false);
        const ok = testLevel(level, mapId, lvlNum, "Master Seed");
        if (!ok) allOk = false;
    }
}

console.log("\n=================================================");
console.log("VERIFYING PROCEDURAL GENERATOR (FRESH RANDOM SEEDS)");
console.log("=================================================");

for (const mapId of ['cyber', 'shadow']) {
    for (let lvlNum = 1; lvlNum <= 3; lvlNum++) {
        const procLvl = getLevelDefinition(mapId, lvlNum, true);
        if (!procLvl) {
            console.error(`FAIL: Procedural generation failed for ${mapId} Level ${lvlNum}`);
            allOk = false;
        } else {
            const ok = testLevel(procLvl, mapId, lvlNum, "Procedural Fresh");
            if (!ok) allOk = false;
        }
    }
}

if (allOk) {
    console.log("\n=================================================");
    console.log("ALL 6 MASTER & PROCEDURAL LEVELS 100% VERIFIED! ✓");
    console.log("Zero 2x2 voids | Strict 1-tile corridors | 3-wall alcoves | All metrics passed!");
    console.log("=================================================");
    process.exit(0);
} else {
    console.error("Verification suite encountered errors.");
    process.exit(1);
}

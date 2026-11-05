// Full Suite Validator for MAZE RUN
const { MAZE_LEVELS, getLevelDefinition } = require('../js/maze-data');
const { MazeGenerator } = require('../js/maze-generator');

function testLevel(level, label = "Master") {
    const title = `${level.title} — ${level.subtitle} [${label}]`;
    const map = level.map;
    const monsters = level.monsters || [];
    const h = map.length;
    const w = map[0].length;
    const grid = map.map(r => r.split(''));

    let S, K, E;
    let has2x2 = false;

    for (let y = 0; y < h; y++) {
        if (map[y].length !== w) throw new Error(`${title} row ${y} length mismatch`);
        for (let x = 0; x < w; x++) {
            if (grid[y][x] === 'S') S = { x, y };
            if (grid[y][x] === 'K') K = { x, y };
            if (grid[y][x] === 'E') E = { x, y };

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

    console.log(`\n--------------------------------------------`);
    console.log(`[${title}]`);
    console.log(`Size: ${w}x${h}`);
    console.log(`Start: (${S.x}, ${S.y}), Key: (${K.x}, ${K.y}), Exit: (${E.x}, ${E.y})`);
    console.log(`Start -> Key: ${sToK ? sToK.length + ' steps' : 'FAILED'}`);
    console.log(`Key -> Exit:   ${kToE ? kToE.length + ' steps' : 'FAILED'}`);
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

    return sToK && kToE && !has2x2 && keyOpenNeighbors === 1 && exitOpenNeighbors === 1 && monsterOk;
}

let allOk = true;

console.log("=== VERIFYING MASTER HANDCRAFTED LABYRINTHS ===");
MAZE_LEVELS.forEach(lvl => {
    const ok = testLevel(lvl, "Master");
    if (!ok) allOk = false;
});

console.log("\n=== VERIFYING PROCEDURAL GENERATOR LABYRINTHS ===");
for (let lvlNum = 1; lvlNum <= 3; lvlNum++) {
    const procLvl = MazeGenerator.generateLevel(lvlNum);
    if (!procLvl) {
        console.error(`FAIL: Procedural generation failed for Level ${lvlNum}`);
        allOk = false;
    } else {
        const ok = testLevel(procLvl, "Procedural Variation");
        if (!ok) allOk = false;
    }
}

if (allOk) {
    console.log("\n============================================");
    console.log("ALL MASTER & PROCEDURAL LABYRINTHS 100% VERIFIED! ✓");
    console.log("Zero 2x2 voids | Strict 1-tile corridors | 3-wall alcove keys/exits");
    console.log("============================================");
} else {
    process.exit(1);
}

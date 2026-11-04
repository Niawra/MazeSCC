// Full Suite Validator for MAZE RUN
const { MAZE_LEVELS } = require('../js/maze-data');

function testLevel(level) {
    const title = `${level.title} — ${level.subtitle}`;
    const map = level.map;
    const monsters = level.monsters || [];
    const h = map.length;
    const w = map[0].length;
    const grid = map.map(r => r.split(''));

    let S, K, E;
    for (let y = 0; y < h; y++) {
        if (map[y].length !== w) throw new Error(`${title} row ${y} length mismatch`);
        for (let x = 0; x < w; x++) {
            if (grid[y][x] === 'S') S = { x, y };
            if (grid[y][x] === 'K') K = { x, y };
            if (grid[y][x] === 'E') E = { x, y };
        }
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

    return sToK && kToE && monsterOk;
}

let allOk = true;
MAZE_LEVELS.forEach(lvl => {
    const ok = testLevel(lvl);
    if (!ok) allOk = false;
});

if (allOk) {
    console.log("\n============================================");
    console.log("ALL 3 LEVELS FULLY VERIFIED & SOLVABLE! ✓");
    console.log("============================================");
} else {
    process.exit(1);
}

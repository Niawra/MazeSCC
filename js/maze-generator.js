// MAZE RUN — Procedural & Asymmetric Maze Generator
// Produces organic, non-symmetric labyrinths with deceptive dead-ends, loop shortcuts, and guaranteed BFS solvability.

class MazeGenerator {
    /**
     * Level generation parameter profiles
     */
    static get LEVEL_PROFILES() {
        return {
            1: {
                levelNumber: 1,
                title: "LEVEL 1 — EASY",
                subtitle: "Beginner Vault",
                instructions: "Find the Golden Key 🔑 to unlock the Exit Portal 🚪! Watch out for dead ends.",
                width: 17,
                height: 13,
                accentColor: "#00f0ff",
                wallFill: "#0b2239",
                wallBorder: "#00e5ff",
                wallHighlight: "#7cf7ff",
                floorFill: "#060b17",
                floorDot: "#12203d",
                parTime: 45,
                parSteps: 70,
                minSToK: 35,
                minKToE: 30,
                loopRate: 0.02,
                monsterCount: 0
            },
            2: {
                levelNumber: 2,
                title: "LEVEL 2 — MEDIUM",
                subtitle: "Explorer Labyrinth",
                instructions: "Beware Grumble the Sentry! Watch out for deceptive loop paths and deep dead ends.",
                width: 23,
                height: 15,
                accentColor: "#d946ef",
                wallFill: "#260e38",
                wallBorder: "#d946ef",
                wallHighlight: "#f59e0b",
                floorFill: "#0e071c",
                floorDot: "#271247",
                parTime: 75,
                parSteps: 110,
                minSToK: 55,
                minKToE: 45,
                loopRate: 0.05,
                monsterCount: 1
            },
            3: {
                levelNumber: 3,
                title: "LEVEL 3 — HARD",
                subtitle: "Master of Shadows",
                instructions: "Two fast sentry phantoms guard the maze! Long corridors end in traps—stay alert.",
                width: 27,
                height: 17,
                accentColor: "#00ff88",
                wallFill: "#09291b",
                wallBorder: "#00ff88",
                wallHighlight: "#ffd700",
                floorFill: "#04140e",
                floorDot: "#0f3d2a",
                parTime: 110,
                parSteps: 150,
                minSToK: 75,
                minKToE: 65,
                loopRate: 0.07,
                monsterCount: 2
            }
        };
    }

    /**
     * Generate a verified, playable maze configuration with dense walls, strictly 1-tile corridors,
     * and dead-end alcove placement for Key and Exit.
     * @param {number} levelNumber (1, 2, or 3)
     * @param {number|null} seed (optional PRNG seed)
     * @returns {Object} Complete level definition
     */
    static generateLevel(levelNumber, seed = null) {
        const profile = this.LEVEL_PROFILES[levelNumber];
        if (!profile) throw new Error(`Unknown level number: ${levelNumber}`);

        const w = profile.width;
        const h = profile.height;

        let prng = seed !== null ? (seed >>> 0) : ((Date.now() ^ (Math.random() * 0x7FFFFFFF)) >>> 0);
        function rand() {
            prng = (prng * 1664525 + 1013904223) % 4294967296;
            return (prng >>> 0) / 4294967296;
        }

        const maxAttempts = 100;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const grid = Array.from({ length: h }, () => Array(w).fill('#'));
            const visited = Array.from({ length: h }, () => Array(w).fill(false));

            function measureRun(cx, cy, dx, dy) {
                let len = 1;
                const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0;
                const sy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
                let x = cx + sx, y = cy + sy;
                while (x >= 0 && x < w && y >= 0 && y < h && grid[y][x] === '.') {
                    len++;
                    x += sx; y += sy;
                }
                x = cx - sx; y = cy - sy;
                while (x >= 0 && x < w && y >= 0 && y < h && grid[y][x] === '.') {
                    len++;
                    x -= sx; y -= sy;
                }
                return len;
            }

            // 1. Carve using pure cell lattice DFS with anti-runway turn-bias
            function carve(cx, cy, lastDx = 0, lastDy = 0) {
                visited[cy][cx] = true;
                grid[cy][cx] = '.';

                const dirs = [
                    [0, -2], [0, 2], [-2, 0], [2, 0]
                ];
                dirs.sort(() => rand() - 0.5);

                // Anti-runway sort: penalize continuing straight if line length exceeds 6
                dirs.sort((a, b) => {
                    const runA = measureRun(cx + a[0] / 2, cy + a[1] / 2, a[0], a[1]) + 1;
                    const runB = measureRun(cx + b[0] / 2, cy + b[1] / 2, b[0], b[1]) + 1;
                    return (runA > 6 ? 1 : 0) - (runB > 6 ? 1 : 0);
                });

                for (const [dx, dy] of dirs) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && !visited[ny][nx]) {
                        grid[cy + dy / 2][cx + dx / 2] = '.';
                        carve(nx, ny, dx, dy);
                    }
                }
            }

            carve(1, 1);

            // 2. Add controlled loop cuts on single wall edges (never on corner vertices!)
            const loopCandidates = [];
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    if (grid[y][x] === '#') {
                        if (x % 2 === 1 && y % 2 === 0 && grid[y - 1][x] === '.' && grid[y + 1][x] === '.') {
                            loopCandidates.push({ x, y });
                        } else if (x % 2 === 0 && y % 2 === 1 && grid[y][x - 1] === '.' && grid[y][x + 1] === '.') {
                            loopCandidates.push({ x, y });
                        }
                    }
                }
            }
            loopCandidates.sort(() => rand() - 0.5);
            const maxLoops = Math.floor(w * h * 0.005);
            for (let i = 0; i < Math.min(maxLoops, loopCandidates.length); i++) {
                grid[loopCandidates[i].y][loopCandidates[i].x] = '.';
            }

            // Verify: strictly zero 2x2 floor blocks
            let has2x2 = false;
            for (let y = 0; y < h - 1; y++) {
                for (let x = 0; x < w - 1; x++) {
                    if (grid[y][x] === '.' && grid[y + 1][x] === '.' && grid[y][x + 1] === '.' && grid[y + 1][x + 1] === '.') {
                        has2x2 = true;
                        break;
                    }
                }
                if (has2x2) break;
            }
            if (has2x2) continue;

            // 3. Find true dead-end alcove cells (cells with exactly 1 neighbor open, surrounded on 3 sides by walls)
            const deadEnds = [];
            for (let y = 1; y < h - 1; y += 2) {
                for (let x = 1; x < w - 1; x += 2) {
                    if (grid[y][x] === '.') {
                        let open = 0;
                        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                            if (grid[y + dy][x + dx] !== '#') open++;
                        }
                        if (open === 1) deadEnds.push({ x, y });
                    }
                }
            }
            if (deadEnds.length < 5) continue;

            const start = { x: 1, y: 1 };
            const distFromStart = this.bfsDistances(grid, w, h, start);
            if (distFromStart[start.y][start.x] !== 0) continue;

            // Find Key: dead-end alcove in opposite quadrant (right half, high distance)
            let maxDKey = -1, key = null;
            for (const d of deadEnds) {
                if (d.x === start.x && d.y === start.y) continue;
                if (d.x < Math.floor(w * 0.45)) continue;
                const manhattan = Math.abs(d.x - start.x) + Math.abs(d.y - start.y);
                if (manhattan < (w + h) * 0.45) continue;
                if (distFromStart[d.y][d.x] > maxDKey) {
                    maxDKey = distFromStart[d.y][d.x];
                    key = d;
                }
            }
            if (!key || maxDKey < profile.minSToK) continue;

            // Find Exit: dead-end alcove far from both Start and Key
            const distFromKey = this.bfsDistances(grid, w, h, key);
            let maxDExit = -1, exit = null;
            for (const d of deadEnds) {
                if (d.x === key.x && d.y === key.y) continue;
                if (d.x === start.x && d.y === start.y) continue;
                const mS = Math.abs(d.x - start.x) + Math.abs(d.y - start.y);
                const mK = Math.abs(d.x - key.x) + Math.abs(d.y - key.y);
                if (mS < (w + h) * 0.35 || mK < (w + h) * 0.35) continue;
                const score = distFromKey[d.y][d.x] + distFromStart[d.y][d.x];
                if (score > maxDExit) {
                    maxDExit = score;
                    exit = d;
                }
            }
            if (!exit || distFromKey[exit.y][exit.x] < profile.minKToE) continue;

            // Verify BFS Paths
            const pathSToK = this.findBFSPath(grid, w, h, start, key);
            const pathKToE = this.findBFSPath(grid, w, h, key, exit);
            if (!pathSToK || !pathKToE) continue;

            // Mark Start, Key, Exit
            grid[start.y][start.x] = 'S';
            grid[key.y][key.x] = 'K';
            grid[exit.y][exit.x] = 'E';

            // 4. Find Monster Patrol Routes
            const monsters = this.findMonsterRoutes(grid, w, h, profile, start, key, exit);
            if (profile.monsterCount > 0 && monsters.length < profile.monsterCount) {
                continue;
            }

            const map = grid.map(r => r.join(''));

            return {
                id: levelNumber,
                number: levelNumber,
                title: profile.title,
                subtitle: profile.subtitle,
                instructions: profile.instructions,
                accentColor: profile.accentColor,
                wallFill: profile.wallFill,
                wallBorder: profile.wallBorder,
                wallHighlight: profile.wallHighlight,
                floorFill: profile.floorFill,
                floorDot: profile.floorDot,
                parTime: profile.parTime,
                parSteps: profile.parSteps,
                map,
                monsters,
                stats: {
                    stepsSToK: pathSToK.length,
                    stepsKToE: pathKToE.length,
                    deadEndsCount: deadEnds.length,
                    seed
                }
            };
        }

        return null;
    }

    static findMonsterRoutes(grid, w, h, profile, start, key, exit) {
        if (!profile.monsterCount || profile.monsterCount === 0) return [];

        const isProtected = (x, y) => {
            const dxS = Math.abs(x - start.x), dyS = Math.abs(y - start.y);
            const dxK = Math.abs(x - key.x), dyK = Math.abs(y - key.y);
            const dxE = Math.abs(x - exit.x), dyE = Math.abs(y - exit.y);
            return (dxS <= 1 && dyS <= 1) || (dxK <= 1 && dyK <= 1) || (dxE <= 1 && dyE <= 1);
        };

        const corridors = [];
        // Horizontal corridors
        for (let y = 2; y < h - 2; y++) {
            let startX = -1;
            for (let x = 1; x < w - 1; x++) {
                if (grid[y][x] === '.' && !isProtected(x, y)) {
                    if (startX === -1) startX = x;
                } else {
                    if (startX !== -1) {
                        const len = x - startX;
                        if (len >= 4) {
                            const wp = [];
                            for (let i = startX; i < Math.min(x, startX + 6); i++) wp.push({ x: i, y });
                            corridors.push({ type: 'H', y, wp, len: wp.length });
                        }
                        startX = -1;
                    }
                }
            }
        }
        // Vertical corridors
        for (let x = 2; x < w - 2; x++) {
            let startY = -1;
            for (let y = 1; y < h - 1; y++) {
                if (grid[y][x] === '.' && !isProtected(x, y)) {
                    if (startY === -1) startY = y;
                } else {
                    if (startY !== -1) {
                        const len = y - startY;
                        if (len >= 4) {
                            const wp = [];
                            for (let i = startY; i < Math.min(y, startY + 6); i++) wp.push({ x, y: i });
                            corridors.push({ type: 'V', x, wp, len: wp.length });
                        }
                        startY = -1;
                    }
                }
            }
        }

        const monsters = [];
        if (profile.monsterCount === 1) {
            const picked = corridors.length > 0 ? corridors[Math.floor(corridors.length / 2)] : null;
            if (picked) {
                monsters.push({
                    id: "m1",
                    name: "Grumble",
                    type: "blob",
                    color: "#ff3366",
                    eyeColor: "#ffffff",
                    pupilColor: "#111111",
                    speed: 1.8,
                    waypoints: picked.wp
                });
            }
        } else if (profile.monsterCount === 2) {
            if (corridors.length >= 2) {
                monsters.push({
                    id: "m1",
                    name: "Spike",
                    type: "bat",
                    color: "#ffaa00",
                    eyeColor: "#ffffff",
                    pupilColor: "#990000",
                    speed: 2.0,
                    waypoints: corridors[0].wp
                });
                monsters.push({
                    id: "m2",
                    name: "Phantom",
                    type: "ghost",
                    color: "#ff007f",
                    eyeColor: "#00ffff",
                    pupilColor: "#050014",
                    speed: 2.0,
                    waypoints: corridors[corridors.length - 1].wp
                });
            }
        }

        return monsters;
    }

    static bfsDistances(grid, w, h, from) {
        const dist = Array.from({ length: h }, () => Array(w).fill(-1));
        const q = [[from.x, from.y]];
        dist[from.y][from.x] = 0;
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        while (q.length > 0) {
            const [cx, cy] = q.shift();
            for (const [dx, dy] of dirs) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    if (grid[ny][nx] !== '#' && dist[ny][nx] === -1) {
                        dist[ny][nx] = dist[cy][cx] + 1;
                        q.push([nx, ny]);
                    }
                }
            }
        }
        return dist;
    }

    static findBFSPath(grid, w, h, from, to) {
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
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx] !== '#' && !vis[ny][nx]) {
                    vis[ny][nx] = true;
                    parent[ny][nx] = [cx, cy];
                    q.push([nx, ny]);
                }
            }
        }
        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MazeGenerator };
}

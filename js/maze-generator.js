// MAZE RUN — Dual-Map Procedural & Asymmetric Maze Generator
// Produces 2 completely distinct map architectures:
// MAP 1: Cyber Labyrinth — Geometric, sharp-turning circuit grid with deep alcoves.
// MAP 2: Shadow Labyrinth — Organic, asymmetric, meandering labyrinth generated with Randomized Prim's.
// Both maps feature strict 1-tile wide corridors, zero 2x2 voids, dynamic 3-walled alcove Key & Exit placement, and verified BFS solvability.

class MazeGenerator {
    static get MAP_CONFIGS() {
        return {
            cyber: {
                id: "cyber",
                name: "Cyber Labyrinth",
                theme: "Futuristic Neon",
                description: "Geometric neon grid with sharp turns, strict corridors, and sentry drones.",
                accentColor: "#00f0ff",
                levels: {
                    1: {
                        levelNumber: 1,
                        title: "LEVEL 1 — EASY",
                        subtitle: "Neon Circuit Beginner",
                        instructions: "Welcome to Cyber Labyrinth! Find the Golden Key 🔑 to unlock the Exit 🚪.",
                        width: 21,
                        height: 21,
                        minDeadEnds: 15,
                        minJunctions: 15,
                        minSToK: 25,
                        minKToE: 25,
                        parTime: 65,
                        parSteps: 95,
                        monsterCount: 0,
                        accentColor: "#00f0ff",
                        wallFill: "#07192d",
                        wallBorder: "#00f0ff",
                        wallHighlight: "#7cf7ff",
                        floorFill: "#040a16",
                        floorDot: "#0f2c4f"
                    },
                    2: {
                        levelNumber: 2,
                        title: "LEVEL 2 — MEDIUM",
                        subtitle: "Gridlock Protocol",
                        instructions: "Beware Grumble the Sentry! Deceptive dead ends and security bots patrol the grid.",
                        width: 27,
                        height: 27,
                        minDeadEnds: 30,
                        minJunctions: 30,
                        minSToK: 45,
                        minKToE: 45,
                        parTime: 110,
                        parSteps: 160,
                        monsterCount: 1,
                        accentColor: "#00f0ff",
                        wallFill: "#07192d",
                        wallBorder: "#00f0ff",
                        wallHighlight: "#7cf7ff",
                        floorFill: "#040a16",
                        floorDot: "#0f2c4f"
                    },
                    3: {
                        levelNumber: 3,
                        title: "LEVEL 3 — HARD",
                        subtitle: "Overclocked Core",
                        instructions: "EXTREME: Sentry Spike and Phantom patrol! Master the 35x35 grid or get trapped.",
                        width: 35,
                        height: 35,
                        minDeadEnds: 45,
                        minJunctions: 50,
                        minSToK: 65,
                        minKToE: 65,
                        parTime: 175,
                        parSteps: 250,
                        monsterCount: 2,
                        accentColor: "#00f0ff",
                        wallFill: "#07192d",
                        wallBorder: "#00f0ff",
                        wallHighlight: "#7cf7ff",
                        floorFill: "#040a16",
                        floorDot: "#0f2c4f"
                    }
                }
            },
            shadow: {
                id: "shadow",
                name: "Shadow Labyrinth",
                theme: "Dark Mysterious Void",
                description: "Organic, unpredictable void labyrinth with dense branching dead ends.",
                accentColor: "#d946ef",
                levels: {
                    1: {
                        levelNumber: 1,
                        title: "LEVEL 1 — EASY",
                        subtitle: "Whispering Catacombs",
                        instructions: "Enter the Shadow Realm! Find the Golden Key 🔑 hidden deep in dark alcoves.",
                        width: 21,
                        height: 21,
                        minDeadEnds: 15,
                        minJunctions: 15,
                        minSToK: 25,
                        minKToE: 25,
                        parTime: 65,
                        parSteps: 95,
                        monsterCount: 0,
                        accentColor: "#d946ef",
                        wallFill: "#1a0826",
                        wallBorder: "#c084fc",
                        wallHighlight: "#f472b6",
                        floorFill: "#0c0214",
                        floorDot: "#310d4a"
                    },
                    2: {
                        levelNumber: 2,
                        title: "LEVEL 2 — MEDIUM",
                        subtitle: "Nightshade Abyss",
                        instructions: "Nightshade haunts this twisted labyrinth! Watch for misleading forks.",
                        width: 27,
                        height: 27,
                        minDeadEnds: 30,
                        minJunctions: 30,
                        minSToK: 45,
                        minKToE: 45,
                        parTime: 110,
                        parSteps: 160,
                        monsterCount: 1,
                        accentColor: "#d946ef",
                        wallFill: "#1a0826",
                        wallBorder: "#c084fc",
                        wallHighlight: "#f472b6",
                        floorFill: "#0c0214",
                        floorDot: "#310d4a"
                    },
                    3: {
                        levelNumber: 3,
                        title: "LEVEL 3 — HARD",
                        subtitle: "Void of the Arch-Demon",
                        instructions: "EXTREME: Vortex and Specter stalk the abyss! Organic 35x35 maze with massive dead ends.",
                        width: 35,
                        height: 35,
                        minDeadEnds: 45,
                        minJunctions: 50,
                        minSToK: 65,
                        minKToE: 65,
                        parTime: 175,
                        parSteps: 250,
                        monsterCount: 2,
                        accentColor: "#d946ef",
                        wallFill: "#1a0826",
                        wallBorder: "#c084fc",
                        wallHighlight: "#f472b6",
                        floorFill: "#0c0214",
                        floorDot: "#310d4a"
                    }
                }
            }
        };
    }

    /**
     * Backward-compatible level profile getter
     */
    static get LEVEL_PROFILES() {
        return this.MAP_CONFIGS.cyber.levels;
    }

    /**
     * Backward-compatible level generator
     */
    static generateLevel(levelNumber, seed = null) {
        return this.generate('cyber', levelNumber, seed);
    }

    /**
     * Primary level generator for both maps
     * @param {string} mapId ('cyber' or 'shadow')
     * @param {number} levelNumber (1, 2, or 3)
     * @param {number|null} seed (optional PRNG seed)
     * @returns {Object} Complete level definition
     */
    static generate(mapId = 'cyber', levelNumber = 1, seed = null) {
        const mapDef = this.MAP_CONFIGS[mapId] || this.MAP_CONFIGS.cyber;
        const profile = mapDef.levels[levelNumber];
        if (!profile) throw new Error(`Unknown level: ${mapId} ${levelNumber}`);

        const w = profile.width;
        const h = profile.height;

        let prng = seed !== null ? (seed >>> 0) : ((Date.now() ^ (Math.random() * 0x7FFFFFFF)) >>> 0);
        function rand() {
            prng = (prng * 1664525 + 1013904223) % 4294967296;
            return (prng >>> 0) / 4294967296;
        }

        const maxAttempts = 60;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const grid = Array.from({ length: h }, () => Array(w).fill('#'));
            const visited = Array.from({ length: h }, () => Array(w).fill(false));

            if (mapId === 'cyber') {
                // MAP 1: Cyber Labyrinth (Growing Tree with 50% newest / 50% random branch + circuit turns)
                const active = [{ x: 1, y: 1 }];
                visited[1][1] = true;
                grid[1][1] = '.';
                const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];

                while (active.length > 0) {
                    const idx = rand() < 0.50 ? (active.length - 1) : Math.floor(rand() * active.length);
                    const cell = active[idx];
                    const neighbors = [];
                    for (const [dx, dy] of dirs) {
                        const nx = cell.x + dx, ny = cell.y + dy;
                        if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && !visited[ny][nx]) {
                            neighbors.push({ x: nx, y: ny, wallX: cell.x + dx / 2, wallY: cell.y + dy / 2 });
                        }
                    }
                    if (neighbors.length === 0) {
                        active.splice(idx, 1);
                    } else {
                        const picked = neighbors[Math.floor(rand() * neighbors.length)];
                        visited[picked.y][picked.x] = true;
                        grid[picked.y][picked.x] = '.';
                        grid[picked.wallY][picked.wallX] = '.';
                        active.push({ x: picked.x, y: picked.y });
                    }
                }
            } else {
                // MAP 2: Shadow Labyrinth (Randomized Prim's Frontier Algorithm — Organic, Asymmetric)
                const startX = 1, startY = 1;
                visited[startY][startX] = true;
                grid[startY][startX] = '.';
                const frontier = [];
                const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];

                function addFrontier(cx, cy) {
                    for (const [dx, dy] of dirs) {
                        const nx = cx + dx, ny = cy + dy;
                        if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && !visited[ny][nx]) {
                            if (!frontier.some(f => f.x === nx && f.y === ny)) {
                                frontier.push({ x: nx, y: ny });
                            }
                        }
                    }
                }

                addFrontier(startX, startY);

                while (frontier.length > 0) {
                    const idx = Math.floor(rand() * frontier.length);
                    const current = frontier.splice(idx, 1)[0];
                    const { x, y } = current;

                    if (visited[y][x]) continue;

                    const carved = [];
                    for (const [dx, dy] of dirs) {
                        const nx = x + dx, ny = y + dy;
                        if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && visited[ny][nx]) {
                            carved.push({ x: nx, y: ny, wallX: x + dx / 2, wallY: y + dy / 2 });
                        }
                    }

                    if (carved.length > 0) {
                        const picked = carved[Math.floor(rand() * carved.length)];
                        visited[y][x] = true;
                        grid[y][x] = '.';
                        grid[picked.wallY][picked.wallX] = '.';
                        addFrontier(x, y);
                    }
                }
            }

            // Verify strict zero 2x2 floor blocks
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

            // Collect true dead ends (surrounded by 3 walls, 1 open neighbor) and junctions
            const deadEnds = [];
            let junctions = 0;
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    if (grid[y][x] === '.') {
                        let open = 0;
                        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                            if (grid[y + dy][x + dx] !== '#') open++;
                        }
                        if (open === 1) deadEnds.push({ x, y });
                        if (open >= 3) junctions++;
                    }
                }
            }

            // Verify difficulty targets
            if (deadEnds.length < profile.minDeadEnds || junctions < profile.minJunctions) {
                continue;
            }

            const start = { x: 1, y: 1 };
            const distFromStart = this.bfsDistances(grid, w, h, start);
            if (distFromStart[start.y][start.x] !== 0) continue;

            // Dynamic Key Placement: deep dead-end alcove
            const validKeyCandidates = deadEnds.filter(d =>
                !(d.x === start.x && d.y === start.y) &&
                distFromStart[d.y][d.x] >= profile.minSToK
            );
            if (validKeyCandidates.length === 0) continue;

            validKeyCandidates.sort((a, b) => distFromStart[b.y][b.x] - distFromStart[a.y][a.x]);
            const topKeyPool = validKeyCandidates.slice(0, Math.min(6, validKeyCandidates.length));
            const key = topKeyPool[Math.floor(rand() * topKeyPool.length)];

            // Dynamic Exit Placement: deep dead-end alcove separated from both Start and Key
            const distFromKey = this.bfsDistances(grid, w, h, key);
            const validExitCandidates = deadEnds.filter(d =>
                !(d.x === start.x && d.y === start.y) &&
                !(d.x === key.x && d.y === key.y) &&
                distFromKey[d.y][d.x] >= profile.minKToE &&
                distFromStart[d.y][d.x] >= Math.floor(profile.minSToK * 0.7)
            );
            if (validExitCandidates.length === 0) continue;

            validExitCandidates.sort((a, b) =>
                (distFromKey[b.y][b.x] + distFromStart[b.y][b.x]) - (distFromKey[a.y][a.x] + distFromStart[a.y][a.x])
            );
            const topExitPool = validExitCandidates.slice(0, Math.min(6, validExitCandidates.length));
            const exit = topExitPool[Math.floor(rand() * topExitPool.length)];

            // Verify BFS Paths
            const pathSToK = this.findBFSPath(grid, w, h, start, key);
            const pathKToE = this.findBFSPath(grid, w, h, key, exit);
            if (!pathSToK || !pathKToE) continue;

            // Mark Start, Key, Exit
            grid[start.y][start.x] = 'S';
            grid[key.y][key.x] = 'K';
            grid[exit.y][exit.x] = 'E';

            // Find Monster Routes
            const monsters = this.findMonsterRoutes(grid, w, h, profile, start, key, exit, mapId);
            if (profile.monsterCount > 0 && monsters.length < profile.monsterCount) {
                continue;
            }

            const map = grid.map(r => r.join(''));

            return {
                id: `${mapId}_${levelNumber}`,
                mapId,
                number: levelNumber,
                levelNumber: levelNumber,
                title: profile.title,
                subtitle: profile.subtitle,
                instructions: profile.instructions,
                width: profile.width,
                height: profile.height,
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
                    junctionsCount: junctions,
                    keyPos: key,
                    exitPos: exit,
                    seed
                }
            };
        }

        return null;
    }

    static findMonsterRoutes(grid, w, h, profile, start, key, exit, mapId = 'cyber') {
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

        if (corridors.length < profile.monsterCount) return [];

        const monsters = [];
        if (mapId === 'cyber') {
            if (profile.monsterCount === 1) {
                monsters.push({
                    id: "m1",
                    name: "Grumble",
                    type: "blob",
                    color: "#ff3366",
                    eyeColor: "#ffffff",
                    pupilColor: "#111111",
                    speed: 1.8,
                    waypoints: corridors[Math.floor(corridors.length / 2)].wp
                });
            } else if (profile.monsterCount === 2) {
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
                    color: "#00ffff",
                    eyeColor: "#050014",
                    pupilColor: "#ffffff",
                    speed: 2.0,
                    waypoints: corridors[corridors.length - 1].wp
                });
            }
        } else {
            // Shadow monsters
            if (profile.monsterCount === 1) {
                monsters.push({
                    id: "m1",
                    name: "Nightshade",
                    type: "blob",
                    color: "#e879f9",
                    eyeColor: "#ffffff",
                    pupilColor: "#111111",
                    speed: 1.8,
                    waypoints: corridors[Math.floor(corridors.length / 2)].wp
                });
            } else if (profile.monsterCount === 2) {
                monsters.push({
                    id: "m1",
                    name: "Vortex",
                    type: "bat",
                    color: "#c084fc",
                    eyeColor: "#ffffff",
                    pupilColor: "#3b0764",
                    speed: 2.0,
                    waypoints: corridors[0].wp
                });
                monsters.push({
                    id: "m2",
                    name: "Specter",
                    type: "ghost",
                    color: "#f43f5e",
                    eyeColor: "#ffffff",
                    pupilColor: "#881337",
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

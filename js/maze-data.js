// Level definitions for MAZE RUN
// High-complexity asymmetric labyrinths with deceptive dead-ends, non-obvious chambers, and strategic monster patrols!

const MAZE_LEVELS = [
    {
        id: 1,
        number: 1,
        title: "LEVEL 1 — EASY",
        subtitle: "The Winding Vault",
        instructions: "Find the Golden Key 🔑 to unlock the Exit Portal 🚪! Watch out for dead ends.",
        accentColor: "#00f0ff",      // Neon Cyan
        wallFill: "#0b2239",
        wallBorder: "#00e5ff",
        wallHighlight: "#7cf7ff",
        floorFill: "#060b17",
        floorDot: "#12203d",
        parTime: 55,
        parSteps: 90,
        map: [
            "#################",
            "#S#.....#.....#.#",
            "#.###.#.#.###.#.#",
            "#.....#...#E#...#",
            "###########.###.#",
            "#.....#...#.....#",
            "#.###.#.#.#.#####",
            "#.#.#...#...#..K#",
            "#.#.#########.###",
            "#...#...#...#...#",
            "###.#.#.#.#.###.#",
            "#.....#...#.....#",
            "#################"
        ],
        monsters: []
    },
    {
        id: 2,
        number: 2,
        title: "LEVEL 2 — MEDIUM",
        subtitle: "Sentry Shadow Labyrinth",
        instructions: "Beware Grumble the Sentry! Watch out for deceptive loop paths and deep dead ends.",
        accentColor: "#d946ef",      // Neon Magenta
        wallFill: "#260e38",
        wallBorder: "#d946ef",
        wallHighlight: "#f59e0b",
        floorFill: "#0e071c",
        floorDot: "#271247",
        parTime: 95,
        parSteps: 130,
        map: [
            "#######################",
            "#S....#.....#.....#...#",
            "#.###.###.#.#.###.#.#.#",
            "#...#.....#.#...#...#.#",
            "#.#.#######.###.#####.#",
            "#.#...#.....#...#.#...#",
            "###.###.#####.###.#.###",
            "#...#...#.....#K#...#.#",
            "#.###.#####.###.#.###.#",
            "#...#...#...#...#.....#",
            "#.#.###.#.###.#.#####.#",
            "#.#...#.#.#...#.#...#.#",
            "#.###.#.#.#.#.###.#.#.#",
            "#..E#.....#.#.....#...#",
            "#######################"
        ],
        monsters: [
            {
                id: "m1",
                name: "Grumble",
                type: "blob",
                color: "#ff3366",
                eyeColor: "#ffffff",
                pupilColor: "#111111",
                speed: 1.8,
                waypoints: [
                    { x: 7, y: 1 },
                    { x: 8, y: 1 },
                    { x: 9, y: 1 },
                    { x: 10, y: 1 },
                    { x: 11, y: 1 }
                ]
            }
        ]
    },
    {
        id: 3,
        number: 3,
        title: "LEVEL 3 — HARD",
        subtitle: "Dungeon of the Twin Phantoms",
        instructions: "Two fast sentry phantoms guard the maze! Long corridors end in traps—stay alert.",
        accentColor: "#00ff88",      // Neon Green
        wallFill: "#09291b",
        wallBorder: "#00ff88",
        wallHighlight: "#ffd700",
        floorFill: "#04140e",
        floorDot: "#0f3d2a",
        parTime: 125,
        parSteps: 160,
        map: [
            "###########################",
            "#S#.....#.....#.....#.....#",
            "#.#.###.#####.#.#.###.#.#.#",
            "#.#.#.......#...#.....#.#.#",
            "#.#.#.#####.#########.#.###",
            "#...#.....#.....#...#K#...#",
            "#######.#.#####.#.#.#####.#",
            "#.#.....#.#.#...#.#.....#.#",
            "#.#.#.###.#.#.###.###.#.#.#",
            "#.#.#...#...#...#...#.#.#.#",
            "#.#.###.###.###.###.#.#.#.#",
            "#...#...#E..#...#...#...#.#",
            "#.###.#######.###.###.###.#",
            "#...#.#.....#.#...#...#...#",
            "###.#.#.###.#.###.#.###.#.#",
            "#...#.....#.......#.....#.#",
            "###########################"
        ],
        monsters: [
            {
                id: "m1",
                name: "Spike",
                type: "bat",
                color: "#ffaa00",
                eyeColor: "#ffffff",
                pupilColor: "#990000",
                speed: 2.0,
                waypoints: [
                    { x: 9, y: 1 },
                    { x: 10, y: 1 },
                    { x: 11, y: 1 },
                    { x: 12, y: 1 },
                    { x: 13, y: 1 }
                ]
            },
            {
                id: "m2",
                name: "Phantom",
                type: "ghost",
                color: "#ff007f",
                eyeColor: "#00ffff",
                pupilColor: "#050014",
                speed: 2.0,
                waypoints: [
                    { x: 19, y: 15 },
                    { x: 20, y: 15 },
                    { x: 21, y: 15 },
                    { x: 22, y: 15 },
                    { x: 23, y: 15 }
                ]
            }
        ]
    }
];

/**
 * Get level definition with optional procedural variation
 * @param {number} levelNumber (1, 2, or 3)
 * @param {boolean} generateVariation (whether to procedurally generate a fresh layout)
 * @returns {Object} Level definition
 */
function getLevelDefinition(levelNumber, generateVariation = false) {
    let Gen = typeof MazeGenerator !== 'undefined' ? MazeGenerator : null;
    if (!Gen && typeof require !== 'undefined') {
        try {
            Gen = require('./maze-generator').MazeGenerator;
        } catch (e) {
            Gen = null;
        }
    }

    if (generateVariation && Gen) {
        const procedural = Gen.generateLevel(levelNumber);
        if (procedural) {
            return procedural;
        }
    }
    return MAZE_LEVELS[levelNumber - 1];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAZE_LEVELS, getLevelDefinition };
}

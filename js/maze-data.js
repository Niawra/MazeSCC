// Level definitions for MAZE RUN
// Intricate, challenging labyrinths with deceptive paths, dead-ends, and strategic monster patrols!

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
        parTime: 40,
        parSteps: 65,
        map: [
            "###############",
            "#S#...#...#...#",
            "#.#.#.#.#.###.#",
            "#...#.#.#.....#",
            "#####.#.#####.#",
            "#.#...#...#...#",
            "#.#.#####.#.###",
            "#...#...#.#...#",
            "#.###.#.#.###.#",
            "#E....#...#..K#",
            "###############"
        ],
        monsters: []
    },
    {
        id: 2,
        number: 2,
        title: "LEVEL 2 — MEDIUM",
        subtitle: "Sentry Shadow Labyrinth",
        instructions: "Beware Grumble the Sentry! Sneak past when it turns and avoid dead-end traps.",
        accentColor: "#d946ef",      // Neon Magenta
        wallFill: "#260e38",
        wallBorder: "#d946ef",
        wallHighlight: "#f59e0b",
        floorFill: "#0e071c",
        floorDot: "#271247",
        parTime: 65,
        parSteps: 90,
        map: [
            "#####################",
            "#S#.....#...#.....#K#",
            "#.#####.#.#.#.#.#.#.#",
            "#.....#.#.#...#.#...#",
            "#####.#.#.#####.#####",
            "#.#...#.......#.....#",
            "#.#.#######.#######.#",
            "#...#...#...#.....#.#",
            "#.###.#.#####.###.#.#",
            "#...#.#...#...#.#...#",
            "###.#.###.#.###.###.#",
            "#E....#.....#.......#",
            "#####################"
        ],
        monsters: [
            {
                id: "m1",
                name: "Grumble",
                type: "blob",
                color: "#ff3366",
                eyeColor: "#ffffff",
                pupilColor: "#111111",
                speed: 1.8, // tiles per second
                waypoints: [
                    { x: 7, y: 5 },
                    { x: 8, y: 5 },
                    { x: 9, y: 5 },
                    { x: 10, y: 5 },
                    { x: 11, y: 5 },
                    { x: 12, y: 5 },
                    { x: 13, y: 5 }
                ]
            }
        ]
    },
    {
        id: 3,
        number: 3,
        title: "LEVEL 3 — HARD",
        subtitle: "Dungeon of the Twin Phantoms",
        instructions: "Two aggressive monsters guard the labyrinth! Paths are deceptive—plan every step.",
        accentColor: "#00ff88",      // Neon Green
        wallFill: "#09291b",
        wallBorder: "#00ff88",
        wallHighlight: "#ffd700",
        floorFill: "#04140e",
        floorDot: "#0f3d2a",
        parTime: 95,
        parSteps: 125,
        map: [
            "#########################",
            "#S#...#...#...#.......#.#",
            "#.###.#.#.#.#.#.###.#.#.#",
            "#...#...#...#...#...#...#",
            "###.#.###########.#####.#",
            "#.#.#.......#.#...#.#...#",
            "#.#.#######.#.#.###.#.###",
            "#...#.....#...#.#...#...#",
            "#.###.###.#####.###.###.#",
            "#...#...#.#...#.#.....#.#",
            "###.###.#.#.#.#.#.#####.#",
            "#...#...#.#.#...#...#...#",
            "#..##.###.#.#####.#.#.###",
            "#E....#.....#.....#....K#",
            "#########################"
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
                    { x: 15, y: 1 },
                    { x: 16, y: 1 },
                    { x: 17, y: 1 },
                    { x: 18, y: 1 },
                    { x: 19, y: 1 },
                    { x: 20, y: 1 },
                    { x: 21, y: 1 }
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
                    { x: 17, y: 9 },
                    { x: 18, y: 9 },
                    { x: 19, y: 9 },
                    { x: 20, y: 9 },
                    { x: 21, y: 9 }
                ]
            }
        ]
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAZE_LEVELS };
}

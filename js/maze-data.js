// Level definitions for MAZE RUN
// All maps are verified solvable with guaranteed open routes!

const MAZE_LEVELS = [
    {
        id: 1,
        number: 1,
        title: "LEVEL 1 — EASY",
        subtitle: "Rookie Run",
        instructions: "Find the Golden Key 🔑 to unlock the Exit Portal 🚪!",
        accentColor: "#00f0ff",      // Neon Cyan
        wallFill: "#0b2239",
        wallBorder: "#00e5ff",
        wallHighlight: "#7cf7ff",
        floorFill: "#060b17",
        floorDot: "#12203d",
        parTime: 25,
        parSteps: 35,
        map: [
            "#############",
            "#S....#....K#",
            "#.###.#.###.#",
            "#.#...#...#.#",
            "#.#.#####.#.#",
            "#.#.......#.#",
            "#.#.#####.#.#",
            "#...#...#...#",
            "###.#.#.#.###",
            "#.....#....E#",
            "#############"
        ],
        monsters: []
    },
    {
        id: 2,
        number: 2,
        title: "LEVEL 2 — MEDIUM",
        subtitle: "Sentry Shadow",
        instructions: "Beware the patrolling sentry monster! Watch its route and sneak past.",
        accentColor: "#d946ef",      // Neon Magenta
        wallFill: "#260e38",
        wallBorder: "#d946ef",
        wallHighlight: "#f59e0b",
        floorFill: "#0e071c",
        floorDot: "#271247",
        parTime: 45,
        parSteps: 60,
        map: [
            "#################",
            "#S....#.....#..K#",
            "#.###.#.###.#.###",
            "#...#...#...#...#",
            "###.#####.#####.#",
            "#...#.....#...#.#",
            "#.###.###.#.#.#.#",
            "#...#.......#...#",
            "###.#########.###",
            "#...#.......#...#",
            "#.###.#####.###.#",
            "#.....#....#...E#",
            "#################"
        ],
        monsters: [
            {
                id: "m1",
                name: "Grumble",
                type: "blob",
                color: "#ff3366",
                eyeColor: "#ffffff",
                pupilColor: "#111111",
                speed: 1.6, // tiles per second
                waypoints: [
                    { x: 5, y: 7 },
                    { x: 6, y: 7 },
                    { x: 7, y: 7 },
                    { x: 8, y: 7 },
                    { x: 9, y: 7 },
                    { x: 10, y: 7 },
                    { x: 11, y: 7 }
                ]
            }
        ]
    },
    {
        id: 3,
        number: 3,
        title: "LEVEL 3 — HARD",
        subtitle: "Labyrinth Escape",
        instructions: "Two sentry monsters guard the corridors! Timing is everything.",
        accentColor: "#00ff88",      // Neon Green
        wallFill: "#09291b",
        wallBorder: "#00ff88",
        wallHighlight: "#ffd700",
        floorFill: "#04140e",
        floorDot: "#0f3d2a",
        parTime: 65,
        parSteps: 80,
        map: [
            "#####################",
            "#S..#.....#.....#..K#",
            "#.###.###.#.###.#.###",
            "#...#.#.......#.#...#",
            "###.#.#.#####.#.###.#",
            "#.....#.....#.#.....#",
            "#.###.#####.#.#####.#",
            "#.#...#.....#.....#.#",
            "#.#.###.###.#####.#.#",
            "#.#.....#.#.....#.#.#",
            "#.#####.#.#####.#.#.#",
            "#.......#...#...#...#",
            "###.#.#####.#.#####.#",
            "#...#.......#......E#",
            "#####################"
        ],
        monsters: [
            {
                id: "m1",
                name: "Spike",
                type: "bat",
                color: "#ffaa00",
                eyeColor: "#ffffff",
                pupilColor: "#990000",
                speed: 1.8,
                waypoints: [
                    { x: 7, y: 5 },
                    { x: 8, y: 5 },
                    { x: 9, y: 5 },
                    { x: 10, y: 5 },
                    { x: 11, y: 5 }
                ]
            },
            {
                id: "m2",
                name: "Phantom",
                type: "ghost",
                color: "#ff007f",
                eyeColor: "#00ffff",
                pupilColor: "#050014",
                speed: 1.8,
                waypoints: [
                    { x: 5, y: 13 },
                    { x: 6, y: 13 },
                    { x: 7, y: 13 },
                    { x: 8, y: 13 },
                    { x: 9, y: 13 },
                    { x: 10, y: 13 },
                    { x: 11, y: 13 }
                ]
            }
        ]
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAZE_LEVELS };
}

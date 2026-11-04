// BFS Pathfinder for MAZE RUN
// Finds shortest paths for hints and route validation

class Pathfinder {
    /**
     * Finds shortest path from {x, y} to {x, y} on grid
     * @param {Array<Array<number>>} grid - 0 for open, 1 for wall
     * @param {number} width 
     * @param {number} height 
     * @param {{x: number, y: number}} from 
     * @param {{x: number, y: number}} to 
     * @returns {Array<{x: number, y: number}> | null} Array of coordinates including start and destination
     */
    static findPath(grid, width, height, from, to) {
        if (!from || !to) return null;
        if (from.x === to.x && from.y === to.y) return [from];

        const queue = [[from.x, from.y]];
        const visited = Array.from({ length: height }, () => Array(width).fill(false));
        const parent = Array.from({ length: height }, () => Array(width).fill(null));

        visited[from.y][from.x] = true;
        const dirs = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];

        while (queue.length > 0) {
            const [cx, cy] = queue.shift();

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

            for (const d of dirs) {
                const nx = cx + d.x;
                const ny = cy + d.y;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (grid[ny][nx] === 0 && !visited[ny][nx]) {
                        visited[ny][nx] = true;
                        parent[ny][nx] = [cx, cy];
                        queue.push([nx, ny]);
                    }
                }
            }
        }

        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pathfinder };
}

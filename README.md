# 🎮 MAZE RUN — Retro Pixel Maze Game
## Dual-Map Edition • 6 Levels • Extreme Asymmetric Labyrinths

A complete, fully functional browser-based retro pixel-art maze game built for a school technology event for middle school students, expanded with **2 distinct map architectures** and **extreme labyrinth difficulty**.

![HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%2B%20Vanilla%20JS-brightgreen)
![Web Audio API](https://img.shields.io/badge/Audio-Synthesized%20Web%20Audio-cyan)
![Zero Dependencies](https://img.shields.io/badge/Backend-Zero%20Dependencies%20(Pure%20Static)-yellow)
![Tested](https://img.shields.io/badge/E2E%20Tests-100%25%20Passed-blue)
![Maps](https://img.shields.io/badge/Maps-2%20Maps%20%7C%206%20Levels-magenta)

---

## 🌟 Major Highlights & Dual-Map Architecture

### 🌐 MAP 1: Cyber Labyrinth
- **Theme:** Futuristic Neon Cyber Grid (`#00f0ff` neon cyan glow, dark circuit floor).
- **Generator Algorithm:** Geometric Growing Tree with anti-runway momentum bias and 90° circuit turns.
- **Characteristics:** Dense geometric walls, sharp corridor turns, deceptive dead-end pockets, and robotic sentries.
  - **Level 1 — Easy ($21 \times 21$):** $\ge 15$ dead ends, $\ge 15$ junctions, 0 monsters. Introduction to deep maze exploration.
  - **Level 2 — Medium ($27 \times 27$):** $\ge 30$ dead ends, $\ge 30$ junctions, 1 patrolling sentry (*Grumble the Blob*, speed 1.8).
  - **Level 3 — Extreme ($35 \times 35$):** $\ge 45$ dead ends, $\ge 50$ junctions, 2 patrolling sentries (*Spike the Bat* and *Phantom the Ghost*, speed 2.0).

### 🌑 MAP 2: Shadow Labyrinth
- **Theme:** Dark Mysterious Void (`#d946ef` / `#c084fc` void purple/magenta glow, deep abyss floor).
- **Generator Algorithm:** Randomized Prim's Frontier Carving with high organic branch dispersion.
- **Characteristics:** Organic, asymmetric, unpredictable meandering corridors, dense forks, and void demons. **NOT a recolor or size clone of Map 1!**
  - **Level 1 — Easy ($21 \times 21$):** $\ge 15$ dead ends, $\ge 15$ junctions, 0 monsters. Meandering catacombs with deceptive dead ends.
  - **Level 2 — Medium ($27 \times 27$):** $\ge 30$ dead ends, $\ge 30$ junctions, 1 patrolling void stalker (*Nightshade the Shade*, speed 1.8).
  - **Level 3 — Extreme ($35 \times 35$):** $\ge 45$ dead ends, $\ge 50$ junctions, 2 patrolling arch-demons (*Vortex the Void Bat* and *Specter the Phantom*, speed 2.0).

---

## 🏰 Strict Wall Structure & Placement Mechanics

1. **Strictly 1-Tile Corridors & Zero $2 \times 2$ Voids:**
   - Lattice vertex carving guarantees that corner wall vertices remain solid.
   - Corridors are strictly 1 tile wide (`.`); there are **zero** $2 \times 2$ floor voids (`.. / ..`) anywhere on the map.
   - Outer border is completely enclosed with solid boundary walls.
   - Seamless autotiled rendering connects contiguous walls with glowing neon contour lines on exterior corridor-facing edges.
2. **Dynamic 3-Walled Cul-de-Sac Alcoves:**
   - The Golden Key (`🔑`) and Exit Portal (`🚪`) are **never placed at fixed or predictable coordinates**.
   - Every generation or restart dynamically selects alcove cells from candidate dead ends surrounded on 3 sides by walls (`openNeighbors === 1`).
   - Placement is ranked via **BFS shortest-path distance**: Key is placed in a deep dead end far from Start, and Exit is placed in a separate deep dead end far from both Start and Key.
   - Players cannot cut across or spot the objectives through open gaps.

---

## 🗺️ Independent Progression & Level Selection System

- **Map & Level Selection Screen (`#screen-select`):**
  - Interactive tabs to switch between **MAP 1: CYBER** and **MAP 2: SHADOW**.
  - Each map has independent level progression saved in `localStorage`:
    - Level 1 is unlocked initially for both maps.
    - Beating Level 1 unlocks Level 2; beating Level 2 unlocks Level 3.
    - Completing levels on Map 1 does not affect Map 2, and vice versa.
    - All unlocked levels can be freely replayed anytime to beat personal best times or score records.
  - Displays total stars ($\text{max } 9$ per map), completion status, best completion times, best step counts, and level score.
  - One-click progress reset button with confirmation dialog.

---

## 🕹️ Controls & Navigation

| Action | Desktop Keyboard | Mobile / Tablet Touch |
| :--- | :--- | :--- |
| **Move Up** | `W` or `↑` | Tap **▲** button or swipe up |
| **Move Down** | `S` or `↓` | Tap **▼** button or swipe down |
| **Move Left** | `A` or `←` | Tap **◀** button or swipe left |
| **Move Right** | `D` or `→` | Tap **▶** button or swipe right |
| **Use Hint (BFS illumination)** | `H` key | Tap **💡 Hint** button (3 per level) |
| **Restart Level (New variation)** | `R` key | Tap **🔄 Restart** button |
| **Open Map & Level Select** | `M` key | Tap **🗺️ Map** button in HUD |
| **Pause / Resume** | `P` or `Esc` | Tap **⏸️ Pause** button |
| **Toggle 8-bit Audio** | — | Tap **🔊 Sound** button |

---

## 🚀 How to Run the Game

### Method 1: Direct File Open (Zero Setup!)
No build steps, node, or servers required:
1. Locate [`index.html`](file:///c:/Users/tania/Downloads/maze_scc/index.html) in the project folder.
2. Double-click [`index.html`](file:///c:/Users/tania/Downloads/maze_scc/index.html) to open in Google Chrome, Microsoft Edge, Firefox, or Safari.
3. Click **▶ CHOOSE MAP & PLAY** to select your labyrinth and begin playing!

### Method 2: Local HTTP Server (Optional)
```bash
# Using Node.js
npx serve .

# Or using Python
python -m http.server 8000
```
Open `http://localhost:3000` (or `http://localhost:8000`) in your browser.

---

## 🧪 Comprehensive Automated Test Suites

The codebase includes full automated test coverage:

```bash
# 1. Verify all 6 Master Levels & Procedural Variations against difficulty metrics:
# (Checks size >= 21x21 / 27x27 / 35x35, zero 2x2 voids, dead ends, junctions, 3-wall alcoves, BFS solvability)
node tests/verify_all_levels.js

# 2. Run Game Engine & Progression Unit Tests:
# (Tests movement, collision, monsters, hints, independent map progress, dynamic alcove variance)
node tests/test_game_engine.js

# 3. Run End-to-End Browser Tests (Puppeteer headless Chrome):
# (Drives all 20 scenarios: Map select tabs, Level 1 -> 3 completion, victory screen, map switching)
node tests/e2e_browser_test.js

# 4. Run Mobile Viewport Responsiveness Test (iPhone 390x844):
node tests/test_mobile_viewport.js
```

---

## 📂 Project Structure

```
maze_scc/
├── index.html              # Main HTML5 game container, HUD, modals & Map Select screen
├── css/
│   └── style.css           # Retro pixel arcade styling, responsive layout & neon glowing cards
├── js/
│   ├── audio.js            # Synthesized 8-bit Web Audio API sound effects
│   ├── maze-generator.js   # Dual procedural generator: Cyber (DFS/Tree) & Shadow (Prim's)
│   ├── maze-data.js        # Map profiles, deterministic master levels & ProgressionManager
│   ├── pathfinder.js       # BFS shortest-path finder for hint system & solvability checks
│   ├── sprites.js          # Procedural pixel-art rendering for player, key, exit, monsters, walls
│   └── game.js             # Main game loop, state machine, input handling & canvas scaling
├── tests/
│   ├── verify_all_levels.js     # Validates all 6 levels against strict metric requirements
│   ├── test_game_engine.js      # 47 unit tests for game logic, collisions & progression
│   ├── e2e_browser_test.js      # 20 automated Puppeteer browser tests
│   ├── test_mobile_viewport.js  # Mobile touch D-pad & viewport tests
│   └── screenshots/             # Generated test screenshots
└── README.md               # Complete game documentation & guide
```

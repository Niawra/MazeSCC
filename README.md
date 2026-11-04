# 🎮 MAZE RUN — Retro Pixel Maze Game

A complete, fully functional browser-based retro pixel-art maze game built for a school technology event for middle school students.

![HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%2B%20Vanilla%20JS-brightgreen)
![Web Audio API](https://img.shields.io/badge/Audio-Synthesized%20Web%20Audio-cyan)
![Zero Dependencies](https://img.shields.io/badge/Backend-Zero%20Dependencies%20(Pure%20Static)-yellow)
![Tested](https://img.shields.io/badge/E2E%20Tests-100%25%20Passed-blue)

---

## 🌟 Highlights & Enhanced Labyrinth Design

- **Challenging, Authentic Labyrinths:** Redesigned with deceptive branching, false shortcuts, and deep dead-end traps. Straight unblocked corridors are strictly limited so the path cannot be guessed at a glance!
- **Opposite Placement Strategy:** Keys and Exit doors are placed in opposite sectors separated by dividing maze walls. Players cannot simply dash down a single column or row; they must navigate through intricate winding passages twice (once to the Golden Key, then back across through monster sectors to the Exit Portal).
- **Procedural Maze Generation & Layout Variation:** Every restart (`R` key or Restart button in HUD / Pause modal) dynamically generates a brand-new, 100% BFS-verified labyrinth with randomized organic paths, deep dead ends, and safe monster patrol corridors.
- **Three Progressive Playable Levels:**
  - **Level 1 — Easy (The Winding Vault, 17 × 13):** 73-step journey to the Golden Key, 59-step return to Exit. Introduces players to real maze navigation with multiple dead ends and non-obvious chambers. No monsters.
  - **Level 2 — Medium (Sentry Shadow Labyrinth, 23 × 15):** 95-step journey to Key, 83-step return to Exit. Features organic asymmetric walls, deceptive loops, deep dead-end traps, and a central bottleneck patrolled by *Grumble the Sentry* (1.8 tiles/s) with safe pockets to time your dash.
  - **Level 3 — Hard (Dungeon of the Twin Phantoms, 27 × 17):** 111-step journey to Key, 95-step return to Exit. Complex, multilayered labyrinth with 10+ deep dead-end traps and 2 aggressive sentry monsters (*Spike the Bat* and *Phantom the Ghost*, 2.0 tiles/s) guarding critical crossover corridors.
- **Player Controls:**
  - **Desktop / Laptop:** Arrow Keys or **WASD** with input buffering for smooth corner turns.
  - **Mobile / Tablet:** Ergonomic on-screen virtual Directional Pad (D-Pad) with haptic feedback and swipe support.
  - **Collision System:** Player cannot pass through walls. Touching a monster triggers screen shake and resets player to the level start position.
- **Pathfinding Hint System:** 3 hints per level. Clicking **💡 Hint** (or pressing `H`) runs a BFS pathfinder and illuminates the next steps of the optimal route towards the objective for 5 seconds.
- **HUD & Stats:** Real-time millisecond-accurate timer, step counter, key status badge, exit status badge, level title, and quick-action buttons.
- **Pause & Resume:** Pauses timer, entity updates, and inputs.
- **Restart Level:** Instant level reset at any point.
- **Built-in 8-Bit Chiptune Sound:** Self-contained Web Audio API synthesizer for footsteps, wall bumps, key pickup arpeggios, portal unlocks, monster hit zaps, victory fanfares, and UI blips, with a persistent mute toggle (zero external audio files or broken links).
- **Level Completion & Victory Screens:** Completion summaries with star ratings (1–3 stars), score breakdown, final cumulative rank (S+, S, A, B), and animated confetti celebration.
- **Responsive Design:** Automatically calculates optimal tile sizing to fit desktop monitors, laptops, tablets, and mobile smartphones in portrait or landscape.

---

## 🚀 How to Run the Game

### Method 1: Direct File Open (Simplest)
No installation, node, or servers required!
1. Locate [`index.html`](file:///c:/Users/tania/Downloads/maze_scc/index.html) in the project folder.
2. Double-click [`index.html`](file:///c:/Users/tania/Downloads/maze_scc/index.html) to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.
3. Click **▶ START GAME** and enjoy!

### Method 2: Local HTTP Server (Optional)
If you prefer running through a local web server:
```bash
# Using Node.js (built-in npx)
npx serve .

# Or using Python (if installed)
python -m http.server 8000
```
Then visit `http://localhost:3000` (or `http://localhost:8000`) in your browser.

---

## 🕹️ Game Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Up** | `W` or `↑` | Tap **▲** button or swipe up |
| **Move Down** | `S` or `↓` | Tap **▼** button or swipe down |
| **Move Left** | `A` or `←` | Tap **◀** button or swipe left |
| **Move Right** | `D` or `→` | Tap **▶** button or swipe right |
| **Use Hint** | `H` key | Tap **💡 Hint** button |
| **Restart Level** | `R` key | Tap **🔄 Restart** button |
| **Pause / Resume** | `P` or `Esc` | Tap **⏸️ Pause** button |
| **Toggle Mute** | — | Tap **🔊 Sound** button |

---

## 🎯 Gameplay Rules & Mechanics

1. **Find the Key:** Every maze contains 1 Golden Key (`🔑`). The exit portal (`🚪`) is locked with a heavy padlock until you retrieve the key.
2. **Unlock the Portal:** After collecting the key, the exit portal springs to life with swirling neon vortex rings. Step onto the exit portal to complete the level.
3. **Beware the Monsters (Levels 2 & 3):**
   - Monsters patrol back-and-forth along fixed corridors.
   - Touching a monster triggers an alert and sends you back to the start position of that level.
   - Keys already collected remain saved so you only need to sneak past and escape.
4. **Hints:** You have 3 hints per level. If you are ever lost, activate a hint to see glowing breadcrumbs pointing towards the Key (or Exit).
5. **Scoring Formula:**
   $$\text{Score} = 1000 + \max(0, (\text{ParTime} - \text{Time}) \times 25) + \max(0, (\text{ParSteps} - \text{Steps}) \times 15) + (\text{HintsLeft} \times 100)$$

---

## 🧪 Automated Testing

The game includes both unit and end-to-end browser tests verifying all requirements:

```bash
# 1. Run engine & maze connectivity tests:
node tests/test_game_engine.js
node tests/verify_all_levels.js

# 2. Run full End-to-End browser test (all 3 levels + mechanics):
node tests/e2e_browser_test.js

# 3. Run mobile viewport responsiveness test:
node tests/test_mobile_viewport.js
```

### Verified Test Results:
- ✅ Outer maze boundaries fully enclosed.
- ✅ All 3 levels verified 100% solvable via Breadth-First Search.
- ✅ Monster waypoints verified clear and open.
- ✅ Player wall collisions stop movement.
- ✅ Key collection unlocks the exit door.
- ✅ Reaching exit without key is blocked.
- ✅ Touching monsters resets player to level start.
- ✅ Timer accurately freezes on pause and level complete.
- ✅ 3 hints per level correctly calculate shortest paths.
- ✅ Both keyboard and touch D-Pad controls tested.
- ✅ Star ratings, scoring, and Final Victory screen with Play Again verified.

---

## 📁 File Structure

```
maze_scc/
├── index.html              # Main HTML5 application shell & UI overlays
├── css/
│   └── style.css           # Retro arcade styling, neon theme, responsive layout
├── js/
│   ├── audio.js            # Self-contained Web Audio API 8-bit sound effects
│   ├── maze-generator.js   # Procedural asymmetric labyrinth generator with turn bias & BFS verification
│   ├── maze-data.js        # Enhanced challenging level definitions & monster routes
│   ├── pathfinder.js       # Breadth-First Search (BFS) pathfinder for hints
│   ├── sprites.js          # Pixel-art rendering (Player, Key, Portal, Monsters)
│   └── game.js             # Core game engine, states, inputs, physics, and HUD
├── tests/
│   ├── test_game_engine.js      # Headless test for movement, collisions, hints
│   ├── verify_all_levels.js     # BFS route and monster waypoint verification
│   ├── e2e_browser_test.js      # Puppeteer Chrome E2E test of all 3 levels
│   ├── test_mobile_viewport.js  # Mobile touch & responsive layout test
│   └── screenshots/             # Visual proof screenshots captured during tests
└── README.md               # Complete project documentation
```

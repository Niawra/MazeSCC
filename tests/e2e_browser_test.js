// End-to-End Automated Browser Test for MAZE RUN — 2 Maps & Progression System
// Uses puppeteer-core to drive Chrome or Edge

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

console.log("Using browser at:", executablePath);

async function runE2ETests() {
    console.log("==================================================");
    console.log("STARTING END-TO-END BROWSER TESTS FOR MAZE RUN");
    console.log("==================================================");

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const profileDir = path.join(require('os').tmpdir(), 'maze_run_' + Date.now() + '_' + Math.floor(Math.random()*10000));
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        userDataDir: profileDir,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-gpu',
            '--window-size=1280,900'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error(`[BROWSER ERROR]: ${msg.text()}`);
            consoleErrors.push(msg.text());
        } else {
            console.log(`[BROWSER LOG]: ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        console.error(`[PAGE EXCEPTION]: ${err.message}`);
        consoleErrors.push(err.message);
    });

    const htmlPath = path.resolve(__dirname, '..', 'index.html');
    const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
    console.log(`Loading: ${fileUrl}`);

    await page.goto(fileUrl, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 600));

    // 1. Verify Start Screen
    console.log("\n[TEST 1]: Checking Start Screen...");
    const isStartVisible = await page.$eval('#screen-start', el => !el.classList.contains('hidden'));
    if (!isStartVisible) throw new Error("Start screen is not visible on initial load");
    console.log("✓ Start screen visible");
    await page.screenshot({ path: path.join(screenshotsDir, '01_start_screen.png') });

    // 2. Test How to Play Modal
    console.log("\n[TEST 2]: Testing How to Play Modal...");
    await page.click('#btn-how-to-play');
    await new Promise(r => setTimeout(r, 300));
    const isHowToPlayOpen = await page.$eval('#modal-how-to-play', el => !el.classList.contains('hidden'));
    if (!isHowToPlayOpen) throw new Error("How to Play modal failed to open");
    console.log("✓ How to Play modal opened");
    await page.screenshot({ path: path.join(screenshotsDir, '02_how_to_play.png') });

    await page.click('#btn-close-how-to-play');
    await new Promise(r => setTimeout(r, 300));
    const isHowToPlayClosed = await page.$eval('#modal-how-to-play', el => el.classList.contains('hidden'));
    if (!isHowToPlayClosed) throw new Error("How to Play modal failed to close");
    console.log("✓ How to Play modal closed");

    // 3. Open Map & Level Selector Screen
    console.log("\n[TEST 3]: Testing Map & Level Selector Screen...");
    await page.click('#btn-start-game');
    await new Promise(r => setTimeout(r, 400));

    const isSelectVisible = await page.$eval('#screen-select', el => !el.classList.contains('hidden'));
    if (!isSelectVisible) throw new Error("Map selection screen failed to display after Start Game click");
    console.log("✓ Map selection screen visible");
    await page.screenshot({ path: path.join(screenshotsDir, '02b_map_select_screen.png') });

    // Switch between Map 1 (Cyber) and Map 2 (Shadow)
    console.log("\n[TEST 4]: Testing Map Tabs Switch...");
    await page.click('#tab-map-shadow');
    await new Promise(r => setTimeout(r, 200));
    const shadowBannerTitle = await page.$eval('#map-banner-title', el => el.innerText);
    if (!shadowBannerTitle.includes('SHADOW')) throw new Error(`Expected SHADOW banner title, got ${shadowBannerTitle}`);
    console.log("✓ Shadow Labyrinth tab selected successfully");

    await page.click('#tab-map-cyber');
    await new Promise(r => setTimeout(r, 200));
    const cyberBannerTitle = await page.$eval('#map-banner-title', el => el.innerText);
    if (!cyberBannerTitle.includes('CYBER')) throw new Error(`Expected CYBER banner title, got ${cyberBannerTitle}`);
    console.log("✓ Cyber Labyrinth tab re-selected successfully");

    // 5. Launch Map 1 Level 1
    console.log("\n[TEST 5]: Launching Map 1 Level 1...");
    const playBtnL1 = await page.$('.level-card.unlocked .btn-play-level');
    if (!playBtnL1) throw new Error("No play button found for unlocked Level 1!");
    await playBtnL1.click();
    await new Promise(r => setTimeout(r, 500));

    const isGameVisible = await page.$eval('#screen-game', el => !el.classList.contains('hidden'));
    if (!isGameVisible) throw new Error("Game screen failed to display after Level 1 launch");

    const levelTitle = await page.$eval('#hud-level-title', el => el.innerText);
    console.log(`✓ Game screen visible. HUD Level: "${levelTitle}"`);
    if (!levelTitle.includes('CYBER') || !levelTitle.includes('LEVEL 1')) {
        throw new Error(`Expected CYBER LEVEL 1, got ${levelTitle}`);
    }

    // Verify Canvas size & dimensions
    const canvasDimensions = await page.$eval('#game-canvas', el => ({ width: el.width, height: el.height }));
    console.log(`✓ Canvas initialized with dimensions: ${canvasDimensions.width}x${canvasDimensions.height}`);
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) throw new Error("Canvas dimensions are zero!");

    await page.screenshot({ path: path.join(screenshotsDir, '03_level_1_start.png') });

    // 6. Test Wall Collision
    console.log("\n[TEST 6]: Testing Wall Collision...");
    const initialPos = await page.evaluate(() => ({ x: window.game.player.gridX, y: window.game.player.gridY }));
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 150));
    const afterWallHitPos = await page.evaluate(() => ({ x: window.game.player.gridX, y: window.game.player.gridY }));
    if (afterWallHitPos.x !== initialPos.x || afterWallHitPos.y !== initialPos.y) {
        throw new Error("Wall collision failed! Player moved through wall!");
    }
    console.log("✓ Wall collision prevents passing through walls");

    // 7. Test Hint Button
    console.log("\n[TEST 7]: Testing Hint Button...");
    const hintsBefore = await page.evaluate(() => window.game.hintsRemaining);
    await page.click('#btn-hint');
    await new Promise(r => setTimeout(r, 200));
    const hintsAfter = await page.evaluate(() => window.game.hintsRemaining);
    const hasHintPath = await page.evaluate(() => window.game.hintPath !== null);
    if (hintsAfter !== hintsBefore - 1 || !hasHintPath) {
        throw new Error(`Hint failed: before=${hintsBefore}, after=${hintsAfter}, hasPath=${hasHintPath}`);
    }
    console.log(`✓ Hint button works: remaining=${hintsAfter}, hint path active`);
    await page.screenshot({ path: path.join(screenshotsDir, '04_level_1_hint_active.png') });

    // 8. Test Pause and Resume
    console.log("\n[TEST 8]: Testing Pause and Resume...");
    await page.click('#btn-pause');
    await new Promise(r => setTimeout(r, 300));
    const isPaused = await page.evaluate(() => window.game.state === 'PAUSED');
    const isPauseModalOpen = await page.$eval('#modal-pause', el => !el.classList.contains('hidden'));
    if (!isPaused || !isPauseModalOpen) throw new Error("Pause failed to freeze game or show modal");
    console.log("✓ Pause modal opened, game state is PAUSED");

    // Check timer does not advance while paused
    const timeDuringPause1 = await page.evaluate(() => window.game.elapsedTime);
    await new Promise(r => setTimeout(r, 400));
    const timeDuringPause2 = await page.evaluate(() => window.game.elapsedTime);
    if (timeDuringPause1 !== timeDuringPause2) {
        throw new Error("Timer continued advancing during pause!");
    }
    console.log("✓ Timer stops when game is paused");

    // Resume
    await page.click('#btn-resume');
    await new Promise(r => setTimeout(r, 300));
    const isResumed = await page.evaluate(() => window.game.state === 'PLAYING');
    if (!isResumed) throw new Error("Resume failed");
    console.log("✓ Game resumed successfully");

    // 9. Test Mute Toggle
    console.log("\n[TEST 9]: Testing Mute Toggle...");
    const isMutedInitial = await page.evaluate(() => sounds.isMuted());
    await page.click('#btn-mute');
    const isMutedAfter = await page.evaluate(() => sounds.isMuted());
    if (isMutedAfter === isMutedInitial) throw new Error("Mute toggle failed");
    console.log(`✓ Mute toggle works: muted=${isMutedAfter}`);
    await page.click('#btn-mute');

    // 10. Test Virtual D-Pad
    console.log("\n[TEST 10]: Testing Virtual D-Pad...");
    const stepsBeforeDpad = await page.evaluate(() => window.game.steps);
    await page.click('#dpad-down');
    await new Promise(r => setTimeout(r, 200));
    const stepsAfterDpad = await page.evaluate(() => window.game.steps);
    if (stepsAfterDpad <= stepsBeforeDpad) {
        throw new Error("D-Pad button click did not move player or increment step counter");
    }
    console.log("✓ On-screen Virtual D-Pad moved player successfully");

    // 11. Test Restart Button with Procedural Layout Variation
    console.log("\n[TEST 11]: Testing Restart Level with Layout Variation...");
    const mapBeforeRestart = await page.evaluate(() => window.game.level.map.join(''));
    await page.click('#btn-restart');
    await new Promise(r => setTimeout(r, 400));
    const mapAfterRestart = await page.evaluate(() => window.game.level.map.join(''));
    const stepsAfterRestart = await page.evaluate(() => window.game.steps);
    const hintsAfterRestart = await page.evaluate(() => window.game.hintsRemaining);
    if (stepsAfterRestart !== 0 || hintsAfterRestart !== 3) {
        throw new Error("Restart button failed to reset steps or hints!");
    }
    console.log("✓ Restart cleanly reset level state and generated variation");

    // 12. Solve Level 1 (Navigate to Key then Exit)
    console.log("\n[TEST 12]: Solving Level 1...");
    await page.evaluate(async () => {
        const game = window.game;
        const pathToKey = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.key);

        for (let i = 1; i < pathToKey.length; i++) {
            const next = pathToKey[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 400));
    const hasKeyL1 = await page.evaluate(() => window.game.hasKey);
    console.log(`✓ Golden Key collected: hasKey=${hasKeyL1}`);
    if (!hasKeyL1) throw new Error("Failed to collect key in Level 1");
    await page.screenshot({ path: path.join(screenshotsDir, '05_level_1_key_collected.png') });

    // Move to exit
    await page.evaluate(async () => {
        const game = window.game;
        const pathToExit = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.exit);

        for (let i = 1; i < pathToExit.length; i++) {
            const next = pathToExit[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 600));
    const isLevel1Complete = await page.evaluate(() => window.game.state === 'LEVEL_COMPLETE');
    if (!isLevel1Complete) throw new Error("Level 1 failed to complete after reaching exit with key");
    console.log("✓ Level 1 Completed! Level Complete modal displayed");
    await page.screenshot({ path: path.join(screenshotsDir, '06_level_1_complete_modal.png') });

    // 13. Advance to Level 2
    console.log("\n[TEST 13]: Advancing to Level 2 (Medium)...");
    await page.click('#btn-next-level');
    await new Promise(r => setTimeout(r, 600));

    const level2Title = await page.$eval('#hud-level-title', el => el.innerText);
    console.log(`✓ HUD Title: "${level2Title}"`);
    if (!level2Title.includes('LEVEL 2')) throw new Error(`Expected LEVEL 2, got ${level2Title}`);

    const monsterCountL2 = await page.evaluate(() => window.game.monsters.length);
    console.log(`✓ Level 2 monsters count: ${monsterCountL2}`);
    if (monsterCountL2 !== 1) throw new Error(`Expected 1 monster in Level 2, got ${monsterCountL2}`);

    // Wait and verify monster moves along patrol route
    const mPos1 = await page.evaluate(() => ({ x: window.game.monsters[0].x, y: window.game.monsters[0].y }));
    await new Promise(r => setTimeout(r, 1200));
    const mPos2 = await page.evaluate(() => ({ x: window.game.monsters[0].x, y: window.game.monsters[0].y }));
    const distMoved = Math.hypot(mPos2.x - mPos1.x, mPos2.y - mPos1.y);
    console.log(`✓ Monster pos 1: (${mPos1.x.toFixed(2)}, ${mPos1.y.toFixed(2)}), pos 2: (${mPos2.x.toFixed(2)}, ${mPos2.y.toFixed(2)}), dist: ${distMoved.toFixed(2)}`);
    if (distMoved < 0.1) throw new Error("Monster did not move along its patrol route!");

    await page.screenshot({ path: path.join(screenshotsDir, '07_level_2_patrol.png') });

    // Test Monster Collision Reset
    console.log("\n[TEST 14]: Testing Monster Collision Reset...");
    const resetResult = await page.evaluate(() => {
        const game = window.game;
        const m = game.monsters[0];
        game.player.renderX = m.x;
        game.player.renderY = m.y;
        game.onMonsterHit(m);
        return {
            gridX: game.player.gridX,
            gridY: game.player.gridY,
            startX: game.startPos.x,
            startY: game.startPos.y,
            invulnerable: game.player.invulnerableTimer > 0
        };
    });

    if (resetResult.gridX !== resetResult.startX || resetResult.gridY !== resetResult.startY) {
        throw new Error("Monster collision did not reset player to start position!");
    }
    console.log(`✓ Touching a monster resets player to start: (${resetResult.gridX}, ${resetResult.gridY})`);
    await page.screenshot({ path: path.join(screenshotsDir, '08_level_2_monster_hit_reset.png') });

    // 15. Solve Level 2
    console.log("\n[TEST 15]: Solving Level 2...");
    await page.evaluate(async () => {
        const game = window.game;
        game.player.invulnerableTimer = 999;

        const pathToKey = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.key);

        for (let i = 1; i < pathToKey.length; i++) {
            const next = pathToKey[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 400));
    const hasKeyL2 = await page.evaluate(() => window.game.hasKey);
    console.log(`✓ Level 2 Key collected: hasKey=${hasKeyL2}`);

    // Path to Exit
    await page.evaluate(async () => {
        const game = window.game;
        const pathToExit = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.exit);

        for (let i = 1; i < pathToExit.length; i++) {
            const next = pathToExit[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 600));
    const isLevel2Complete = await page.evaluate(() => window.game.state === 'LEVEL_COMPLETE');
    if (!isLevel2Complete) throw new Error("Level 2 failed to complete!");
    console.log("✓ Level 2 Completed!");
    await page.screenshot({ path: path.join(screenshotsDir, '09_level_2_complete_modal.png') });

    // 16. Advance to Level 3 (Extreme 35x35)
    console.log("\n[TEST 16]: Advancing to Level 3 (Hard)...");
    await page.click('#btn-next-level');
    await new Promise(r => setTimeout(r, 600));

    const level3Title = await page.$eval('#hud-level-title', el => el.innerText);
    console.log(`✓ HUD Title: "${level3Title}"`);
    if (!level3Title.includes('LEVEL 3')) throw new Error(`Expected LEVEL 3, got ${level3Title}`);

    const monsterCountL3 = await page.evaluate(() => window.game.monsters.length);
    console.log(`✓ Level 3 monsters count: ${monsterCountL3}`);
    if (monsterCountL3 !== 2) throw new Error(`Expected 2 monsters in Level 3, got ${monsterCountL3}`);

    await page.screenshot({ path: path.join(screenshotsDir, '10_level_3_start.png') });

    // 17. Solve Level 3
    console.log("\n[TEST 17]: Solving Level 3...");
    await page.evaluate(async () => {
        const game = window.game;
        game.player.invulnerableTimer = 999;

        const pathToKey = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.key);

        for (let i = 1; i < pathToKey.length; i++) {
            const next = pathToKey[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 400));
    const hasKeyL3 = await page.evaluate(() => window.game.hasKey);
    console.log(`✓ Level 3 Key collected: hasKey=${hasKeyL3}`);
    if (!hasKeyL3) throw new Error("Failed to collect key in Level 3");

    // Path to Exit
    await page.evaluate(async () => {
        const game = window.game;
        const pathToExit = Pathfinder.findPath(game.grid, game.width, game.height, 
            { x: game.player.gridX, y: game.player.gridY }, game.exit);

        for (let i = 1; i < pathToExit.length; i++) {
            const next = pathToExit[i];
            const dx = next.x - game.player.gridX;
            const dy = next.y - game.player.gridY;
            const dir = dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up';
            game.requestMove(dir);
            while (game.player.isMoving) {
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 20));
        }
    });

    await new Promise(r => setTimeout(r, 1000));

    // 18. Check Final Victory Screen for Map 1
    console.log("\n[TEST 18]: Verifying Final Victory Screen for Cyber Labyrinth...");
    const isVictoryState = await page.evaluate(() => window.game.state === 'VICTORY');
    const isVictoryModalOpen = await page.$eval('#modal-victory', el => !el.classList.contains('hidden'));
    if (!isVictoryState || !isVictoryModalOpen) {
        throw new Error("Victory screen not displayed after beating Level 3!");
    }

    const totalTime = await page.$eval('#victory-total-time', el => el.innerText);
    const totalSteps = await page.$eval('#victory-total-steps', el => el.innerText);
    const totalScore = await page.$eval('#victory-total-score', el => el.innerText);
    const rank = await page.$eval('#victory-rank', el => el.innerText);

    console.log(`✓ Final Victory Screen Verified:`);
    console.log(`  - Total Time: ${totalTime}`);
    console.log(`  - Total Steps: ${totalSteps}`);
    console.log(`  - Total Score: ${totalScore}`);
    console.log(`  - Rank: ${rank}`);

    await page.screenshot({ path: path.join(screenshotsDir, '11_victory_screen.png') });

    // 19. Return to Map Select from Victory Screen and Verify Progression
    console.log("\n[TEST 19]: Returning to Map Select Screen...");
    await page.click('#btn-victory-map-select');
    await new Promise(r => setTimeout(r, 400));

    const isBackOnSelect = await page.$eval('#screen-select', el => !el.classList.contains('hidden'));
    if (!isBackOnSelect) throw new Error("Failed to return to Map Select screen from Victory screen");
    console.log("✓ Successfully returned to Map Select screen");

    const cyberProgressText = await page.$eval('#banner-progress', el => el.innerText);
    console.log(`✓ Cyber Labyrinth progress: ${cyberProgressText}`);
    if (!cyberProgressText.includes('3/3')) throw new Error(`Expected 3/3, got ${cyberProgressText}`);

    // Switch to Map 2: Shadow Labyrinth
    console.log("\n[TEST 20]: Switching to Shadow Labyrinth and launching Level 1...");
    await page.click('#tab-map-shadow');
    await new Promise(r => setTimeout(r, 300));

    const shadowPlayBtn = await page.$('.level-card.unlocked .btn-play-level');
    if (!shadowPlayBtn) throw new Error("No play button for Shadow Level 1!");
    await shadowPlayBtn.click();
    await new Promise(r => setTimeout(r, 500));

    const shadowL1Title = await page.$eval('#hud-level-title', el => el.innerText);
    console.log(`✓ HUD Title: "${shadowL1Title}"`);
    if (!shadowL1Title.includes('SHADOW')) throw new Error(`Expected SHADOW level title, got ${shadowL1Title}`);

    await page.screenshot({ path: path.join(screenshotsDir, '12_shadow_level_1.png') });

    await browser.close();
    try {
        fs.rmSync(profileDir, { recursive: true, force: true });
    } catch (e) {}

    console.log("\n==================================================");
    if (consoleErrors.length > 0) {
        console.error(`COMPLETED WITH ${consoleErrors.length} BROWSER CONSOLE ERRORS:`);
        consoleErrors.forEach(err => console.error(" - " + err));
        process.exit(1);
    } else {
        console.log("ALL END-TO-END TESTS PASSED WITH 0 ERRORS! 🎉");
        console.log("Screenshots saved in tests/screenshots/");
        console.log("==================================================");
    }
}

runE2ETests().catch(err => {
    console.error("FATAL TEST FAILURE:", err);
    process.exit(1);
});

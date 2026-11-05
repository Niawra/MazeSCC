// Mobile Viewport and Touch Responsive Test — iPhone Viewport (390x844)

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function testMobileViewport() {
    console.log("Testing mobile viewport responsiveness (390x844)...");
    const screenshotsDir = path.join(__dirname, 'screenshots');

    const testProfileDir = path.join(require('os').tmpdir(), 'maze_mobile_' + Date.now() + '_' + Math.floor(Math.random()*10000));
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        userDataDir: testProfileDir,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();
    // Simulate iPhone 13/14 viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    const htmlPath = path.resolve(__dirname, '..', 'index.html');
    await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 500));

    // Capture mobile start screen
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_01_start.png') });

    // Open How to Play on mobile
    await page.tap('#btn-how-to-play');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_02_how_to_play.png') });
    await page.tap('#btn-close-how-to-play');
    await new Promise(r => setTimeout(r, 300));

    // Open Map & Level Selector on mobile
    await page.tap('#btn-start-game');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_02b_map_select.png') });

    // Tap Level 1 Play button
    const playBtn = await page.$('.level-card.unlocked .btn-play-level');
    if (!playBtn) throw new Error("No play button on mobile Map Select screen!");
    await playBtn.tap();
    await new Promise(r => setTimeout(r, 500));

    // Check canvas and layout
    const layout = await page.evaluate(() => {
        const hud = document.getElementById('game-hud').getBoundingClientRect();
        const canvas = document.getElementById('game-canvas').getBoundingClientRect();
        const dpad = document.getElementById('mobile-controls').getBoundingClientRect();
        return {
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            hud: { w: hud.width, h: hud.height },
            canvas: { w: canvas.width, h: canvas.height },
            dpad: { w: dpad.width, h: dpad.height, top: dpad.top }
        };
    });

    console.log("Mobile layout analysis:", JSON.stringify(layout, null, 2));

    // Find the open direction from start (either right or down in a strictly 1-tile corridor)
    const openDir = await page.evaluate(() => {
        const g = window.game;
        const px = g.player.gridX;
        const py = g.player.gridY;
        if (px + 1 < g.width && g.grid[py][px + 1] === 0) return 'right';
        if (py + 1 < g.height && g.grid[py + 1][px] === 0) return 'down';
        return 'right';
    });
    console.log(`Open corridor from start is: ${openDir}`);

    // Tap D-Pad open direction button to test touch
    await page.tap(`#dpad-${openDir}`);
    await new Promise(r => setTimeout(r, 200));
    const steps = await page.evaluate(() => window.game.steps);
    console.log(`Mobile tap on #dpad-${openDir} registered steps: ${steps}`);
    if (steps <= 0) throw new Error("Mobile touch on D-Pad failed to register move!");

    await page.screenshot({ path: path.join(screenshotsDir, 'mobile_03_gameplay.png') });

    await browser.close();

    try {
        fs.rmSync(testProfileDir, { recursive: true, force: true });
    } catch (e) {}

    console.log("Mobile responsiveness test passed successfully! ✓");
}

testMobileViewport().catch(err => {
    console.error("Mobile test failure:", err);
    process.exit(1);
});

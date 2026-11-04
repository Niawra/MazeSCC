// Pixel Art Sprites and Visual Effects Renderer for MAZE RUN
// Renders cute retro pixel art on HTML5 Canvas

class SpriteRenderer {
    constructor() {
        this.particlePool = [];
    }

    /**
     * Draw retro 3D beveled wall tile
     */
    drawWall(ctx, x, y, size, colors) {
        // Main block
        ctx.fillStyle = colors.wallFill;
        ctx.fillRect(x, y, size, size);

        // Top and Left 3D highlight bevel
        const bevel = Math.max(2, Math.floor(size * 0.12));
        ctx.fillStyle = colors.wallHighlight;
        ctx.globalAlpha = 0.35;
        // Top highlight
        ctx.fillRect(x, y, size, bevel);
        // Left highlight
        ctx.fillRect(x, y, bevel, size);

        // Bottom and Right shadow bevel
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.45;
        ctx.fillRect(x, y + size - bevel, size, bevel);
        ctx.fillRect(x + size - bevel, y, bevel, size);

        // Inner glowing border
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = colors.wallBorder;
        ctx.lineWidth = Math.max(1, Math.floor(size * 0.08));
        ctx.strokeRect(x + bevel, y + bevel, size - bevel * 2, size - bevel * 2);

        // Reset alpha
        ctx.globalAlpha = 1.0;
    }

    /**
     * Draw floor tile with subtle retro grid dot
     */
    drawFloor(ctx, x, y, size, colors) {
        ctx.fillStyle = colors.floorFill;
        ctx.fillRect(x, y, size, size);

        // Subtle center dot or cross
        ctx.fillStyle = colors.floorDot;
        const dotSize = Math.max(2, Math.floor(size * 0.1));
        const center = size / 2 - dotSize / 2;
        ctx.fillRect(x + center, y + center, dotSize, dotSize);
    }

    /**
     * Draw Cute Pixel Player
     */
    drawPlayer(ctx, x, y, size, dir, walkPhase, isInvulnerable = false) {
        if (isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
            // Flash when respawning/hit
            return;
        }

        ctx.save();
        ctx.translate(x, y);

        // Gentle walking bounce
        const bounce = Math.abs(Math.sin(walkPhase * Math.PI)) * (size * 0.08);
        const pSize = size * 0.85;
        const offsetX = (size - pSize) / 2;
        const offsetY = (size - pSize) / 2 - bounce;

        // Shadow under player
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(size / 2, size * 0.88, size * 0.32, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player Head / Helmet (Retro Astronaut / Runner)
        const u = pSize / 16; // 16x16 pixel grid unit

        // Body / Spacesuit (Bright Cyan & Navy)
        ctx.fillStyle = "#00e5ff"; // Bright Cyan body
        ctx.fillRect(offsetX + u * 4, offsetY + u * 7, u * 8, u * 6);

        // Suit Chest Accent (Yellow emblem)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(offsetX + u * 6, offsetY + u * 8, u * 4, u * 3);

        // Helmet (Round cute dome)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(offsetX + u * 3, offsetY + u * 1, u * 10, u * 7);
        ctx.fillRect(offsetX + u * 4, offsetY, u * 8, u * 2);

        // Visor / Face Area (Dark Navy with Cyan shine)
        ctx.fillStyle = "#091428";
        ctx.fillRect(offsetX + u * 4, offsetY + u * 2, u * 8, u * 5);

        // Big cute cartoon eyes
        ctx.fillStyle = "#00ffcc";
        let eyeOffset = 0;
        if (dir === 'left') eyeOffset = -u * 1.5;
        if (dir === 'right') eyeOffset = u * 1.5;

        // Eyes
        ctx.fillRect(offsetX + u * 5 + eyeOffset, offsetY + u * 3, u * 2, u * 3);
        ctx.fillRect(offsetX + u * 9 + eyeOffset, offsetY + u * 3, u * 2, u * 3);

        // Eye reflections (White glint)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(offsetX + u * 5 + eyeOffset, offsetY + u * 3, u * 1, u * 1);
        ctx.fillRect(offsetX + u * 9 + eyeOffset, offsetY + u * 3, u * 1, u * 1);

        // Little antenna / head cap button
        ctx.fillStyle = "#ff0077";
        ctx.fillRect(offsetX + u * 7.5, offsetY - u * 1.5, u * 1, u * 1.5);
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(offsetX + u * 7, offsetY - u * 2.5, u * 2, u * 1.5);

        // Feet (Alternating walking animation)
        const footW = u * 3;
        const footH = u * 3;
        const leftFootY = offsetY + u * 13 + Math.sin(walkPhase * Math.PI) * (u * 1.5);
        const rightFootY = offsetY + u * 13 - Math.sin(walkPhase * Math.PI) * (u * 1.5);

        ctx.fillStyle = "#ff0077"; // Magenta sneakers!
        ctx.fillRect(offsetX + u * 3.5, leftFootY, footW, footH);
        ctx.fillRect(offsetX + u * 9.5, rightFootY, footW, footH);

        // Sneaker soles (White)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(offsetX + u * 3.5, leftFootY + u * 2, footW, u);
        ctx.fillRect(offsetX + u * 9.5, rightFootY + u * 2, footW, u);

        ctx.restore();
    }

    /**
     * Draw Golden Key with floating sparkle animation
     */
    drawKey(ctx, x, y, size, time) {
        ctx.save();
        ctx.translate(x, y);

        // Gentle floating
        const floatOffset = Math.sin(time * 3.5) * (size * 0.1);
        const kSize = size * 0.75;
        const offsetX = (size - kSize) / 2;
        const offsetY = (size - kSize) / 2 + floatOffset;
        const u = kSize / 14;

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(size / 2, size * 0.88, size * 0.28, size * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing aura
        const pulse = 0.5 + 0.3 * Math.sin(time * 5);
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(size / 2, offsetY + kSize / 2, kSize * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Key Head (Golden Ring)
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(offsetX + u * 2, offsetY + u * 2, u * 6, u * 6);
        // Keyhole cutout (Dark center)
        ctx.fillStyle = "#664d00";
        ctx.fillRect(offsetX + u * 4, offsetY + u * 4, u * 2, u * 2);

        // Key Shaft
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(offsetX + u * 7, offsetY + u * 4, u * 6, u * 2);

        // Key Teeth
        ctx.fillRect(offsetX + u * 10, offsetY + u * 6, u * 1.5, u * 2);
        ctx.fillRect(offsetX + u * 12, offsetY + u * 6, u * 1.5, u * 3);

        // Highlights (White shimmer)
        ctx.fillStyle = "#fff8db";
        ctx.fillRect(offsetX + u * 3, offsetY + u * 2, u * 3, u);
        ctx.fillRect(offsetX + u * 7, offsetY + u * 4, u * 5, u * 0.7);

        // Little sparkle stars rotating
        const sparkleX = offsetX + u * 11 + Math.cos(time * 4) * (u * 4);
        const sparkleY = offsetY + u * 2 + Math.sin(time * 4) * (u * 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sparkleX, sparkleY, u * 1.2, u * 1.2);

        ctx.restore();
    }

    /**
     * Draw Exit Door (Locked / Unlocked Portal)
     */
    drawExit(ctx, x, y, size, isUnlocked, time) {
        ctx.save();
        ctx.translate(x, y);
        const u = size / 16;

        if (!isUnlocked) {
            // LOCKED DOOR: Sturdy steel door with large red padlock
            // Door Frame
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(u * 1, u * 1, u * 14, u * 14);

            // Inner Door Panels
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(u * 2, u * 2, u * 12, u * 12);
            ctx.fillStyle = "#334155";
            ctx.fillRect(u * 3, u * 3, u * 10, u * 10);

            // Rivets on door
            ctx.fillStyle = "#64748b";
            ctx.fillRect(u * 3.5, u * 3.5, u * 1.5, u * 1.5);
            ctx.fillRect(u * 11, u * 3.5, u * 1.5, u * 1.5);
            ctx.fillRect(u * 3.5, u * 11, u * 1.5, u * 1.5);
            ctx.fillRect(u * 11, u * 11, u * 1.5, u * 1.5);

            // Red Padlock in center with pulsing glow
            const padGlow = 0.5 + 0.3 * Math.sin(time * 4);
            ctx.fillStyle = `rgba(255, 40, 80, ${padGlow * 0.5})`;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, u * 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Lock Shackle (Silver)
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(u * 6, u * 4.5, u * 4, u * 3);
            ctx.fillStyle = "#334155";
            ctx.fillRect(u * 7, u * 5.5, u * 2, u * 2);

            // Lock Body (Bright Red)
            ctx.fillStyle = "#ff2a55";
            ctx.fillRect(u * 5.5, u * 7, u * 5, u * 5);

            // Keyhole (Black)
            ctx.fillStyle = "#000000";
            ctx.fillRect(u * 7.5, u * 8.5, u * 1, u * 2);

            // Warning "LOCKED" indicator above door
            ctx.fillStyle = "#ff2a55";
            ctx.font = `bold ${Math.max(7, Math.floor(u * 2.8))}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText("LOCK", size / 2, u * 2.5);
        } else {
            // UNLOCKED: Swirling Magical Cyber Portal!
            // Portal Outer Arch
            ctx.fillStyle = "#00ff88";
            ctx.fillRect(u * 1, u * 1, u * 14, u * 14);

            // Portal Background (Void)
            ctx.fillStyle = "#050d1a";
            ctx.fillRect(u * 2, u * 2, u * 12, u * 12);

            // Rotating Swirl Rings
            const rot1 = time * 3;
            const rot2 = -time * 4;

            ctx.save();
            ctx.translate(size / 2, size / 2);

            // Outer ring
            ctx.rotate(rot1);
            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = u * 1.5;
            ctx.strokeRect(-u * 4.5, -u * 4.5, u * 9, u * 9);

            // Inner ring
            ctx.rotate(rot2 - rot1);
            ctx.strokeStyle = "#00ff88";
            ctx.lineWidth = u * 1.2;
            ctx.strokeRect(-u * 2.5, -u * 2.5, u * 5, u * 5);

            // Portal Core
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, u * 1.5 + Math.sin(time * 8) * u * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Glowing "EXIT" text
            ctx.fillStyle = "#00ff88";
            ctx.font = `bold ${Math.max(7, Math.floor(u * 2.8))}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText("EXIT", size / 2, u * 2.5);
        }

        ctx.restore();
    }

    /**
     * Draw Monsters (Blob, Bat, Ghost)
     */
    drawMonster(ctx, m, size, time) {
        ctx.save();
        ctx.translate(m.x * size, m.y * size);
        const u = size / 16;

        // Shadow under monster
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(size / 2, size * 0.88, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        if (m.type === 'blob') {
            // Cute jiggly slime (Grumble)
            const jiggle = Math.sin(time * 6) * (u * 1.2);
            const bodyW = u * 11 + jiggle;
            const bodyH = u * 10 - jiggle;
            const bx = (size - bodyW) / 2;
            const by = size * 0.85 - bodyH;

            // Slime Body (Neon Magenta)
            ctx.fillStyle = m.color || "#ff3366";
            ctx.beginPath();
            ctx.roundRect(bx, by, bodyW, bodyH, [u * 5, u * 5, u * 2, u * 2]);
            ctx.fill();

            // Shiny highlight
            ctx.fillStyle = "#ff85a1";
            ctx.beginPath();
            ctx.arc(bx + u * 3, by + u * 3, u * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Big expressive eyes
            const eyeX1 = bx + u * 3;
            const eyeX2 = bx + bodyW - u * 5;
            const eyeY = by + u * 3.5;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(eyeX1, eyeY, u * 2.5, u * 3.5);
            ctx.fillRect(eyeX2, eyeY, u * 2.5, u * 3.5);

            // Pupils looking in movement direction
            const lookOffset = (m.direction || 1) * (u * 0.8);
            ctx.fillStyle = "#111111";
            ctx.fillRect(eyeX1 + u * 0.6 + lookOffset, eyeY + u * 1, u * 1.3, u * 2);
            ctx.fillRect(eyeX2 + u * 0.6 + lookOffset, eyeY + u * 1, u * 1.3, u * 2);

            // Cute little mouth
            ctx.fillStyle = "#550011";
            ctx.fillRect(bx + bodyW / 2 - u * 1.2, by + u * 7, u * 2.4, u * 1.2);

        } else if (m.type === 'bat') {
            // Cute flapping bat (Spike)
            const flap = Math.sin(time * 12) * (u * 3);
            const by = size * 0.45 + Math.sin(time * 4) * (u * 1.5);

            // Wings
            ctx.fillStyle = "#d97706";
            // Left wing
            ctx.beginPath();
            ctx.moveTo(size / 2 - u * 2, by);
            ctx.lineTo(size * 0.1, by - flap);
            ctx.lineTo(size * 0.2, by + u * 3);
            ctx.closePath();
            ctx.fill();
            // Right wing
            ctx.beginPath();
            ctx.moveTo(size / 2 + u * 2, by);
            ctx.lineTo(size * 0.9, by - flap);
            ctx.lineTo(size * 0.8, by + u * 3);
            ctx.closePath();
            ctx.fill();

            // Bat Body (Bright Amber / Orange)
            ctx.fillStyle = m.color || "#ffaa00";
            ctx.fillRect(size / 2 - u * 3.5, by - u * 3, u * 7, u * 8);

            // Ears
            ctx.fillStyle = "#b45309";
            ctx.fillRect(size / 2 - u * 3.5, by - u * 5.5, u * 2, u * 3);
            ctx.fillRect(size / 2 + u * 1.5, by - u * 5.5, u * 2, u * 3);

            // Glowing Eyes (Red)
            ctx.fillStyle = "#ff0044";
            ctx.fillRect(size / 2 - u * 2.5, by - u * 0.5, u * 2, u * 2);
            ctx.fillRect(size / 2 + u * 0.5, by - u * 0.5, u * 2, u * 2);

            // Fangs
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(size / 2 - u * 1.5, by + u * 3.5, u * 1, u * 1.5);
            ctx.fillRect(size / 2 + u * 0.5, by + u * 3.5, u * 1, u * 1.5);

        } else if (m.type === 'ghost') {
            // Cute floating ghost (Phantom)
            const floatY = size * 0.15 + Math.sin(time * 4.5) * (u * 1.8);
            const gx = size * 0.2;
            const gw = size * 0.6;
            const gh = size * 0.65;

            // Ghost Body (Neon Pink / Translucent aura)
            ctx.fillStyle = m.color || "#ff007f";
            ctx.beginPath();
            ctx.arc(size / 2, floatY + gh * 0.45, gw / 2, Math.PI, 0);
            ctx.lineTo(gx + gw, floatY + gh);
            // Wavy tail
            const tailW = gw / 3;
            const twiggle = Math.sin(time * 8) * (u * 1.2);
            ctx.lineTo(gx + tailW * 2 + twiggle, floatY + gh - u * 2);
            ctx.lineTo(gx + tailW - twiggle, floatY + gh);
            ctx.lineTo(gx, floatY + gh - u * 2);
            ctx.closePath();
            ctx.fill();

            // Glowing eyes (Cyan glow)
            ctx.fillStyle = "#00ffff";
            ctx.fillRect(size / 2 - u * 3, floatY + u * 3, u * 2, u * 3);
            ctx.fillRect(size / 2 + u * 1, floatY + u * 3, u * 2, u * 3);
            // Black pupils
            ctx.fillStyle = "#050014";
            ctx.fillRect(size / 2 - u * 2.5, floatY + u * 3.5, u * 1, u * 2);
            ctx.fillRect(size / 2 + u * 1.5, floatY + u * 3.5, u * 1, u * 2);
        }

        ctx.restore();
    }

    /**
     * Draw glowing hint path orbs
     */
    drawHintPath(ctx, path, size, time) {
        if (!path || path.length === 0) return;

        ctx.save();
        const pulse = 0.6 + 0.4 * Math.sin(time * 8);

        for (let i = 0; i < path.length; i++) {
            const pt = path[i];
            const cx = pt.x * size + size / 2;
            const cy = pt.y * size + size / 2;

            // Outer glow
            ctx.fillStyle = `rgba(255, 215, 0, ${0.25 * pulse})`;
            ctx.beginPath();
            ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Inner core orb
            ctx.fillStyle = `rgba(255, 240, 100, ${0.9 * pulse})`;
            ctx.beginPath();
            ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
            ctx.fill();

            // Star center
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 2, cy - 2, 4, 4);

            // Connect lines between hints
            if (i < path.length - 1) {
                const nextPt = path[i + 1];
                const ncx = nextPt.x * size + size / 2;
                const ncy = nextPt.y * size + size / 2;

                ctx.strokeStyle = `rgba(255, 215, 0, ${0.45 * pulse})`;
                ctx.lineWidth = Math.max(2, size * 0.08);
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(ncx, ncy);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        ctx.restore();
    }
}

// Global renderer instance
const sprites = new SpriteRenderer();

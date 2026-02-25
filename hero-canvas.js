/**
 * HERO CANVAS — Lo-fi Anime Sky Background
 * Renders an animated sky with stars, moon/sun, aurora streaks, and horizon glow.
 * Colors shift based on body.time-* class and body.aesthetic-experimental class.
 * No images used — 100% procedural rendering.
 */
(function () {
    'use strict';

    const CANVAS_ID = 'hero-sky-canvas';
    let canvas, ctx, animId;
    let W, H;
    let stars = [];
    let streaks = [];
    let tick = 0;

    // Performance optimizations
    let isVisible = true;
    let isPlaying = false;

    // --- Color Palettes for each time state ---
    const palettes = {
        morning: {
            skyTop: '#4A6FA5',
            skyMid: '#87CEEB',
            skyBot: '#FFE4B5',
            horizon: '#FFDAB9',
            starColor: 'rgba(255,255,255,0.3)',
            moonColor: '#FFFDE7',
            moonGlow: 'rgba(255,253,231,0.15)',
            auroraA: 'rgba(135,206,235,0.12)',
            auroraB: 'rgba(255,215,0,0.08)',
            sparkle: 'rgba(255,215,0,0.6)',
        },
        afternoon: {
            skyTop: '#2D1B69',
            skyMid: '#6A3093',
            skyBot: '#F9A825',
            horizon: '#FF6F00',
            starColor: 'rgba(255,255,255,0.2)',
            moonColor: '#FFD54F',
            moonGlow: 'rgba(255,213,79,0.12)',
            auroraA: 'rgba(238,9,121,0.12)',
            auroraB: 'rgba(255,111,0,0.08)',
            sparkle: 'rgba(255,183,77,0.7)',
        },
        night: {
            skyTop: '#0B0B2B',
            skyMid: '#1A1A4E',
            skyBot: '#2D2D7A',
            horizon: '#3F51B5',
            starColor: 'rgba(255,255,255,0.8)',
            moonColor: '#E0E0E0',
            moonGlow: 'rgba(200,200,255,0.2)',
            auroraA: 'rgba(100,149,237,0.15)',
            auroraB: 'rgba(138,43,226,0.1)',
            sparkle: 'rgba(173,216,230,0.8)',
        },
    };

    function getCurrentPalette() {
        const body = document.body;
        if (body.classList.contains('time-afternoon')) return palettes.afternoon;
        if (body.classList.contains('time-night')) return palettes.night;
        return palettes.morning;
    }

    // --- Star generation ---
    function generateStars(count) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random() * 0.7,
                r: Math.random() * 1.8 + 0.3,
                twinkleSpeed: Math.random() * 0.03 + 0.005,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    // --- Aurora streaks ---
    function generateStreaks(count) {
        streaks = [];
        for (let i = 0; i < count; i++) {
            streaks.push({
                x: 0.3 + Math.random() * 0.4,
                y: 0.1 + Math.random() * 0.3,
                length: 80 + Math.random() * 200,
                angle: -Math.PI / 4 + Math.random() * 0.5,
                width: 1 + Math.random() * 2,
                speed: 0.002 + Math.random() * 0.003,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function resize() {
        const container = canvas.parentElement;
        W = canvas.width = container.offsetWidth;
        H = canvas.height = container.offsetHeight;
    }

    function drawSky(p) {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, p.skyTop);
        grad.addColorStop(0.5, p.skyMid);
        grad.addColorStop(0.85, p.skyBot);
        grad.addColorStop(1, p.horizon);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    function drawStars(p) {
        stars.forEach(s => {
            const alpha = 0.3 + 0.7 * Math.abs(Math.sin(tick * s.twinkleSpeed + s.phase));
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
            ctx.fillStyle = p.starColor.replace(/[\d.]+\)$/, alpha.toFixed(2) + ')');
            ctx.fill();

            // Cross sparkle on brightest stars
            if (s.r > 1.2 && alpha > 0.8) {
                ctx.strokeStyle = p.sparkle;
                ctx.lineWidth = 0.5;
                const cx = s.x * W, cy = s.y * H, len = s.r * 4;
                ctx.beginPath();
                ctx.moveTo(cx - len, cy);
                ctx.lineTo(cx + len, cy);
                ctx.moveTo(cx, cy - len);
                ctx.lineTo(cx, cy + len);
                ctx.stroke();
            }
        });
    }

    function drawMoon(p) {
        const mx = W * 0.55;
        const my = H * 0.22;
        const mr = Math.min(W, H) * 0.07;

        // Outer glow
        const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 5);
        glow.addColorStop(0, p.moonGlow);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);

        // Moon body
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fillStyle = p.moonColor;
        ctx.shadowColor = p.moonColor;
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawAurora(p) {
        streaks.forEach(s => {
            const alpha = 0.3 + 0.5 * Math.abs(Math.sin(tick * s.speed + s.phase));
            const sx = s.x * W;
            const sy = s.y * H;
            const ex = sx + Math.cos(s.angle) * s.length;
            const ey = sy + Math.sin(s.angle) * s.length;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = (Math.random() > 0.5 ? p.auroraA : p.auroraB).replace(
                /[\d.]+\)$/,
                (alpha * 0.5).toFixed(2) + ')'
            );
            ctx.lineWidth = s.width;
            ctx.stroke();
        });
    }

    function drawHorizonGlow(p) {
        const grad = ctx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, H * 0.6);
        grad.addColorStop(0, p.auroraA.replace(/[\d.]+\)$/, '0.25)'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, H * 0.4, W, H * 0.6);
    }

    function frame() {
        if (!isVisible) {
            isPlaying = false;
            return; // Pause the animation entirely when out of viewport
        }
        isPlaying = true;

        if (!document.body.classList.contains('aesthetic-experimental')) {
            // If not in experimental mode, just clear and stop drawing
            ctx.clearRect(0, 0, W, H);
            animId = requestAnimationFrame(frame);
            return;
        }

        tick++;
        const p = getCurrentPalette();

        drawSky(p);
        drawHorizonGlow(p);
        drawAurora(p);
        drawStars(p);
        drawMoon(p);

        animId = requestAnimationFrame(frame);
    }

    function init() {
        canvas = document.getElementById(CANVAS_ID);
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        generateStars(120);
        generateStreaks(6);

        resize();
        window.addEventListener('resize', resize);

        // Performance Observer: Only animate when hero is visible
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
            if (isVisible && !isPlaying) {
                frame(); // Resume animation
            }
        }, { threshold: 0 });

        if (canvas.parentElement) {
            observer.observe(canvas.parentElement);
        } else {
            frame(); // Fallback
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

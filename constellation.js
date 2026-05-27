const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let width, height;

// State
let stars = [];
let constellation = [];
let cursor = { x: -100, y: -100 };
let unlocked = false;
let currentTargetIndex = 0;

// Config
const CONFIG = {
    starCount: 150,
    connectDistance: 50, // Pixel proximity to connect
    starSize: 2,
    guideStarSize: 6,
    lineColor: 'rgba(244, 114, 182, 0.6)',
    glowColor: 'rgba(244, 114, 182, 0.8)'
};

// Heart Pattern (Normalized 0-1 coords)
const HEART_PATH = [
    { x: 0.5, y: 0.35 },   // Top Center Dip
    { x: 0.35, y: 0.2 },   // Top Left Hump
    { x: 0.2, y: 0.3 },    // Left Shoulder
    { x: 0.2, y: 0.5 },    // Left Side
    { x: 0.5, y: 0.8 },    // Bottom Tip
    { x: 0.8, y: 0.5 },    // Right Side
    { x: 0.8, y: 0.3 },    // Right Shoulder
    { x: 0.65, y: 0.2 },   // Top Right Hump
    { x: 0.5, y: 0.35 }    // Back to Center (Loop close)
];

// Zodiac Config - 100% Accurate Relative Positions
const SAGITTARIUS_PATH = [
    // The Teapot Asterism + Bow Elements
    // Coordinates normalized (0.0 - 0.4 range approx for left side placement)
    { x: 0.28, y: 0.58 }, // Alnasl (Gamma - Spout Tip)
    { x: 0.24, y: 0.62 }, // Kaus Media (Delta - Spout Base)
    { x: 0.20, y: 0.70 }, // Kaus Australis (Epsilon - Bottom Right)
    { x: 0.14, y: 0.65 }, // Ascella (Zeta - Bottom Handle)
    { x: 0.16, y: 0.55 }, // Nunki (Sigma - Top Handle)
    { x: 0.19, y: 0.58 }, // Phi (Lid Connection)
    { x: 0.23, y: 0.52 }, // Kaus Borealis (Lambda - Lid Top)
    { x: 0.24, y: 0.62 }, // Connect back to Kaus Media to close Lid triangle
    { x: 0.16, y: 0.55 }, // Nunki
    { x: 0.11, y: 0.52 }, // Polis (Mu - Head/Bow Top)
    { x: 0.20, y: 0.70 }, // Kaus Australis
    { x: 0.22, y: 0.78 }  // Rukbat (Alpha - Knee)
];

const CAPRICORN_PATH = [
    // The Sea Goat (Bikini Bottom Shape)
    // Coordinates normalized (0.6 - 1.0 range approx for right side placement)
    { x: 0.75, y: 0.50 }, // Algedi (Alpha - Top Horn)
    { x: 0.73, y: 0.53 }, // Dabih (Beta - Head Base)
    { x: 0.78, y: 0.65 }, // Rho/Pi joint (Neck/Chest)
    { x: 0.78, y: 0.70 }, // Omega (Belly)
    { x: 0.82, y: 0.72 }, // Psi (Thigh)
    { x: 0.90, y: 0.65 }, // Nashira (Gamma - Tail Start)
    { x: 0.92, y: 0.62 }, // Deneb Algedi (Delta - Tail Tip)
    { x: 0.85, y: 0.58 }, // Theta (Back)
    { x: 0.73, y: 0.53 }, // Connect back to Dabih (Head)
    { x: 0.75, y: 0.50 }, // Algedi
    { x: 0.92, y: 0.62 }  // Connect Tail to Tip
];

let sagittariusStars = [];
let capricornStars = [];
let shootingStars = [];

class Star {
    constructor(x, y, isGuide = false, guideIndex = -1) {
        this.x = x;
        this.y = y;
        this.baseX = x; // For potential parallax
        this.baseY = y;
        this.size = isGuide ? CONFIG.guideStarSize : Math.random() * CONFIG.starSize;
        this.isGuide = isGuide;
        this.guideIndex = guideIndex;
        this.active = false; // "Connected" state
        this.alpha = Math.random();
        this.twinkleDir = Math.random() > 0.5 ? 0.01 : -0.01;
    }

    update() {
        if (!this.isGuide && !unlocked) {
            this.alpha += this.twinkleDir;
            if (this.alpha > 1 || this.alpha < 0.2) this.twinkleDir *= -1;
        } else if (this.active) {
            this.alpha = 1;
            this.size = CONFIG.guideStarSize + Math.sin(Date.now() / 200) * 2; // Pulse
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        if (this.isGuide && this.active) {
            ctx.fillStyle = CONFIG.glowColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONFIG.glowColor;
        } else if (this.isGuide) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Faint guide
            // Hints pulse slightly
            if (this.guideIndex === currentTargetIndex) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';
            }
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        }

        ctx.fill();
        ctx.restore();
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5; // Top half
        this.length = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 6;
        this.vX = this.speed;
        this.vY = this.speed * 0.6; // Angle
        this.opacity = 0;
        this.fadingIn = true;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.x += this.vX;
        this.y += this.vY;

        // Fade in/out
        if (this.fadingIn) {
            this.opacity += 0.1;
            if (this.opacity >= 1) this.fadingIn = false;
        } else {
            this.opacity -= 0.02;
            if (this.opacity <= 0) {
                this.active = false;
                this.reset();
            }
        }

        // Reset if out of bounds
        if (this.x > width + 100 || this.y > height + 100) {
            this.active = false;
            this.reset();
        }
    }

    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y - this.length * 0.6);
        ctx.stroke();
        ctx.restore();
    }
}

function init() {
    resize();
    createStars();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    // Mobile Touch Listeners (Passive false allows preventing scroll)
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchstart', onTouchMove, { passive: false });

    requestAnimationFrame(loop);
    console.log("Constellation JS Initialized");
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars(); // Re-center pattern on resize
}

function createStars() {
    stars = [];
    constellation = [];
    sagittariusStars = [];
    capricornStars = [];
    currentTargetIndex = 0;

    // Background dust
    for (let i = 0; i < CONFIG.starCount; i++) {
        stars.push(new Star(Math.random() * width, Math.random() * height));
    }

    // --- HEART (The Lock) ---
    const scale = Math.min(width, height) * 0.6;
    const offsetX = (width - scale) / 2;
    const offsetY = (height - scale) / 2 + 60; // Offset for header

    HEART_PATH.forEach((pt, index) => {
        const sx = pt.x * scale + offsetX;
        const sy = pt.y * scale + offsetY;
        const guideStar = new Star(sx, sy, true, index);
        stars.push(guideStar);
        constellation.push(guideStar);
    });

    // --- ZODIAC BACKGROUNDS ---
    // Sagittarius (Left)
    SAGITTARIUS_PATH.forEach(pt => {
        const sx = pt.x * width;
        const sy = pt.y * height;
        sagittariusStars.push(new Star(sx, sy, false));
    });

    // Capricorn (Right)
    CAPRICORN_PATH.forEach(pt => {
        const sx = pt.x * width;
        const sy = pt.y * height;
        capricornStars.push(new Star(sx, sy, false));
    });

    // Add them to main stars array for twinkling/rendering
    stars.push(...sagittariusStars, ...capricornStars);
}

// Touch Handler
function onTouchMove(e) {
    if (unlocked) return;

    // Validate touch
    if (!e.touches || e.touches.length === 0) return;

    // Prevent scrolling while drawing
    e.preventDefault();

    const touch = e.touches[0];
    cursor.x = touch.clientX;
    cursor.y = touch.clientY;

    // Logic Duplicated from onMouseMove
    const target = constellation[currentTargetIndex];
    if (!target) return;

    // Larger hit area for mobile (60px vs 50px)
    const hitDist = CONFIG.connectDistance + 15;
    const dist = Math.hypot(cursor.x - target.x, cursor.y - target.y);

    if (dist < hitDist) {
        target.active = true;
        currentTargetIndex++;

        if (navigator.vibrate) navigator.vibrate(40); // Stronger haptic for mobile

        if (currentTargetIndex >= constellation.length) {
            unlockSuccess();
        }
    }
}

function onMouseMove(e) {
    if (unlocked) return;

    cursor.x = e.clientX;
    cursor.y = e.clientY;

    // Check interaction with NEXT target guide star
    const target = constellation[currentTargetIndex];
    if (!target) return;

    const dist = Math.hypot(cursor.x - target.x, cursor.y - target.y);

    if (dist < CONFIG.connectDistance) {
        // Connected!
        target.active = true;
        currentTargetIndex++;

        // Play small chime/haptic here if possible
        if (navigator.vibrate) navigator.vibrate(20);

        // Check Win Condition
        if (currentTargetIndex >= constellation.length) {
            unlockSuccess();
        }
    }
}

function unlockSuccess() {
    if (unlocked) return;
    unlocked = true;
    document.body.classList.add('unlocked');
    setTimeout(() => {
        const passInput = document.getElementById('password');
        if (passInput) passInput.focus();
    }, 1500);
}

function drawZodiacLines(starArray) {
    if (starArray.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Clear visibility
    ctx.lineWidth = 1;
    ctx.moveTo(starArray[0].x, starArray[0].y);

    for (let i = 1; i < starArray.length; i++) {
        ctx.lineTo(starArray[i].x, starArray[i].y);
    }
    ctx.stroke();
}

function loop() {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // Spawn Shooting Star randomly
    if (Math.random() < 0.02 && shootingStars.length < 3) {
        shootingStars.push(new ShootingStar());
    }

    // Draw Shooting Stars
    shootingStars.forEach((star, index) => {
        star.update();
        star.draw();
        if (!star.active && shootingStars.length > 3) {
            shootingStars.splice(index, 1);
        }
    });

    // Draw Zodiac Lines
    drawZodiacLines(sagittariusStars);
    drawZodiacLines(capricornStars);

    // Draw Active Constellation Lines (The Lock)
    if (currentTargetIndex > 0) {
        ctx.save();
        if (unlocked) ctx.globalAlpha = 0.2;

        ctx.beginPath();
        ctx.strokeStyle = CONFIG.lineColor;
        ctx.lineWidth = 2;
        ctx.moveTo(constellation[0].x, constellation[0].y);
        for (let i = 1; i < currentTargetIndex; i++) {
            ctx.lineTo(constellation[i].x, constellation[i].y);
        }
        if (!unlocked && currentTargetIndex < constellation.length) {
            ctx.lineTo(cursor.x, cursor.y);
        } else if (unlocked) {
            ctx.lineTo(constellation[constellation.length - 1].x, constellation[constellation.length - 1].y);
        }

        ctx.fillStyle = CONFIG.glowColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONFIG.glowColor;
        ctx.stroke();
        ctx.restore();
    }

    // Draw All Stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);

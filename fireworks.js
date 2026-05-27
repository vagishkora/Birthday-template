let canvas;
let ctx;
let fireworks = [];
let particles = [];
let hue = 120;
let limiterTotal = 5;
let limiterTick = 0;
let timerTotal = 80;
let timerTick = 0;
let mousedown = false;
let mx, my;

// Canvas setup will happen in startFireworks() to avoid crash
let isRunning = false;
let autoLaunch = false; // Flag to control automatic generation

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
    let xDistance = p1x - p2x;
    let yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Firework Class
class Firework {
    constructor(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.targetRadius = 1;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        this.speed *= this.acceleration;
        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Particle Class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 15); // Powerful explosion
        this.friction = 0.96;       // Slight air resistance
        this.gravity = 1.5;         // Stronger gravity for "falling" effect
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(60, 90); // Brighter
        this.alpha = 1;
        this.decay = random(0.01, 0.025); // Longer life

        // Occasional sparkle particle
        this.sparkle = Math.random() < 0.3;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        // Sparkle flickers
        if (this.sparkle) this.brightness = random(80, 100);

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.lineWidth = this.sparkle ? 2 : 1;
        ctx.stroke();
    }
}

function createParticles(x, y) {
    let particleCount = 200; // MUCH DENSER EXPLOSION
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

function loop() {
    if (!autoLaunch && fireworks.length === 0 && particles.length === 0) {
        isRunning = false;
        return;
    }
    requestAnimationFrame(loop);

    // Create trails - slightly faster fade for clearer sparkles
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    // Only launch new fireworks if autoLaunch is true
    if (autoLaunch) {
        if (timerTick >= timerTotal) {
            if (!mousedown) {
                // Launch random fireworks
                fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
                timerTick = 0;
            }
        } else {
            timerTick++;
        }
    }

    // Cycle colors
    hue += 0.5;
}

function stopAutoFire() {
    autoLaunch = false;
    console.log("🛑 Auto fireworks stopping... fading out.");
}

function startFireworks() {
    console.log("🚀 Initializing Fireworks...");
    canvas = document.getElementById('fireworks-canvas');

    if (!canvas) {
        console.error("❌ Canvas element NOT found with id 'fireworks-canvas'");
        return;
    }

    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize listener
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Reset auto launch
    autoLaunch = true;

    if (!isRunning) {
        isRunning = true;
        loop();
        console.log("✨ Fireworks loop started!");
    }

    // Launch a flurry immediately
    setTimeout(() => {
        fireworks.push(new Firework(canvas.width / 4, canvas.height, canvas.width / 4, canvas.height / 3));
        fireworks.push(new Firework(canvas.width / 2, canvas.height, canvas.width / 2, canvas.height / 4));
        fireworks.push(new Firework(canvas.width * 0.75, canvas.height, canvas.width * 0.75, canvas.height / 3));
    }, 100);
}

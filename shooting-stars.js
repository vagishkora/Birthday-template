/**
 * Shooting Stars Effect - Vanilla JS Port
 * Adapted from React implementation for Janes Birthday Surprise
 */

class ShootingStarSystem {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            minSpeed: options.minSpeed || 10,
            maxSpeed: options.maxSpeed || 30,
            minDelay: options.minDelay || 1200,
            maxDelay: options.maxDelay || 4200,
            starColor: options.starColor || "#9E00FF",
            trailColor: options.trailColor || "#2EB9DF",
            starWidth: options.starWidth || 10,
            starHeight: options.starHeight || 1,
        };

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Create SVG Canvas if not exists, otherwise append to it?
        // Actually, to support multiple layers (colors), we can either use one SVG or multiple.
        // The React demo uses multiple Components, so multiple SVGs stacked.
        // Let's create one private SVG for this system instance.
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.style.position = "absolute";
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        this.svg.style.top = "0";
        this.svg.style.left = "0";
        this.svg.style.pointerEvents = "none"; // Let clicks pass through
        this.svg.style.zIndex = "0"; // Base level inside container (container should be -1)

        // Define Gradient
        this.gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.id = this.gradientId;
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.setAttribute("y2", "100%");

        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.style.stopColor = this.options.trailColor;
        stop1.style.stopOpacity = "0";

        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.style.stopColor = this.options.starColor;
        stop2.style.stopOpacity = "1";

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        this.svg.appendChild(defs);
        this.container.appendChild(this.svg);

        // State
        this.star = null; // { x, y, angle, scale, speed, distance, id, element }

        this.init();
    }

    init() {
        this.scheduleNextStar();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    getRandomStartPoint() {
        const side = Math.floor(Math.random() * 4);
        const offset = Math.random() * window.innerWidth;

        switch (side) {
            case 0: return { x: offset, y: 0, angle: 45 };
            case 1: return { x: window.innerWidth, y: offset, angle: 135 };
            case 2: return { x: offset, y: window.innerHeight, angle: 225 };
            case 3: return { x: 0, y: offset, angle: 315 };
            default: return { x: 0, y: 0, angle: 45 };
        }
    }

    scheduleNextStar() {
        const randomDelay = Math.random() * (this.options.maxDelay - this.options.minDelay) + this.options.minDelay;
        setTimeout(() => {
            this.createStar();
            this.scheduleNextStar();
        }, randomDelay);
    }

    createStar() {
        if (this.star) {
            // If a star already exists, we skip creating a new one to mimic the React component single-star behavior
            // Or we could allow multiple. The React code `setStar` replaces the current star.
            // So if one is traveling, it might get replaced? 
            // Actually React `createStar` is called in setTimeout loop.
            // `setStar` replaces state. So yes, only 1 active star per "System" at a time.
            // Converting this behaviour:
            // If current star is far enough or done, we replace.
            // But let's just overwrite for now to match exactly.
            if (this.star && this.star.element) {
                this.star.element.remove();
            }
        }

        const { x, y, angle } = this.getRandomStartPoint();

        // Create SVG Rect
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("fill", `url(#${this.gradientId})`);
        rect.setAttribute("height", this.options.starHeight);

        this.svg.appendChild(rect);

        const wasRunning = !!this.star;
        this.star = {
            id: Date.now(),
            x,
            y,
            angle,
            scale: 1,
            speed: Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed,
            distance: 0,
            element: rect
        };

        if (!wasRunning) {
            requestAnimationFrame(this.animate);
        }
    }

    animate() {
        if (this.star && this.star.element) {
            const prevStar = this.star;
            const newX = prevStar.x + prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
            const newY = prevStar.y + prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
            const newDistance = prevStar.distance + prevStar.speed;
            const newScale = 1 + newDistance / 100;

            // Update State
            this.star.x = newX;
            this.star.y = newY;
            this.star.distance = newDistance;
            this.star.scale = newScale;

            // Update DOM
            const width = this.options.starWidth * newScale;
            this.star.element.setAttribute("width", width);
            this.star.element.setAttribute("x", newX);
            this.star.element.setAttribute("y", newY);

            const centerX = newX + width / 2;
            const centerY = newY + this.options.starHeight / 2;
            this.star.element.setAttribute("transform", `rotate(${this.star.angle}, ${centerX}, ${centerY})`);

            // Check bounds
            if (
                newX < -20 ||
                newX > window.innerWidth + 20 ||
                newY < -20 ||
                newY > window.innerHeight + 20
            ) {
                this.star.element.remove();
                this.star = null;
            }
        }
        if (this.star) {
            requestAnimationFrame(this.animate);
        }
    }
}

// Helper to init standard 3 layers
function initShootingStars(containerId) {
    // Layer 1: Purple
    new ShootingStarSystem(containerId, {
        starColor: "#9E00FF",
        trailColor: "#2EB9DF",
        minSpeed: 15,
        maxSpeed: 35,
        minDelay: 1000,
        maxDelay: 3000
    });

    // Layer 2: Pink
    new ShootingStarSystem(containerId, {
        starColor: "#FF0099",
        trailColor: "#FFB800",
        minSpeed: 10,
        maxSpeed: 25,
        minDelay: 2000,
        maxDelay: 4000
    });

    // Layer 3: Cyan
    new ShootingStarSystem(containerId, {
        starColor: "#00FF9E",
        trailColor: "#00B8FF",
        minSpeed: 20,
        maxSpeed: 40,
        minDelay: 1500,
        maxDelay: 3500
    });
}

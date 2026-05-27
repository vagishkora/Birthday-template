/**
 * sphere.js - Interactive 3D Image Sphere (Vanilla JS Port)
 * Based on the React component SphereImageGrid.
 */

class SphereGrid {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`SphereGrid: Container ${containerId} not found`);
            return;
        }

        // Configuration
        this.config = Object.assign({
            images: [],
            containerSize: 400,
            sphereRadius: 200,
            dragSensitivity: 0.5,
            momentumDecay: 0.95,
            maxRotationSpeed: 5,
            baseImageScale: 0.12,
            hoverScale: 1.2,
            autoRotate: true,
            autoRotateSpeed: 0.3
        }, config);

        // State
        this.rotation = { x: 15, y: 15, z: 0 };
        this.velocity = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.imagePositions = [];
        this.domNodes = [];
        this.animationId = null;

        // Math Helpers
        this.MATH = {
            degToRad: d => d * (Math.PI / 180),
            normalizeAngle: a => {
                while (a > 180) a -= 360;
                while (a < -180) a += 360;
                return a;
            }
        };

        this.init();
    }

    init() {
        this.setupDOM();
        this.calculateSpherePositions();
        this.setupEvents();
        this.animate();
    }

    setupDOM() {
        this.container.style.width = `${this.config.containerSize}px`;
        this.container.style.height = `${this.config.containerSize}px`;
        this.container.style.position = 'relative';
        this.container.style.perspective = '1000px';
        this.container.style.cursor = 'grab';
        this.container.style.userSelect = 'none';

        // LOADING OPTIMIZATION: Staggered Creation
        this.currentIndex = 0;
        this.batchSize = 5; // Create 5 items per frame
        this.createNodeBatch();
    }

    createNodeBatch() {
        if (this.currentIndex >= this.config.images.length) return;

        const end = Math.min(this.currentIndex + this.batchSize, this.config.images.length);

        for (let i = this.currentIndex; i < end; i++) {
            const imgData = this.config.images[i];

            const el = document.createElement('div');
            el.className = 'sphere-item';
            el.style.position = 'absolute';
            el.style.transformStyle = 'preserve-3d';
            el.style.willChange = 'transform, opacity';
            el.style.left = '50%';
            el.style.top = '50%';

            // Inner image
            const inner = document.createElement('div');
            inner.style.width = '100%';
            inner.style.height = '100%';
            inner.style.borderRadius = '50%';
            inner.style.overflow = 'hidden';
            inner.style.border = '2px solid rgba(255,255,255,0.3)';
            inner.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';

            const img = document.createElement('img');
            img.src = imgData.src;
            img.loading = 'lazy';   // Browser native lazy load
            img.decoding = 'async'; // Non-blocking decode
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.pointerEvents = 'none'; // dragging fix

            inner.appendChild(img);
            el.appendChild(inner);
            this.container.appendChild(el);

            this.domNodes[i] = el; // Store at correct index

            // Modal Click
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent drag start maybe?
                if (this.config.onImageClick) {
                    this.config.onImageClick(imgData);
                }
            });
        }

        this.currentIndex = end;

        // Schedule next batch
        if (this.currentIndex < this.config.images.length) {
            requestAnimationFrame(() => this.createNodeBatch());
        }
    }

    calculateSpherePositions() {
        const imageCount = this.config.images.length;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angleIncrement = 2 * Math.PI / goldenRatio;
        const radius = this.config.sphereRadius;

        for (let i = 0; i < imageCount; i++) {
            const t = i / imageCount;
            const inclination = Math.acos(1 - 2 * t);
            const azimuth = angleIncrement * i;

            let phi = inclination * (180 / Math.PI);
            let theta = (azimuth * (180 / Math.PI)) % 360;

            // Pole optimization (same as React code)
            const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35;
            if (phi < 90) phi = Math.max(5, phi - poleBonus);
            else phi = Math.min(175, phi + poleBonus);

            phi = 15 + (phi / 180) * 150;

            this.imagePositions.push({
                theta,
                phi,
                radius
            });
        }
    }

    setupEvents() {
        // Mouse
        this.container.addEventListener('mousedown', e => this.handleStart(e.clientX, e.clientY));
        document.addEventListener('mousemove', e => this.handleMove(e.clientX, e.clientY));
        document.addEventListener('mouseup', () => this.handleEnd());

        // Touch
        this.container.addEventListener('touchstart', e => this.handleStart(e.touches[0].clientX, e.touches[0].clientY));
        document.addEventListener('touchmove', e => this.handleMove(e.touches[0].clientX, e.touches[0].clientY));
        document.addEventListener('touchend', () => this.handleEnd());
    }

    handleStart(x, y) {
        this.isDragging = true;
        this.velocity = { x: 0, y: 0 };
        this.lastMousePos = { x, y };
        this.container.style.cursor = 'grabbing';
    }

    handleMove(x, y) {
        if (!this.isDragging) return;

        const deltaX = x - this.lastMousePos.x;
        const deltaY = y - this.lastMousePos.y;

        const rotX = -deltaY * this.config.dragSensitivity;
        const rotY = deltaX * this.config.dragSensitivity;

        this.rotation.x = this.MATH.normalizeAngle(this.rotation.x + this.clampSpeed(rotX));

        // STABILIZATION FIX: Clamp X (Vertical Tilt) to prevent chaotic tumbling
        // Keeps it spinning like a globe (horizontally) rather than flipping over.
        this.rotation.x = Math.max(-10, Math.min(10, this.rotation.x));

        this.rotation.y = this.MATH.normalizeAngle(this.rotation.y + this.clampSpeed(rotY));

        this.velocity = { x: 0, y: this.clampSpeed(rotY) }; // Kill X velocity to prevent drift
        this.lastMousePos = { x, y };
    }

    handleEnd() {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
    }

    clampSpeed(speed) {
        return Math.max(-this.config.maxRotationSpeed, Math.min(this.config.maxRotationSpeed, speed));
    }

    updateMomentum() {
        if (this.isDragging) return;

        this.velocity.x *= this.config.momentumDecay;
        this.velocity.y *= this.config.momentumDecay;

        let newY = this.rotation.y;
        if (this.config.autoRotate) newY += this.config.autoRotateSpeed;

        newY += this.velocity.y;

        this.rotation.x = this.MATH.normalizeAngle(this.rotation.x + this.velocity.x);
        this.rotation.y = this.MATH.normalizeAngle(newY);
    }

    render() {
        const rotXRad = this.MATH.degToRad(this.rotation.x);
        const rotYRad = this.MATH.degToRad(this.rotation.y);
        const baseSize = this.config.containerSize * this.config.baseImageScale;

        this.imagePositions.forEach((pos, i) => {
            // Apply Rotation
            const thetaRad = this.MATH.degToRad(pos.theta);
            const phiRad = this.MATH.degToRad(pos.phi);

            // Sphere Cartesian
            let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
            let y = pos.radius * Math.cos(phiRad);
            let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

            // Rotate Y
            const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
            const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
            x = x1;
            z = z1;

            // Rotate X
            const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
            const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
            y = y2;
            z = z2;

            // Update DOM
            const el = this.domNodes[i];
            if (!el) return; // Skip if not yet created via batch

            // Visibility
            if (z < -30) {
                el.style.opacity = 0;
            } else {
                // Scale & Opacity
                const scale = Math.max(0.3, 1 + (z / pos.radius) * 0.5); // Depth scaling
                const opacity = Math.min(1, (z + 50) / 50); // Fade in
                const size = baseSize * scale;
                const zIndex = Math.round(1000 + z);

                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
                el.style.zIndex = zIndex;
                el.style.opacity = opacity;
            }
        });
    }

    animate() {
        this.updateMomentum();
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

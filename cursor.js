document.addEventListener("DOMContentLoaded", () => {
    // 0. Touch Device Detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;

    // 1. Remove Any Old Cursors (Cleanup)
    const oldGlow = document.getElementById("glow-cursor");
    if (oldGlow) oldGlow.remove();
    const oldFingerprint = document.getElementById("fingerprint-cursor");
    if (oldFingerprint) oldFingerprint.remove();

    // 2. Create Main Cursor Element (Only for Desktop)
    let cursor = null;
    if (!isTouchDevice) {
        cursor = document.createElement("div");
        cursor.id = "fingerprint-cursor";
        document.body.appendChild(cursor);
    }

    // 3. Movement Logic (Desktop)
    let lastDustTime = 0;
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (cursor) {
            cursor.style.left = (mouseX - 16) + "px";
            cursor.style.top = (mouseY - 16) + "px";
        }

        // CREATE FAIRY DUST (Desktop)
        const now = Date.now();
        if (now - lastDustTime > 50) { // Max 20 particles per second
            createFairyDust(mouseX, mouseY);
            lastDustTime = now;
        }
    });

    // 3.5 Touch Logic (Mobile Fairy Dust)
    const handleTouch = (e) => {
        const now = Date.now();
        if (now - lastDustTime > 50) {
            const touch = e.touches[0];
            createFairyDust(touch.clientX, touch.clientY);
            lastDustTime = now;
        }
    };

    document.addEventListener("touchmove", handleTouch, { passive: true });
    document.addEventListener("touchstart", handleTouch, { passive: true });

    // FAIRY DUST LOGIC
    function createFairyDust(x, y) {
        const dust = document.createElement("span");
        dust.className = "fairy-dust";

        // Random Position jitter
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;

        dust.style.left = (x + jitterX) + "px";
        dust.style.top = (y + jitterY) + "px";

        // Random Size
        const size = Math.random() * 8 + 4; // 4px to 12px
        dust.style.width = size + "px";
        dust.style.height = size + "px";

        // Random Color (Pink/Gold/White)
        const colors = ['#f472b6', '#fbbf24', '#ffffff', '#e879f9'];
        dust.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        document.body.appendChild(dust);

        // Animate out
        setTimeout(() => {
            dust.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${Math.random() * 50}px) scale(0)`;
            dust.style.opacity = "0";
        }, 50);

        // Remove
        setTimeout(() => {
            dust.remove();
        }, 1000);
    }

    // 4. Hover Interactions (Pulse)
    const addHoverListeners = () => {
        const specialElements = document.querySelectorAll(".special-hover, a, button, .clickable");

        specialElements.forEach(el => {
            el.addEventListener("mouseenter", () => {
                if (cursor) cursor.classList.add("fingerprint-pulse");
            });
            el.addEventListener("mouseleave", () => {
                if (cursor) cursor.classList.remove("fingerprint-pulse");
            });
        });
    };

    addHoverListeners();

    // 5. Visibility
    document.addEventListener("mouseout", (e) => {
        if (!e.relatedTarget && !e.toElement) {
            if (cursor) cursor.style.opacity = "0";
        }
    });
    document.addEventListener("mouseover", () => {
        if (cursor) cursor.style.opacity = "0.9";
    });
});

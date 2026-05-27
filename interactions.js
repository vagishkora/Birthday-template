/**
 * SUKKUVERSE MICRO-INTERACTIONS
 * 1. Magic Click (Heart Explosion)
 * 2. Love Battery (100% Fixed Widget)
 * 3. Magnet Buttons (Playful hover)
 * 4. Sleepy Screensaver (Inactivity Monitor)
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MAGIC CLICK (HEART EXPLOSION) ---
    document.addEventListener('click', (e) => {
        // Avoid double trigger on interactive elements
        if (e.target.closest('button') || e.target.closest('a')) return;
        createHeartExplosion(e.clientX, e.clientY);
    });

    // --- 5. 3D TILT CARDS (Premium Hover Effect) ---
    const cards = document.querySelectorAll('.float-card, .question-card, .reason-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (center is 0,0)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Max rotation degrees
            const maxRotate = 15;

            const rotateX = ((y - centerY) / centerY) * -maxRotate;
            const rotateY = ((x - centerX) / centerX) * maxRotate;

            // Apply Transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.transition = 'none'; // Instant response
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease-out'; // Smooth reset
        });
    });

    function createHeartExplosion(x, y) {
        const colors = ['#ff4d6d', '#ff8fa3', '#ffd700', '#ffffff'];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.classList.add('magic-particle');
            document.body.appendChild(particle);

            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Random Direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 20;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            // Animate
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0, .9, .57, 1)',
                fill: 'forwards'
            });

            setTimeout(() => particle.remove(), 600);
        }
    }

    // --- 2. LOVE BATTERY (100% Fixed Widget) ---
    const battery = document.createElement('div');
    battery.className = 'love-battery';
    battery.innerHTML = `
        <span class="battery-icon">
            <span class="battery-level"></span>
        </span>
        <span class="battery-text">100% Love</span>
    `;
    document.body.appendChild(battery);

    // --- 3. MAGNET BUTTONS ---
    const buttons = document.querySelectorAll('button, a.home-btn, .clickable');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic Pull Strength
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            setTimeout(() => {
                btn.style.transition = 'transform 0.3s ease';
            }, 0);
        });

        // Reset transition after snapping back
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s ease-out';
        });
    });

    // --- 4. SLEEPY SCREENSAVER REMOVED ---
});

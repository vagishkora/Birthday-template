document.addEventListener('DOMContentLoaded', () => {
    // Touch Check
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    if (isTouch) return; // Disable on mobile

    const cards = document.querySelectorAll('.float-card');

    cards.forEach(card => {
        // Add glare element if not present
        if (!card.querySelector('.glare')) {
            const glare = document.createElement('div');
            glare.classList.add('glare');
            card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (Limited to +/- 15 deg)
            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const rotateX = (0.5 - yPct) * 30; // Max tilt X
            const rotateY = (xPct - 0.5) * 30; // Max tilt Y

            // Apply Transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

            // Move Glare
            const glare = card.querySelector('.glare');
            if (glare) {
                glare.style.left = `${xPct * 100}%`;
                glare.style.top = `${yPct * 100}%`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            // Reset
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;

            const glare = card.querySelector('.glare');
            if (glare) {
                glare.style.opacity = '0';
            }
        });
    });
});

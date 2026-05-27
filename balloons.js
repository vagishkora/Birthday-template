const balloons = [];
const balloonContainer = document.createElement('div');
balloonContainer.id = 'balloon-container';
balloonContainer.style.position = 'fixed';
balloonContainer.style.inset = '0';
balloonContainer.style.pointerEvents = 'none';
balloonContainer.style.zIndex = '40';
document.body.appendChild(balloonContainer);

// Inject Liquid Animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes liquid-wobble {
        0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        25% { border-radius: 45% 55% 50% 50% / 55% 45% 60% 40%; }
        50% { border-radius: 50% 60% 30% 60% / 40% 60% 50% 60%; }
        75% { border-radius: 60% 40% 60% 40% / 60% 30% 70% 40%; }
        100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    }
    @keyframes float-up {
        0% { transform: translateY(110vh) scale(0.8); opacity: 0; }
        10% { opacity: 1; transform: translateY(100vh) scale(1); }
        100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
    }
    .liquid-balloon {
        position: absolute;
        opacity: 0.85;
        box-shadow: 
            inset 10px 10px 20px rgba(255, 255, 255, 0.5), 
            inset -10px -20px 20px rgba(0, 0, 0, 0.1), 
            5px 10px 15px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.4);
        animation: liquid-wobble 8s ease-in-out infinite, float-up 15s linear forwards;
    }
    .liquid-balloon::after {
        content: '';
        position: absolute;
        top: 15%;
        left: 20%;
        width: 25%;
        height: 15%;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.8);
        filter: blur(2px);
        transform: rotate(-45deg);
    }
`;
document.head.appendChild(style);

function createBalloon() {
    const el = document.createElement('div');
    el.classList.add('liquid-balloon');
    const size = Math.random() * 60 + 50; // Bigger: 50px to 110px

    // Size & Initial Pos
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 95}vw`;

    // Randomize duration for natural feel
    const duration = Math.random() * 10 + 12; // 12-22s
    el.style.animationDuration = `6s, ${duration}s`; // Wobble speed, Float speed

    // Liquid Colors (Vibrant but translucent)
    const colors = [
        'rgba(236, 72, 153, 0.3)', // Pink
        'rgba(59, 130, 246, 0.3)', // Blue
        'rgba(139, 92, 246, 0.3)', // Violet
        'rgba(245, 158, 11, 0.3)', // Amber
        'rgba(16, 185, 129, 0.3)'  // Emerald
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.background = `linear-gradient(135deg, rgba(255,255,255,0.1), ${color})`;

    // Append to container
    balloonContainer.appendChild(el);

    // Cleanup after animation
    setTimeout(() => {
        if (el.parentNode) el.remove();
    }, duration * 1000);
}

let balloonInterval;

function startBalloons() {
    // Launch a flurry immediately
    for (let i = 0; i < 10; i++) {
        setTimeout(createBalloon, i * 300);
    }

    // Continuous flow
    if (!balloonInterval) {
        balloonInterval = setInterval(() => {
            if (Math.random() > 0.2) createBalloon();
        }, 600);
    }
}

function stopBalloons() {
    if (balloonInterval) {
        clearInterval(balloonInterval);
        balloonInterval = null;
    }
    // Fade out existing
    const balloons = document.querySelectorAll('.liquid-balloon');
    balloons.forEach(b => {
        b.style.transition = 'opacity 1s, transform 1s';
        b.style.opacity = '0';
        b.style.transform += ' scale(0)';
        setTimeout(() => b.remove(), 1000);
    });
}

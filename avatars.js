document.addEventListener('DOMContentLoaded', () => {
    initAvatarWidget();
});

const avatarMessages = [
    "Happy Birthday! ❤️",
    "We look cool, right? 😎",
    "Keep smiling, beautiful! ✨",
    "Did you find the secret? 🤫",
    "You are the best! 🌟",
    "Party timmmme! 🥳"
];

function initAvatarWidget() {
    // Create Container
    const widget = document.createElement('div');
    widget.className = 'avatar-widget';
    widget.setAttribute('onclick', 'interactAvatar()');
    widget.setAttribute('onmouseover', 'peekAvatar()');

    widget.innerHTML = `
        <div class="speech-bubble" id="avatar-msg">Hey Birthday Girl! 🎉</div>
        <div class="avatar-img-container" id="avatar-inner">
            <div class="avatar-gloss"></div>
            <img src="https://picsum.photos/seed/portfolio/800/600" class="avatar-img" alt="Us">
        </div>
    `;

    document.body.appendChild(widget);

    // 3D Tilt Logic
    widget.addEventListener('mousemove', (e) => {
        const inner = document.getElementById('avatar-inner');
        const rect = widget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center-based coordinates (-1 to 1)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -20; // Max 20deg tilt
        const rotateY = ((x - centerX) / centerX) * 20;

        inner.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;

        // Gloss movement
        const gloss = widget.querySelector('.avatar-gloss');
        gloss.style.transform = `translate(${x}px, ${y}px)`;
        gloss.style.opacity = '0.6';
    });

    widget.addEventListener('mouseleave', () => {
        const inner = document.getElementById('avatar-inner');
        const gloss = widget.querySelector('.avatar-gloss');
        inner.style.transform = `perspective(500px) rotateX(0) rotateY(0) scale(1)`;
        gloss.style.opacity = '0';
    });

    // Initial greeting delay
    setTimeout(() => {
        showBubble("Happy Birthday! 🎂");
    }, 2000);
}

let bubbleTimer;

function showBubble(text) {
    const bubble = document.getElementById('avatar-msg');
    if (!bubble) return;

    bubble.innerText = text;
    bubble.classList.add('show');

    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
        bubble.classList.remove('show');
    }, 4000);
}

function peekAvatar() {
    // Random chance to say something on hover
    if (Math.random() > 0.7) {
        const text = avatarMessages[Math.floor(Math.random() * avatarMessages.length)];
        showBubble(text);
    }
}

function interactAvatar() {
    // 1. Show Message
    const text = avatarMessages[Math.floor(Math.random() * avatarMessages.length)];
    showBubble(text);

    // 2. Burst Hearts
    createAvatarHearts();
}

function createAvatarHearts() {
    const widget = document.querySelector('.avatar-widget');
    const rect = widget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 6; i++) {
        const heart = document.createElement('div');
        heart.innerText = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = centerX + 'px';
        heart.style.top = centerY + 'px';
        heart.style.fontSize = '1.5rem';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '10000';
        heart.style.transition = 'all 1s ease-out';

        document.body.appendChild(heart);

        // Random explode
        const x = (Math.random() - 0.5) * 150;
        const y = (Math.random() - 1) * 150 - 50; // Upwards

        requestAnimationFrame(() => {
            heart.style.transform = `translate(${x}px, ${y}px) scale(0)`;
            heart.style.opacity = '0';
        });

        setTimeout(() => heart.remove(), 1000);
    }
}

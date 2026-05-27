document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Logic removed (moved to cursor.js)

    // Floating Hearts Background
    const heartsContainer = document.createElement('div');
    heartsContainer.classList.add('bg-hearts');
    document.body.appendChild(heartsContainer);

    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 5 + 10 + 's';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        heartsContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 15000);
    }

    setInterval(createHeart, 2500); // Optimized: Reduced spawn rate

    // Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Next Button Logic (Show when scrolled to bottom - basic implementation)
    window.addEventListener('scroll', () => {
        const nextBtn = document.querySelector('.next-btn-container');
        if (nextBtn) {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
    });
});

/* ------------------------------------------- */
/* IPHONE PASSCODE LOGIC */
/* ------------------------------------------- */
let currentPasscode = "";
const correctPasscode = "0000"; // Generic Passcode

function showPasscodeOverlay(event) {
    if (event) event.preventDefault();
    const overlay = document.getElementById('passcode-overlay');
    if (overlay) {
        overlay.classList.add('active');
        currentPasscode = "";
        updateDots();
    } else {
        console.error("Passcode overlay not found!");
    }
}

function hidePasscodeOverlay() {
    const overlay = document.getElementById('passcode-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        currentPasscode = "";
        updateDots();
    }
}

function addDigit(digit) {
    if (currentPasscode.length < 4) {
        currentPasscode += digit;
        updateDots();

        if (currentPasscode.length === 4) {
            // Small delay to show the last dot filled before checking
            setTimeout(checkPasscode, 300);
        }
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.passcode-dots .dot');
    dots.forEach((dot, index) => {
        if (index < currentPasscode.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function checkPasscode() {
    const dotsContainer = document.getElementById('passcode-dots');
    const lockIconContainer = document.getElementById('lock-icon'); // Assuming id added to div
    const lockIcon = lockIconContainer ? lockIconContainer.querySelector('i') : document.querySelector('.lock-icon i');
    const lockDiv = document.querySelector('.lock-icon');

    if (currentPasscode === correctPasscode) {
        // Correct!
        if (lockIcon) {
            lockIcon.classList.remove('fa-lock');
            lockIcon.classList.add('fa-lock-open');
        }
        if (lockDiv) {
            lockDiv.classList.add('unlocked');
        }

        // Slight delay to appreciate the unlock animation
        setTimeout(() => {
            window.location.href = "journal.html";
        }, 800);

    } else {
        // Incorrect - Shake animation
        dotsContainer.classList.add('shake');
        if (lockDiv) lockDiv.classList.add('shake');

        // Vibrate if on mobile
        if (navigator.vibrate) navigator.vibrate(200);

        setTimeout(() => {
            dotsContainer.classList.remove('shake');
            if (lockDiv) lockDiv.classList.remove('shake');
            currentPasscode = "";
            updateDots();
        }, 500);
    }
}

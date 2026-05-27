document.addEventListener("DOMContentLoaded", () => {

    // --- CONFIGURATION ---
    // User requested 23 edits. Assuming filenames edit1.mp4 ... edit23.mp4
    // If you don't have these files yet, you must add them to a 'videos' folder!
    // User requested 23 edits, but we found 22 unique MP4s in 'edits/' folder.
    // Filename pattern is: 'edits/edit (i).MP4'
    const VIDEO_COUNT = 22;
    const CARDS_DATA = [];

    for (let i = 1; i <= VIDEO_COUNT; i++) {
        CARDS_DATA.push({
            id: i,
            // Correct path based on actual file names
            src: `edits/edit (${i}).MP4`,
            title: `Edit ${i}`
        });
    }

    const container = document.querySelector(".stack-container");
    const dotsContainer = document.querySelector(".nav-dots");
    const volumeBtn = document.getElementById("volume-toggle");

    let currentIndex = 0;
    let isAnimating = false;
    const cooldown = 500; // ms
    let lastTime = 0;
    let isMuted = true; // Default state

    // --- VOLUME TOGGLE ---
    volumeBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        const icon = volumeBtn.querySelector("i");
        if (isMuted) {
            icon.className = "fas fa-volume-mute";
            muteAll();
        } else {
            icon.className = "fas fa-volume-up";
            // Unmute CURRENT active video
            playCurrentVideo(true);
        }
    });

    function muteAll() {
        document.querySelectorAll("video").forEach(v => {
            v.muted = true;
        });
    }

    // --- INITIALIZATION ---
    function init() {
        // Create Cards
        CARDS_DATA.forEach((item, index) => {
            const card = document.createElement("div");
            card.classList.add("stack-card");
            card.dataset.index = index;

            // Create Video Element
            const video = document.createElement("video");
            video.src = item.src;
            video.classList.add("stack-video");
            video.loop = true;
            video.muted = true; // Start muted
            video.playsInline = true;

            // Mouse Interaction (Hover Mute/Unmute?) 
            // User said: "cursor moved it should mute automatically"
            // Interpreted as: Leave area -> Mute. Enter -> Unmute (if global sound is ON).
            card.addEventListener("mouseenter", () => {
                if (!isMuted && index === currentIndex) {
                    video.muted = false;
                }
            });
            card.addEventListener("mouseleave", () => {
                video.muted = true;
            });

            card.appendChild(video);
            container.appendChild(card);

            // Create Dot (Only show max 10 dots to prevent overcrowding?)
            // Or just show all if small, but 23 is a lot for dots.
            // Let's scrollable dots or hidden. For now, all 23.
            /* 
            const dot = document.createElement("div");
            dot.classList.add("nav-dot");
            dot.addEventListener("click", () => jumpTo(index));
            dotsContainer.appendChild(dot);
            */
        });

        // Disable dots for 23 items (too messy), or use a scrollbar logic.
        // Let's keep dots hidden for now or just first few.
        // Actually, let's just not render dots for 23 items to keep UI clean.
        dotsContainer.style.display = 'none';

        updateStack();
    }

    // --- CORE LOGIC ---
    function updateStack() {
        const cards = document.querySelectorAll(".stack-card");
        const total = cards.length;

        // Update Cards Position & Playback
        cards.forEach((card, index) => {
            const video = card.querySelector("video");

            // Calculate distance from current (handling circular wrap)
            let diff = index - currentIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            // STYLES based on distance
            if (diff === 0) {
                // ACTIVE CARD
                card.style.transform = `translateY(0) translateZ(0) scale(1) rotateX(0deg)`;
                card.style.opacity = "1";
                card.style.zIndex = "10";
                card.style.filter = "blur(0px)";
                card.style.pointerEvents = "auto";

                // Play Video
                video.play().catch(e => console.log("Autoplay blocked", e));
                video.muted = isMuted; // Sync with global toggle

            } else {
                // INACTIVE CARDS
                // Pause video to save resources
                video.pause();
                video.currentTime = 0; // Optional: Reset

                if (diff === -1) {
                    // PREVIOUS CARD (Above)
                    // Added translateZ(-100px) to physically push it behind the active card
                    card.style.transform = `translateY(-140px) translateZ(-100px) scale(0.85) rotateX(5deg)`;
                    card.style.opacity = "0.6";
                    card.style.zIndex = "5";
                    card.style.filter = "blur(2px)";
                    card.style.pointerEvents = "none";
                } else if (diff === 1) {
                    // NEXT CARD (Below)
                    // Added translateZ(-100px) to physically push it behind the active card
                    card.style.transform = `translateY(140px) translateZ(-100px) scale(0.85) rotateX(-5deg)`;
                    card.style.opacity = "0.6";
                    card.style.zIndex = "5";
                    card.style.filter = "blur(2px)";
                    card.style.pointerEvents = "none";
                } else {
                    // HIDDEN
                    const direction = diff > 0 ? 1 : -1;
                    card.style.transform = `translateY(${direction * 800}px) scale(0.5)`;
                    card.style.opacity = "0";
                    card.style.zIndex = "0";
                }
            }
        });
    }

    function playCurrentVideo(unmute = false) {
        const card = document.querySelectorAll(".stack-card")[currentIndex];
        const video = card.querySelector("video");
        if (unmute) video.muted = false;
        video.play();
    }

    function navigate(direction) {
        const now = Date.now();
        if (now - lastTime < cooldown) return;
        lastTime = now;

        const total = CARDS_DATA.length;
        if (direction === 1) {
            // Next
            currentIndex = (currentIndex + 1) % total;
        } else {
            // Prev
            currentIndex = (currentIndex - 1 + total) % total;
        }
        updateStack();
    }

    // --- EVENTS ---

    // 1. Wheel Scroll
    window.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) > 30) {
            navigate(e.deltaY > 0 ? 1 : -1);
        }
    });

    // 2. Keyboard
    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") navigate(1);
        if (e.key === "ArrowUp") navigate(-1);
    });

    // 3. Touch / Drag Logic
    let startY = 0;
    let isDragging = false;

    window.addEventListener("mousedown", (e) => {
        startY = e.clientY;
        isDragging = true;
    });

    window.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: false });

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;

        // Handle touch vs mouse end coordinates
        let endY = 0;
        if (e.type === "touchend") {
            endY = e.changedTouches[0].clientY;
        } else {
            endY = e.clientY;
        }

        const diff = startY - endY;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            navigate(diff > 0 ? 1 : -1);
        }
    }

    // Run
    init();
});

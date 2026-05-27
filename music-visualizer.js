document.addEventListener("DOMContentLoaded", () => {
    // 1. Create Visualizer Container
    const container = document.createElement("div");
    container.id = "music-visualizer";
    container.classList.add("music-visualizer");
    document.body.appendChild(container);

    // 2. Create Bars
    const barCount = 40;
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement("div");
        bar.className = "bar";
        container.appendChild(bar);
    }

    // 3. Sync with Audio State
    // We check the music toggle button state or listen for events
    // Assuming music-toggle.js toggles a class 'playing' on the body or button

    // Polling check for simplicity (or we can hook into window.audioState if exists)
    setInterval(() => {
        // Check if music is playing
        // Strategy: Check if the audio element is playing
        const audio = document.getElementById("global-bg-music");
        if (audio && !audio.paused) {
            container.classList.add("active");
        } else {
            container.classList.remove("active");
        }
    }, 500);
});

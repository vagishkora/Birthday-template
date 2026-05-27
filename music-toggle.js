const initMusicToggle = () => {
    // 1. Inject HTML for the Toggle
    if (document.getElementById('music-toggle-container')) return; // Prevent duplicate

    const toggleHTML = `
        <div id="music-toggle-container">
            <span class="music-label">Background Ambience 🎵</span>
            <div class="cinematic-switch" id="music-switch">
                <span class="switch-label off">OFF</span>
                
                <div class="switch-track">
                    <div class="switch-thumb">
                        <div class="thumb-gloss"></div>
                    </div>
                </div>

                <span class="switch-label on">ON</span>
            </div>
        </div>
        <audio id="global-bg-music" loop>
            <!-- Updated Song -->
            <source src="music/Forever and Ever and Ever (Movie Saiyaara) - Tanishk Bagchi.mp3" type="audio/mpeg">
        </audio>
    `;

    // Append to body
    const div = document.createElement('div');
    div.innerHTML = toggleHTML;
    document.body.appendChild(div);

    // 2. Logic
    const switchEl = document.getElementById('music-switch');
    const audioEl = document.getElementById('global-bg-music');
    let isPlaying = false;

    // Set Low Volume (Ambience)
    audioEl.volume = 0.3;

    // Check localStorage for state
    const savedTime = localStorage.getItem('bgMusicTime');
    const savedState = localStorage.getItem('bgMusicPlaying');

    if (savedTime) {
        audioEl.currentTime = parseFloat(savedTime);
    }

    // Try to auto-play only if previously ON
    if (savedState === 'true') {
        playMusic(true); // silent mode (no alert on fail)
    } else {
        updateUI(false);
    }

    // User Interaction
    switchEl.addEventListener('click', () => {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic(false); // interactive mode (alert on fail)
        }
    });

    // Functions
    function playMusic(isAuto) {
        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateUI(true);
                localStorage.setItem('bgMusicPlaying', 'true');
            }).catch(error => {
                console.warn("Auto-play prevented or file missing:", error);
                isPlaying = false;
                updateUI(false);

                // Only alert if user clicked specifically
                if (!isAuto) {
                    alert("Music couldn't play! 🎵\n\nMake sure you have a file named 'bg-music.mp3' in the 'music' folder.");
                }
            });
        }
    }

    function pauseMusic() {
        audioEl.pause();
        isPlaying = false;
        updateUI(false);
        localStorage.setItem('bgMusicPlaying', 'false');
    }

    function updateUI(active) {
        if (active) {
            switchEl.classList.add('active');
        } else {
            switchEl.classList.remove('active');
        }
    }

    // Persistence Loop
    setInterval(() => {
        if (isPlaying) {
            localStorage.setItem('bgMusicTime', audioEl.currentTime);
        }
    }, 1000);
};

// Robust Loading: Run immediately if ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicToggle);
} else {
    initMusicToggle();
}

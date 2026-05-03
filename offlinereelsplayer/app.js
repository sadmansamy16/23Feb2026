/**
 * Samy Offline Reels Player - Logic
 * Features: PWA Support, Vertical Swipe, Auto-next, Tap to Pause, Double-tap Skip
 */

// 1. REGISTER SERVICE WORKER FOR OFFLINE PWA USE
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    });
}

let swiper;
const videoWrapper = document.getElementById('video-wrapper');
const loadBtn = document.getElementById('load-folder');
const overlay = document.getElementById('setup-overlay');

// 2. INITIALIZE SWIPER (The TikTok Scroll)
function initSwiper() {
    swiper = new Swiper('.swiper', {
        direction: 'vertical',
        mousewheel: true,
        speed: 400,
        on: {
            slideChange: function () {
                // Stop all videos to save memory/battery
                document.querySelectorAll('video').forEach(v => {
                    v.pause();
                    v.currentTime = 0;
                });
                // Play only the active video
                const activeSlide = this.slides[this.activeIndex];
                const activeVideo = activeSlide.querySelector('video');
                if (activeVideo) activeVideo.play();
            }
        }
    });
}

// 3. FOLDER PICKER LOGIC (Android & PC Compatible)
loadBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true; // Essential for folder selection
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Hide overlay and show loader/player
        overlay.style.display = 'none';

        // Sort files alphabetically so they play in order
        files.sort((a, b) => a.name.localeCompare(b.name));

        files.forEach(file => {
            // Only process video files
            if (file.type.startsWith('video/')) {
                createVideoSlide(file);
            }
        });

        initSwiper();

        // Start playing the first video automatically
        const firstVideo = document.querySelector('video');
        if (firstVideo) firstVideo.play();
    };
    input.click();
};

// 4. CREATE THE VIDEO SLIDE ELEMENT
function createVideoSlide(file) {
    const url = URL.createObjectURL(file);
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    const video = document.createElement('video');
    video.src = url;
    video.preload = "metadata";
    video.playsInline = true; // Critical for mobile
    video.setAttribute('webkit-playsinline', 'true');

    // FEATURE: Auto-scroll to next when video ends
    video.onended = () => {
        if (swiper && !swiper.isEnd) {
            swiper.slideNext();
        }
    };

    // FEATURE: Single Tap (Play/Pause) & Double Tap (Skip 10s)
    let lastTap = 0;
    video.onclick = (event) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // DOUBLE TAP logic
            const rect = video.getBoundingClientRect();
            const x = event.clientX - rect.left;
            
            if (x < rect.width / 2) {
                video.currentTime -= 10; // Left side skip back
            } else {
                video.currentTime += 10; // Right side skip forward
            }
        } else {
            // SINGLE TAP logic (with a small delay to distinguish from double tap)
            setTimeout(() => {
                if (Date.now() - lastTap >= DOUBLE_TAP_DELAY) {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            }, DOUBLE_TAP_DELAY);
        }
        lastTap = now;
    };

    slide.appendChild(video);
    videoWrapper.appendChild(slide);
}

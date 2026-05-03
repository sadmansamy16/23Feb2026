let swiper;
const videoWrapper = document.getElementById('video-wrapper');
const loadBtn = document.getElementById('load-folder');
const overlay = document.getElementById('setup-overlay');

// 1. Initialize Swiper
function initSwiper() {
    swiper = new Swiper('.swiper', {
        direction: 'vertical',
        mousewheel: true,
        on: {
            slideChange: function () {
                stopAllVideos();
                playCurrentVideo();
            }
        }
    });
}

// 2. Load Videos from Folder
loadBtn.onclick = async () => {
    try {
        // Asks user for a directory
        const dirHandle = await window.showDirectoryPicker();
        overlay.style.display = 'none';
        
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && /\.(mp4|webm|mov)$/i.test(entry.name)) {
                const file = await entry.getFile();
                addVideoToFeed(file);
            }
        }
        initSwiper();
        playCurrentVideo();
    } catch (err) {
        console.error("Folder access denied or unsupported browser.", err);
    }
};

function addVideoToFeed(file) {
    const url = URL.createObjectURL(file);
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    const video = document.createElement('video');
    video.src = url;
    video.preload = "metadata";
    video.playsInline = true;

    // FEATURE: Auto-scroll to next when video ends
    video.onended = () => {
        if (!swiper.isEnd) swiper.slideNext();
    };

    // FEATURE: Single Tap (Play/Pause) & Double Tap (Skip 10s)
    let lastTap = 0;
    video.onclick = (e) => {
        const now = Date.now();
        const rect = video.getBoundingClientRect();
        const x = e.clientX - rect.left; // position within the element

        if (now - lastTap < 300) {
            // DOUBLE TAP detected
            if (x < rect.width / 2) {
                video.currentTime -= 10; // Left side skip back
            } else {
                video.currentTime += 10; // Right side skip forward
            }
        } else {
            // SINGLE TAP logic
            setTimeout(() => {
                if (Date.now() - lastTap >= 300) {
                    video.paused ? video.play() : video.pause();
                }
            }, 300);
        }
        lastTap = now;
    };

    slide.appendChild(video);
    videoWrapper.appendChild(slide);
}

function playCurrentVideo() {
    const activeVideo = document.querySelector('.swiper-slide-active video');
    if (activeVideo) activeVideo.play();
}

function stopAllVideos() {
    document.querySelectorAll('video').forEach(v => {
        v.pause();
        v.currentTime = 0;
    });
}

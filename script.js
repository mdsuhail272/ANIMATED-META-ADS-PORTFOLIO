// DOM Elements
const canvas = document.getElementById('animation-canvas');
const context = canvas.getContext('2d');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');
const navItems = document.querySelectorAll('.nav-item');

// --- MOBILE NAVIGATION TOGGLE ---
if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        }
    });

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    });
}

// --- SCROLL ANIMATION CONFIGURATION ---
const frameCount = 192;
const currentFrame = index => `frames/frame_${index.toString().padStart(4, '0')}.jpg`;

// Preload images to memory
const images = [];
let hasDrawnFirstFrame = false;

for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        if (i === 0 && !hasDrawnFirstFrame) {
            drawImageCenter(img);
            hasDrawnFirstFrame = true;
        }
    };
    images.push(img);
}

let currentDrawnIndex = 0;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// Set canvas dimensions
const setCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;
};
setCanvasSize();

// Draw image covering entire canvas (preserving aspect ratio)
function drawImageCenter(img) {
    if (!img || img.width === 0 || img.height === 0) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let width, height;

    if (canvasRatio > imgRatio) {
        width = canvas.width;
        height = canvas.width / imgRatio;
    } else {
        height = canvas.height;
        width = canvas.height * imgRatio;
    }

    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, width, height);
}

// Initial draw attempt if cached
if (images[0].complete && images[0].naturalWidth > 0) {
    drawImageCenter(images[0]);
    hasDrawnFirstFrame = true;
}

// Scroll Update with requestAnimationFrame
let isTicking = false;

const updateFrame = () => {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
    );
    const maxScrollTop = Math.max(1, scrollHeight - window.innerHeight);
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScrollTop));

    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    if (frameIndex !== currentDrawnIndex || !hasDrawnFirstFrame) {
        currentDrawnIndex = frameIndex;
        const targetImg = images[frameIndex];
        if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
            drawImageCenter(targetImg);
            hasDrawnFirstFrame = true;
        } else {
            // If target frame not loaded yet, find nearest loaded frame
            for (let offset = 1; offset < 20; offset++) {
                const prev = images[frameIndex - offset];
                if (prev && prev.complete && prev.naturalWidth > 0) {
                    drawImageCenter(prev);
                    break;
                }
                const next = images[frameIndex + offset];
                if (next && next.complete && next.naturalWidth > 0) {
                    drawImageCenter(next);
                    break;
                }
            }
        }
    }
    isTicking = false;
};

const requestTick = () => {
    if (!isTicking) {
        requestAnimationFrame(updateFrame);
        isTicking = true;
    }
};

window.addEventListener('scroll', requestTick, { passive: true });

// Prevent mobile URL bar resize glitch:
// Only resize canvas if width changed or height changed significantly (orientation change)
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const heightDiff = Math.abs(newHeight - lastHeight);

    if (newWidth !== lastWidth || heightDiff > 120) {
        setCanvasSize();
        requestTick();
    }
});

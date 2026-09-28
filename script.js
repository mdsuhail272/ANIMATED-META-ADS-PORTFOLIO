const canvas = document.getElementById('animation-canvas');
const context = canvas.getContext('2d');

const frameCount = 192;

const currentFrame = index => (
  `frames/frame_${index.toString().padStart(4, '0')}.jpg`
);

// Preload images to an array so drawing is instant
const images = [];
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }
};

preloadImages();

// Set canvas dimensions
const setCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
setCanvasSize();

// Draw image covering the entire canvas (similar to object-fit: cover)
function drawImageCenter(img) {
    if (!img) return;
    
    // Fallback if image width/height isn't available yet
    if (img.width === 0 || img.height === 0) return;

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

// Initial draw when the first image loads
images[0].onload = () => {
    drawImageCenter(images[0]);
};

// Also try to draw immediately in case it's cached
drawImageCenter(images[0]);

const updateFrame = () => {
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(scrollFraction * frameCount))
    );
    
    requestAnimationFrame(() => drawImageCenter(images[frameIndex]));
};

window.addEventListener('scroll', () => {  
    updateFrame();
});

window.addEventListener('resize', () => {
    setCanvasSize();
    updateFrame();
});

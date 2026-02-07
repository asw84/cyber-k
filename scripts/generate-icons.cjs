const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
    const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
    if (fs.existsSync(svgPath)) {
        // We have the SVG, but for simplicity with the 'canvas' lib in a script, 
        // I'll keep the direct drawing logic but fix the output paths too.
    }

    const sizes = [192, 512];

    for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size, size);

        // Glow
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, '#1a002a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Circle
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = size * 0.04;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // Text (KR)
        ctx.font = `bold ${size * 0.5}px sans-serif`;
        ctx.fillStyle = '#ff00ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🇰🇷', size / 2, size / 2);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(__dirname, '..', 'public', `pwa-${size}x${size}.png`), buffer);
        console.log(`Generated pwa-${size}x${size}.png`);
    }
}

generateIcons().catch(console.error);

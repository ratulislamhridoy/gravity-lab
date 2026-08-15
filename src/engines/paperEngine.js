// Gravity AI Studio — Tactile & Paper Cutout Studio Engine
const PaperEngine = {
  renderNotePaper(options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;
    const color = options.color || '#fff3a0'; // Sticky note yellow
    const text = options.text || 'Gravity AI Note';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0d101b"/>
  
  <!-- Drop Shadow -->
  <rect x="${width*0.15 + 8}" y="${height*0.15 + 8}" width="${width*0.7}" height="${height*0.7}" fill="rgba(0,0,0,0.4)" rx="10"/>
  
  <!-- Note Body -->
  <rect x="${width*0.15}" y="${height*0.15}" width="${width*0.7}" height="${height*0.7}" fill="${color}" rx="6"/>
  
  <!-- Tape Top -->
  <rect x="${width*0.4}" y="${height*0.12}" width="${width*0.2}" height="30" fill="rgba(255,255,255,0.4)" transform="rotate(-3 ${width*0.5} ${height*0.13})"/>
  
  <!-- Lines -->
  <line x1="${width*0.2}" y1="${height*0.3}" x2="${width*0.8}" y2="${height*0.3}" stroke="#d6c66b" stroke-width="2"/>
  <line x1="${width*0.2}" y1="${height*0.4}" x2="${width*0.8}" y2="${height*0.4}" stroke="#d6c66b" stroke-width="2"/>
  <line x1="${width*0.2}" y1="${height*0.5}" x2="${width*0.8}" y2="${height*0.5}" stroke="#d6c66b" stroke-width="2"/>
  <line x1="${width*0.2}" y1="${height*0.6}" x2="${width*0.8}" y2="${height*0.6}" stroke="#d6c66b" stroke-width="2"/>

  <!-- Handwriting Text -->
  <text x="${width*0.22}" y="${height*0.38}" font-family="'Outfit', sans-serif" font-size="28" font-weight="600" fill="#2c2a1e">${text}</text>
</svg>`;
  },

  renderCutoutLetters(options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;
    const word = (options.word || 'GRAVITY').toUpperCase();
    const colors = ['#00f2fe', '#ff007f', '#ffb703', '#00f5d4', '#7f00ff', '#e100ff'];

    let tiles = [];
    const charWidth = Math.min(80, (width * 0.8) / word.length);
    const startX = (width - word.length * charWidth) / 2;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const x = startX + i * charWidth;
      const y = height * 0.4;
      const rot = (Math.random() - 0.5) * 16;
      const bg = colors[i % colors.length];

      tiles.push(`
        <g transform="rotate(${rot} ${x + charWidth/2} ${y + charWidth/2})">
          <rect x="${x + 4}" y="${y + 4}" width="${charWidth - 8}" height="${charWidth + 10}" fill="rgba(0,0,0,0.5)" rx="4"/>
          <rect x="${x}" y="${y}" width="${charWidth - 8}" height="${charWidth + 10}" fill="${bg}" rx="4" stroke="#ffffff" stroke-width="2"/>
          <text x="${x + charWidth/2 - 14}" y="${y + charWidth*0.75}" font-family="'Outfit', sans-serif" font-size="42" font-weight="800" fill="#000000">${char}</text>
        </g>
      `);
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#0a0c14"/>
  ${tiles.join('\n  ')}
</svg>`;
  }
};

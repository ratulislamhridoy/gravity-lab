// Gravity AI Studio — Light FX Generator Engine
const LightFxEngine = {
  render(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const type = options.type || 'flare'; // 'flare', 'spotlight', 'sparkles', 'lightning'
    const color = options.color || '#00f2fe';
    const intensity = options.intensity || 1.0;

    // Dark base
    ctx.fillStyle = '#07090f';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    if (type === 'flare') {
      const cx = w / 2;
      const cy = h / 2;
      
      // Core glow
      const g1 = ctx.createRadialGradient(cx, cy, 5, cx, cy, 180 * intensity);
      g1.addColorStop(0, '#ffffff');
      g1.addColorStop(0.2, color);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Starburst rays
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * intensity;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * w * 0.4, cy + Math.sin(angle) * h * 0.4);
        ctx.stroke();
      }
    } else if (type === 'sparkles') {
      for (let i = 0; i < 60; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sr = (Math.random() * 8 + 2) * intensity;
        
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'spotlight') {
      const g = ctx.createRadialGradient(w * 0.5, 0, 10, w * 0.5, h * 0.8, h * 0.9);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      
      ctx.beginPath();
      ctx.moveTo(w * 0.4, 0);
      ctx.lineTo(w * 0.6, 0);
      ctx.lineTo(w * 0.9, h);
      ctx.lineTo(w * 0.1, h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
};

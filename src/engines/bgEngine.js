// Gravity AI Studio — Procedural Background Generator Engine
const BackgroundEngine = {
  render(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const style = options.style || 'mesh'; // 'mesh', 'nebulas', 'waves'
    const color1 = options.color1 || '#00f2fe';
    const color2 = options.color2 || '#7f00ff';
    const color3 = options.color3 || '#00f5d4';

    ctx.clearRect(0, 0, w, h);

    if (style === 'mesh') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0a0c14');
      grad.addColorStop(0.5, '#121624');
      grad.addColorStop(1, '#080a10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Blobs
      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 10, w * 0.2, h * 0.3, w * 0.5);
      g1.addColorStop(0, color1);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 10, w * 0.8, h * 0.7, w * 0.5);
      g2.addColorStop(0, color2);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      const g3 = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.4);
      g3.addColorStop(0, color3);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'source-over';
    } else if (style === 'waves') {
      ctx.fillStyle = '#0a0c14';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * (0.3 + i * 0.15));
        for (let x = 0; x <= w; x += 20) {
          const y = h * (0.3 + i * 0.15) + Math.sin(x * 0.01 + i) * 60;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? color1 : color2;
        ctx.globalAlpha = 0.3;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else if (style === 'nebulas') {
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, w, h);

      // Star field
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 200; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sr = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cosmic glow
      const g = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.6);
      g.addColorStop(0, color1);
      g.addColorStop(0.5, color2);
      g.addColorStop(1, 'transparent');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
};

// Gravity AI Studio — Cyberpunk Neon Tech Studio Engine
const NeonEngine = {
  render(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const color1 = options.color1 || '#00f2fe';
    const color2 = options.color2 || '#ff007f';

    // Dark cyberpunk BG
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, w, h);

    // Perspective Grid
    ctx.save();
    ctx.strokeStyle = color1;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.shadowColor = color1;
    ctx.shadowBlur = 10;

    const horizon = h * 0.4;
    const vanishingX = w / 2;

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // Perspective lines
    for (let x = -w; x <= w * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = horizon; y <= h; y += (y - horizon) * 0.2 + 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Neon Plexus Nodes & Particles
    ctx.fillStyle = color2;
    ctx.shadowColor = color2;
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.8;

    const nodes = [];
    for (let i = 0; i < 25; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * horizon,
        r: Math.random() * 4 + 2
      });
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Node connections
    ctx.strokeStyle = color2;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
};

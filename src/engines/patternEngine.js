// Gravity AI Studio — Pattern Studio Engine
const PatternEngine = {
  generatePattern(options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;
    const type = options.type || 'chevrons';
    const primaryColor = options.primaryColor || '#00f2fe';
    const secondaryColor = options.secondaryColor || '#7f00ff';
    const bgColor = options.bgColor || '#0a0c14';
    const scale = options.scale || 40;
    const strokeWidth = options.strokeWidth || 2;

    let elements = [];

    if (type === 'chevrons') {
      for (let y = -scale; y < height + scale; y += scale) {
        for (let x = -scale; x < width + scale; x += scale * 2) {
          const color = ((x + y) / scale) % 2 === 0 ? primaryColor : secondaryColor;
          elements.push(`<path d="M${x},${y + scale/2} L${x + scale},${y} L${x + scale * 2},${y + scale/2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`);
        }
      }
    } else if (type === 'rings') {
      for (let y = 0; y < height + scale; y += scale) {
        for (let x = 0; x < width + scale; x += scale) {
          const r = scale * 0.45;
          const color = ((x + y) / scale) % 2 === 0 ? primaryColor : secondaryColor;
          elements.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`);
        }
      }
    } else if (type === 'hexagons') {
      for (let y = 0; y < height + scale; y += scale * 0.866) {
        for (let x = 0; x < width + scale; x += scale * 1.5) {
          const cx = x + ((Math.floor(y / (scale * 0.866)) % 2) * scale * 0.75);
          const color = Math.random() > 0.5 ? primaryColor : secondaryColor;
          elements.push(`<polygon points="${cx},${y - scale*0.5} ${cx + scale*0.433},${y - scale*0.25} ${cx + scale*0.433},${y + scale*0.25} ${cx},${y + scale*0.5} ${cx - scale*0.433},${y + scale*0.25} ${cx - scale*0.433},${y - scale*0.25}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`);
        }
      }
    } else if (type === 'florals') {
      for (let y = scale; y < height; y += scale * 1.5) {
        for (let x = scale; x < width; x += scale * 1.5) {
          const r = scale * 0.35;
          elements.push(`
            <circle cx="${x - r}" cy="${y}" r="${r}" fill="none" stroke="${primaryColor}" stroke-width="${strokeWidth}"/>
            <circle cx="${x + r}" cy="${y}" r="${r}" fill="none" stroke="${primaryColor}" stroke-width="${strokeWidth}"/>
            <circle cx="${x}" cy="${y - r}" r="${r}" fill="none" stroke="${secondaryColor}" stroke-width="${strokeWidth}"/>
            <circle cx="${x}" cy="${y + r}" r="${r}" fill="none" stroke="${secondaryColor}" stroke-width="${strokeWidth}"/>
          `);
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  ${elements.join('\n  ')}
</svg>`;
  }
};

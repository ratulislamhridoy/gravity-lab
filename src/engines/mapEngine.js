// Gravity AI Studio — Geopolitical World Map & 3D Globe Studio Engine
const MapEngine = {
  renderMap(options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;
    const color = options.color || '#00f2fe';
    const bgColor = options.bgColor || '#0a0c14';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  
  <!-- Latitude & Longitude Grid -->
  <g stroke="rgba(255,255,255,0.08)" stroke-width="1">
    <line x1="0" y1="${height*0.25}" x2="${width}" y2="${height*0.25}"/>
    <line x1="0" y1="${height*0.5}" x2="${width}" y2="${height*0.5}"/>
    <line x1="0" y1="${height*0.75}" x2="${width}" y2="${height*0.75}"/>
    <line x1="${width*0.25}" y1="0" x2="${width*0.25}" y2="${height}"/>
    <line x1="${width*0.5}" y1="0" x2="${width*0.5}" y2="${height}"/>
    <line x1="${width*0.75}" y1="0" x2="${width*0.75}" y2="${height}"/>
  </g>

  <!-- Vector Continent Outlines -->
  <!-- North America -->
  <path d="M${width*0.15},${height*0.2} Q${width*0.25},${height*0.15} ${width*0.35},${height*0.25} T${width*0.25},${height*0.45} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>
  <!-- South America -->
  <path d="M${width*0.28},${height*0.5} Q${width*0.38},${height*0.55} ${width*0.33},${height*0.8} T${width*0.26},${height*0.58} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>
  <!-- Europe -->
  <path d="M${width*0.48},${height*0.2} Q${width*0.55},${height*0.18} ${width*0.58},${height*0.3} T${width*0.46},${height*0.32} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>
  <!-- Africa -->
  <path d="M${width*0.46},${height*0.38} Q${width*0.6},${height*0.42} ${width*0.54},${height*0.7} T${width*0.45},${height*0.45} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>
  <!-- Asia -->
  <path d="M${width*0.6},${height*0.18} Q${width*0.85},${height*0.15} ${width*0.82},${height*0.45} T${width*0.62},${height*0.35} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>
  <!-- Australia -->
  <path d="M${width*0.75},${height*0.6} Q${width*0.85},${height*0.62} ${width*0.83},${height*0.78} T${width*0.73},${height*0.72} Z" fill="rgba(0,242,254,0.2)" stroke="${color}" stroke-width="2"/>

  <!-- Flight / Data Arcs -->
  <path d="M${width*0.25},${height*0.3} Q${width*0.4},${height*0.08} ${width*0.52},${height*0.25}" fill="none" stroke="#ff007f" stroke-width="2" stroke-dasharray="6,4"/>
  <path d="M${width*0.52},${height*0.25} Q${width*0.68},${height*0.1} ${width*0.75},${height*0.3}" fill="none" stroke="#ffb703" stroke-width="2" stroke-dasharray="6,4"/>
</svg>`;
  }
};

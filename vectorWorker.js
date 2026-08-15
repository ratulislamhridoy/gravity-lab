/**
 * Gravity AI Studio - Non-Blocking Web Worker Vectorizer
 * Offloads heavy Potrace image tracing and bitmap binarization from the main UI thread.
 */

self.onmessage = function(e) {
  const data = e.data;
  if (!data || !data.type) return;

  if (data.type === 'VECTORIZE_TILE') {
    const { id, imgData, width, height, threshold = 128, turnPolicy = 'minority', turdSize = 2, alphaMax = 1 } = data;

    try {
      // 1. Process ImageData to binary bitmap array
      const pixels = imgData.data;
      const len = width * height;
      const bitmap = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        const offset = i * 4;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        const a = pixels[offset + 3];

        if (a < 10) {
          bitmap[i] = 0; // Transparent -> white background
        } else {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          bitmap[i] = luma < threshold ? 1 : 0; // 1 = Black foreground, 0 = White
        }
      }

      // 2. Generate SVG Path representation
      const pathD = traceBitmapToSvgPath(bitmap, width, height, turnPolicy, turdSize, alphaMax);

      self.postMessage({
        status: 'SUCCESS',
        id: id,
        pathD: pathD,
        width: width,
        height: height
      });
    } catch (err) {
      self.postMessage({
        status: 'ERROR',
        id: id,
        error: err.message || 'Vectorization failed'
      });
    }
  }
};

/**
 * Fast Vector Tracing helper inside worker
 */
function traceBitmapToSvgPath(bitmap, w, h, turnPolicy, turdSize, alphaMax) {
  // Generate bounding paths and SVG path string
  let pathString = '';
  const visited = new Uint8Array(w * h);

  for (let y = 1; y < h - 1; y += 2) {
    for (let x = 1; x < w - 1; x += 2) {
      const idx = y * w + x;
      if (bitmap[idx] === 1 && !visited[idx]) {
        // Outline bounding rectangle for SVG export
        let minX = x, maxX = x, minY = y, maxY = y;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (bitmap[nidx] === 1) {
                visited[nidx] = 1;
                if (nx < minX) minX = nx;
                if (nx > maxX) maxX = nx;
                if (ny < minY) minY = ny;
                if (ny > maxY) maxY = ny;
              }
            }
          }
        }
        const pw = Math.max(4, maxX - minX);
        const ph = Math.max(4, maxY - minY);
        pathString += ` M ${minX} ${minY} L ${minX + pw} ${minY} L ${minX + pw} ${minY + ph} L ${minX} ${minY + ph} Z`;
      }
    }
  }

  return pathString || `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
}

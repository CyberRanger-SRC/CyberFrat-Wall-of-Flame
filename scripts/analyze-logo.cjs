const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, '../public/cyberfrat-logo.png'));
let offset = 8;
const idatChunks = [];
let width = 0, height = 0;

while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(offset + 8);
    height = buf.readUInt32BE(offset + 12);
  } else if (type === 'IDAT') {
    idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const idat = Buffer.concat(idatChunks);
const raw = zlib.inflateSync(idat);

// Decode PNG scanlines
const stride = 1 + width * 4;
const rgba = Buffer.alloc(width * height * 4);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y++) {
  const lineStart = y * stride;
  const filterType = raw[lineStart];
  const prevLineRgba = (y > 0) ? (y - 1) * width * 4 : -1;
  const currLineRgba = y * width * 4;

  for (let x = 0; x < width; x++) {
    const rawPos = lineStart + 1 + x * 4;
    const outPos = currLineRgba + x * 4;

    for (let c = 0; c < 4; c++) {
      const xVal = raw[rawPos + c];
      const a = (x > 0) ? rgba[outPos - 4 + c] : 0;
      const b = (y > 0) ? rgba[prevLineRgba + x * 4 + c] : 0;
      const cDiag = (x > 0 && y > 0) ? rgba[prevLineRgba + (x - 1) * 4 + c] : 0;

      let val = 0;
      switch (filterType) {
        case 0: val = xVal; break;
        case 1: val = (xVal + a) & 0xff; break;
        case 2: val = (xVal + b) & 0xff; break;
        case 3: val = (xVal + Math.floor((a + b) / 2)) & 0xff; break;
        case 4: val = (xVal + paethPredictor(a, b, cDiag)) & 0xff; break;
        default: val = xVal;
      }
      rgba[outPos + c] = val;
    }
  }
}

console.log('Decoded PNG to RGBA successfully. Image:', width, 'x', height);

// Find bounds of non-transparent pixels
let minX = width, maxX = 0, minY = height, maxY = 0;
const isSolid = new Uint8Array(width * height);
const wingType = new Uint8Array(width * height); // 1 = red, 2 = blue

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];
    const a = rgba[idx + 3];

    if (a > 120) {
      isSolid[y * width + x] = 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      // Color classification: Red wing vs Blue wing
      if (r > 150 && b < 100) {
        wingType[y * width + x] = 1; // Red
      } else if (b > 120 && r < 80) {
        wingType[y * width + x] = 2; // Blue
      } else {
        // Mixed or boundary
        wingType[y * width + x] = (r > b) ? 1 : 2;
      }
    }
  }
}

console.log(`Solid bounds: X [${minX}, ${maxX}] (${maxX - minX + 1}), Y [${minY}, ${maxY}] (${maxY - minY + 1})`);

// Compute distance-to-edge (erosion / medial axis) to place diyas strictly well inside strokes
// Simple approximation: check disk of radius R around pixel
const interiorDist = new Int16Array(width * height);
const searchR = 28;

for (let y = minY; y <= maxY; y += 2) {
  for (let x = minX; x <= maxX; x += 2) {
    if (!isSolid[y * width + x]) continue;
    let minD = searchR;
    for (let dy = -searchR; dy <= searchR; dy += 4) {
      for (let dx = -searchR; dx <= searchR; dx += 4) {
        const ny = y + dy;
        const nx = x + dx;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height || !isSolid[ny * width + nx]) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < minD) minD = d;
        }
      }
    }
    interiorDist[y * width + x] = Math.round(minD);
  }
}

// Select a set of candidate points with good interior clearance (> 12 pixels inside edge)
// We want ~150 well-distributed positions across red and blue wings.
// Normalized coordinates: center (0,0), scale roughly [-4, 4] in Three.js space
const centerX = (minX + maxX) / 2;
const centerY = (minY + maxY) / 2;
const maxDim = Math.max(maxX - minX, maxY - minY);
const scaleFactor = 7.0 / maxDim; // Map to roughly [-3.5, 3.5] in 3D world units

const redCandidates = [];
const blueCandidates = [];

for (let y = minY; y <= maxY; y += 4) {
  for (let x = minX; x <= maxX; x += 4) {
    const dist = interiorDist[y * width + x];
    if (dist >= 14) {
      // 3D coordinates: x inverted/centered, y inverted (3D +Y is up, 2D +Y is down)
      const posX = (x - centerX) * scaleFactor;
      const posY = -(y - centerY) * scaleFactor;
      const item = {
        x: Number(posX.toFixed(3)),
        y: Number(posY.toFixed(3)),
        pixelX: x,
        pixelY: y,
        dist,
        wing: wingType[y * width + x] === 1 ? 'red' : 'blue'
      };
      if (item.wing === 'red') redCandidates.push(item);
      else blueCandidates.push(item);
    }
  }
}

console.log(`Found candidates: Red: ${redCandidates.length}, Blue: ${blueCandidates.length}`);

// Poisson-disk or farthest-point sampling to get evenly spaced points
function sampleEvenly(list, count, minDistance) {
  const chosen = [];
  // Sort candidates by highest interior clearance first
  list.sort((a, b) => b.dist - a.dist);

  for (const cand of list) {
    let tooClose = false;
    for (const c of chosen) {
      const d2 = (cand.x - c.x) ** 2 + (cand.y - c.y) ** 2;
      if (d2 < minDistance * minDistance) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      chosen.push(cand);
      if (chosen.length >= count) break;
    }
  }
  return chosen;
}

// Sample 60 red and 65 blue for up to 120+ distinct diya positions
const chosenRed = sampleEvenly(redCandidates, 60, 0.36);
const chosenBlue = sampleEvenly(blueCandidates, 65, 0.34);

// Interleave red and blue so as participants join, diyas appear naturally balanced across both wings
const allAnchors = [];
const maxLen = Math.max(chosenRed.length, chosenBlue.length);
for (let i = 0; i < maxLen; i++) {
  if (i < chosenRed.length) allAnchors.push({ ...chosenRed[i], id: allAnchors.length });
  if (i < chosenBlue.length) allAnchors.push({ ...chosenBlue[i], id: allAnchors.length });
}

console.log(`Generated total balanced diya anchors: ${allAnchors.length}`);

const output = {
  imageWidth: width,
  imageHeight: height,
  bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
  scaleFactor,
  totalAnchors: allAnchors.length,
  anchors: allAnchors
};

fs.writeFileSync(path.join(__dirname, '../src/data/logoPoints.json'), JSON.stringify(output, null, 2));
console.log('Saved to src/data/logoPoints.json successfully!');

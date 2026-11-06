const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Simple PNG encoder for RGBA
function encodePNG(width, height, rgbaBuffer) {
  // Add filter byte 0 to each scanline
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0; // Filter None
    rgbaBuffer.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const idatData = zlib.deflateSync(filtered, { level: 9 });

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC
    let crc = -1;
    for (let i = 4; i < 8 + len; i++) {
      let c = buf[i];
      for (let j = 0; j < 8; j++) {
        crc = ((crc ^ c) & 1) ? (-306674912 ^ (crc >>> 1)) : (crc >>> 1);
        c >>>= 1;
      }
    }
    buf.writeInt32BE(~crc, 8 + len);
    return buf;
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Read original logo and generate:
// 1. Normal map (beveled edges for metallic 3D sheen)
// 2. Gold emissive mask (interior glow for the dynamic lighting progression)
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

function paeth(a, b, c) {
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
        case 4: val = (xVal + paeth(a, b, cDiag)) & 0xff; break;
        default: val = xVal;
      }
      rgba[outPos + c] = val;
    }
  }
}

// Generate Alpha Heightmap: compute distance transform from edge for beveling
const alpha = new Float32Array(width * height);
for (let i = 0; i < width * height; i++) {
  alpha[i] = rgba[i * 4 + 3] / 255;
}

// Normal map buffer (tangent space: R=X, G=Y, B=Z)
const normalMap = Buffer.alloc(width * height * 4);
const emissiveMap = Buffer.alloc(width * height * 4);

const bevelRadius = 6;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const a = alpha[y * width + x];

    if (a < 0.05) {
      // Background transparent
      normalMap[idx] = 128;
      normalMap[idx + 1] = 128;
      normalMap[idx + 2] = 255;
      normalMap[idx + 3] = 0;

      emissiveMap[idx] = 0;
      emissiveMap[idx + 1] = 0;
      emissiveMap[idx + 2] = 0;
      emissiveMap[idx + 3] = 0;
      continue;
    }

    // Sobel gradient for normal map
    const xm = x > 0 ? alpha[y * width + (x - 1)] : 0;
    const xp = x < width - 1 ? alpha[y * width + (x + 1)] : 0;
    const ym = y > 0 ? alpha[(y - 1) * width + x] : 0;
    const yp = y < height - 1 ? alpha[(y + 1) * width + x] : 0;

    let dx = (xp - xm) * 2.5;
    let dy = (yp - ym) * 2.5; // in image space
    let dz = 1.0;

    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= len;
    dy /= len;
    dz /= len;

    // Normal mapped to [0, 255]
    normalMap[idx] = Math.round((dx * 0.5 + 0.5) * 255);
    normalMap[idx + 1] = Math.round((-dy * 0.5 + 0.5) * 255); // Invert Y for OpenGL tangent space
    normalMap[idx + 2] = Math.round((dz * 0.5 + 0.5) * 255);
    normalMap[idx + 3] = Math.round(a * 255);

    // Emissive mask: soft golden glow along the strokes
    emissiveMap[idx] = 255; // R (warm gold)
    emissiveMap[idx + 1] = 200; // G
    emissiveMap[idx + 2] = 80; // B
    emissiveMap[idx + 3] = Math.round(a * 255);
  }
}

fs.writeFileSync(path.join(__dirname, '../public/cyberfrat-normal.png'), encodePNG(width, height, normalMap));
fs.writeFileSync(path.join(__dirname, '../public/cyberfrat-emissive.png'), encodePNG(width, height, emissiveMap));
console.log('Successfully generated cyberfrat-normal.png and cyberfrat-emissive.png');


/**
 * Rasterises the landing logo (apps/landing/assets/logo.svg) into the mobile PNGs.
 * Geometry and colours are copied from that SVG. No extra dependency.
 */
import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps', 'mobile', 'assets', 'images');

const PRIMARY = [0x1f, 0x6f, 0x50, 255];
const WHITE = [255, 255, 255, 255];
const MINT = [0xe8, 0xf3, 0xee, 255];
const ACCENT = [0xb4, 0x53, 0x09, 255];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([length, name, data, crc]);
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const start = y * (width * 4 + 1);
    raw[start] = 0;
    pixels.copy(raw, start + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }
  const index = (y * size + x) * 4;
  const srcA = color[3] / 255;
  const dstA = pixels[index + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) {
    return;
  }
  for (let channel = 0; channel < 3; channel += 1) {
    pixels[index + channel] = Math.round(
      (color[channel] * srcA + pixels[index + channel] * dstA * (1 - srcA)) / outA,
    );
  }
  pixels[index + 3] = Math.round(outA * 255);
}

function fillRoundRect(pixels, size, color, radius) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const rx = Math.min(Math.max(px, radius), size - radius);
      const ry = Math.min(Math.max(py, radius), size - radius);
      const dx = px - rx;
      const dy = py - ry;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const x = x1 + t * dx;
  const y = y1 + t * dy;
  return Math.hypot(px - x, py - y);
}

function strokeSegments(pixels, size, scale, segments, width, color) {
  const pad = width * scale;
  for (const [x1, y1, x2, y2] of segments) {
    const minX = Math.max(0, Math.floor(Math.min(x1, x2) * scale - pad));
    const maxX = Math.min(size - 1, Math.ceil(Math.max(x1, x2) * scale + pad));
    const minY = Math.max(0, Math.floor(Math.min(y1, y2) * scale - pad));
    const maxY = Math.min(size - 1, Math.ceil(Math.max(y1, y2) * scale + pad));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const distance = distToSegment((x + 0.5) / scale, (y + 0.5) / scale, x1, y1, x2, y2);
        if (distance <= width / 2) {
          setPixel(pixels, size, x, y, color);
        }
      }
    }
  }
}

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function strokeDashedCurve(pixels, size, scale, color) {
  const curves = [
    [
      [26, 48],
      [26, 42],
      [38, 44],
      [38, 38],
    ],
    [
      [38, 38],
      [38, 32],
      [32, 33],
      [32, 33],
    ],
  ];
  const samples = [];
  for (const curve of curves) {
    for (let step = 0; step <= 24; step += 1) {
      samples.push(cubicPoint(curve[0], curve[1], curve[2], curve[3], step / 24));
    }
  }
  for (let index = 0; index < samples.length - 1; index += 6) {
    const [x1, y1] = samples[index];
    const [x2, y2] = samples[Math.min(index + 2, samples.length - 1)];
    strokeSegments(pixels, size, scale, [[x1, y1, x2, y2]], 3.5, color);
  }
}

function fillCircle(pixels, size, scale, cx, cy, radius, color) {
  const pad = (radius + 1) * scale;
  const minX = Math.max(0, Math.floor(cx * scale - pad));
  const maxX = Math.min(size - 1, Math.ceil(cx * scale + pad));
  const minY = Math.max(0, Math.floor(cy * scale - pad));
  const maxY = Math.min(size - 1, Math.ceil(cy * scale + pad));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot((x + 0.5) / scale - cx, (y + 0.5) / scale - cy);
      if (distance <= radius) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function drawMark(size, { plate, mono }) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 64;
  if (plate) {
    fillRoundRect(pixels, size, PRIMARY, 16 * scale);
  }
  const line = mono ? WHITE : WHITE;
  const route = mono ? WHITE : MINT;
  const pin = mono ? WHITE : ACCENT;
  const pinStroke = WHITE;
  strokeSegments(
    pixels,
    size,
    scale,
    [
      [14, 31, 32, 16],
      [32, 16, 50, 31],
      [19, 29, 19, 48],
      [19, 48, 45, 48],
      [45, 48, 45, 29],
    ],
    4.5,
    line,
  );
  strokeDashedCurve(pixels, size, scale, route);
  fillCircle(pixels, size, scale, 32, 33, 3 + 0.75, pinStroke);
  fillCircle(pixels, size, scale, 32, 33, 3, pin);
  return pixels;
}

function drawCentered(size, mono) {
  const pixels = Buffer.alloc(size * size * 4, 0);
  const inner = Math.round(size * 0.62);
  const mark = drawMark(inner, { plate: false, mono });
  const offset = Math.floor((size - inner) / 2);
  for (let y = 0; y < inner; y += 1) {
    for (let x = 0; x < inner; x += 1) {
      const source = (y * inner + x) * 4;
      setPixel(pixels, size, x + offset, y + offset, [
        mark[source],
        mark[source + 1],
        mark[source + 2],
        mark[source + 3],
      ]);
    }
  }
  return pixels;
}

mkdirSync(outDir, { recursive: true });

const files = {
  'icon.png': encodePng(1024, 1024, drawMark(1024, { plate: true, mono: false })),
  'splash-icon.png': encodePng(512, 512, drawCentered(512, false)),
  'favicon.png': encodePng(48, 48, drawMark(48, { plate: true, mono: false })),
  'android-icon-foreground.png': encodePng(1024, 1024, drawCentered(1024, false)),
  'android-icon-monochrome.png': encodePng(1024, 1024, drawCentered(1024, true)),
  'android-icon-background.png': encodePng(
    1024,
    1024,
    (() => {
      const pixels = Buffer.alloc(1024 * 1024 * 4);
      for (let i = 0; i < 1024 * 1024; i += 1) {
        pixels.set(PRIMARY, i * 4);
      }
      return pixels;
    })(),
  ),
};

for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(outDir, name), data);
}

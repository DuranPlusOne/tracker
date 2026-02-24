const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function createPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk("IHDR", ihdrData);

  const rawData = [];
  const bgR = 99,
    bgG = 102,
    bgB = 241;
  const fgR = 255,
    fgG = 255,
    fgB = 255;

  for (let y = 0; y < size; y++) {
    rawData.push(0);
    for (let x = 0; x < size; x++) {
      const cx = size / 2,
        cy = size / 2;
      const letterW = size * 0.5,
        letterH = size * 0.5;
      const barH = size * 0.1;
      const stemW = size * 0.12;

      const inTopBar =
        y >= cy - letterH / 2 &&
        y <= cy - letterH / 2 + barH &&
        x >= cx - letterW / 2 &&
        x <= cx + letterW / 2;
      const inStem =
        y >= cy - letterH / 2 + barH &&
        y <= cy + letterH / 2 &&
        x >= cx - stemW / 2 &&
        x <= cx + stemW / 2;

      if (inTopBar || inStem) {
        rawData.push(fgR, fgG, fgB);
      } else {
        rawData.push(bgR, bgG, bgB);
      }
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return crc ^ 0xffffffff;
}

const publicDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "icon-192.png"), createPNG(192));
fs.writeFileSync(path.join(publicDir, "icon-512.png"), createPNG(512));
console.log("Created icon-192.png and icon-512.png in public/");

/**
 * PNG rendering for fractal avatars
 * Uses a minimal PNG encoder - no external dependencies
 */

import { ColorPalette, getColorForIteration } from './color.js';
import { FractalParams } from './fractal.js';

export interface PNGOptions {
  /** Output size in pixels (default: 128) */
  size?: number;
  /** Whether to apply a circular mask (default: false) */
  circular?: boolean;
}

/**
 * Generate PNG bytes from iteration grid
 */
export function gridToPNG(
  grid: number[][],
  params: FractalParams,
  palette: ColorPalette,
  options: PNGOptions = {}
): Uint8Array {
  const { size = 128, circular = false } = options;
  const gridSize = grid.length;
  
  // Create RGBA pixel data, scaling grid to output size
  const pixels = new Uint8Array(size * size * 4);
  const center = size / 2;
  const radius = size / 2;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Check circular mask
      if (circular) {
        const dx = x - center + 0.5;
        const dy = y - center + 0.5;
        if (dx * dx + dy * dy > radius * radius) {
          // Transparent pixel outside circle
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 0;
          continue;
        }
      }
      
      // Map output coordinates to grid coordinates
      const gx = Math.floor((x / size) * gridSize);
      const gy = Math.floor((y / size) * gridSize);
      const iteration = grid[gy][gx];
      
      const color = getColorForIteration(
        iteration,
        params.maxIterations,
        palette,
        params.colorOffset
      );
      
      pixels[idx] = color.r;
      pixels[idx + 1] = color.g;
      pixels[idx + 2] = color.b;
      pixels[idx + 3] = 255; // Fully opaque
    }
  }
  
  return encodePNG(pixels, size, size);
}

/**
 * Generate a PNG data URL from iteration grid
 */
export function gridToPNGDataURL(
  grid: number[][],
  params: FractalParams,
  palette: ColorPalette,
  options: PNGOptions = {}
): string {
  const pngBytes = gridToPNG(grid, params, palette, options);
  const base64 = bytesToBase64(pngBytes);
  return `data:image/png;base64,${base64}`;
}

/**
 * Minimal PNG encoder
 * Encodes RGBA pixel data to PNG format
 */
function encodePNG(pixels: Uint8Array, width: number, height: number): Uint8Array {
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = createIHDRChunk(width, height);
  
  // IDAT chunk (compressed image data)
  const idat = createIDATChunk(pixels, width, height);
  
  // IEND chunk
  const iend = createIENDChunk();
  
  // Combine all parts
  const totalLength = signature.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  
  let offset = 0;
  png.set(signature, offset); offset += signature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);
  
  return png;
}

/**
 * Create IHDR chunk (image header)
 */
function createIHDRChunk(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  
  view.setUint32(0, width, false);  // Width
  view.setUint32(4, height, false); // Height
  data[8] = 8;  // Bit depth
  data[9] = 6;  // Color type (RGBA)
  data[10] = 0; // Compression method
  data[11] = 0; // Filter method
  data[12] = 0; // Interlace method
  
  return createChunk('IHDR', data);
}

/**
 * Create IDAT chunk (compressed image data)
 */
function createIDATChunk(pixels: Uint8Array, width: number, height: number): Uint8Array {
  // Add filter byte (0 = none) to each row
  const rowSize = width * 4 + 1;
  const rawData = new Uint8Array(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    
    const pixelRowStart = y * width * 4;
    for (let x = 0; x < width * 4; x++) {
      rawData[rowOffset + 1 + x] = pixels[pixelRowStart + x];
    }
  }
  
  // Compress with deflate (using a simple uncompressed deflate for simplicity)
  const compressed = deflateUncompressed(rawData);
  
  return createChunk('IDAT', compressed);
}

/**
 * Create IEND chunk (image end)
 */
function createIENDChunk(): Uint8Array {
  return createChunk('IEND', new Uint8Array(0));
}

/**
 * Create a PNG chunk with length, type, data, and CRC
 */
function createChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  
  // Length (4 bytes)
  view.setUint32(0, data.length, false);
  
  // Type (4 bytes)
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  
  // Data
  chunk.set(data, 8);
  
  // CRC (4 bytes) - CRC32 of type + data
  const crcData = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) {
    crcData[i] = type.charCodeAt(i);
  }
  crcData.set(data, 4);
  const crc = crc32(crcData);
  view.setUint32(8 + data.length, crc, false);
  
  return chunk;
}

/**
 * Simple uncompressed deflate
 * Wraps data in zlib format without actual compression
 */
function deflateUncompressed(data: Uint8Array): Uint8Array {
  const maxBlockSize = 65535;
  const numBlocks = Math.ceil(data.length / maxBlockSize);
  
  // zlib header (2 bytes) + blocks + adler32 (4 bytes)
  let totalSize = 2 + 4;
  for (let i = 0; i < numBlocks; i++) {
    const blockSize = Math.min(maxBlockSize, data.length - i * maxBlockSize);
    totalSize += 5 + blockSize; // 5 byte block header + data
  }
  
  const result = new Uint8Array(totalSize);
  let offset = 0;
  
  // zlib header (CMF, FLG)
  result[offset++] = 0x78; // CMF: deflate, 32K window
  result[offset++] = 0x01; // FLG: no dict, fastest compression
  
  // Deflate blocks
  for (let i = 0; i < numBlocks; i++) {
    const isLast = i === numBlocks - 1;
    const blockStart = i * maxBlockSize;
    const blockSize = Math.min(maxBlockSize, data.length - blockStart);
    
    // Block header
    result[offset++] = isLast ? 0x01 : 0x00; // BFINAL + BTYPE=00 (no compression)
    result[offset++] = blockSize & 0xff;
    result[offset++] = (blockSize >> 8) & 0xff;
    result[offset++] = (~blockSize) & 0xff;
    result[offset++] = ((~blockSize) >> 8) & 0xff;
    
    // Block data
    for (let j = 0; j < blockSize; j++) {
      result[offset++] = data[blockStart + j];
    }
  }
  
  // Adler-32 checksum
  const adler = adler32(data);
  result[offset++] = (adler >> 24) & 0xff;
  result[offset++] = (adler >> 16) & 0xff;
  result[offset++] = (adler >> 8) & 0xff;
  result[offset++] = adler & 0xff;
  
  return result;
}

/**
 * CRC32 calculation for PNG chunks
 */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Adler-32 checksum for zlib
 */
function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  
  return ((b << 16) | a) >>> 0;
}

/**
 * Convert Uint8Array to base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;
    
    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[b3 & 63] : '=';
  }
  
  return result;
}

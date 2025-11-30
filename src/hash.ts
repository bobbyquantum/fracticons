/**
 * Pure JavaScript implementation of SHA-256 hash function
 * Used to generate deterministic seeds for fractal avatar generation
 */

// SHA-256 constants
const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

// Initial hash values
const H0: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function padMessage(message: Uint8Array): Uint8Array {
  const bitLength = message.length * 8;
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  
  padded.set(message);
  padded[message.length] = 0x80;
  
  // Append length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength, false);
  
  return padded;
}

function processBlock(block: Uint8Array, h: number[]): void {
  const w = new Array<number>(64);
  const view = new DataView(block.buffer, block.byteOffset);
  
  // Prepare message schedule
  for (let i = 0; i < 16; i++) {
    w[i] = view.getUint32(i * 4, false);
  }
  
  for (let i = 16; i < 64; i++) {
    const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
  }
  
  // Initialize working variables
  let a = h[0];
  let b = h[1];
  let c = h[2];
  let d = h[3];
  let e = h[4];
  let f = h[5];
  let g = h[6];
  let hh = h[7];
  
  // Main loop
  for (let i = 0; i < 64; i++) {
    const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (hh + S1 + ch + K[i] + w[i]) | 0;
    const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (S0 + maj) | 0;
    
    hh = g;
    g = f;
    f = e;
    e = (d + temp1) | 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) | 0;
  }
  
  // Add compressed chunk to current hash value
  h[0] = (h[0] + a) | 0;
  h[1] = (h[1] + b) | 0;
  h[2] = (h[2] + c) | 0;
  h[3] = (h[3] + d) | 0;
  h[4] = (h[4] + e) | 0;
  h[5] = (h[5] + f) | 0;
  h[6] = (h[6] + g) | 0;
  h[7] = (h[7] + hh) | 0;
}

/**
 * Compute SHA-256 hash of a string
 * @param message - The input string to hash
 * @returns The hash as a hexadecimal string
 */
export function sha256(message: string): string {
  const bytes = stringToBytes(message);
  const padded = padMessage(bytes);
  const h = [...H0];
  
  // Process each 64-byte block
  for (let i = 0; i < padded.length; i += 64) {
    processBlock(padded.subarray(i, i + 64), h);
  }
  
  // Convert to hex string - use unsigned right shift to ensure positive values
  return h.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

/**
 * Convert a hash string to an array of numbers for seeding
 * @param hash - A hexadecimal hash string
 * @returns Array of 32-bit unsigned integers
 */
export function hashToNumbers(hash: string): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < hash.length; i += 8) {
    const chunk = hash.substring(i, i + 8);
    numbers.push(parseInt(chunk, 16) >>> 0);
  }
  return numbers;
}

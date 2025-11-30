/**
 * Fracticons - Deterministic fractal avatar generator
 * 
 * Generate unique, beautiful fractal-based avatars from a hash.
 * Like Gravatar/Identicon, but with fractals.
 */

import { hashToNumbers, sha256 } from './hash.js';
import { SeededRandom } from './random.js';
import { 
  generateFractalParams, 
  generateFractalGrid, 
  FractalParams,
  FractalType,
  FractalGenerationOptions
} from './fractal.js';
import { generatePalette, ColorPalette, PaletteStyle } from './color.js';
import { gridToPNG, gridToPNGDataURL, PNGOptions } from './png.js';

/**
 * Convert a Uint8Array hash to a hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert raw hash bytes to seed numbers
 */
function hashBytesToSeeds(bytes: Uint8Array): number[] {
  const seeds: number[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  
  // Extract 32-bit integers from the hash bytes
  for (let i = 0; i + 4 <= bytes.length; i += 4) {
    seeds.push(view.getUint32(i, false)); // big-endian
  }
  
  return seeds;
}

/**
 * Options for generating a fracticon
 */
export interface FracticonOptions {
  /** Size of the output image in pixels (default: 128) */
  size?: number;
  /** Resolution of the fractal grid (default: 64) */
  resolution?: number;
  /** Whether to apply a circular mask (default: false) */
  circular?: boolean;
  /** Fractal type: 'julia', 'mandelbrot', 'burning-ship', or 'tricorn' (default: 'julia') */
  fractalType?: FractalType;
  /** Use a preset Julia constant by name (e.g., 'galaxy', 'lightning', 'seahorse') */
  preset?: string;
  /** Custom c value for the fractal - overrides random generation */
  c?: { real: number; imag: number };
  /** Color palette style (default: 'random') */
  paletteStyle?: PaletteStyle;
}

/**
 * Result of fractal generation including metadata
 */
export interface FracticonResult {
  /** The PNG image as bytes */
  png: Uint8Array;
  /** The hash that was used (as hex string) */
  hash: string;
  /** The fractal parameters used */
  params: FractalParams;
  /** The color palette used */
  palette: ColorPalette;
}

// ============================================================================
// String-based API (with automatic SHA-256 hashing)
// ============================================================================

/**
 * Generate a deterministic fractal avatar PNG from any input string.
 * The input is always hashed with SHA-256 to produce the seed.
 * 
 * @param input - Any string (email, username, ID, etc.)
 * @param options - Generation options
 * @returns PNG image as Uint8Array
 * 
 * @example
 * ```typescript
 * import { generateFracticon } from 'fracticons';
 * 
 * const avatar = generateFracticon('user@example.com');
 * // Node.js: fs.writeFileSync('avatar.png', avatar);
 * ```
 */
export function generateFracticon(
  input: string,
  options: FracticonOptions = {}
): Uint8Array {
  const hash = sha256(input);
  return generateFracticonFromHex(hash, options);
}

/**
 * Generate a fractal avatar with full metadata from any input string.
 * The input is always hashed with SHA-256 to produce the seed.
 * 
 * @param input - Any string (email, username, ID, etc.)
 * @param options - Generation options
 * @returns Object containing PNG and generation metadata
 */
export function generateFracticonWithMetadata(
  input: string,
  options: FracticonOptions = {}
): FracticonResult {
  const hash = sha256(input);
  return generateFracticonFromHexWithMetadata(hash, options);
}

/**
 * Generate a data URL for the fractal avatar from any input string.
 * The input is always hashed with SHA-256 to produce the seed.
 * 
 * @param input - Any string (email, username, ID, etc.)
 * @param options - Generation options
 * @returns Data URL string that can be used in img src
 * 
 * @example
 * ```typescript
 * import { generateFracticonDataURL } from 'fracticons';
 * 
 * const avatar = generateFracticonDataURL('user@example.com');
 * document.getElementById('avatar').src = avatar;
 * ```
 */
export function generateFracticonDataURL(
  input: string,
  options: FracticonOptions = {}
): string {
  const hash = sha256(input);
  return generateFracticonDataURLFromHex(hash, options);
}

// ============================================================================
// Hex string hash API (for pre-computed hashes)
// ============================================================================

/**
 * Generate a fracticon from a pre-computed hex hash string.
 * Use this when you already have a hash and want to skip the hashing step.
 * 
 * @param hash - A hexadecimal hash string (e.g., SHA-256 output)
 * @param options - Generation options
 * @returns PNG image as Uint8Array
 * 
 * @example
 * ```typescript
 * import { generateFracticonFromHex, sha256 } from 'fracticons';
 * 
 * // Pre-compute hash once, reuse many times
 * const hash = sha256('user@example.com');
 * const avatar1 = generateFracticonFromHex(hash, { size: 64 });
 * const avatar2 = generateFracticonFromHex(hash, { size: 256 });
 * ```
 */
export function generateFracticonFromHex(
  hash: string,
  options: FracticonOptions = {}
): Uint8Array {
  const result = generateFracticonFromHexWithMetadata(hash, options);
  return result.png;
}

/**
 * Generate a fracticon with metadata from a pre-computed hex hash string.
 * 
 * @param hash - A hexadecimal hash string
 * @param options - Generation options
 * @returns Object containing PNG and generation metadata
 */
export function generateFracticonFromHexWithMetadata(
  hash: string,
  options: FracticonOptions = {}
): FracticonResult {
  const {
    size = 128,
    resolution = 64,
    circular = false,
    fractalType,
    preset,
    c,
    paletteStyle = 'random'
  } = options;

  // Convert hash to seed numbers
  const seeds = hashToNumbers(hash.toLowerCase());
  const rng = new SeededRandom(seeds);

  // Generate fractal parameters and palette
  const fractalOptions: FractalGenerationOptions = { fractalType, preset, c };
  const params = generateFractalParams(rng, fractalOptions);
  const palette = generatePalette(rng, paletteStyle);

  // Generate the fractal grid
  const grid = generateFractalGrid(resolution, params);

  // Render to PNG
  const pngOptions: PNGOptions = { size, circular };
  const png = gridToPNG(grid, params, palette, pngOptions);

  return {
    png,
    hash: hash.toLowerCase(),
    params,
    palette
  };
}

/**
 * Generate a data URL from a pre-computed hex hash string.
 * 
 * @param hash - A hexadecimal hash string
 * @param options - Generation options
 * @returns Data URL string
 */
export function generateFracticonDataURLFromHex(
  hash: string,
  options: FracticonOptions = {}
): string {
  const {
    size = 128,
    resolution = 64,
    circular = false,
    fractalType,
    preset,
    c,
    paletteStyle = 'random'
  } = options;

  // Convert hash to seed numbers
  const seeds = hashToNumbers(hash.toLowerCase());
  const rng = new SeededRandom(seeds);

  // Generate fractal parameters and palette
  const fractalOptions: FractalGenerationOptions = { fractalType, preset, c };
  const params = generateFractalParams(rng, fractalOptions);
  const palette = generatePalette(rng, paletteStyle);

  // Generate the fractal grid
  const grid = generateFractalGrid(resolution, params);

  // Render to PNG data URL
  return gridToPNGDataURL(grid, params, palette, { size, circular });
}

// ============================================================================
// Binary hash API (for raw bytes - most efficient)
// ============================================================================

/**
 * Generate a fracticon from raw hash bytes.
 * This is the most efficient API when you have hash bytes directly
 * (e.g., from Web Crypto API or Node.js crypto).
 * 
 * @param hashBytes - Raw hash bytes (Uint8Array, at least 16 bytes recommended)
 * @param options - Generation options
 * @returns PNG image as Uint8Array
 * 
 * @example
 * ```typescript
 * import { generateFracticonFromBytes } from 'fracticons';
 * 
 * // Using Web Crypto API
 * const data = new TextEncoder().encode('user@example.com');
 * const hashBuffer = await crypto.subtle.digest('SHA-256', data);
 * const avatar = generateFracticonFromBytes(new Uint8Array(hashBuffer));
 * ```
 */
export function generateFracticonFromBytes(
  hashBytes: Uint8Array,
  options: FracticonOptions = {}
): Uint8Array {
  const result = generateFracticonFromBytesWithMetadata(hashBytes, options);
  return result.png;
}

/**
 * Generate a fracticon with metadata from raw hash bytes.
 * 
 * @param hashBytes - Raw hash bytes (Uint8Array)
 * @param options - Generation options
 * @returns Object containing PNG and generation metadata
 */
export function generateFracticonFromBytesWithMetadata(
  hashBytes: Uint8Array,
  options: FracticonOptions = {}
): FracticonResult {
  const {
    size = 128,
    resolution = 64,
    circular = false,
    fractalType,
    preset,
    c,
    paletteStyle = 'random'
  } = options;

  // Convert bytes directly to seeds (no string conversion)
  const seeds = hashBytesToSeeds(hashBytes);
  const rng = new SeededRandom(seeds);

  // Generate fractal parameters and palette
  const fractalOptions: FractalGenerationOptions = { fractalType, preset, c };
  const params = generateFractalParams(rng, fractalOptions);
  const palette = generatePalette(rng, paletteStyle);

  // Generate the fractal grid
  const grid = generateFractalGrid(resolution, params);

  // Render to PNG
  const pngOptions: PNGOptions = { size, circular };
  const png = gridToPNG(grid, params, palette, pngOptions);

  return {
    png,
    hash: bytesToHex(hashBytes),
    params,
    palette
  };
}

/**
 * Generate a data URL from raw hash bytes.
 * 
 * @param hashBytes - Raw hash bytes (Uint8Array)
 * @param options - Generation options
 * @returns Data URL string
 */
export function generateFracticonDataURLFromBytes(
  hashBytes: Uint8Array,
  options: FracticonOptions = {}
): string {
  const {
    size = 128,
    resolution = 64,
    circular = false,
    fractalType,
    preset,
    c,
    paletteStyle = 'random'
  } = options;

  // Convert bytes directly to seeds (no string conversion)
  const seeds = hashBytesToSeeds(hashBytes);
  const rng = new SeededRandom(seeds);

  // Generate fractal parameters and palette
  const fractalOptions: FractalGenerationOptions = { fractalType, preset, c };
  const params = generateFractalParams(rng, fractalOptions);
  const palette = generatePalette(rng, paletteStyle);

  // Generate the fractal grid
  const grid = generateFractalGrid(resolution, params);

  // Render to PNG data URL
  return gridToPNGDataURL(grid, params, palette, { size, circular });
}

// Re-export types and utilities for advanced usage
export { hashToNumbers, sha256 } from './hash.js';
export { SeededRandom } from './random.js';
export { 
  generateFractalParams,
  generateFractalGrid,
  generateJuliaParams, 
  generateJuliaGrid, 
  juliaIteration,
  mandelbrotIteration,
  burningShipIteration,
  tricornIteration,
  generateMandelbrotGrid,
  calculateGridEntropy,
  JULIA_PRESETS,
  FractalParams,
  FractalType,
  FractalGenerationOptions,
  EntropyResult,
  Point 
} from './fractal.js';
export { 
  generatePalette, 
  hslToRgb, 
  rgbToHex, 
  getColorForIteration,
  ColorPalette, 
  PaletteStyle,
  RGB, 
  HSL 
} from './color.js';
export { 
  gridToPNG,
  gridToPNGDataURL,
  PNGOptions 
} from './png.js';

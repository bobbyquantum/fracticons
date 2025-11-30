/**
 * Fracticons - Deterministic fractal avatar generator
 * 
 * Generate unique, beautiful fractal-based avatars from a hash.
 * Like Gravatar/Identicon, but with fractals.
 */

import { hashToNumbers } from './hash.js';
import { SeededRandom } from './random.js';
import { generateJuliaParams, generateJuliaGrid, FractalParams } from './fractal.js';
import { generatePalette, ColorPalette } from './color.js';
import { gridToSVG, generateStylizedSVG, wrapInCircleMask, SVGOptions } from './svg.js';

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
  /** Style of the avatar: 'detailed' or 'stylized' (default: 'detailed') */
  style?: 'detailed' | 'stylized';
}

/**
 * Result of fractal generation including metadata
 */
export interface FracticonResult {
  /** The SVG string */
  svg: string;
  /** The hash that was used */
  hash: string;
  /** The fractal parameters used */
  params: FractalParams;
  /** The color palette used */
  palette: ColorPalette;
}

/**
 * Generate a deterministic fractal avatar SVG from a hash
 * 
 * @param hash - A hexadecimal hash string (e.g., SHA-256 hash)
 * @param options - Generation options
 * @returns SVG string of the fractal avatar
 * 
 * @example
 * ```typescript
 * import { generateFracticon } from 'fracticons';
 * 
 * // Use any hash - the caller is responsible for hashing
 * const hash = 'a1b2c3d4e5f6...'; // your hash
 * const svg = generateFracticon(hash);
 * document.getElementById('avatar').innerHTML = svg;
 * ```
 */
export function generateFracticon(
  hash: string,
  options: FracticonOptions = {}
): string {
  const result = generateFracticonWithMetadata(hash, options);
  return result.svg;
}

/**
 * Generate a fractal avatar with full metadata
 * 
 * @param hash - A hexadecimal hash string (e.g., SHA-256 hash)
 * @param options - Generation options
 * @returns Object containing SVG and generation metadata
 */
export function generateFracticonWithMetadata(
  hash: string,
  options: FracticonOptions = {}
): FracticonResult {
  const {
    size = 128,
    resolution = 64,
    circular = false,
    style = 'detailed'
  } = options;

  // Convert hash to seed numbers
  const seeds = hashToNumbers(hash);
  const rng = new SeededRandom(seeds);

  // Generate fractal parameters and palette
  const params = generateJuliaParams(rng);
  const palette = generatePalette(rng);

  // Generate the fractal grid
  const grid = generateJuliaGrid(resolution, params);

  // Render to SVG
  const svgOptions: SVGOptions = { size };
  let svg: string;

  if (style === 'stylized') {
    svg = generateStylizedSVG(grid, params, palette, svgOptions);
  } else {
    svg = gridToSVG(grid, params, palette, svgOptions);
  }

  // Apply circular mask if requested
  if (circular) {
    svg = wrapInCircleMask(svg, size);
  }

  return {
    svg,
    hash,
    params,
    palette
  };
}

/**
 * Generate a data URL for the fractal avatar
 * 
 * @param hash - A hexadecimal hash string (e.g., SHA-256 hash)
 * @param options - Generation options
 * @returns Data URL string that can be used in img src
 * 
 * @example
 * ```typescript
 * import { generateFracticonDataURL } from 'fracticons';
 * 
 * const hash = 'a1b2c3d4e5f6...'; // your hash
 * const dataUrl = generateFracticonDataURL(hash);
 * document.getElementById('avatar').src = dataUrl;
 * ```
 */
export function generateFracticonDataURL(
  hash: string,
  options: FracticonOptions = {}
): string {
  const svg = generateFracticon(hash, options);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

// Re-export types and utilities for advanced usage
export { hashToNumbers } from './hash.js';
export { SeededRandom } from './random.js';
export { 
  generateJuliaParams, 
  generateJuliaGrid, 
  juliaIteration,
  mandelbrotIteration,
  generateMandelbrotGrid,
  FractalParams, 
  Point 
} from './fractal.js';
export { 
  generatePalette, 
  hslToRgb, 
  rgbToHex, 
  getColorForIteration,
  ColorPalette, 
  RGB, 
  HSL 
} from './color.js';
export { 
  gridToSVG, 
  generateStylizedSVG, 
  wrapInCircleMask,
  SVGOptions 
} from './svg.js';

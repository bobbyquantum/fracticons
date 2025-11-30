/**
 * Fractal generation algorithms for avatar creation
 */

import { SeededRandom } from './random.js';

export interface Point {
  x: number;
  y: number;
}

export interface FractalParams {
  /** Real part of the complex constant c */
  cx: number;
  /** Imaginary part of the complex constant c */
  cy: number;
  zoom: number;
  maxIterations: number;
  colorOffset: number;
  /** The fractal type used */
  fractalType: FractalType;
}

/** Available fractal types */
export type FractalType = 'julia' | 'mandelbrot' | 'burning-ship' | 'tricorn';

/** Well-known interesting Julia set constants */
export const JULIA_PRESETS: Record<string, { cx: number; cy: number; name: string }> = {
  'dendrite': { cx: 0, cy: 1, name: 'Dendrite' },
  'galaxy': { cx: -0.4, cy: 0.6, name: 'Galaxy Spiral' },
  'lightning': { cx: -0.70176, cy: -0.3842, name: 'Lightning' },
  'seahorse': { cx: -0.75, cy: 0.11, name: 'Seahorse Valley' },
  'snowflake': { cx: -0.1, cy: 0.651, name: 'Snowflake' },
  'spiral': { cx: -0.8, cy: 0.156, name: 'Spiral' },
  'starfish': { cx: -0.374004139, cy: 0.659792175, name: 'Starfish' },
  'sun': { cx: 0.285, cy: 0.01, name: 'Sun' },
  'rabbit': { cx: -0.123, cy: 0.745, name: 'Douady Rabbit' },
  'siegel': { cx: -0.391, cy: -0.587, name: 'Siegel Disk' },
};

export interface FractalGenerationOptions {
  /** Fractal type to use (default: 'julia') */
  fractalType?: FractalType;
  /** Use a preset Julia constant by name */
  preset?: string;
  /** Custom c value - overrides random generation */
  c?: { real: number; imag: number };
  /** Skip entropy-based quality filtering (default: false) */
  skipEntropyCheck?: boolean;
}

/** Result of entropy calculation */
export interface EntropyResult {
  /** Overall quality score 0-1 (higher = better) */
  score: number;
  /** Ratio of pixels in the set (black) */
  inSetRatio: number;
  /** Number of unique iteration values */
  uniqueValues: number;
}

/**
 * Calculate visual entropy/quality score for a fractal grid
 * Higher scores indicate more visually interesting fractals
 */
export function calculateGridEntropy(
  grid: number[][],
  maxIterations: number
): EntropyResult {
  let inSetCount = 0;
  const total = grid.length * grid[0].length;
  const iterationCounts = new Map<number, number>();

  for (const row of grid) {
    for (const val of row) {
      if (val === maxIterations) inSetCount++;
      iterationCounts.set(val, (iterationCounts.get(val) || 0) + 1);
    }
  }

  const inSetRatio = inSetCount / total;
  const uniqueValues = iterationCounts.size;

  // Good fractals have:
  // 1. Mix of in-set and escaped pixels (not too extreme either way)
  //    Ideal is around 30-50% in-set for interesting boundary detail
  // 2. Many different iteration values (visual variety/gradient)

  // Balance score: prefer 20-50% in-set, penalize extremes
  let balanceScore: number;
  if (inSetRatio < 0.1 || inSetRatio > 0.9) {
    // Too extreme - mostly all one thing
    balanceScore = 0.1;
  } else if (inSetRatio >= 0.2 && inSetRatio <= 0.6) {
    // Sweet spot
    balanceScore = 1.0;
  } else {
    // Acceptable but not ideal
    balanceScore = 0.5;
  }

  // Variety score: want many unique iteration values (indicates gradients)
  // At least 15-20 unique values for good visual variety
  const varietyScore = Math.min(uniqueValues / 15, 1);

  const score = (balanceScore * 0.6 + varietyScore * 0.4);

  return { score, inSetRatio, uniqueValues };
}

/**
 * Generate candidate fractal parameters (internal helper)
 * Uses a "nearby interesting" strategy - picks a known good preset
 * and adds small perturbation for variety while staying interesting
 */
function generateCandidateParams(
  rng: SeededRandom,
  fractalType: FractalType
): FractalParams {
  let cx: number;
  let cy: number;
  
  if (fractalType === 'julia') {
    // Pick a random preset as the base
    const presetKeys = Object.keys(JULIA_PRESETS);
    const basePreset = JULIA_PRESETS[presetKeys[rng.int(0, presetKeys.length - 1)]];
    
    // Add small perturbation (±0.08) to create variety while staying interesting
    // Julia sets are sensitive, so we keep perturbation small
    const perturbation = 0.08;
    cx = basePreset.cx + rng.range(-perturbation, perturbation);
    cy = basePreset.cy + rng.range(-perturbation, perturbation);
  } else {
    // For other fractal types, use center offset for variety
    cx = rng.range(-0.5, 0.5);
    cy = rng.range(-0.5, 0.5);
  }
  
  const zoom = rng.range(1.5, 3.0);
  const maxIterations = 50 + rng.int(0, 50);
  const colorOffset = rng.range(0, 1);

  return { cx, cy, zoom, maxIterations, colorOffset, fractalType };
}

/** Size used for quick entropy check */
const ENTROPY_CHECK_SIZE = 32;
/** Maximum allowed ratio of in-set (black) pixels */
const MAX_IN_SET_RATIO = 0.25;
/** Minimum required unique iteration values for visual variety */
const MIN_UNIQUE_VALUES = 8;
/** Maximum attempts to find good parameters */
const MAX_ENTROPY_ATTEMPTS = 10;

/**
 * Generate fractal parameters from random seed
 * Uses entropy-based filtering to avoid boring/empty fractals
 */
export function generateFractalParams(
  rng: SeededRandom,
  options: FractalGenerationOptions = {}
): FractalParams {
  const { fractalType = 'julia', preset, c, skipEntropyCheck = false } = options;
  
  let cx: number;
  let cy: number;
  
  if (c) {
    // Use custom c value - skip entropy check
    cx = c.real;
    cy = c.imag;
    const zoom = rng.range(1.5, 3.0);
    const maxIterations = 50 + rng.int(0, 50);
    const colorOffset = rng.range(0, 1);
    return { cx, cy, zoom, maxIterations, colorOffset, fractalType };
  }
  
  if (preset && JULIA_PRESETS[preset]) {
    // Use preset - these are known to be good
    cx = JULIA_PRESETS[preset].cx;
    cy = JULIA_PRESETS[preset].cy;
    const zoom = rng.range(1.5, 3.0);
    const maxIterations = 50 + rng.int(0, 50);
    const colorOffset = rng.range(0, 1);
    return { cx, cy, zoom, maxIterations, colorOffset, fractalType };
  }
  
  // Generate random parameters with entropy-based quality filtering
  if (skipEntropyCheck) {
    return generateCandidateParams(rng, fractalType);
  }

  // Try to find params with good visual variety
  for (let attempt = 0; attempt < MAX_ENTROPY_ATTEMPTS; attempt++) {
    const params = generateCandidateParams(rng, fractalType);
    
    // Quick low-res check for entropy
    const grid = generateFractalGrid(ENTROPY_CHECK_SIZE, params);
    const entropy = calculateGridEntropy(grid, params.maxIterations);

    // Accept if:
    // 1. Black area is 25% or less AND
    // 2. Has enough color variety (at least 8 unique values for gradients)
    if (entropy.inSetRatio <= MAX_IN_SET_RATIO && entropy.uniqueValues >= MIN_UNIQUE_VALUES) {
      return params;
    }
  }

  // Fallback: return last generated params if all attempts failed
  return generateCandidateParams(rng, fractalType);
}

/**
 * @deprecated Use generateFractalParams instead
 */
export function generateJuliaParams(rng: SeededRandom): FractalParams {
  return generateFractalParams(rng, { fractalType: 'julia' });
}

/**
 * Calculate the escape iteration for a point in a Julia set
 * @param px - X coordinate of the point
 * @param py - Y coordinate of the point  
 * @param cx - Real part of the Julia constant
 * @param cy - Imaginary part of the Julia constant
 * @param maxIterations - Maximum number of iterations
 * @returns The iteration count at which the point escaped, or maxIterations if it didn't
 */
export function juliaIteration(
  px: number,
  py: number,
  cx: number,
  cy: number,
  maxIterations: number
): number {
  let zx = px;
  let zy = py;

  for (let i = 0; i < maxIterations; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;

    if (zx2 + zy2 > 4) {
      return i;
    }

    // z = z^2 + c
    const newZx = zx2 - zy2 + cx;
    zy = 2 * zx * zy + cy;
    zx = newZx;
  }

  return maxIterations;
}

/**
 * Generate a 2D grid of iteration values for a fractal
 * Uses horizontal (left-right) reflection symmetry for a balanced look
 */
export function generateFractalGrid(
  size: number,
  params: FractalParams
): number[][] {
  const { cx, cy, zoom, maxIterations, fractalType = 'julia' } = params;
  const grid: number[][] = [];
  const halfWidth = Math.ceil(size / 2);

  for (let y = 0; y < size; y++) {
    const row: number[] = new Array(size);
    for (let x = 0; x < halfWidth; x++) {
      // Map pixel coordinates to complex plane
      const px = (x / size - 0.5) * zoom;
      const py = (y / size - 0.5) * zoom;

      let iterations: number;
      switch (fractalType) {
        case 'mandelbrot':
          iterations = mandelbrotIteration(px + cx, py + cy, maxIterations);
          break;
        case 'burning-ship':
          iterations = burningShipIteration(px + cx, py + cy, maxIterations);
          break;
        case 'tricorn':
          iterations = tricornIteration(px + cx, py + cy, maxIterations);
          break;
        case 'julia':
        default:
          iterations = juliaIteration(px, py, cx, cy, maxIterations);
          break;
      }
      
      // Set the left side
      row[x] = iterations;
      // Mirror to the right side (horizontal reflection)
      row[size - 1 - x] = iterations;
    }
    grid.push(row);
  }

  return grid;
}

/**
 * @deprecated Use generateFractalGrid instead
 */
export function generateJuliaGrid(
  size: number,
  params: FractalParams
): number[][] {
  return generateFractalGrid(size, { ...params, fractalType: 'julia' });
}

/**
 * Mandelbrot set iteration
 */
export function mandelbrotIteration(
  px: number,
  py: number,
  maxIterations: number
): number {
  let zx = 0;
  let zy = 0;

  for (let i = 0; i < maxIterations; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;

    if (zx2 + zy2 > 4) {
      return i;
    }

    const newZx = zx2 - zy2 + px;
    zy = 2 * zx * zy + py;
    zx = newZx;
  }

  return maxIterations;
}

/**
 * Burning Ship fractal iteration
 * Uses absolute values creating a "burning ship" appearance
 */
export function burningShipIteration(
  px: number,
  py: number,
  maxIterations: number
): number {
  let zx = 0;
  let zy = 0;

  for (let i = 0; i < maxIterations; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;

    if (zx2 + zy2 > 4) {
      return i;
    }

    // Take absolute values before squaring
    const newZx = zx2 - zy2 + px;
    zy = Math.abs(2 * zx * zy) + py;
    zx = newZx;
  }

  return maxIterations;
}

/**
 * Tricorn (Mandelbar) fractal iteration
 * Uses complex conjugate creating tricorn/mandelbar appearance
 */
export function tricornIteration(
  px: number,
  py: number,
  maxIterations: number
): number {
  let zx = 0;
  let zy = 0;

  for (let i = 0; i < maxIterations; i++) {
    const zx2 = zx * zx;
    const zy2 = zy * zy;

    if (zx2 + zy2 > 4) {
      return i;
    }

    // Use conjugate: z = conj(z)^2 + c
    const newZx = zx2 - zy2 + px;
    zy = -2 * zx * zy + py;  // Note the negative sign for conjugate
    zx = newZx;
  }

  return maxIterations;
}

/**
 * Generate Mandelbrot grid with custom center and zoom
 */
export function generateMandelbrotGrid(
  size: number,
  centerX: number,
  centerY: number,
  zoom: number,
  maxIterations: number
): number[][] {
  const grid: number[][] = [];

  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const px = centerX + (x / size - 0.5) * zoom;
      const py = centerY + (y / size - 0.5) * zoom;

      const iterations = mandelbrotIteration(px, py, maxIterations);
      row.push(iterations);
    }
    grid.push(row);
  }

  return grid;
}

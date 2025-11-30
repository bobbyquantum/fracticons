/**
 * Fractal generation algorithms for avatar creation
 */

import { SeededRandom } from './random.js';

export interface Point {
  x: number;
  y: number;
}

export interface FractalParams {
  cx: number;
  cy: number;
  zoom: number;
  maxIterations: number;
  colorOffset: number;
}

/**
 * Generate Julia set fractal parameters from random seed
 */
export function generateJuliaParams(rng: SeededRandom): FractalParams {
  // Generate interesting Julia set parameters
  // Values between -1 and 1 typically produce interesting patterns
  const cx = rng.range(-0.8, 0.8);
  const cy = rng.range(-0.8, 0.8);
  const zoom = rng.range(1.5, 3.0);
  const maxIterations = 50 + rng.int(0, 50);
  const colorOffset = rng.range(0, 1);

  return { cx, cy, zoom, maxIterations, colorOffset };
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
 * Generate a 2D grid of iteration values for a Julia set
 */
export function generateJuliaGrid(
  size: number,
  params: FractalParams
): number[][] {
  const { cx, cy, zoom, maxIterations } = params;
  const grid: number[][] = [];

  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      // Map pixel coordinates to complex plane
      const px = (x / size - 0.5) * zoom;
      const py = (y / size - 0.5) * zoom;

      const iterations = juliaIteration(px, py, cx, cy, maxIterations);
      row.push(iterations);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Mandelbrot set iteration for variety
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

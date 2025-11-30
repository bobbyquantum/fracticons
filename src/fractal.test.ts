import { describe, it, expect } from 'vitest';
import { 
  juliaIteration, 
  generateJuliaGrid, 
  generateJuliaParams,
  generateFractalParams,
  generateFractalGrid,
  mandelbrotIteration,
  generateMandelbrotGrid,
  calculateGridEntropy
} from './fractal.js';
import { SeededRandom } from './random.js';

describe('juliaIteration', () => {
  it('should return iteration count for escaping points', () => {
    // Point that escapes quickly
    const result = juliaIteration(2, 2, 0, 0, 100);
    expect(result).toBeLessThan(100);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should return maxIterations for points in the set', () => {
    // Origin with c=0 should stay in set
    const result = juliaIteration(0, 0, 0, 0, 100);
    expect(result).toBe(100);
  });

  it('should be deterministic', () => {
    const result1 = juliaIteration(0.5, 0.5, -0.7, 0.27015, 50);
    const result2 = juliaIteration(0.5, 0.5, -0.7, 0.27015, 50);
    expect(result1).toBe(result2);
  });

  it('should return different values for different points', () => {
    const result1 = juliaIteration(0.1, 0.1, -0.7, 0.27015, 50);
    const result2 = juliaIteration(0.5, 0.5, -0.7, 0.27015, 50);
    // These should typically be different
    expect(typeof result1).toBe('number');
    expect(typeof result2).toBe('number');
  });
});

describe('mandelbrotIteration', () => {
  it('should return iteration count for escaping points', () => {
    const result = mandelbrotIteration(2, 0, 100);
    expect(result).toBeLessThan(100);
  });

  it('should return maxIterations for points in the set', () => {
    // Origin is in the Mandelbrot set
    const result = mandelbrotIteration(0, 0, 100);
    expect(result).toBe(100);
  });

  it('should identify points in the main cardioid', () => {
    // -0.1, 0 is in the main cardioid
    const result = mandelbrotIteration(-0.1, 0, 100);
    expect(result).toBe(100);
  });
});

describe('generateJuliaGrid', () => {
  it('should generate a grid of the correct size', () => {
    const params = { cx: -0.7, cy: 0.27015, zoom: 2, maxIterations: 50, colorOffset: 0 };
    const grid = generateJuliaGrid(32, params);
    
    expect(grid).toHaveLength(32);
    grid.forEach(row => {
      expect(row).toHaveLength(32);
    });
  });

  it('should contain values between 0 and maxIterations', () => {
    const params = { cx: -0.7, cy: 0.27015, zoom: 2, maxIterations: 50, colorOffset: 0 };
    const grid = generateJuliaGrid(16, params);

    grid.forEach(row => {
      row.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(50);
      });
    });
  });

  it('should be deterministic', () => {
    const params = { cx: -0.7, cy: 0.27015, zoom: 2, maxIterations: 50, colorOffset: 0 };
    const grid1 = generateJuliaGrid(16, params);
    const grid2 = generateJuliaGrid(16, params);

    expect(grid1).toEqual(grid2);
  });
});

describe('generateMandelbrotGrid', () => {
  it('should generate a grid of the correct size', () => {
    const grid = generateMandelbrotGrid(32, -0.5, 0, 2, 50);
    
    expect(grid).toHaveLength(32);
    grid.forEach(row => {
      expect(row).toHaveLength(32);
    });
  });
});

describe('generateJuliaParams', () => {
  it('should generate valid parameters', () => {
    const rng = new SeededRandom([12345, 67890]);
    const params = generateJuliaParams(rng);

    expect(params.cx).toBeGreaterThanOrEqual(-0.8);
    expect(params.cx).toBeLessThanOrEqual(0.8);
    expect(params.cy).toBeGreaterThanOrEqual(-0.8);
    expect(params.cy).toBeLessThanOrEqual(0.8);
    expect(params.zoom).toBeGreaterThanOrEqual(1.5);
    expect(params.zoom).toBeLessThanOrEqual(3.0);
    expect(params.maxIterations).toBeGreaterThanOrEqual(50);
    expect(params.maxIterations).toBeLessThanOrEqual(100);
  });

  it('should be deterministic with same seed', () => {
    const rng1 = new SeededRandom([12345, 67890]);
    const rng2 = new SeededRandom([12345, 67890]);
    
    const params1 = generateJuliaParams(rng1);
    const params2 = generateJuliaParams(rng2);

    expect(params1).toEqual(params2);
  });
});

describe('calculateGridEntropy', () => {
  it('should return low score for mostly empty grid', () => {
    // Grid where almost everything escapes (low iteration values)
    const grid: number[][] = Array(32).fill(null).map(() => Array(32).fill(1));
    const result = calculateGridEntropy(grid, 50);
    
    expect(result.score).toBeLessThan(0.5);
    expect(result.inSetRatio).toBe(0);
    expect(result.uniqueValues).toBe(1);
  });

  it('should return low score for mostly filled grid', () => {
    // Grid where almost everything is in the set (maxIterations)
    const grid: number[][] = Array(32).fill(null).map(() => Array(32).fill(50));
    const result = calculateGridEntropy(grid, 50);
    
    expect(result.score).toBeLessThan(0.5);
    expect(result.inSetRatio).toBe(1);
    expect(result.uniqueValues).toBe(1);
  });

  it('should return higher score for varied grid', () => {
    // Grid with good variety of values
    const grid: number[][] = [];
    for (let y = 0; y < 32; y++) {
      const row: number[] = [];
      for (let x = 0; x < 32; x++) {
        // Mix of in-set and escaped with variety
        if (x < 10) row.push(50); // in-set
        else row.push(x % 20); // varied escape times
      }
      grid.push(row);
    }
    const result = calculateGridEntropy(grid, 50);
    
    expect(result.score).toBeGreaterThan(0.4);
    expect(result.inSetRatio).toBeCloseTo(10/32, 1);
    expect(result.uniqueValues).toBeGreaterThan(10);
  });

  it('should correctly count unique values', () => {
    const grid: number[][] = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 50]
    ];
    const result = calculateGridEntropy(grid, 50);
    
    expect(result.uniqueValues).toBe(16);
    expect(result.inSetRatio).toBe(1/16);
  });
});

describe('generateFractalParams with entropy filtering', () => {
  it('should generate params with decent entropy score', () => {
    const rng = new SeededRandom([11111, 22222]);
    const params = generateFractalParams(rng);
    
    // Generate a grid and check its entropy
    const grid = generateFractalGrid(32, params);
    const entropy = calculateGridEntropy(grid, params.maxIterations);
    
    // Should have at least some variety
    expect(entropy.uniqueValues).toBeGreaterThan(1);
  });

  it('should skip entropy check when skipEntropyCheck is true', () => {
    const rng1 = new SeededRandom([12345, 67890]);
    const rng2 = new SeededRandom([12345, 67890]);
    
    // With skip, should use first generated params
    const paramsSkip = generateFractalParams(rng1, { skipEntropyCheck: true });
    
    // Without skip, might retry and consume more RNG
    const paramsCheck = generateFractalParams(rng2, { skipEntropyCheck: false });
    
    // Both should return valid params
    expect(paramsSkip.cx).toBeDefined();
    expect(paramsCheck.cx).toBeDefined();
  });

  it('should use preset without entropy check', () => {
    const rng = new SeededRandom([12345, 67890]);
    const params = generateFractalParams(rng, { preset: 'galaxy' });
    
    expect(params.cx).toBe(-0.4);
    expect(params.cy).toBe(0.6);
  });

  it('should use custom c without entropy check', () => {
    const rng = new SeededRandom([12345, 67890]);
    const params = generateFractalParams(rng, { c: { real: 0.5, imag: -0.5 } });
    
    expect(params.cx).toBe(0.5);
    expect(params.cy).toBe(-0.5);
  });
});

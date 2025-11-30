import { describe, it, expect } from 'vitest';
import { SeededRandom } from './random.js';

describe('SeededRandom', () => {
  it('should produce consistent sequences from the same seed', () => {
    const rng1 = new SeededRandom([12345, 67890]);
    const rng2 = new SeededRandom([12345, 67890]);

    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('should produce different sequences from different seeds', () => {
    const rng1 = new SeededRandom([12345, 67890]);
    const rng2 = new SeededRandom([11111, 22222]);

    const values1: number[] = [];
    const values2: number[] = [];

    for (let i = 0; i < 10; i++) {
      values1.push(rng1.next());
      values2.push(rng2.next());
    }

    expect(values1).not.toEqual(values2);
  });

  it('should produce values in range [0, 1)', () => {
    const rng = new SeededRandom([42, 84]);

    for (let i = 0; i < 1000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('range() should produce values in specified range', () => {
    const rng = new SeededRandom([1, 2, 3]);

    for (let i = 0; i < 100; i++) {
      const value = rng.range(10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThan(20);
    }
  });

  it('int() should produce integers in specified range', () => {
    const rng = new SeededRandom([100, 200]);

    for (let i = 0; i < 100; i++) {
      const value = rng.int(0, 10);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(10);
    }
  });

  it('pick() should select elements from array', () => {
    const rng = new SeededRandom([999, 888]);
    const array = ['a', 'b', 'c', 'd', 'e'];
    const counts: Record<string, number> = {};

    for (let i = 0; i < 1000; i++) {
      const picked = rng.pick(array);
      expect(array).toContain(picked);
      counts[picked] = (counts[picked] || 0) + 1;
    }

    // Check that all elements were picked at least once
    array.forEach(item => {
      expect(counts[item]).toBeGreaterThan(0);
    });
  });

  it('bool() should return boolean values', () => {
    const rng = new SeededRandom([555, 666]);

    let trueCount = 0;
    let falseCount = 0;

    for (let i = 0; i < 1000; i++) {
      if (rng.bool()) {
        trueCount++;
      } else {
        falseCount++;
      }
    }

    // Both should have been selected at reasonable rates
    expect(trueCount).toBeGreaterThan(100);
    expect(falseCount).toBeGreaterThan(100);
  });

  it('bool() with custom probability should bias appropriately', () => {
    const rng = new SeededRandom([777, 888]);

    let trueCount = 0;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      if (rng.bool(0.9)) {
        trueCount++;
      }
    }

    // Should be heavily biased toward true
    expect(trueCount / iterations).toBeGreaterThan(0.8);
  });
});

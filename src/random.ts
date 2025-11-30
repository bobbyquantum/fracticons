/**
 * Seeded pseudo-random number generator using xorshift128+
 * Provides deterministic random number generation from a seed
 */

export class SeededRandom {
  private state0: number;
  private state1: number;

  /**
   * Create a new seeded random number generator
   * @param seeds - Array of seed numbers (at least 2 recommended)
   */
  constructor(seeds: number[]) {
    // Initialize state from seeds, ensuring non-zero values
    this.state0 = seeds[0] || 0x12345678;
    this.state1 = seeds[1] || 0x87654321;
    
    // Mix in additional seeds
    for (let i = 2; i < seeds.length; i++) {
      this.state0 ^= seeds[i];
      this.next();
    }
    
    // Warm up the generator
    for (let i = 0; i < 10; i++) {
      this.next();
    }
  }

  /**
   * Generate the next pseudo-random number
   * @returns A number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // xorshift128+ algorithm
    let s1 = this.state0;
    const s0 = this.state1;
    
    this.state0 = s0;
    s1 ^= s1 << 23;
    s1 ^= s1 >>> 17;
    s1 ^= s0;
    s1 ^= s0 >>> 26;
    this.state1 = s1;
    
    // Convert to 0-1 range (using unsigned right shift to ensure positive)
    const result = ((this.state0 + this.state1) >>> 0) / 0x100000000;
    return result;
  }

  /**
   * Generate a random number in a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns A random number in the range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generate a random integer in a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns A random integer in the range [min, max)
   */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  /**
   * Pick a random element from an array
   * @param array - Array to pick from
   * @returns A random element from the array
   */
  pick<T>(array: T[]): T {
    return array[this.int(0, array.length)];
  }

  /**
   * Generate a random boolean with given probability
   * @param probability - Probability of returning true (0-1)
   * @returns A random boolean
   */
  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }
}

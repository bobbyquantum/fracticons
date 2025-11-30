import { describe, it, expect } from 'vitest';
import { 
  hslToRgb, 
  rgbToHex, 
  generatePalette, 
  getColorForIteration 
} from './color.js';
import { SeededRandom } from './random.js';

describe('hslToRgb', () => {
  it('should convert red correctly', () => {
    const rgb = hslToRgb(0, 1, 0.5);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('should convert green correctly', () => {
    const rgb = hslToRgb(1/3, 1, 0.5);
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(0);
  });

  it('should convert blue correctly', () => {
    const rgb = hslToRgb(2/3, 1, 0.5);
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(255);
  });

  it('should convert white correctly', () => {
    const rgb = hslToRgb(0, 0, 1);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(255);
  });

  it('should convert black correctly', () => {
    const rgb = hslToRgb(0, 0, 0);
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('should convert gray correctly', () => {
    const rgb = hslToRgb(0, 0, 0.5);
    expect(rgb.r).toBe(128);
    expect(rgb.g).toBe(128);
    expect(rgb.b).toBe(128);
  });
});

describe('rgbToHex', () => {
  it('should convert black to #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('should convert white to #ffffff', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });

  it('should convert red to #ff0000', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('should handle single-digit hex values', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 15 })).toBe('#00000f');
  });

  it('should clamp values to valid range', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });
});

describe('generatePalette', () => {
  it('should generate palette with specified number of colors', () => {
    const rng = new SeededRandom([12345, 67890]);
    const palette = generatePalette(rng, 5);

    expect(palette.colors).toHaveLength(5);
    expect(palette.background).toBeDefined();
  });

  it('should generate valid RGB values', () => {
    const rng = new SeededRandom([11111, 22222]);
    const palette = generatePalette(rng, 3);

    palette.colors.forEach(color => {
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
    });
  });

  it('should be deterministic with same seed', () => {
    const rng1 = new SeededRandom([12345, 67890]);
    const rng2 = new SeededRandom([12345, 67890]);
    
    const palette1 = generatePalette(rng1);
    const palette2 = generatePalette(rng2);

    expect(palette1).toEqual(palette2);
  });
});

describe('getColorForIteration', () => {
  it('should return black for points in the set', () => {
    const palette = {
      colors: [{ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }],
      background: { r: 255, g: 255, b: 255 }
    };

    const color = getColorForIteration(50, 50, palette);
    expect(color).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should interpolate colors for escape iterations', () => {
    const palette = {
      colors: [{ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }],
      background: { r: 128, g: 128, b: 128 }
    };

    const color = getColorForIteration(25, 50, palette);
    expect(color.r).toBeGreaterThan(0);
    expect(color.r).toBeLessThan(255);
  });

  it('should be deterministic', () => {
    const palette = {
      colors: [{ r: 100, g: 150, b: 200 }, { r: 50, g: 100, b: 150 }],
      background: { r: 0, g: 0, b: 0 }
    };

    const color1 = getColorForIteration(10, 50, palette, 0.5);
    const color2 = getColorForIteration(10, 50, palette, 0.5);

    expect(color1).toEqual(color2);
  });
});

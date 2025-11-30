import { describe, it, expect } from 'vitest';
import { gridToPNG, gridToPNGDataURL } from './png.js';

describe('gridToPNG', () => {
  const sampleGrid = [
    [0, 10, 20],
    [10, 50, 10],
    [20, 10, 0]
  ];

  const sampleParams = {
    cx: -0.7,
    cy: 0.27,
    zoom: 2,
    maxIterations: 50,
    colorOffset: 0,
    fractalType: 'julia' as const
  };

  const samplePalette = {
    colors: [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 }
    ],
    background: { r: 255, g: 255, b: 255 }
  };

  it('should generate valid PNG bytes', () => {
    const png = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64 });

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png.length).toBeGreaterThan(0);
  });

  it('should have PNG signature', () => {
    const png = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64 });

    // PNG signature: 137 80 78 71 13 10 26 10
    expect(png[0]).toBe(137);
    expect(png[1]).toBe(80);  // P
    expect(png[2]).toBe(78);  // N
    expect(png[3]).toBe(71);  // G
    expect(png[4]).toBe(13);
    expect(png[5]).toBe(10);
    expect(png[6]).toBe(26);
    expect(png[7]).toBe(10);
  });

  it('should be deterministic', () => {
    const png1 = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64 });
    const png2 = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64 });

    expect(png1).toEqual(png2);
  });

  it('should generate different sizes', () => {
    const small = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 32 });
    const large = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 128 });

    expect(large.length).toBeGreaterThan(small.length);
  });

  it('should handle circular mask', () => {
    const square = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64, circular: false });
    const circular = gridToPNG(sampleGrid, sampleParams, samplePalette, { size: 64, circular: true });

    // Both should be valid PNGs
    expect(square[0]).toBe(137);
    expect(circular[0]).toBe(137);
    
    // They should be different (circular has transparency)
    expect(square).not.toEqual(circular);
  });
});

describe('gridToPNGDataURL', () => {
  const sampleGrid = [
    [0, 10],
    [10, 0]
  ];

  const sampleParams = {
    cx: -0.7,
    cy: 0.27,
    zoom: 2,
    maxIterations: 50,
    colorOffset: 0,
    fractalType: 'julia' as const
  };

  const samplePalette = {
    colors: [{ r: 255, g: 0, b: 0 }],
    background: { r: 255, g: 255, b: 255 }
  };

  it('should generate valid data URL', () => {
    const dataUrl = gridToPNGDataURL(sampleGrid, sampleParams, samplePalette, { size: 32 });

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('should be deterministic', () => {
    const url1 = gridToPNGDataURL(sampleGrid, sampleParams, samplePalette, { size: 32 });
    const url2 = gridToPNGDataURL(sampleGrid, sampleParams, samplePalette, { size: 32 });

    expect(url1).toBe(url2);
  });
});

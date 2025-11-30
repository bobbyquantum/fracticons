import { describe, it, expect } from 'vitest';
import { gridToSVG, generateStylizedSVG, wrapInCircleMask } from './svg.js';

describe('gridToSVG', () => {
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
    colorOffset: 0
  };

  const samplePalette = {
    colors: [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 }
    ],
    background: { r: 255, g: 255, b: 255 }
  };

  it('should generate valid SVG string', () => {
    const svg = gridToSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should set width and height correctly', () => {
    const svg = gridToSVG(sampleGrid, sampleParams, samplePalette, { size: 256 });

    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('should include background rectangle', () => {
    const svg = gridToSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });

    expect(svg).toContain('<rect width="100%" height="100%"');
  });

  it('should be deterministic', () => {
    const svg1 = gridToSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });
    const svg2 = gridToSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });

    expect(svg1).toBe(svg2);
  });

  it('should handle custom viewBox', () => {
    const svg = gridToSVG(sampleGrid, sampleParams, samplePalette, { 
      size: 100, 
      viewBox: '0 0 200 200' 
    });

    expect(svg).toContain('viewBox="0 0 200 200"');
  });
});

describe('generateStylizedSVG', () => {
  const sampleGrid = [
    [0, 10, 20, 30],
    [10, 50, 50, 10],
    [20, 50, 50, 20],
    [30, 10, 20, 0]
  ];

  const sampleParams = {
    cx: -0.7,
    cy: 0.27,
    zoom: 2,
    maxIterations: 50,
    colorOffset: 0
  };

  const samplePalette = {
    colors: [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 }
    ],
    background: { r: 255, g: 255, b: 255 }
  };

  it('should generate valid SVG string', () => {
    const svg = generateStylizedSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should be deterministic', () => {
    const svg1 = generateStylizedSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });
    const svg2 = generateStylizedSVG(sampleGrid, sampleParams, samplePalette, { size: 100 });

    expect(svg1).toBe(svg2);
  });
});

describe('wrapInCircleMask', () => {
  it('should add clipPath definition', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect/></svg>';
    const wrapped = wrapInCircleMask(svg, 100);

    expect(wrapped).toContain('<clipPath id="circleClip">');
    expect(wrapped).toContain('<circle');
  });

  it('should preserve inner content', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>';
    const wrapped = wrapInCircleMask(svg, 100);

    expect(wrapped).toContain('rect fill="red"');
  });

  it('should set correct circle dimensions', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    const wrapped = wrapInCircleMask(svg, 200);

    expect(wrapped).toContain('cx="100"');
    expect(wrapped).toContain('cy="100"');
    expect(wrapped).toContain('r="100"');
  });

  it('should return original if invalid SVG', () => {
    const notSvg = 'not an svg';
    const result = wrapInCircleMask(notSvg, 100);

    expect(result).toBe(notSvg);
  });
});

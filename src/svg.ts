/**
 * SVG rendering for fractal avatars
 */

import { rgbToHex, ColorPalette, getColorForIteration } from './color.js';
import { FractalParams } from './fractal.js';

export interface SVGOptions {
  size: number;
  viewBox?: string;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate SVG from iteration grid
 */
export function gridToSVG(
  grid: number[][],
  params: FractalParams,
  palette: ColorPalette,
  options: SVGOptions
): string {
  const { size, viewBox = `0 0 ${size} ${size}` } = options;
  const gridSize = grid.length;
  const cellSize = size / gridSize;

  const bgColor = rgbToHex(palette.background);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${escapeXml(viewBox)}">`;
  svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;

  // Group pixels by color for more efficient SVG
  const colorGroups: Map<string, { x: number; y: number }[]> = new Map();

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const iteration = grid[y][x];
      const color = getColorForIteration(
        iteration,
        params.maxIterations,
        palette,
        params.colorOffset
      );
      const hex = rgbToHex(color);

      if (!colorGroups.has(hex)) {
        colorGroups.set(hex, []);
      }
      colorGroups.get(hex)!.push({ x, y });
    }
  }

  // Render each color group
  for (const [color, pixels] of colorGroups) {
    if (color === bgColor) continue; // Skip background color pixels

    // For efficiency, render as individual rectangles or path
    if (pixels.length < 10) {
      for (const { x, y } of pixels) {
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
      }
    } else {
      // Use a path for many pixels of same color
      let path = '';
      for (const { x, y } of pixels) {
        path += `M${x * cellSize},${y * cellSize}h${cellSize}v${cellSize}h-${cellSize}z`;
      }
      svg += `<path d="${path}" fill="${color}"/>`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Generate a simplified/stylized SVG avatar using polygons
 */
export function generateStylizedSVG(
  grid: number[][],
  params: FractalParams,
  palette: ColorPalette,
  options: SVGOptions
): string {
  const { size, viewBox = `0 0 ${size} ${size}` } = options;
  const bgColor = rgbToHex(palette.background);
  const gridSize = grid.length;

  // Find contours at different iteration levels
  const levels = 5;
  const contours: { level: number; points: { x: number; y: number }[] }[] = [];

  for (let level = 0; level < levels; level++) {
    const threshold = Math.floor((params.maxIterations / levels) * (level + 1));
    const points: { x: number; y: number }[] = [];

    // Simple contour finding - collect points at this threshold
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x] >= threshold && grid[y][x] < threshold + params.maxIterations / levels) {
          points.push({
            x: (x / gridSize) * size,
            y: (y / gridSize) * size
          });
        }
      }
    }

    if (points.length > 0) {
      contours.push({ level, points });
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${escapeXml(viewBox)}">`;
  svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;

  // Render contour regions as circles/ellipses for a more stylized look
  for (const { level, points } of contours) {
    const color = palette.colors[level % palette.colors.length];
    const hex = rgbToHex(color);
    const opacity = 0.3 + (level / levels) * 0.5;

    // Calculate centroid and radius
    if (points.length > 10) {
      const centroidX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centroidY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      const avgDist = points.reduce((sum, p) => 
        sum + Math.sqrt((p.x - centroidX) ** 2 + (p.y - centroidY) ** 2), 0) / points.length;

      svg += `<circle cx="${centroidX}" cy="${centroidY}" r="${avgDist}" fill="${hex}" opacity="${opacity}"/>`;
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Create a circular mask for the avatar
 */
export function wrapInCircleMask(svgContent: string, size: number): string {
  // Extract the inner content (everything between <svg> and </svg>)
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!innerMatch) return svgContent;

  const inner = innerMatch[1];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="circleClip">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    ${inner}
  </g>
</svg>`;
}

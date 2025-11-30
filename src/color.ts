/**
 * Color generation and manipulation for fractal avatars
 */

import { SeededRandom } from './random.js';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorPalette {
  colors: RGB[];
  background: RGB;
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(color: RGB): string {
  const toHex = (c: number): string => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Generate a deterministic color palette from RNG
 */
export function generatePalette(rng: SeededRandom, numColors = 5): ColorPalette {
  const baseHue = rng.next();
  const saturation = rng.range(0.4, 0.9);
  const lightnessRange = { min: rng.range(0.3, 0.4), max: rng.range(0.6, 0.8) };

  const colors: RGB[] = [];

  for (let i = 0; i < numColors; i++) {
    // Create harmonious colors using golden ratio
    const hue = (baseHue + i * 0.618033988749895) % 1;
    const lightness = lightnessRange.min + (i / numColors) * (lightnessRange.max - lightnessRange.min);
    colors.push(hslToRgb(hue, saturation, lightness));
  }

  // Background color - either light or dark
  const isDark = rng.bool(0.5);
  const bgLightness = isDark ? rng.range(0.05, 0.15) : rng.range(0.9, 0.98);
  const bgSaturation = rng.range(0, 0.1);
  const background = hslToRgb(baseHue, bgSaturation, bgLightness);

  return { colors, background };
}

/**
 * Interpolate between colors based on iteration value
 */
export function getColorForIteration(
  iteration: number,
  maxIterations: number,
  palette: ColorPalette,
  colorOffset = 0
): RGB {
  if (iteration === maxIterations) {
    // Point is in the set - use a dark/contrasting color
    return { r: 0, g: 0, b: 0 };
  }

  // Smooth coloring
  const t = (iteration / maxIterations + colorOffset) % 1;
  const colorIndex = t * (palette.colors.length - 1);
  const i = Math.floor(colorIndex);
  const f = colorIndex - i;

  const c1 = palette.colors[i];
  const c2 = palette.colors[Math.min(i + 1, palette.colors.length - 1)];

  return {
    r: Math.round(c1.r + (c2.r - c1.r) * f),
    g: Math.round(c1.g + (c2.g - c1.g) * f),
    b: Math.round(c1.b + (c2.b - c1.b) * f)
  };
}

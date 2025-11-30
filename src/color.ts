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

/** Available palette style presets */
export type PaletteStyle = 
  | 'random'      // Random harmonious colors (default)
  | 'fire'        // Reds, oranges, yellows
  | 'ocean'       // Blues, teals, cyans
  | 'forest'      // Greens, browns, earth tones
  | 'sunset'      // Pinks, purples, oranges
  | 'neon'        // Bright saturated colors
  | 'pastel'      // Soft, light colors
  | 'monochrome'  // Single hue variations
  | 'grayscale'   // Black and white
  | 'rainbow';    // Full spectrum

/** Preset palette definitions */
const PALETTE_PRESETS: Record<Exclude<PaletteStyle, 'random'>, (rng: SeededRandom) => ColorPalette> = {
  fire: (rng) => ({
    colors: [
      { r: 255, g: 240, b: 180 },  // Bright yellow
      { r: 255, g: 180, b: 50 },   // Orange-yellow
      { r: 255, g: 100, b: 20 },   // Orange
      { r: 200, g: 50, b: 10 },    // Red-orange
      { r: 120, g: 20, b: 5 },     // Dark red
    ],
    background: rng.bool(0.5) ? { r: 10, g: 5, b: 0 } : { r: 255, g: 250, b: 240 }
  }),
  
  ocean: (rng) => ({
    colors: [
      { r: 200, g: 240, b: 255 },  // Light cyan
      { r: 100, g: 200, b: 230 },  // Cyan
      { r: 50, g: 150, b: 200 },   // Light blue
      { r: 20, g: 100, b: 160 },   // Medium blue
      { r: 10, g: 50, b: 100 },    // Dark blue
    ],
    background: rng.bool(0.5) ? { r: 5, g: 15, b: 30 } : { r: 240, g: 250, b: 255 }
  }),
  
  forest: (rng) => ({
    colors: [
      { r: 180, g: 220, b: 140 },  // Light green
      { r: 100, g: 180, b: 80 },   // Green
      { r: 60, g: 140, b: 60 },    // Forest green
      { r: 80, g: 100, b: 50 },    // Olive
      { r: 60, g: 50, b: 30 },     // Brown
    ],
    background: rng.bool(0.5) ? { r: 15, g: 20, b: 10 } : { r: 245, g: 250, b: 240 }
  }),
  
  sunset: (rng) => ({
    colors: [
      { r: 255, g: 200, b: 150 },  // Peach
      { r: 255, g: 150, b: 100 },  // Light orange
      { r: 255, g: 100, b: 120 },  // Coral
      { r: 200, g: 80, b: 150 },   // Pink
      { r: 120, g: 60, b: 140 },   // Purple
    ],
    background: rng.bool(0.5) ? { r: 20, g: 10, b: 30 } : { r: 255, g: 250, b: 245 }
  }),
  
  neon: (_rng) => ({
    colors: [
      { r: 255, g: 0, b: 255 },    // Magenta
      { r: 0, g: 255, b: 255 },    // Cyan
      { r: 255, g: 255, b: 0 },    // Yellow
      { r: 0, g: 255, b: 100 },    // Green
      { r: 255, g: 50, b: 100 },   // Pink
    ],
    background: { r: 10, g: 10, b: 20 }
  }),
  
  pastel: (rng) => {
    const baseHue = rng.next();
    return {
      colors: [
        hslToRgb((baseHue + 0.0) % 1, 0.5, 0.8),
        hslToRgb((baseHue + 0.15) % 1, 0.5, 0.75),
        hslToRgb((baseHue + 0.3) % 1, 0.5, 0.8),
        hslToRgb((baseHue + 0.5) % 1, 0.5, 0.75),
        hslToRgb((baseHue + 0.7) % 1, 0.5, 0.8),
      ],
      background: rng.bool(0.5) ? { r: 30, g: 30, b: 35 } : { r: 255, g: 252, b: 250 }
    };
  },
  
  monochrome: (rng) => {
    const hue = rng.next();
    return {
      colors: [
        hslToRgb(hue, 0.7, 0.85),
        hslToRgb(hue, 0.7, 0.7),
        hslToRgb(hue, 0.7, 0.55),
        hslToRgb(hue, 0.7, 0.4),
        hslToRgb(hue, 0.7, 0.25),
      ],
      background: rng.bool(0.5) ? hslToRgb(hue, 0.1, 0.1) : hslToRgb(hue, 0.1, 0.95)
    };
  },
  
  grayscale: (rng) => ({
    colors: [
      { r: 240, g: 240, b: 240 },
      { r: 180, g: 180, b: 180 },
      { r: 120, g: 120, b: 120 },
      { r: 80, g: 80, b: 80 },
      { r: 40, g: 40, b: 40 },
    ],
    background: rng.bool(0.5) ? { r: 15, g: 15, b: 15 } : { r: 250, g: 250, b: 250 }
  }),
  
  rainbow: (rng) => ({
    colors: [
      { r: 255, g: 0, b: 0 },      // Red
      { r: 255, g: 165, b: 0 },    // Orange
      { r: 255, g: 255, b: 0 },    // Yellow
      { r: 0, g: 200, b: 0 },      // Green
      { r: 0, g: 100, b: 255 },    // Blue
      { r: 150, g: 0, b: 255 },    // Purple
    ],
    background: rng.bool(0.5) ? { r: 10, g: 10, b: 15 } : { r: 255, g: 255, b: 255 }
  }),
};

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
 * @param rng - Seeded random number generator
 * @param style - Palette style preset (default: 'random')
 * @param numColors - Number of colors for random palette (default: 5)
 */
export function generatePalette(
  rng: SeededRandom, 
  style: PaletteStyle = 'random',
  numColors = 5
): ColorPalette {
  // Use preset if specified
  if (style !== 'random' && PALETTE_PRESETS[style]) {
    return PALETTE_PRESETS[style](rng);
  }
  
  // Generate random harmonious palette
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

# API Reference

Complete API documentation for Fracticons.

## Quick Reference

Fracticons accepts three input formats:

| Input Format | Type | Use Case |
|--------------|------|----------|
| **String** | `string` | Most common — input is hashed with SHA-256 |
| **Hex Hash** | `string` (hex) | When you already have a hash |
| **Bytes** | `Uint8Array` | Raw hash bytes for maximum performance |

---

## String Input (Recommended)

The simplest approach — pass any string and it gets hashed with SHA-256 automatically.

### `generateFracticonDataURL(input, options?)`

Generates a fractal avatar as a data URL for use in `<img>` tags.

```typescript
function generateFracticonDataURL(input: string, options?: FracticonOptions): string
```

**Example:**
```typescript
import { generateFracticonDataURL } from 'fracticons';

const avatar = generateFracticonDataURL('user@example.com');
document.getElementById('avatar').src = avatar;
```

### `generateFracticon(input, options?)`

Generates a fractal avatar as raw PNG bytes.

```typescript
function generateFracticon(input: string, options?: FracticonOptions): Uint8Array
```

**Example:**
```typescript
import { generateFracticon } from 'fracticons';
import { writeFileSync } from 'fs';

const pngBytes = generateFracticon('user@example.com');
writeFileSync('avatar.png', pngBytes);
```

### `generateFracticonWithMetadata(input, options?)`

Generates a fractal avatar with full generation metadata.

```typescript
function generateFracticonWithMetadata(input: string, options?: FracticonOptions): FracticonResult

interface FracticonResult {
  png: Uint8Array;       // The PNG image bytes
  hash: string;          // The SHA-256 hash of the input
  params: FractalParams; // Fractal parameters used
  palette: ColorPalette; // Colors used
}
```

---

## Hex Hash Input

Use when you already have a hex hash string (e.g., stored in a database).

### `generateFracticonFromHex(hash, options?)`

```typescript
function generateFracticonFromHex(hash: string, options?: FracticonOptions): Uint8Array
```

### `generateFracticonDataURLFromHex(hash, options?)`

```typescript
function generateFracticonDataURLFromHex(hash: string, options?: FracticonOptions): string
```

### `generateFracticonFromHexWithMetadata(hash, options?)`

```typescript
function generateFracticonFromHexWithMetadata(hash: string, options?: FracticonOptions): FracticonResult
```

**Example:**
```typescript
import { generateFracticonFromHex, sha256 } from 'fracticons';

// Pre-compute hash once
const hash = sha256('user@example.com');

// Generate multiple sizes efficiently
const small = generateFracticonFromHex(hash, { size: 32 });
const medium = generateFracticonFromHex(hash, { size: 64 });
const large = generateFracticonFromHex(hash, { size: 256 });
```

---

## Binary Input

Use when you have raw hash bytes from Web Crypto API or Node.js crypto.

### `generateFracticonFromBytes(hashBytes, options?)`

```typescript
function generateFracticonFromBytes(hashBytes: Uint8Array, options?: FracticonOptions): Uint8Array
```

### `generateFracticonDataURLFromBytes(hashBytes, options?)`

```typescript
function generateFracticonDataURLFromBytes(hashBytes: Uint8Array, options?: FracticonOptions): string
```

### `generateFracticonFromBytesWithMetadata(hashBytes, options?)`

```typescript
function generateFracticonFromBytesWithMetadata(hashBytes: Uint8Array, options?: FracticonOptions): FracticonResult
```

**Example:**
```typescript
import { generateFracticonFromBytes } from 'fracticons';

// Using Web Crypto API
const data = new TextEncoder().encode('user@example.com');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const avatar = generateFracticonFromBytes(new Uint8Array(hashBuffer));
```

---

## Utilities

### `sha256(input)`

Hash a string with SHA-256. Returns a 64-character hex string.

```typescript
import { sha256 } from 'fracticons';

const hash = sha256('user@example.com');
// → '84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee'
```

---

## Options

### `FracticonOptions`

```typescript
interface FracticonOptions {
  /** Output image size in pixels (default: 128) */
  size?: number;
  
  /** Fractal grid resolution — higher = more detail (default: 64) */
  resolution?: number;
  
  /** Apply circular mask (default: false) */
  circular?: boolean;
  
  /** Fractal algorithm (default: 'julia') */
  fractalType?: 'julia' | 'mandelbrot' | 'burning-ship' | 'tricorn';
  
  /** Use a named Julia preset */
  preset?: string;
  
  /** Custom Julia c value (overrides random selection) */
  c?: { real: number; imag: number };
  
  /** Color palette style (default: 'random') */
  paletteStyle?: PaletteStyle;
}
```

---

## Types

### `PaletteStyle`

Available color palette presets:

| Value | Description |
|-------|-------------|
| `'random'` | Procedurally generated harmonious colors (default) |
| `'fire'` | 🔥 Reds, oranges, yellows |
| `'ocean'` | 🌊 Blues, teals, cyans |
| `'forest'` | 🌲 Greens, browns, earth tones |
| `'sunset'` | 🌅 Pinks, purples, oranges |
| `'neon'` | 💡 Bright, saturated colors |
| `'pastel'` | 🎀 Soft, muted tones |
| `'monochrome'` | ⬛ Single-hue variations |
| `'grayscale'` | 🔲 Black and white |
| `'rainbow'` | 🌈 Full spectrum |

### `FractalType`

Available fractal algorithms:

| Value | Description |
|-------|-------------|
| `'julia'` | Julia set (default) — Most variety and visual interest |
| `'mandelbrot'` | Mandelbrot set |
| `'burning-ship'` | Burning Ship fractal |
| `'tricorn'` | Tricorn (Mandelbar) fractal |

### Julia Presets

When using `fractalType: 'julia'`, you can optionally specify a preset for a specific visual style:

| Preset | Description |
|--------|-------------|
| `'galaxy'` | Spiral galaxy patterns |
| `'lightning'` | Electric, branching forms |
| `'seahorse'` | Classic seahorse valley |
| `'snowflake'` | Crystalline structures |
| `'spiral'` | Tight spiral patterns |
| `'starfish'` | Star-shaped formations |
| `'dendrite'` | Tree-like branching |
| `'rabbit'` | Douady's rabbit |
| `'explosion'` | Radial burst patterns |
| `'dragon'` | Dragon curve patterns |

---

## Advanced Usage

### Custom Julia Constants

For precise control, you can specify exact Julia set parameters:

```typescript
generateFracticonDataURL('user@example.com', {
  fractalType: 'julia',
  c: { real: -0.4, imag: 0.6 },
});
```

### Using the Low-Level API

For advanced use cases, you can access the individual generation steps:

```typescript
import {
  sha256,
  hashToNumbers,
  SeededRandom,
  generateFractalParams,
  generateFractalGrid,
  generatePalette,
  gridToPNG,
} from 'fracticons';

// Manual generation pipeline
const hash = sha256('user@example.com');
const seeds = hashToNumbers(hash);
const rng = new SeededRandom(seeds);
const params = generateFractalParams(rng);
const palette = generatePalette(rng, 'ocean');
const grid = generateFractalGrid(64, params);
const png = gridToPNG(grid, params, palette, { size: 128, circular: true });
```

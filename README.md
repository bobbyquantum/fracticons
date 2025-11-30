# Fracticons

Deterministic fractal avatar generator - like Gravatar/Identicon, but with fractals.

Generate unique, beautiful fractal-based avatars from any string input. Each input produces a consistent, deterministic fractal pattern.

## Features

- 🎨 **Beautiful fractals**: Generates Julia set fractals for visually appealing avatars
- 🔒 **Deterministic**: Same input always produces the same output
- 📦 **Zero dependencies**: Pure TypeScript/JavaScript implementation
- 🎯 **TypeScript first**: Full type definitions included
- 📐 **SVG output**: Scalable vector graphics that look great at any size
- ⚡ **Fast**: Efficient algorithms for quick generation

## Installation

```bash
npm install fracticons
```

## Usage

### Basic Usage

```typescript
import { generateFracticon } from 'fracticons';

// Generate an SVG avatar from any string
const svg = generateFracticon('user@example.com');
document.getElementById('avatar').innerHTML = svg;
```

### With Options

```typescript
import { generateFracticon } from 'fracticons';

const svg = generateFracticon('user@example.com', {
  size: 256,        // Output size in pixels (default: 128)
  resolution: 64,   // Fractal grid resolution (default: 64)
  circular: true,   // Apply circular mask (default: false)
  style: 'detailed' // 'detailed' or 'stylized' (default: 'detailed')
});
```

### Data URL

```typescript
import { generateFracticonDataURL } from 'fracticons';

// Get a data URL for use in img src
const dataUrl = generateFracticonDataURL('user@example.com');
document.getElementById('avatar').src = dataUrl;
```

### With Metadata

```typescript
import { generateFracticonWithMetadata } from 'fracticons';

const result = generateFracticonWithMetadata('user@example.com');
console.log(result.svg);     // The SVG string
console.log(result.hash);    // SHA-256 hash of input
console.log(result.params);  // Fractal parameters used
console.log(result.palette); // Color palette used
```

### Get Hash Only

```typescript
import { getFracticonHash } from 'fracticons';

// Useful for caching or comparison
const hash = getFracticonHash('user@example.com');
```

## Advanced Usage

The library exports all internal modules for advanced customization:

```typescript
import {
  // Hash utilities
  sha256,
  hashToNumbers,
  
  // Seeded random number generator
  SeededRandom,
  
  // Fractal generation
  generateJuliaParams,
  generateJuliaGrid,
  juliaIteration,
  mandelbrotIteration,
  
  // Color utilities
  generatePalette,
  hslToRgb,
  rgbToHex,
  
  // SVG rendering
  gridToSVG,
  generateStylizedSVG,
  wrapInCircleMask
} from 'fracticons';
```

## API Reference

### generateFracticon(input, options?)

Generate an SVG string for a fractal avatar.

**Parameters:**
- `input` (string): Any string to generate the avatar from
- `options` (FracticonOptions): Optional configuration
  - `size` (number): Output size in pixels (default: 128)
  - `resolution` (number): Fractal grid resolution (default: 64)
  - `circular` (boolean): Apply circular mask (default: false)
  - `style` ('detailed' | 'stylized'): Avatar style (default: 'detailed')

**Returns:** SVG string

### generateFracticonWithMetadata(input, options?)

Generate a fractal avatar with full metadata.

**Returns:** Object with:
- `svg` (string): The SVG string
- `hash` (string): SHA-256 hash of the input
- `params` (FractalParams): Fractal parameters used
- `palette` (ColorPalette): Color palette used

### generateFracticonDataURL(input, options?)

Generate a data URL for the fractal avatar.

**Returns:** Data URL string (data:image/svg+xml;base64,...)

### getFracticonHash(input)

Get the SHA-256 hash for an input.

**Returns:** 64-character hex string

## How It Works

1. **Hashing**: Input string is hashed using SHA-256 (pure JavaScript implementation)
2. **Seeding**: Hash is converted to seed values for a deterministic random number generator
3. **Parameters**: RNG generates Julia set parameters (complex constant c, zoom level, etc.)
4. **Palette**: RNG generates a harmonious color palette
5. **Rendering**: Julia set is computed and rendered to SVG

## License

MIT

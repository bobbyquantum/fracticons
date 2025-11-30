# Fracticons

Deterministic fractal avatar generator - like Gravatar/Identicon, but with fractals.

Generate unique, beautiful fractal-based avatars from a hash. Each hash produces a consistent, deterministic fractal pattern.

## Features

- 🎨 **Beautiful fractals**: Generates Julia set fractals for visually appealing avatars
- 🔒 **Deterministic**: Same hash always produces the same output
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

// Generate an SVG avatar from a hash
// You provide the hash - use any hashing method you prefer
const hash = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const svg = generateFracticon(hash);
document.getElementById('avatar').innerHTML = svg;
```

### With Options

```typescript
import { generateFracticon } from 'fracticons';

const hash = 'your-hash-here...';
const svg = generateFracticon(hash, {
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
const hash = 'your-hash-here...';
const dataUrl = generateFracticonDataURL(hash);
document.getElementById('avatar').src = dataUrl;
```

### With Metadata

```typescript
import { generateFracticonWithMetadata } from 'fracticons';

const hash = 'your-hash-here...';
const result = generateFracticonWithMetadata(hash);
console.log(result.svg);     // The SVG string
console.log(result.hash);    // The hash that was used
console.log(result.params);  // Fractal parameters used
console.log(result.palette); // Color palette used
```

## Advanced Usage

The library exports internal modules for advanced customization:

```typescript
import {
  // Hash utilities
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

### generateFracticon(hash, options?)

Generate an SVG string for a fractal avatar.

**Parameters:**
- `hash` (string): A hexadecimal hash string to generate the avatar from
- `options` (FracticonOptions): Optional configuration
  - `size` (number): Output size in pixels (default: 128)
  - `resolution` (number): Fractal grid resolution (default: 64)
  - `circular` (boolean): Apply circular mask (default: false)
  - `style` ('detailed' | 'stylized'): Avatar style (default: 'detailed')

**Returns:** SVG string

### generateFracticonWithMetadata(hash, options?)

Generate a fractal avatar with full metadata.

**Returns:** Object with:
- `svg` (string): The SVG string
- `hash` (string): The hash that was used
- `params` (FractalParams): Fractal parameters used
- `palette` (ColorPalette): Color palette used

### generateFracticonDataURL(hash, options?)

Generate a data URL for the fractal avatar.

**Returns:** Data URL string (data:image/svg+xml;base64,...)

## How It Works

1. **Input**: Accepts a hex hash string (you provide your own hash)
2. **Seeding**: Hash is converted to seed values for a deterministic random number generator
3. **Parameters**: RNG generates Julia set parameters (complex constant c, zoom level, etc.)
4. **Palette**: RNG generates a harmonious color palette
5. **Rendering**: Julia set is computed and rendered to SVG

## License

MIT

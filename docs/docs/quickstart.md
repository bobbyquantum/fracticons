# Quick Start

Get up and running with Fracticons in under 5 minutes.

## Installation

```bash
npm install fracticons
```

## Basic Usage

### Browser (with a bundler like Vite, webpack, etc.)

```typescript
import { generateFracticonDataURL } from 'fracticons';

// Generate a data URL you can use directly in an <img> tag
const avatarUrl = generateFracticonDataURL('user@example.com');

// Set it as the image source
document.getElementById('avatar').src = avatarUrl;
```

### Node.js (save to file)

```typescript
import { generateFracticon } from 'fracticons';
import { writeFileSync } from 'fs';

// Generate PNG bytes
const pngBytes = generateFracticon('user@example.com');

// Save to file
writeFileSync('avatar.png', pngBytes);
```

### React

```tsx
import { generateFracticonDataURL } from 'fracticons';

function Avatar({ userId }: { userId: string }) {
  const src = generateFracticonDataURL(userId, { circular: true });
  return <img src={src} alt="User avatar" />;
}
```

## Customization Options

### Size

Control the output image dimensions:

```typescript
generateFracticonDataURL('user@example.com', {
  size: 256,  // 256x256 pixels (default: 128)
});
```

### Circular Mask

Apply a circular mask for round avatars:

```typescript
generateFracticonDataURL('user@example.com', {
  circular: true,
});
```

### Color Palettes

Choose from 10 built-in color palettes:

```typescript
generateFracticonDataURL('user@example.com', {
  paletteStyle: 'ocean',  // See all options below
});
```

| Palette | Description |
|---------|-------------|
| `random` | Procedurally generated (default) |
| `fire` | 🔥 Warm reds, oranges, yellows |
| `ocean` | 🌊 Cool blues and teals |
| `forest` | 🌲 Greens and earth tones |
| `sunset` | 🌅 Pinks, purples, oranges |
| `neon` | 💡 Bright, vibrant colors |
| `pastel` | 🎀 Soft, muted tones |
| `monochrome` | ⬛ Single-hue variations |
| `grayscale` | 🔲 Black and white |
| `rainbow` | 🌈 Full spectrum |

### Fractal Types

Experiment with different fractal algorithms:

```typescript
generateFracticonDataURL('user@example.com', {
  fractalType: 'julia',  // 'julia' | 'mandelbrot' | 'burning-ship' | 'tricorn'
});
```

## Complete Example

```typescript
import { generateFracticonDataURL } from 'fracticons';

// Generate a 200px circular avatar with the fire palette
const avatar = generateFracticonDataURL('user@example.com', {
  size: 200,
  circular: true,
  paletteStyle: 'fire',
});

// Use it
const img = document.createElement('img');
img.src = avatar;
img.alt = 'User Avatar';
document.body.appendChild(img);
```

## Next Steps

- **[API Reference](./api)** — Full documentation of all functions and options
- **[Live Demo](/demo)** — Try different options interactively

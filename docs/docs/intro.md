# Introduction

Welcome to **Fracticons** — a library that generates unique, beautiful fractal avatars from any string.

Think of it like [Gravatar](https://gravatar.com/) or GitHub's Identicons, but instead of geometric patterns, you get stunning Julia set fractals that are mathematically unique to each input.

## Why Fracticons?

Traditional identicons use simple geometric shapes. Fracticons uses the infinite complexity of fractal mathematics to create avatars that are:

- **Visually distinctive** — Easy to recognize at a glance
- **Aesthetically pleasing** — Not just functional, but genuinely beautiful
- **Mathematically unique** — The fractal structure ensures true uniqueness

## Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Beautiful Fractals** | Julia set fractals with 10 vibrant color palettes |
| 🔒 **Deterministic** | Same input always produces the same avatar |
| ⚡ **Fast** | ~3ms per avatar at 128px |
| 📦 **Zero Dependencies** | Pure TypeScript, works everywhere |
| 🖼️ **PNG Output** | Native PNG generation, no Canvas required |

## Quick Example

```typescript
import { generateFracticonDataURL } from 'fracticons';

// Generate avatar from any string
const avatar = generateFracticonDataURL('user@example.com');

// Use in an img tag
document.getElementById('avatar').src = avatar;
```

## Installation

```bash
npm install fracticons
```

Ready to dive in? Check out the [Quick Start guide](./quickstart) to get up and running in minutes.

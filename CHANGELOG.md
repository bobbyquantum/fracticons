# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-19

### Added

- Initial release of Fracticons
- Generate deterministic fractal avatars from any string input
- **Three input formats:**
  - String input with automatic SHA-256 hashing
  - Hex hash input for pre-computed hashes
  - Binary input (`Uint8Array`) for maximum performance
- **Fractal types:** Julia sets (default), Mandelbrot, Burning Ship, Tricorn
- **10 Julia set presets:** galaxy, lightning, seahorse, spiral, dendrite, rabbit, dragon, starfish, snowflake, explosion
- **10 color palettes:** random, fire, ocean, forest, sunset, neon, pastel, monochrome, grayscale, rainbow
- **Quality filtering:** Entropy-based rejection of boring/empty fractals
- **Horizontal symmetry:** Mirrored fractals for balanced avatars
- **Output options:**
  - PNG bytes (`Uint8Array`)
  - Data URL for direct use in `<img>` tags
  - Metadata including fractal parameters and palette
- **Customization:**
  - Configurable output size (default: 128px)
  - Optional circular mask
  - Custom Julia set c values
- **Zero dependencies:** Pure TypeScript with custom PNG encoder
- **Cross-platform:** Works in Node.js, browsers, and edge runtimes
- Full test suite with 92 tests
- Docusaurus documentation site

[1.0.0]: https://github.com/bobbyquantum/fracticons/releases/tag/v1.0.0

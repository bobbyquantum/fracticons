import { describe, it, expect } from 'vitest';
import { 
  generateFracticon, 
  generateFracticonWithMetadata,
  generateFracticonDataURL
} from './index.js';
import { sha256 } from './hash.js';

// Helper to generate hash for tests
const testHash = (input: string): string => sha256(input);

describe('generateFracticon', () => {
  it('should generate an SVG for any hash input', () => {
    const hash = testHash('user@example.com');
    const svg = generateFracticon(hash);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should be deterministic', () => {
    const hash = testHash('test@test.com');
    const svg1 = generateFracticon(hash);
    const svg2 = generateFracticon(hash);

    expect(svg1).toBe(svg2);
  });

  it('should generate different avatars for different hashes', () => {
    const hash1 = testHash('user1@example.com');
    const hash2 = testHash('user2@example.com');
    const svg1 = generateFracticon(hash1);
    const svg2 = generateFracticon(hash2);

    expect(svg1).not.toBe(svg2);
  });

  it('should respect size option', () => {
    const hash = testHash('test');
    const svg = generateFracticon(hash, { size: 256 });

    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('should apply circular mask when requested', () => {
    const hash = testHash('test');
    const svg = generateFracticon(hash, { circular: true });

    expect(svg).toContain('clipPath');
    expect(svg).toContain('circleClip');
  });

  it('should support stylized mode', () => {
    const hash = testHash('test');
    const detailed = generateFracticon(hash, { style: 'detailed' });
    const stylized = generateFracticon(hash, { style: 'stylized' });

    expect(detailed).not.toBe(stylized);
    expect(stylized).toContain('<svg');
  });

  it('should handle empty hash', () => {
    const hash = testHash('');
    const svg = generateFracticon(hash);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should handle unicode input hash', () => {
    const hash = testHash('用户名@例子.中国');
    const svg = generateFracticon(hash);

    expect(svg).toContain('<svg');
  });

  it('should handle very long string hash', () => {
    const longString = 'a'.repeat(10000);
    const hash = testHash(longString);
    const svg = generateFracticon(hash);

    expect(svg).toContain('<svg');
  });

  it('should generate unique avatars for different hashes', () => {
    const hash1 = testHash('user1');
    const hash2 = testHash('user2');
    const hash3 = testHash('user3');
    const svg1 = generateFracticon(hash1);
    const svg2 = generateFracticon(hash2);
    const svg3 = generateFracticon(hash3);

    expect(new Set([svg1, svg2, svg3]).size).toBe(3);
  });
});

describe('generateFracticonWithMetadata', () => {
  it('should return SVG and metadata', () => {
    const hash = testHash('test@example.com');
    const result = generateFracticonWithMetadata(hash);

    expect(result.svg).toContain('<svg');
    expect(result.hash).toBe(hash);
    expect(result.params).toBeDefined();
    expect(result.params.cx).toBeDefined();
    expect(result.params.cy).toBeDefined();
    expect(result.palette).toBeDefined();
    expect(result.palette.colors.length).toBeGreaterThan(0);
  });

  it('should return consistent metadata', () => {
    const hash = testHash('test');
    const result1 = generateFracticonWithMetadata(hash);
    const result2 = generateFracticonWithMetadata(hash);

    expect(result1.hash).toBe(result2.hash);
    expect(result1.params).toEqual(result2.params);
    expect(result1.palette).toEqual(result2.palette);
  });
});

describe('generateFracticonDataURL', () => {
  it('should return a valid data URL', () => {
    const hash = testHash('test@example.com');
    const dataUrl = generateFracticonDataURL(hash);

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('should be decodable back to SVG', () => {
    const hash = testHash('test');
    const dataUrl = generateFracticonDataURL(hash);
    const base64 = dataUrl.replace('data:image/svg+xml;base64,', '');
    const decoded = decodeURIComponent(escape(atob(base64)));

    expect(decoded).toContain('<svg');
    expect(decoded).toContain('</svg>');
  });

  it('should be deterministic', () => {
    const hash = testHash('user');
    const url1 = generateFracticonDataURL(hash);
    const url2 = generateFracticonDataURL(hash);

    expect(url1).toBe(url2);
  });
});

describe('Integration tests', () => {
  it('should produce consistent output across all API functions', () => {
    const hash = testHash('consistency-test@example.com');
    
    const svg1 = generateFracticon(hash);
    const result = generateFracticonWithMetadata(hash);
    const dataUrl = generateFracticonDataURL(hash);

    // SVG should match
    expect(svg1).toBe(result.svg);

    // Hash should match
    expect(hash).toBe(result.hash);

    // Data URL should decode to the same SVG
    const base64 = dataUrl.replace('data:image/svg+xml;base64,', '');
    const decodedSvg = decodeURIComponent(escape(atob(base64)));
    expect(decodedSvg).toBe(svg1);
  });

  it('should handle all size options', () => {
    const sizes = [32, 64, 128, 256, 512];
    const hash = testHash('test');

    sizes.forEach(size => {
      const svg = generateFracticon(hash, { size });
      expect(svg).toContain(`width="${size}"`);
      expect(svg).toContain(`height="${size}"`);
    });
  });

  it('should handle all style options', () => {
    const styles: Array<'detailed' | 'stylized'> = ['detailed', 'stylized'];
    const hash = testHash('test');

    styles.forEach(style => {
      const svg = generateFracticon(hash, { style });
      expect(svg).toContain('<svg');
    });
  });

  it('should generate valid SVGs that could be rendered', () => {
    const hash = testHash('rendering-test');
    const svg = generateFracticon(hash);
    
    // Check for valid SVG structure
    expect(svg).toMatch(/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toMatch(/<svg[^>]*width="\d+"/);
    expect(svg).toMatch(/<svg[^>]*height="\d+"/);
    expect(svg).toContain('</svg>');
    
    // Should not have unclosed tags (basic check)
    const closeTags = svg.match(/<\/[a-z]+>/gi) || [];
    const selfClosing = svg.match(/<[a-z]+[^>]*\/>/gi) || [];
    
    // This is a simplified check
    expect(closeTags.length + selfClosing.length).toBeGreaterThan(0);
  });
});

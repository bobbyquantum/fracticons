import { describe, it, expect } from 'vitest';
import { 
  generateFracticon, 
  generateFracticonWithMetadata,
  generateFracticonDataURL,
  getFracticonHash 
} from './index.js';

describe('generateFracticon', () => {
  it('should generate an SVG for any string input', () => {
    const svg = generateFracticon('user@example.com');

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should be deterministic', () => {
    const svg1 = generateFracticon('test@test.com');
    const svg2 = generateFracticon('test@test.com');

    expect(svg1).toBe(svg2);
  });

  it('should generate different avatars for different inputs', () => {
    const svg1 = generateFracticon('user1@example.com');
    const svg2 = generateFracticon('user2@example.com');

    expect(svg1).not.toBe(svg2);
  });

  it('should respect size option', () => {
    const svg = generateFracticon('test', { size: 256 });

    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
  });

  it('should apply circular mask when requested', () => {
    const svg = generateFracticon('test', { circular: true });

    expect(svg).toContain('clipPath');
    expect(svg).toContain('circleClip');
  });

  it('should support stylized mode', () => {
    const detailed = generateFracticon('test', { style: 'detailed' });
    const stylized = generateFracticon('test', { style: 'stylized' });

    expect(detailed).not.toBe(stylized);
    expect(stylized).toContain('<svg');
  });

  it('should handle empty string', () => {
    const svg = generateFracticon('');

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should handle unicode input', () => {
    const svg = generateFracticon('用户名@例子.中国');

    expect(svg).toContain('<svg');
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const svg = generateFracticon(longString);

    expect(svg).toContain('<svg');
  });

  it('should generate unique avatars for similar inputs', () => {
    const svg1 = generateFracticon('user1');
    const svg2 = generateFracticon('user2');
    const svg3 = generateFracticon('user3');

    expect(new Set([svg1, svg2, svg3]).size).toBe(3);
  });
});

describe('generateFracticonWithMetadata', () => {
  it('should return SVG and metadata', () => {
    const result = generateFracticonWithMetadata('test@example.com');

    expect(result.svg).toContain('<svg');
    expect(result.hash).toHaveLength(64);
    expect(result.params).toBeDefined();
    expect(result.params.cx).toBeDefined();
    expect(result.params.cy).toBeDefined();
    expect(result.palette).toBeDefined();
    expect(result.palette.colors.length).toBeGreaterThan(0);
  });

  it('should return consistent metadata', () => {
    const result1 = generateFracticonWithMetadata('test');
    const result2 = generateFracticonWithMetadata('test');

    expect(result1.hash).toBe(result2.hash);
    expect(result1.params).toEqual(result2.params);
    expect(result1.palette).toEqual(result2.palette);
  });
});

describe('generateFracticonDataURL', () => {
  it('should return a valid data URL', () => {
    const dataUrl = generateFracticonDataURL('test@example.com');

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('should be decodable back to SVG', () => {
    const dataUrl = generateFracticonDataURL('test');
    const base64 = dataUrl.replace('data:image/svg+xml;base64,', '');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');

    expect(decoded).toContain('<svg');
    expect(decoded).toContain('</svg>');
  });

  it('should be deterministic', () => {
    const url1 = generateFracticonDataURL('user');
    const url2 = generateFracticonDataURL('user');

    expect(url1).toBe(url2);
  });
});

describe('getFracticonHash', () => {
  it('should return a 64-character hex string', () => {
    const hash = getFracticonHash('test@example.com');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('should be deterministic', () => {
    const hash1 = getFracticonHash('test');
    const hash2 = getFracticonHash('test');

    expect(hash1).toBe(hash2);
  });

  it('should match hash in metadata', () => {
    const hash = getFracticonHash('test');
    const result = generateFracticonWithMetadata('test');

    expect(hash).toBe(result.hash);
  });
});

describe('Integration tests', () => {
  it('should produce consistent output across all API functions', () => {
    const input = 'consistency-test@example.com';
    
    const svg1 = generateFracticon(input);
    const result = generateFracticonWithMetadata(input);
    const dataUrl = generateFracticonDataURL(input);
    const hash = getFracticonHash(input);

    // SVG should match
    expect(svg1).toBe(result.svg);

    // Hash should match
    expect(hash).toBe(result.hash);

    // Data URL should decode to the same SVG
    const base64 = dataUrl.replace('data:image/svg+xml;base64,', '');
    const decodedSvg = Buffer.from(base64, 'base64').toString('utf-8');
    expect(decodedSvg).toBe(svg1);
  });

  it('should handle all size options', () => {
    const sizes = [32, 64, 128, 256, 512];

    sizes.forEach(size => {
      const svg = generateFracticon('test', { size });
      expect(svg).toContain(`width="${size}"`);
      expect(svg).toContain(`height="${size}"`);
    });
  });

  it('should handle all style options', () => {
    const styles: Array<'detailed' | 'stylized'> = ['detailed', 'stylized'];

    styles.forEach(style => {
      const svg = generateFracticon('test', { style });
      expect(svg).toContain('<svg');
    });
  });

  it('should generate valid SVGs that could be rendered', () => {
    const svg = generateFracticon('rendering-test');
    
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

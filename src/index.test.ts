import { describe, it, expect } from 'vitest';
import { 
  generateFracticon, 
  generateFracticonWithMetadata,
  generateFracticonDataURL,
  generateFracticonFromHex,
  generateFracticonFromHexWithMetadata,
  generateFracticonDataURLFromHex,
  generateFracticonFromBytes,
  generateFracticonFromBytesWithMetadata,
  generateFracticonDataURLFromBytes,
} from './index.js';
import { sha256 } from './hash.js';

describe('generateFracticon (string API)', () => {
  it('should generate a PNG for any string input', () => {
    const png = generateFracticon('user@example.com');

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png.length).toBeGreaterThan(0);
    // Check PNG signature
    expect(png[0]).toBe(137);
    expect(png[1]).toBe(80); // P
    expect(png[2]).toBe(78); // N
    expect(png[3]).toBe(71); // G
  });

  it('should always hash string input with SHA-256', () => {
    const input = 'user@example.com';
    const hash = sha256(input);
    
    // String API hashes the input
    const png1 = generateFracticon(input);
    // Hex API uses hash directly
    const png2 = generateFracticonFromHex(hash);

    expect(png1).toEqual(png2);
  });

  it('should be deterministic', () => {
    const input = 'test@test.com';
    const png1 = generateFracticon(input);
    const png2 = generateFracticon(input);

    expect(png1).toEqual(png2);
  });

  it('should generate different avatars for different inputs', () => {
    const png1 = generateFracticon('user1@example.com');
    const png2 = generateFracticon('user2@example.com');

    expect(png1).not.toEqual(png2);
  });

  it('should respect size option', () => {
    const input = 'test';
    const small = generateFracticon(input, { size: 64 });
    const large = generateFracticon(input, { size: 256 });

    // Larger size should produce larger file
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('should apply circular mask when requested', () => {
    const input = 'test';
    const square = generateFracticon(input, { circular: false });
    const circular = generateFracticon(input, { circular: true });

    // Both should be valid PNGs but different
    expect(square[0]).toBe(137);
    expect(circular[0]).toBe(137);
    expect(square).not.toEqual(circular);
  });

  it('should handle empty string', () => {
    const png = generateFracticon('');

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137); // PNG signature
  });

  it('should handle unicode input', () => {
    const png = generateFracticon('用户名@例子.中国');

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137);
  });

  it('should handle very long string', () => {
    const longString = 'a'.repeat(10000);
    const png = generateFracticon(longString);

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137);
  });

  it('should generate unique avatars for different inputs', () => {
    const png1 = generateFracticon('user1');
    const png2 = generateFracticon('user2');
    const png3 = generateFracticon('user3');

    // Convert to strings for comparison
    const str1 = Array.from(png1).join(',');
    const str2 = Array.from(png2).join(',');
    const str3 = Array.from(png3).join(',');

    expect(new Set([str1, str2, str3]).size).toBe(3);
  });
});

describe('generateFracticonFromHex (hex hash API)', () => {
  it('should generate a PNG from a hex hash', () => {
    const hash = sha256('user@example.com');
    const png = generateFracticonFromHex(hash);

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137); // PNG signature
  });

  it('should be deterministic', () => {
    const hash = sha256('test');
    const png1 = generateFracticonFromHex(hash);
    const png2 = generateFracticonFromHex(hash);

    expect(png1).toEqual(png2);
  });

  it('should handle uppercase hex', () => {
    const hash = sha256('test');
    const png1 = generateFracticonFromHex(hash.toLowerCase());
    const png2 = generateFracticonFromHex(hash.toUpperCase());

    expect(png1).toEqual(png2);
  });

  it('should produce same result as string API with same input', () => {
    const input = 'test@example.com';
    const hash = sha256(input);
    
    const png1 = generateFracticon(input);
    const png2 = generateFracticonFromHex(hash);

    expect(png1).toEqual(png2);
  });
});

describe('generateFracticonFromBytes (binary API)', () => {
  it('should generate a PNG from raw bytes', () => {
    // Create a 32-byte hash (like SHA-256 output)
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hashBytes[i] = i * 8;
    }
    
    const png = generateFracticonFromBytes(hashBytes);

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137); // PNG signature
  });

  it('should be deterministic', () => {
    const hashBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const png1 = generateFracticonFromBytes(hashBytes);
    const png2 = generateFracticonFromBytes(hashBytes);

    expect(png1).toEqual(png2);
  });

  it('should work with Web Crypto API style output', () => {
    // Simulate what you'd get from crypto.subtle.digest
    const hashBytes = new Uint8Array(32);
    crypto.getRandomValues(hashBytes);
    
    const png = generateFracticonFromBytes(hashBytes);

    expect(png).toBeInstanceOf(Uint8Array);
    expect(png[0]).toBe(137);
  });
});

describe('generateFracticonWithMetadata', () => {
  it('should return PNG and metadata', () => {
    const input = 'test@example.com';
    const result = generateFracticonWithMetadata(input);

    expect(result.png).toBeInstanceOf(Uint8Array);
    expect(result.png[0]).toBe(137); // PNG signature
    expect(result.hash).toBeDefined();
    expect(result.hash.length).toBe(64); // SHA-256 produces 64 hex chars
    expect(result.params).toBeDefined();
    expect(result.params.cx).toBeDefined();
    expect(result.params.cy).toBeDefined();
    expect(result.palette).toBeDefined();
    expect(result.palette.colors.length).toBeGreaterThan(0);
  });

  it('should return the SHA-256 hash of input', () => {
    const input = 'test@example.com';
    const expectedHash = sha256(input);
    const result = generateFracticonWithMetadata(input);

    expect(result.hash).toBe(expectedHash);
  });

  it('should return consistent metadata', () => {
    const input = 'test';
    const result1 = generateFracticonWithMetadata(input);
    const result2 = generateFracticonWithMetadata(input);

    expect(result1.hash).toBe(result2.hash);
    expect(result1.params).toEqual(result2.params);
    expect(result1.palette).toEqual(result2.palette);
  });
});

describe('generateFracticonDataURL', () => {
  it('should return a valid PNG data URL', () => {
    const dataUrl = generateFracticonDataURL('test@example.com');

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('should be deterministic', () => {
    const input = 'user';
    const url1 = generateFracticonDataURL(input);
    const url2 = generateFracticonDataURL(input);

    expect(url1).toBe(url2);
  });

  it('should produce valid base64', () => {
    const dataUrl = generateFracticonDataURL('test');
    const base64 = dataUrl.replace('data:image/png;base64,', '');
    
    // Should be valid base64 (no errors when matching pattern)
    expect(base64).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe('Hex and Bytes API variants', () => {
  it('generateFracticonFromHexWithMetadata should return metadata', () => {
    const hash = sha256('test');
    const result = generateFracticonFromHexWithMetadata(hash);

    expect(result.png).toBeInstanceOf(Uint8Array);
    expect(result.hash).toBe(hash);
    expect(result.params).toBeDefined();
    expect(result.palette).toBeDefined();
  });

  it('generateFracticonDataURLFromHex should return data URL', () => {
    const hash = sha256('test');
    const dataUrl = generateFracticonDataURLFromHex(hash);

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('generateFracticonFromBytesWithMetadata should return metadata', () => {
    const hashBytes = new Uint8Array(16).fill(42);
    const result = generateFracticonFromBytesWithMetadata(hashBytes);

    expect(result.png).toBeInstanceOf(Uint8Array);
    expect(result.hash).toBeDefined();
    expect(result.params).toBeDefined();
    expect(result.palette).toBeDefined();
  });

  it('generateFracticonDataURLFromBytes should return data URL', () => {
    const hashBytes = new Uint8Array(16).fill(42);
    const dataUrl = generateFracticonDataURLFromBytes(hashBytes);

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe('Integration tests', () => {
  it('should produce consistent output across all API functions', () => {
    const input = 'consistency-test@example.com';
    
    const png1 = generateFracticon(input);
    const result = generateFracticonWithMetadata(input);

    // PNG should match
    expect(png1).toEqual(result.png);
  });

  it('should handle all size options', () => {
    const sizes = [32, 64, 128, 256];
    const input = 'test';

    let prevSize = 0;
    sizes.forEach(size => {
      const png = generateFracticon(input, { size });
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png.length).toBeGreaterThan(prevSize);
      prevSize = png.length;
    });
  });

  it('should handle fractal type options', () => {
    const types = ['julia', 'mandelbrot', 'burning-ship', 'tricorn'] as const;
    const input = 'test';

    types.forEach(fractalType => {
      const png = generateFracticon(input, { fractalType });
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png[0]).toBe(137);
    });
  });

  it('should generate valid PNGs with proper structure', () => {
    const png = generateFracticon('rendering-test');
    
    // Check PNG signature
    expect(png[0]).toBe(137);
    expect(png[1]).toBe(80);  // P
    expect(png[2]).toBe(78);  // N
    expect(png[3]).toBe(71);  // G
    expect(png[4]).toBe(13);
    expect(png[5]).toBe(10);
    expect(png[6]).toBe(26);
    expect(png[7]).toBe(10);
    
    // Should have reasonable size for 128x128 image
    expect(png.length).toBeGreaterThan(100);
    expect(png.length).toBeLessThan(500000); // Less than 500KB
  });
});

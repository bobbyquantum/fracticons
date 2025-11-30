import { describe, it, expect } from 'vitest';
import { sha256, hashToNumbers } from './hash.js';

describe('sha256', () => {
  it('should generate consistent hashes for the same input', () => {
    const hash1 = sha256('test@example.com');
    const hash2 = sha256('test@example.com');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different inputs', () => {
    const hash1 = sha256('user1@example.com');
    const hash2 = sha256('user2@example.com');
    expect(hash1).not.toBe(hash2);
  });

  it('should generate a 64-character hex string', () => {
    const hash = sha256('hello world');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('should handle empty strings', () => {
    const hash = sha256('');
    expect(hash).toHaveLength(64);
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('should handle unicode characters', () => {
    const hash = sha256('こんにちは世界');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('should match known SHA-256 values', () => {
    // Test against known SHA-256 values
    expect(sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    expect(sha256('The quick brown fox jumps over the lazy dog')).toBe('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592');
  });
});

describe('hashToNumbers', () => {
  it('should convert hash to array of numbers', () => {
    const hash = sha256('test');
    const numbers = hashToNumbers(hash);
    expect(numbers).toHaveLength(8);
    numbers.forEach(n => {
      expect(typeof n).toBe('number');
      expect(n).toBeGreaterThanOrEqual(0);
    });
  });

  it('should produce consistent numbers', () => {
    const hash = sha256('test');
    const numbers1 = hashToNumbers(hash);
    const numbers2 = hashToNumbers(hash);
    expect(numbers1).toEqual(numbers2);
  });
});

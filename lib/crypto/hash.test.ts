import { describe, it, expect } from 'vitest';
import {
  sha256,
  generateRandomToken,
  generateNumericOTP,
  timingSafeEqualHex,
} from './hash';

describe('sha256', () => {
  it('is deterministic', () => {
    expect(sha256('hello')).toBe(sha256('hello'));
  });
  it('returns hex 64 chars', () => {
    expect(sha256('x')).toMatch(/^[0-9a-f]{64}$/);
  });
  it('matches the canonical sha256 of "abc"', () => {
    // Test vector — SHA-256("abc") well-known
    expect(sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('generateRandomToken', () => {
  it('default 32 bytes → ~43 chars in base64url', () => {
    const t = generateRandomToken();
    // 32 bytes → 43 chars sans padding (base64url)
    expect(t.length).toBeGreaterThanOrEqual(42);
    expect(t.length).toBeLessThanOrEqual(44);
  });

  it('produces different values each call', () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) set.add(generateRandomToken());
    expect(set.size).toBe(50);
  });

  it('has only base64url-safe characters', () => {
    expect(generateRandomToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('generateNumericOTP', () => {
  it('default length 6 with leading zeros if needed', () => {
    for (let i = 0; i < 100; i++) {
      const otp = generateNumericOTP();
      expect(otp).toMatch(/^[0-9]{6}$/);
    }
  });

  it('respects custom length', () => {
    expect(generateNumericOTP(4)).toMatch(/^[0-9]{4}$/);
    expect(generateNumericOTP(8)).toMatch(/^[0-9]{8}$/);
  });
});

describe('timingSafeEqualHex', () => {
  it('returns true for equal hex strings', () => {
    expect(timingSafeEqualHex(sha256('a'), sha256('a'))).toBe(true);
  });

  it('returns false for different hex strings', () => {
    expect(timingSafeEqualHex(sha256('a'), sha256('b'))).toBe(false);
  });

  it('returns false for invalid hex without throwing', () => {
    expect(timingSafeEqualHex('not hex', 'not hex')).toBe(false);
    expect(timingSafeEqualHex('', sha256('a'))).toBe(false);
  });

  it('returns false for different-length hex', () => {
    expect(timingSafeEqualHex('ab', 'abcd')).toBe(false);
  });
});

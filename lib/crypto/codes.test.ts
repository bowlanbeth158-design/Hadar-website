import { describe, it, expect } from 'vitest';
import {
  generateRecoveryCode,
  generateRecoveryCodes,
  normalizeRecoveryCode,
} from './codes';

describe('generateRecoveryCode', () => {
  it('matches XXXXX-XXXXX format with the safe alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateRecoveryCode();
      expect(c).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/);
    }
  });

  it('never contains 0/O/1/I/L (visually ambiguous chars)', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateRecoveryCode();
      expect(c).not.toMatch(/[01OIL]/);
    }
  });
});

describe('generateRecoveryCodes', () => {
  it('returns 8 unique codes by default', () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8);
  });

  it('respects custom count', () => {
    expect(generateRecoveryCodes(3)).toHaveLength(3);
    expect(generateRecoveryCodes(16)).toHaveLength(16);
  });
});

describe('normalizeRecoveryCode', () => {
  it('uppercases and re-inserts the dash if missing', () => {
    expect(normalizeRecoveryCode('abcdefghij')).toBe('ABCDE-FGHIJ');
  });

  it('preserves the dash if present', () => {
    expect(normalizeRecoveryCode('abcde-fghij')).toBe('ABCDE-FGHIJ');
  });

  it('strips arbitrary whitespace', () => {
    expect(normalizeRecoveryCode('ab cd e-fg hij')).toBe('ABCDE-FGHIJ');
    expect(normalizeRecoveryCode('  abcde fghij  ')).toBe('ABCDE-FGHIJ');
  });
});

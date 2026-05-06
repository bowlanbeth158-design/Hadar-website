import { describe, it, expect, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import { encrypt, decrypt, encryptNullable, decryptNullable } from './aes';
import { _setTestKey } from './keys';

beforeAll(() => {
  _setTestKey('ENCRYPTION_KEY', randomBytes(32));
});

describe('AES-256-GCM', () => {
  it('encrypt → decrypt roundtrip preserves the plaintext', () => {
    const inputs = [
      '',
      'hello',
      'Mohamed Ossama MOUSSAOUI',
      'مرحبا بالعالم — السلام عليكم',
      JSON.stringify({ a: 1, b: [2, 3, 'x'] }),
      'A'.repeat(10_000),
    ];
    for (const v of inputs) {
      expect(decrypt(encrypt(v))).toBe(v);
    }
  });

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    const plaintext = 'même contact, deux signalements';
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe(plaintext);
    expect(decrypt(b)).toBe(plaintext);
  });

  it('starts with the version prefix v1:', () => {
    expect(encrypt('x').startsWith('v1:')).toBe(true);
  });

  it('throws on tampered ciphertext (auth tag check)', () => {
    const enc = encrypt('secret');
    // Flip one character of the ciphertext segment
    const tampered = enc.slice(0, -10) + 'aaaaaaaaaa';
    expect(() => decrypt(tampered)).toThrow();
  });

  it('throws on unknown version prefix', () => {
    expect(() => decrypt('v9:foo.bar.baz')).toThrow(/Version/);
  });

  it('throws on missing version prefix', () => {
    expect(() => decrypt('foo.bar.baz')).toThrow(/version/);
  });

  it('throws on wrong segment count', () => {
    expect(() => decrypt('v1:foo.bar')).toThrow(/3 segments/);
  });

  it('encryptNullable / decryptNullable roundtrip null', () => {
    expect(encryptNullable(null)).toBe(null);
    expect(encryptNullable(undefined)).toBe(null);
    expect(decryptNullable(null)).toBe(null);
    expect(decryptNullable(undefined)).toBe(null);
    const enc = encryptNullable('hello');
    expect(enc).not.toBe(null);
    expect(decryptNullable(enc)).toBe('hello');
  });

  it('throws if a non-string is passed', () => {
    // @ts-expect-error testing runtime guard
    expect(() => encrypt(42)).toThrow();
    // @ts-expect-error testing runtime guard
    expect(() => decrypt(42)).toThrow();
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  hmacContact,
  hmacEmail,
  hmacIp,
  hmacUserAgent,
  normalizeContactValue,
} from './hmac';
// hmacContact référencé dans un test pour comparer les peppers
import { _setTestKey } from './keys';

beforeAll(() => {
  _setTestKey('CONTACT_HASH_PEPPER', randomBytes(32));
  _setTestKey('IP_HASH_PEPPER', randomBytes(32));
});

describe('normalizeContactValue', () => {
  it('lowercases', () => {
    expect(normalizeContactValue('CONTACT@X.COM')).toBe('contact@x.com');
  });
  it('trims whitespace', () => {
    expect(normalizeContactValue('  hello  ')).toBe('hello');
  });
  it('strips spaces, dashes, parens, underscores', () => {
    expect(normalizeContactValue('+212 (6) 12-34_56-78')).toBe('+212612345678');
  });
});

describe('hmacContact', () => {
  it('is deterministic for same (value, channel)', () => {
    const a = hmacContact('+212612345678', 'WHATSAPP');
    const b = hmacContact('+212612345678', 'WHATSAPP');
    expect(a).toBe(b);
  });

  it('returns hex string of 64 chars (256 bits)', () => {
    const h = hmacContact('+212612345678', 'WHATSAPP');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('different channels for the same value yield different hashes', () => {
    const wa = hmacContact('+212612345678', 'WHATSAPP');
    const tel = hmacContact('+212612345678', 'TELEPHONE');
    expect(wa).not.toBe(tel);
  });

  it('different values yield different hashes', () => {
    const a = hmacContact('+212612345678', 'WHATSAPP');
    const b = hmacContact('+212612345679', 'WHATSAPP');
    expect(a).not.toBe(b);
  });
});

describe('hmacEmail', () => {
  it('normalizes case and whitespace before hashing', () => {
    expect(hmacEmail('User@X.com')).toBe(hmacEmail('  user@x.com '));
  });

  it('different emails yield different hashes', () => {
    expect(hmacEmail('a@x.com')).not.toBe(hmacEmail('b@x.com'));
  });
});

describe('hmacIp / hmacUserAgent', () => {
  it('are deterministic', () => {
    expect(hmacIp('1.2.3.4')).toBe(hmacIp('1.2.3.4'));
    expect(hmacUserAgent('Mozilla/5.0')).toBe(hmacUserAgent('Mozilla/5.0'));
  });

  it('use a different pepper than hmacContact (ip pepper ≠ contact pepper)', () => {
    expect(hmacIp('foo')).not.toBe(hmacContact('foo', 'WHATSAPP'));
  });

  it('hmacIp and hmacUserAgent share the IP pepper (same input → same hash)', () => {
    // Décision design : les deux utilisent IP_HASH_PEPPER. C'est OK
    // parce que les inputs (IP vs UA) ne se collisionnent jamais en
    // pratique. Si un jour on veut une isolation stricte, on ajoute
    // un séparateur ou un troisième pepper.
    expect(hmacIp('foo')).toBe(hmacUserAgent('foo'));
  });

  it('truncates very long User-Agents safely', () => {
    const ua = 'X'.repeat(10_000);
    expect(() => hmacUserAgent(ua)).not.toThrow();
    // First 256 chars match → hash matches truncated input
    expect(hmacUserAgent(ua)).toBe(hmacUserAgent('X'.repeat(256)));
  });
});

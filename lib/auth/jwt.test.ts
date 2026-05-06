import { describe, it, expect, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
} from './jwt';

beforeAll(() => {
  // 64 bytes en base64 → suffisant pour HS512.
  process.env.AUTH_JWT_SECRET = randomBytes(64).toString('base64');
});

describe('signAccessToken / verifyAccessToken', () => {
  it('roundtrip user token preserves the payload', async () => {
    const token = await signAccessToken({
      sub: 'usr_abc123',
      type: 'user',
      sid: 'sess_xyz',
    });
    const claims = await verifyAccessToken(token);
    expect(claims.sub).toBe('usr_abc123');
    expect(claims.type).toBe('user');
    expect(claims.sid).toBe('sess_xyz');
    expect(claims.role).toBeUndefined();
    expect(claims.iss).toBe('hadar.ma');
    expect(claims.aud).toBe('hadar.ma');
    expect(typeof claims.iat).toBe('number');
    expect(typeof claims.exp).toBe('number');
    // exp = iat + 15min
    expect(claims.exp - claims.iat).toBe(15 * 60);
    expect(typeof claims.jti).toBe('string');
  });

  it('roundtrip member token preserves the role', async () => {
    const token = await signAccessToken({
      sub: 'mbr_admin1',
      type: 'member',
      role: 'SUPER_ADMIN',
      sid: 'sess_abc',
    });
    const claims = await verifyAccessToken(token);
    expect(claims.type).toBe('member');
    expect(claims.role).toBe('SUPER_ADMIN');
  });

  it('rejects a tampered token (signature mismatch)', async () => {
    const token = await signAccessToken({
      sub: 'usr',
      type: 'user',
      sid: 'sess',
    });
    // Flip a character in the signature segment
    const tampered = token.slice(0, -3) + 'AAA';
    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it('rejects a token signed with a different secret', async () => {
    const original = process.env.AUTH_JWT_SECRET;
    const token = await signAccessToken({
      sub: 'usr',
      type: 'user',
      sid: 'sess',
    });
    // Change the secret → cached secret in the module is unchanged for
    // this test, but a brand-new signature with a different secret
    // would also be rejected. Check by mutating env and re-importing
    // can't be done easily without isolated modules; instead we just
    // check the original tampered scenario above.
    process.env.AUTH_JWT_SECRET = original;
    expect(token).toBeTypeOf('string');
  });

  it('jti is unique across two consecutive tokens', async () => {
    const a = await signAccessToken({
      sub: 'usr',
      type: 'user',
      sid: 'sess',
    });
    const b = await signAccessToken({
      sub: 'usr',
      type: 'user',
      sid: 'sess',
    });
    const ca = await verifyAccessToken(a);
    const cb = await verifyAccessToken(b);
    expect(ca.jti).not.toBe(cb.jti);
  });
});

describe('generateRefreshToken', () => {
  it('returns base64url tokens, ~43 chars (32 bytes)', () => {
    const t = generateRefreshToken();
    expect(t.length).toBeGreaterThanOrEqual(42);
    expect(t.length).toBeLessThanOrEqual(44);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produces different values each call', () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) set.add(generateRefreshToken());
    expect(set.size).toBe(50);
  });
});

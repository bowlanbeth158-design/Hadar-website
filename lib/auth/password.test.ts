import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, needsRehash } from './password';

describe('hashPassword / verifyPassword', () => {
  it('roundtrip réussit avec le bon mot de passe', async () => {
    const hash = await hashPassword('Hadar2026!ok');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword('Hadar2026!ok', hash)).toBe(true);
  });

  it('refuse un mauvais mot de passe', async () => {
    const hash = await hashPassword('Hadar2026!ok');
    expect(await verifyPassword('autreMotDePasse!', hash)).toBe(false);
  });

  it('produit deux hashes différents pour le même mot de passe (sel aléatoire)', async () => {
    const a = await hashPassword('memeMotDePasse2026!');
    const b = await hashPassword('memeMotDePasse2026!');
    expect(a).not.toBe(b);
    // Les deux vérifient malgré tout
    expect(await verifyPassword('memeMotDePasse2026!', a)).toBe(true);
    expect(await verifyPassword('memeMotDePasse2026!', b)).toBe(true);
  });

  it('throw si mot de passe trop court (< 8)', async () => {
    await expect(hashPassword('short')).rejects.toThrow();
  });

  it('verifyPassword retourne false sur un hash corrompu', async () => {
    expect(await verifyPassword('xx', 'pas un hash')).toBe(false);
    expect(await verifyPassword('xx', '')).toBe(false);
  });
}, { timeout: 10_000 }); // argon2 prend ~250 ms par hash

describe('needsRehash', () => {
  it('false sur un hash produit avec les params courants', async () => {
    const hash = await hashPassword('Hadar2026!ok');
    expect(needsRehash(hash)).toBe(false);
  });

  it('true sur un hash bizarre', () => {
    expect(needsRehash('pas un hash')).toBe(true);
  });
}, { timeout: 10_000 });

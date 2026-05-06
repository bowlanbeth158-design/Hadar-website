// ─────────────────────────────────────────────────────────────────────────────
// Codes de récupération 2FA.
//
// Quand un user perd son authenticator TOTP, il peut se connecter avec
// un code de récupération à usage unique. On en génère 8 à
// l'enrôlement TOTP, l'user les sauvegarde (impression / coffre).
//
// Format : XXXXX-XXXXX (10 caractères + tiret = 11 chars). Alphabet
// base32 modifié (sans 0/O/1/I/L) pour éviter les confusions à la
// lecture.
//
// Stockage : les 8 codes sont CHIFFRÉS en bloc (lib/crypto/aes) dans
// MemberCredential.recoveryCodesEncrypted. Au login, on déchiffre, on
// compare au code tapé en temps constant, puis on retire le code utilisé
// et on ré-écrit l'ensemble chiffré.
// ─────────────────────────────────────────────────────────────────────────────

import { randomInt } from 'node:crypto';

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars, sans 0/O/1/I/L

function randomChunk(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}

/// Génère un code de récupération unique au format XXXXX-XXXXX.
export function generateRecoveryCode(): string {
  return `${randomChunk(5)}-${randomChunk(5)}`;
}

/// Génère un set de codes de récupération (8 par défaut, recommandation
/// usuelle en 2FA).
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  while (codes.length < count) {
    const c = generateRecoveryCode();
    // Pas de doublon dans un même set (probabilité quasi nulle mais
    // on en est sûr).
    if (!codes.includes(c)) codes.push(c);
  }
  return codes;
}

/// Normalise un code tapé par l'user (whitespace, casse, tiret optionnel)
/// avant comparaison. "ab cd e-fghij" → "ABCDE-FGHIJ"
export function normalizeRecoveryCode(input: string): string {
  const cleaned = input.replace(/\s+/g, '').toUpperCase();
  if (cleaned.length === 10 && !cleaned.includes('-')) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
}

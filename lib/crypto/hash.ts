// ─────────────────────────────────────────────────────────────────────────────
// Hash SHA-256 simple (sans pepper) pour les tokens à durée courte.
//
// Utilisation : refresh tokens, email/SMS verification tokens, password
// reset tokens. Ces tokens sont eux-mêmes générés cryptographiquement
// aléatoires (32 octets = 256 bits d'entropie) → un pepper n'apporte
// rien de plus en sécurité, alors qu'il complique la rotation.
//
// Le client reçoit le token CLAIR (cookie / email link / SMS), la DB
// stocke seulement son hash. Au lookup, on hash le token reçu et on
// compare. Une fuite DB seule ne permet pas de réutiliser un refresh
// token.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/// Hash SHA-256 hex d'une chaîne. Idempotent (même entrée → même
/// sortie) — utilisable pour les lookups indexés.
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/// Génère un token cryptographiquement aléatoire en base64url.
/// Par défaut 32 octets = 256 bits d'entropie — résistant à toute
/// attaque par bruteforce dans l'absolu.
export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/// Génère un OTP numérique à `length` chiffres (par défaut 6).
/// Utilisé pour SMS / TOTP backup. randomInt évite le biais modulo.
export function generateNumericOTP(length = 6): string {
  const max = 10 ** length;
  // randomInt borne [0, max[ uniforme, idéal pour OTP.
  const { randomInt } = require('node:crypto') as typeof import('node:crypto');
  const n = randomInt(0, max);
  return String(n).padStart(length, '0');
}

/// Compare deux hashes hex en temps constant (anti timing attack).
/// IMPORTANT : Buffer.from peut throw si les hex sont mal formés —
/// on retourne false plutôt que de propager (un attaquant ne doit
/// pas pouvoir distinguer "hash invalide" de "hash incorrect" via
/// l'erreur).
export function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length || ba.length === 0) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

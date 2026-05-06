// ─────────────────────────────────────────────────────────────────────────────
// Chiffrement AES-256-GCM pour les champs T1.
//
// Utilisé pour : secrets TOTP, codes de récupération, payload audit,
// notes admin sur signalements, object keys CIN/selfie, etc.
//
// Format de sortie versionné : "v1:<iv>.<ciphertext>.<tag>" en base64url.
// Le préfixe "v1:" permettra une rotation de clé future (on supporte
// "v1" en lecture, on écrit "v2" en écriture, et un job migre les
// "v1" vers "v2" sans downtime).
//
// IV (12 octets) régénéré aléatoirement à chaque chiffrement → deux
// chiffrements de la même valeur produisent des sorties différentes
// (impossible de détecter "ces deux signalements ont les mêmes notes
// admin" en lisant juste les bytes chiffrés).
//
// Authentification : tag GCM 16 octets vérifié au déchiffrement → si
// quelqu'un a altéré le ciphertext en DB, decrypt() throw.
// ─────────────────────────────────────────────────────────────────────────────

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { getEncryptionKey } from './keys.js';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // recommandation NIST pour GCM
const TAG_LENGTH = 16;
const VERSION = 'v1';

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

/// Chiffre une chaîne UTF-8. Renvoie une chaîne opaque sûre à stocker
/// en colonne TEXT.
export function encrypt(plaintext: string): string {
  if (typeof plaintext !== 'string') {
    throw new TypeError('encrypt() attend une chaîne de caractères.');
  }
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${b64url(iv)}.${b64url(ciphertext)}.${b64url(tag)}`;
}

/// Déchiffre une chaîne produite par encrypt(). Throw si :
///   - le format est invalide
///   - la clé de chiffrement n'est pas la bonne
///   - le ciphertext a été altéré (tag GCM ne match pas)
export function decrypt(payload: string): string {
  if (typeof payload !== 'string') {
    throw new TypeError('decrypt() attend une chaîne de caractères.');
  }
  const colon = payload.indexOf(':');
  if (colon === -1) {
    throw new Error('Payload chiffré invalide : version manquante.');
  }
  const version = payload.slice(0, colon);
  if (version !== VERSION) {
    throw new Error(`Version de chiffrement inconnue : ${version}`);
  }
  const parts = payload.slice(colon + 1).split('.');
  if (parts.length !== 3) {
    throw new Error('Payload chiffré invalide : 3 segments attendus.');
  }
  const [ivPart, ctPart, tagPart] = parts as [string, string, string];
  const iv = fromB64url(ivPart);
  const ciphertext = fromB64url(ctPart);
  const tag = fromB64url(tagPart);
  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new Error('Payload chiffré invalide : longueur IV/tag.');
  }
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

/// Helper pour les colonnes nullable : null in → null out.
export function encryptNullable(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null;
  return encrypt(plaintext);
}

export function decryptNullable(payload: string | null | undefined): string | null {
  if (payload === null || payload === undefined) return null;
  return decrypt(payload);
}

#!/usr/bin/env node
//
// Génère des clés cryptographiques aléatoires pour .env.local.
//
// Usage :
//   node scripts/generate-secrets.mjs
//
// Sortie : un bloc à copier-coller dans .env.local. Le script ne touche
// JAMAIS .env.local — c'est volontaire pour qu'on ne risque jamais
// d'écraser des clés déjà actives en dev.

import { randomBytes } from 'node:crypto';

const b64 = (bytes) => randomBytes(bytes).toString('base64');

const secrets = {
  AUTH_JWT_SECRET: b64(64), // 512 bits — overkill mais inoffensif
  AUTH_REFRESH_SECRET: b64(64),
  ENCRYPTION_KEY: b64(32), // AES-256 = 32 octets
  CONTACT_HASH_PEPPER: b64(32),
  IP_HASH_PEPPER: b64(32),
};

console.log('# ────────────────────────────────────────────────────────────');
console.log('# Clés générées le ' + new Date().toISOString());
console.log('# Copie-colle ces lignes dans .env.local');
console.log('# ────────────────────────────────────────────────────────────');
for (const [k, v] of Object.entries(secrets)) {
  console.log(`${k}=${v}`);
}
console.log('# ────────────────────────────────────────────────────────────');
console.log('# ⚠ Ne jamais commit ces valeurs.');
console.log('# ⚠ Les sauvegarder en lieu sûr (1Password / Bitwarden).');
console.log('# ⚠ Une fois en prod, ces valeurs viendront du KMS.');

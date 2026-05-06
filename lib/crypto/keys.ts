// ─────────────────────────────────────────────────────────────────────────────
// Chargement et validation des clés cryptographiques.
//
// Les clés viennent toutes de variables d'environnement (en dev :
// .env.local généré par `node scripts/generate-secrets.mjs` ; en prod :
// secrets DigitalOcean / Vault / KMS).
//
// Ce module lazy-load chaque clé à la première utilisation et garde le
// résultat en mémoire (Buffer) pour éviter de re-décoder le base64 à
// chaque opération. Si une clé manque ou a une mauvaise longueur, on
// throw IMMÉDIATEMENT — pas de silent fallback. Mieux vaut un crash
// au boot qu'un chiffrement avec une clé vide.
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_BYTES = {
  ENCRYPTION_KEY: 32, // AES-256
  CONTACT_HASH_PEPPER: 32,
  IP_HASH_PEPPER: 32,
} as const;

type KeyName = keyof typeof REQUIRED_BYTES;

const cache = new Map<KeyName, Buffer>();

function loadKey(name: KeyName): Buffer {
  const cached = cache.get(name);
  if (cached) return cached;

  const raw = process.env[name];
  if (!raw) {
    throw new Error(
      `Variable d'environnement ${name} manquante. Lance : node scripts/generate-secrets.mjs`,
    );
  }

  let buf: Buffer;
  try {
    buf = Buffer.from(raw, 'base64');
  } catch {
    throw new Error(`${name} n'est pas du base64 valide.`);
  }

  const expected = REQUIRED_BYTES[name];
  if (buf.length !== expected) {
    throw new Error(
      `${name} doit faire exactement ${expected} octets (= ${Math.ceil((expected * 4) / 3)} caractères base64), reçu ${buf.length}.`,
    );
  }

  cache.set(name, buf);
  return buf;
}

export const getEncryptionKey = () => loadKey('ENCRYPTION_KEY');
export const getContactPepper = () => loadKey('CONTACT_HASH_PEPPER');
export const getIpPepper = () => loadKey('IP_HASH_PEPPER');

/// Pour les tests : injecte une clé en mémoire sans passer par l'env.
/// Utilisée uniquement par lib/crypto/*.test.ts.
export function _setTestKey(name: KeyName, key: Buffer) {
  if (key.length !== REQUIRED_BYTES[name]) {
    throw new Error(`Clé de test ${name} de mauvaise longueur.`);
  }
  cache.set(name, key);
}

/// Pour les tests : vide le cache pour forcer le rechargement depuis env.
export function _clearKeyCache() {
  cache.clear();
}

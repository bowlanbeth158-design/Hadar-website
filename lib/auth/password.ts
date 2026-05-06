// ─────────────────────────────────────────────────────────────────────────────
// Hashing et vérification des mots de passe avec argon2id.
//
// Paramètres production-grade (OWASP 2023+ recommandation) :
//   - argon2id (résiste à GPU + side-channel)
//   - memoryCost = 64 MB     (bloque les ASIC à coût raisonnable)
//   - timeCost = 3           (~250 ms sur un serveur moderne)
//   - parallelism = 4
//
// Les paramètres sont inscrits DANS le hash → si on les change plus
// tard, les anciens hashes restent vérifiables (argon2 lit ses propres
// paramètres). On peut ré-hasher progressivement au prochain login.
// ─────────────────────────────────────────────────────────────────────────────

import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB en kibioctets
  timeCost: 3,
  parallelism: 4,
} as const;

/// Hash un mot de passe en clair → string opaque à stocker dans
/// UserCredential.passwordHash / MemberCredential.passwordHash.
/// Throw si le mot de passe est trop court (sanity, le caller doit
/// déjà avoir validé via passwordSchema avant).
export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== 'string' || plaintext.length < 8) {
    throw new Error('Mot de passe trop court pour être hashé.');
  }
  return argon2.hash(plaintext, ARGON2_OPTIONS);
}

/// Vérifie un mot de passe contre un hash stocké. Retourne false si
/// non-match, throw uniquement sur erreur technique (hash corrompu).
/// IMPORTANT : argon2 a déjà la comparaison en temps constant intégrée,
/// pas besoin de timingSafeEqual.
export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  if (typeof plaintext !== 'string' || typeof hash !== 'string') {
    return false;
  }
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    // Hash mal formé / corrompu → on traite comme non-match.
    return false;
  }
}

/// Indique si un hash existant a été produit avec des paramètres plus
/// faibles que la politique courante. Si oui, le caller doit
/// re-hasher au prochain login réussi.
export function needsRehash(hash: string): boolean {
  try {
    return argon2.needsRehash(hash, ARGON2_OPTIONS);
  } catch {
    return true; // hash bizarre → on le remplace au prochain login
  }
}

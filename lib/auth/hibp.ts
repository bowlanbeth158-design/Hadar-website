// ─────────────────────────────────────────────────────────────────────────────
// Vérification "Have I Been Pwned" — détecte les mots de passe déjà
// fuités dans des breachs publics.
//
// Protocole k-anonymity :
//   1. SHA-1 du mot de passe en hex uppercase.
//   2. Envoyer les 5 premiers caractères au endpoint HIBP.
//   3. HIBP renvoie tous les hashes connus qui commencent par ce
//      préfixe (~500 hashes, sans nous dire combien on en a tapé).
//   4. On compare localement le suffixe → on sait si NOTRE mot de
//      passe est dedans, sans jamais l'envoyer à HIBP.
//
// Gracieux : si l'API HIBP est down ou l'env REQUIRE_HIBP_CHECK est
// absent, on FAIL OPEN (laisse passer + log) plutôt que de bloquer
// les inscriptions à cause d'une dépendance externe.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';

const HIBP_API = 'https://api.pwnedpasswords.com/range';
const TIMEOUT_MS = 3000;

interface HibpResult {
  pwned: boolean;
  /// Combien de fois ce mot de passe est apparu dans des fuites
  /// connues (0 si pas pwned).
  occurrences: number;
}

/// Vérifie si un mot de passe est dans HIBP. Retourne { pwned: false }
/// silencieusement si l'API est down (fail-open).
export async function checkHibp(password: string): Promise<HibpResult> {
  try {
    const sha1 = createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${HIBP_API}/${prefix}`, {
        signal: ctrl.signal,
        headers: { 'Add-Padding': 'true', 'User-Agent': 'hadar-ma' },
      });
    } finally {
      clearTimeout(t);
    }
    if (!res.ok) return { pwned: false, occurrences: 0 };

    const text = await res.text();
    // Format réponse : "SUFFIX:COUNT\r\n" répété
    for (const line of text.split('\n')) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (!hashSuffix || !countStr) continue;
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10);
        // Padding lines have count=0 — ignore them.
        if (count > 0) {
          return { pwned: true, occurrences: count };
        }
      }
    }
    return { pwned: false, occurrences: 0 };
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[hibp] API unavailable, fail-open');
    return { pwned: false, occurrences: 0 };
  }
}

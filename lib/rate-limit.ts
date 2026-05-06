// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting (sliding window) — store-agnostic.
//
// Implémentation actuelle : in-memory Map avec TTL. Suffisant pour :
//   - dev local
//   - les tests
//   - un déploiement single-instance
//
// Pour la prod multi-instance on basculera vers Redis (interface
// RateLimitStore prévue à cet effet). Le call-site ne change pas —
// juste le store injecté.
//
// Algorithme : Sliding-window log (on garde la liste des timestamps
// dans la fenêtre, on supprime ceux qui sortent). Précis mais coût
// O(n) en mémoire par clé. Vu nos volumes (< 100k events / fenêtre),
// c'est OK. Si on monte à des millions on passera au sliding-window
// counter.
//
// Politique de défaillance : si le store throw, on FAIL OPEN (laisse
// passer + log). Mieux qu'un site totalement bloqué si Redis tombe.
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /// Secondes avant que le caller puisse réessayer (uniquement si !ok).
  retryAfterSec: number;
}

export interface RateLimitStore {
  /// Enregistre un événement à `now` ms et retourne le nombre
  /// d'événements dans la fenêtre [now - windowMs, now].
  recordAndCount(
    key: string,
    now: number,
    windowMs: number,
  ): Promise<number>;
  /// Vide une clé (ex : reset après login réussi).
  reset(key: string): Promise<void>;
}

// ── Implémentation in-memory (fallback dev / tests) ──────────────────────
//
// Une seule Map globale, attachée à globalThis pour survivre aux hot
// reloads de Next.js dev (sinon on reset le rate limit à chaque save).

interface MemoryRecord {
  timestamps: number[];
}

const globalForRl = globalThis as unknown as {
  __hadarRateLimit?: Map<string, MemoryRecord>;
};

const store = (globalForRl.__hadarRateLimit ??= new Map());

class MemoryStore implements RateLimitStore {
  async recordAndCount(
    key: string,
    now: number,
    windowMs: number,
  ): Promise<number> {
    const cutoff = now - windowMs;
    const rec = store.get(key) ?? { timestamps: [] };
    // Purge les timestamps trop vieux.
    rec.timestamps = rec.timestamps.filter((t: number) => t > cutoff);
    rec.timestamps.push(now);
    store.set(key, rec);
    return rec.timestamps.length;
  }

  async reset(key: string): Promise<void> {
    store.delete(key);
  }
}

let activeStore: RateLimitStore = new MemoryStore();

/// Permet aux tests d'injecter un store différent (ex : un mock qui
/// throw pour tester le fail-open).
export function _setStoreForTest(s: RateLimitStore) {
  activeStore = s;
}

export function _resetStoreForTest() {
  activeStore = new MemoryStore();
  store.clear();
}

// ── API publique ──────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /// Identifiant unique de la limite (ex : `signup:ip:1.2.3.4`).
  /// Composer namespace + scope + valeur côté caller.
  key: string;
  /// Nombre maximal d'événements autorisés dans la fenêtre.
  max: number;
  /// Largeur de la fenêtre en millisecondes.
  windowMs: number;
}

/// Vérifie ET enregistre un nouvel événement pour la clé donnée.
/// Si la nouvelle valeur dépasse `max`, retourne ok:false avec un
/// retryAfterSec calculé d'après le timestamp le plus ancien.
export async function checkRateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  let count: number;
  try {
    count = await activeStore.recordAndCount(opts.key, now, opts.windowMs);
  } catch (e) {
    // FAIL OPEN — un Redis qui tombe ne doit pas bloquer le site.
    // eslint-disable-next-line no-console
    console.warn('[rate-limit] Store error, fail-open:', e);
    return { ok: true, remaining: opts.max, retryAfterSec: 0 };
  }

  if (count > opts.max) {
    // Pour calculer retryAfter : sec restantes jusqu'à ce que le
    // plus vieil event sorte de la fenêtre. Approximation : windowMs.
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil(opts.windowMs / 1000),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, opts.max - count),
    retryAfterSec: 0,
  };
}

/// Reset une clé (ex : après login réussi pour effacer le compteur
/// d'échecs).
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await activeStore.reset(key);
  } catch {
    /* ignore */
  }
}

// ── Limites pré-configurées ──────────────────────────────────────────────
//
// Centralisées ici pour qu'on les revoie d'un coup d'œil en cas
// d'attaque. Toutes en MS.

export const RATE_LIMITS = {
  /// Signup : 3 par IP / heure → empêche le bot-flood.
  SIGNUP_PER_IP: { max: 3, windowMs: 60 * 60 * 1000 },
  /// Login : 5 par IP / 15 min ET 5 par email / 15 min.
  LOGIN_PER_IP: { max: 5, windowMs: 15 * 60 * 1000 },
  LOGIN_PER_ACCOUNT: { max: 5, windowMs: 15 * 60 * 1000 },
  /// Reset password : 3 par email / heure.
  PASSWORD_RESET: { max: 3, windowMs: 60 * 60 * 1000 },
  /// Recherche publique : 60/min/user, 300/min/IP.
  SEARCH_PER_USER: { max: 60, windowMs: 60 * 1000 },
  SEARCH_PER_IP: { max: 300, windowMs: 60 * 1000 },
  /// Soumission signalement : 10/jour/user (anti-flood).
  REPORT_SUBMISSION: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
  /// OTP SMS : 5 envois / heure / téléphone.
  OTP_SEND: { max: 5, windowMs: 60 * 60 * 1000 },
} as const;

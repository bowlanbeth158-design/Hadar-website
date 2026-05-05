// Contributor tier system — single source of truth shared between
// the user-facing BadgesCriteriaModal (shows the user where they
// stand) and the admin StarManagementTab (lets the admin shift the
// thresholds so the whole system rebalances).
//
// Each tier maps a user's `publishedContributions` count to a star
// rating (0-5) and a label name. The admin only edits the *min*
// threshold of each tier; the *max* of every tier except the last
// is automatically the next tier's min minus one.
//
// Defaults (from the owner's validated copy):
//   0★ Visiteur            → 0 contribution
//   1★ Nouveau membre      → 1-3
//   2★ Membre actif        → 4-6
//   3★ Contributeur régulier → 7-11
//   4★ Contributeur avancé → 12-16
//   5★ Contributeur expert → 17+
//
// Admin overrides persist in localStorage under TIER_OVERRIDES_KEY
// and are applied on top of these defaults at read time.

export const TIER_OVERRIDES_KEY = 'hadar:admin:tierThresholds';

export type TierKey =
  | 'visiteur'
  | 'nouveau'
  | 'actif'
  | 'regulier'
  | 'avance'
  | 'expert';

export type Tier = {
  key: TierKey;
  // Number of stars displayed under the user's name (0-5).
  stars: number;
  // i18n key for the label ("Visiteur", "Nouveau membre", ...)
  labelKey: string;
  // Default minimum publishedContributions count to enter this tier.
  defaultMin: number;
};

// Order matters — tiers are evaluated top-to-bottom; the first tier
// whose min ≤ contributions wins (we walk from highest to lowest).
export const TIERS: readonly Tier[] = [
  { key: 'visiteur', stars: 0, labelKey: 'tier.visiteur',  defaultMin: 0  },
  { key: 'nouveau',  stars: 1, labelKey: 'tier.nouveau',   defaultMin: 1  },
  { key: 'actif',    stars: 2, labelKey: 'tier.actif',     defaultMin: 4  },
  { key: 'regulier', stars: 3, labelKey: 'tier.regulier',  defaultMin: 7  },
  { key: 'avance',   stars: 4, labelKey: 'tier.avance',    defaultMin: 12 },
  { key: 'expert',   stars: 5, labelKey: 'tier.expert',    defaultMin: 17 },
] as const;

export type TierThresholds = Record<TierKey, number>;

export const DEFAULT_THRESHOLDS: TierThresholds = TIERS.reduce(
  (acc, t) => {
    acc[t.key] = t.defaultMin;
    return acc;
  },
  {} as TierThresholds,
);

// Read the admin-edited thresholds from localStorage, falling back
// to defaults for any tier the admin hasn't touched.
export function readThresholds(): TierThresholds {
  if (typeof window === 'undefined') return { ...DEFAULT_THRESHOLDS };
  try {
    const raw = window.localStorage.getItem(TIER_OVERRIDES_KEY);
    if (!raw) return { ...DEFAULT_THRESHOLDS };
    const parsed = JSON.parse(raw) as Partial<TierThresholds>;
    return { ...DEFAULT_THRESHOLDS, ...parsed };
  } catch {
    return { ...DEFAULT_THRESHOLDS };
  }
}

export function writeThresholds(t: TierThresholds): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TIER_OVERRIDES_KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

// Resolve the tier for a given count of published contributions
// using the current (possibly admin-overridden) thresholds.
export function tierFromCount(count: number, t?: TierThresholds): Tier {
  const thr = t ?? readThresholds();
  // Walk highest → lowest tier; first one whose min fits wins.
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i]!;
    if (count >= thr[tier.key]) return tier;
  }
  return TIERS[0]!;
}

// Resolve the [min, max] range for a tier given the current
// thresholds. The last tier returns max = undefined.
export function tierRange(
  tier: Tier,
  t?: TierThresholds,
): { min: number; max: number | undefined } {
  const thr = t ?? readThresholds();
  const idx = TIERS.findIndex((x) => x.key === tier.key);
  const next = TIERS[idx + 1];
  return {
    min: thr[tier.key],
    max: next ? thr[next.key] - 1 : undefined,
  };
}

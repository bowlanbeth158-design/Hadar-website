'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import {
  TIERS,
  DEFAULT_THRESHOLDS,
  readThresholds,
  writeThresholds,
  type Tier,
  type TierKey,
  type TierThresholds,
} from '@/lib/contributorTiers';
import { useI18n } from '@/lib/i18n/provider';
import { appendAudit } from './VerificationRequestsTab';

// Tab body for /admin/utilisateurs → "Étoiles". Owner reframed this
// to manage per-tier thresholds instead of per-user star counts:
// the admin sees the 6 contributor levels with their min/max
// publishedContributions ranges and can shift the min thresholds.
// The 0★ "Visiteur" tier is fixed at 0 and not editable.
//
// Saved thresholds flow through to BadgesCriteriaModal (and thus
// every public profile) instantly because both surfaces read from
// the same lib/contributorTiers source. Each save appends an entry
// to the shared audit log.

// Per-tier visual config so the admin row matches the user-facing
// modal (same colour codes for the same tier).
const TIER_STYLE: Record<TierKey, { dot: string; pill: string }> = {
  visiteur: { dot: 'bg-gray-400',     pill: 'text-gray-700 bg-gray-100'      },
  nouveau:  { dot: 'bg-brand-blue',   pill: 'text-brand-navy bg-brand-sky'   },
  actif:    { dot: 'bg-sky-500',      pill: 'text-sky-700 bg-sky-100'        },
  regulier: { dot: 'bg-yellow-500',   pill: 'text-yellow-700 bg-yellow-100'  },
  avance:   { dot: 'bg-orange-500',   pill: 'text-orange-700 bg-orange-100'  },
  expert:   { dot: 'bg-violet-500',   pill: 'text-violet-700 bg-violet-100'  },
};

type Draft = TierThresholds;

export function StarManagementTab() {
  const { t } = useI18n();
  // savedThresholds = currently applied (matches localStorage)
  // draft           = what the admin is editing (uncommitted)
  const [savedThresholds, setSavedThresholds] = useState<TierThresholds>(DEFAULT_THRESHOLDS);
  const [draft, setDraft] = useState<Draft>(DEFAULT_THRESHOLDS);

  useEffect(() => {
    const t = readThresholds();
    setSavedThresholds(t);
    setDraft(t);
  }, []);

  // A draft is dirty if any tier's min differs from the saved one.
  const isDirty = useMemo(
    () => TIERS.some((tier) => draft[tier.key] !== savedThresholds[tier.key]),
    [draft, savedThresholds],
  );

  // Validation: thresholds must be strictly increasing, every value
  // must be ≥ 0, and tier 0 (Visiteur) must stay at 0.
  const errors = useMemo(() => {
    const out: Partial<Record<TierKey, string>> = {};
    if (draft.visiteur !== 0) {
      out.visiteur = t('admin.stars.error.visiteurFixed');
    }
    for (let i = 1; i < TIERS.length; i++) {
      const tier = TIERS[i]!;
      const prev = TIERS[i - 1]!;
      const v = draft[tier.key];
      if (!Number.isFinite(v) || v < 0) {
        out[tier.key] = t('admin.stars.error.invalidNumber');
      } else if (v <= draft[prev.key]) {
        out[tier.key] = t('admin.stars.error.notIncreasing', {
          prev: t(prev.labelKey),
          prevMin: draft[prev.key],
        });
      }
    }
    return out;
  }, [draft, t]);

  const hasErrors = Object.keys(errors).length > 0;

  const setMin = (key: TierKey, value: number) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    if (hasErrors) return;
    writeThresholds(draft);
    setSavedThresholds(draft);
    // Audit one entry per changed tier so each row is searchable.
    const ts = new Date().toLocaleString('fr-FR');
    TIERS.forEach((tier) => {
      const before = savedThresholds[tier.key];
      const after = draft[tier.key];
      if (before !== after) {
        appendAudit({
          ts,
          scope: 'star',
          action: 'tier-threshold',
          targetUserId: tier.key,
          details: `${tier.key} min: ${before} → ${after}`,
        });
      }
    });
  };

  const resetDraft = () => setDraft(savedThresholds);

  const resetDefaults = () => setDraft(DEFAULT_THRESHOLDS);

  // Resolve [min, max] for a given tier in the draft state so the
  // preview reflects edits before save.
  const draftRange = (tier: Tier) => {
    const idx = TIERS.findIndex((x) => x.key === tier.key);
    const next = TIERS[idx + 1];
    return {
      min: draft[tier.key],
      max: next ? draft[next.key] - 1 : undefined,
    };
  };

  return (
    <div>
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-brand-navy">
            {t('admin.stars.tier.title')}
          </h3>
          <p className="mt-1 text-xs text-gray-500">{t('admin.stars.tier.subtitle')}</p>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">{t('admin.stars.tier.col.tier')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.tier.col.stars')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.tier.col.range')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.tier.col.min')}</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => {
              const v = TIER_STYLE[tier.key];
              const { min, max } = draftRange(tier);
              const err = errors[tier.key];
              const isVisiteur = tier.key === 'visiteur';
              return (
                <tr key={tier.key} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-pill px-2.5 py-1 text-xs font-semibold ${v.pill}`}
                    >
                      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
                      {t(tier.labelKey)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < tier.stars
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 tabular-nums">
                    {isVisiteur
                      ? t('tier.range.none')
                      : max === undefined
                        ? t('tier.range.plus', { n: min })
                        : t('tier.range.between', { min, max })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex flex-col gap-1">
                      <input
                        type="number"
                        min={0}
                        value={draft[tier.key]}
                        onChange={(e) => setMin(tier.key, Number.parseInt(e.target.value, 10) || 0)}
                        disabled={isVisiteur}
                        aria-invalid={!!err}
                        className={
                          err
                            ? 'w-24 rounded-lg border border-red-500 ring-2 ring-red-500/20 px-3 py-1.5 text-sm text-brand-navy focus:outline-none'
                            : 'w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-gray-50 disabled:text-gray-400'
                        }
                      />
                      {err && (
                        <span className="inline-flex items-start gap-1 text-[11px] text-red-600 max-w-[16rem]">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" aria-hidden />
                          {err}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            {isDirty
              ? t('admin.stars.tier.dirty')
              : t('admin.stars.tier.clean')}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-gray-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue px-4 py-1.5 text-sm font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t('admin.stars.tier.resetDefaults')}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              disabled={!isDirty}
              className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-gray-200 text-brand-navy enabled:hover:border-brand-blue enabled:hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {t('admin.stars.tier.cancel')}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!isDirty || hasErrors}
              className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy enabled:hover:bg-brand-blue text-white enabled:shadow-glow-navy disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-sm font-semibold transition-colors"
            >
              <Save className="h-4 w-4" aria-hidden />
              {t('admin.stars.tier.save')}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">{t('admin.stars.tier.note')}</p>
    </div>
  );
}

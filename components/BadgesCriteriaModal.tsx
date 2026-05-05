'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Award, Star, Trophy, Sprout, Sparkles, Users } from 'lucide-react';
import { TIERS, readThresholds, tierRange, type Tier, type TierKey } from '@/lib/contributorTiers';
import { useI18n } from '@/lib/i18n/provider';

// Visual config per tier — icon + colours. Labels and ranges come
// from the i18n layer + readThresholds() so admin edits flow through
// instantly and the whole modal stays localised.
const VIS: Record<TierKey, { Icon: typeof Award; iconColor: string; pillBg: string }> = {
  visiteur: { Icon: Sprout,    iconColor: 'text-gray-400',    pillBg: 'bg-gray-100 text-gray-600'    },
  nouveau:  { Icon: Sparkles,  iconColor: 'text-brand-blue',  pillBg: 'bg-brand-sky text-brand-navy' },
  actif:    { Icon: Users,     iconColor: 'text-sky-500',     pillBg: 'bg-sky-100 text-sky-700'      },
  regulier: { Icon: Star,      iconColor: 'text-yellow-500',  pillBg: 'bg-yellow-100 text-yellow-700'},
  avance:   { Icon: Award,     iconColor: 'text-orange-500',  pillBg: 'bg-orange-100 text-orange-700'},
  expert:   { Icon: Trophy,    iconColor: 'text-violet-500',  pillBg: 'bg-gradient-to-r from-violet-200 to-yellow-100 text-violet-700' },
};

export function BadgesCriteriaModal({
  trigger,
  highlightKey,
}: {
  trigger: React.ReactNode;
  highlightKey?: TierKey | string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Reading thresholds in render is fine — we only render after open.
  const thresholds = useMemo(() => readThresholds(), [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // Format the range as "1 à 3 contributions publiées" / "1 to 3 ..."
  // using i18n templates so the wording follows locale.
  const formatRange = (tier: Tier): string => {
    const { min, max } = tierRange(tier, thresholds);
    if (tier.key === 'visiteur') {
      // 0★ tier — "Aucune contribution publiée"
      return t('tier.range.none');
    }
    if (max === undefined) {
      // last tier — "17 contributions publiées et plus"
      return t('tier.range.plus', { n: min });
    }
    // middle tiers — "1 à 3 contributions publiées"
    return t('tier.range.between', { min, max });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="badges-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label={t('badgesModal.close')}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default animate-fade-in"
          />
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-glow-navy overflow-hidden animate-modal-pop">
            <div
              aria-hidden
              className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-sky"
            />
            <div className="p-6 md:p-7">
              <button
                type="button"
                aria-label={t('badgesModal.close')}
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy hover:rotate-90 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              <h2
                id="badges-modal-title"
                className="text-xl font-bold text-brand-navy flex items-center gap-2"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-navy via-brand-blue to-brand-sky shadow-glow-soft">
                  <Award className="h-4 w-4 text-white" aria-hidden />
                </span>
                {t('badgesModal.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t('badgesModal.subtitle')}</p>

              <ul className="mt-5 space-y-2">
                {TIERS.map((tier) => {
                  const isHighlighted = tier.key === highlightKey;
                  const v = VIS[tier.key];
                  return (
                    <li
                      key={tier.key}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        isHighlighted
                          ? 'border-brand-blue bg-brand-sky/30 shadow-glow-soft'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${v.pillBg}`}
                      >
                        <v.Icon className={`h-5 w-5 ${v.iconColor}`} aria-hidden />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-brand-navy inline-flex items-center gap-1.5">
                            {t(tier.labelKey)}
                            <span className="inline-flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < tier.stars
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  aria-hidden
                                />
                              ))}
                            </span>
                            {isHighlighted && (
                              <span className="ml-1 inline-flex items-center rounded-pill bg-brand-blue text-white px-2 py-0.5 text-[10px] font-semibold">
                                {t('badgesModal.you')}
                              </span>
                            )}
                          </p>
                          <span className="text-xs font-medium text-gray-500">
                            {formatRange(tier)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 text-xs text-gray-400 text-center">
                {t('badgesModal.note')}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

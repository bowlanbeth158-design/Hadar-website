'use client';

import { useEffect, useState } from 'react';
import { X, Award, Star, Trophy, Sprout, Sparkles } from 'lucide-react';

type Tier = {
  key: string;
  label: string;
  Icon: typeof Award;
  iconColor: string;
  pillBg: string;
  range: string;
  rule: string;
  stars: number;
};

const TIERS: Tier[] = [
  {
    key: 'visiteur',
    label: 'Visiteur',
    Icon: Sprout,
    iconColor: 'text-gray-400',
    pillBg: 'bg-gray-100 text-gray-600',
    range: '0 signalement',
    rule: 'Compte créé, pas encore de contribution.',
    stars: 0,
  },
  {
    key: 'nouveau',
    label: 'Nouveau membre',
    Icon: Sparkles,
    iconColor: 'text-brand-blue',
    pillBg: 'bg-brand-sky text-brand-navy',
    range: '1 à 4 signalements publiés',
    rule: 'Premier(s) signalement(s) validé(s) par la modération.',
    stars: 2,
  },
  {
    key: 'regulier',
    label: 'Contributeur régulier',
    Icon: Star,
    iconColor: 'text-yellow-500',
    pillBg: 'bg-yellow-100 text-yellow-700',
    range: '5 à 19 signalements publiés',
    rule: 'Au moins 80 % de taux de validation.',
    stars: 4,
  },
  {
    key: 'expert',
    label: 'Contributeur expert',
    Icon: Award,
    iconColor: 'text-orange-500',
    pillBg: 'bg-orange-100 text-orange-700',
    range: '20 à 49 signalements publiés',
    rule: 'Au moins 90 % de taux de validation et compte vérifié.',
    stars: 5,
  },
  {
    key: 'legende',
    label: 'Contributeur légende',
    Icon: Trophy,
    iconColor: 'text-violet-500',
    pillBg: 'bg-gradient-to-r from-violet-200 to-yellow-100 text-violet-700',
    range: '50 signalements publiés et plus',
    rule: 'Au moins 95 % de taux de validation et compte vérifié.',
    stars: 5,
  },
];

export function BadgesCriteriaModal({
  trigger,
  highlightKey,
}: {
  trigger: React.ReactNode;
  highlightKey?: string;
}) {
  const [open, setOpen] = useState(false);

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
            aria-label="Fermer"
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
                aria-label="Fermer"
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
                Niveaux de contributeur
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Plus vous signalez avec précision, plus votre niveau monte.
              </p>

              <ul className="mt-5 space-y-2">
                {TIERS.map((t) => {
                  const isHighlighted = t.key === highlightKey;
                  return (
                    <li
                      key={t.key}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        isHighlighted
                          ? 'border-brand-blue bg-brand-sky/30 shadow-glow-soft'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.pillBg}`}
                      >
                        <t.Icon className={`h-5 w-5 ${t.iconColor}`} aria-hidden />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-brand-navy inline-flex items-center gap-1.5">
                            {t.label}
                            <span className="inline-flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < t.stars
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  aria-hidden
                                />
                              ))}
                            </span>
                            {isHighlighted && (
                              <span className="ml-1 inline-flex items-center rounded-pill bg-brand-blue text-white px-2 py-0.5 text-[10px] font-semibold">
                                Vous
                              </span>
                            )}
                          </p>
                          <span className="text-xs font-medium text-gray-500">{t.range}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{t.rule}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 text-xs text-gray-400 text-center">
                Le taux de validation = signalements publiés ÷ signalements soumis.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

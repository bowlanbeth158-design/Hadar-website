'use client';

import { useEffect, useState } from 'react';
import { BellRing, X, Check } from 'lucide-react';

type Prefs = {
  email: boolean;
  push: boolean;
  weekly: boolean;
  instant: boolean;
};

const KEY = 'hadar:notif-prefs';
const DEFAULT_PREFS: Prefs = {
  email: true,
  push: true,
  weekly: false,
  instant: true,
};

const OPTIONS: { key: keyof Prefs; title: string; description: string }[] = [
  {
    key: 'instant',
    title: 'Notifications immédiates',
    description: 'Recevoir une alerte dès qu’un nouveau signalement concerne un contact surveillé.',
  },
  {
    key: 'email',
    title: 'Alertes par email',
    description: 'Recevoir les notifications importantes à votre adresse email.',
  },
  {
    key: 'push',
    title: 'Notifications push',
    description: 'Autoriser les notifications navigateur ou application mobile.',
  },
  {
    key: 'weekly',
    title: 'Résumé hebdomadaire',
    description: 'Un digest chaque lundi avec l’activité de la semaine sur vos contacts.',
  },
];

export function NotificationSettingsModal({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
    }
  }, []);

  // Re-open when the parent flips defaultOpen (e.g. when navigating to
  // /mes-alertes?settings=1 from the AlertsPopover).
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

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

  const toggle = (key: keyof Prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 ease-out"
      >
        <BellRing
          className="h-4 w-4 text-brand-blue group-hover:animate-siren-wiggle"
          aria-hidden
        />
        Gérer les notifications
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default animate-fade-in"
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-glow-navy overflow-hidden animate-modal-pop">
            {/* Decorative top gradient strip — brand cohesion */}
            <div
              aria-hidden
              className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-sky"
            />

            <div className="p-6 md:p-8">
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy hover:rotate-90 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              <h2
                id="notif-modal-title"
                className="text-xl font-bold text-brand-navy flex items-center gap-2"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-brand-navy via-brand-blue to-brand-sky shadow-glow-soft">
                  <BellRing className="h-4 w-4 text-white" aria-hidden />
                </span>
                Gérer mes notifications
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choisissez comment et quand Hadar vous alerte sur vos contacts surveillés.
              </p>

              <div className="mt-5 space-y-2 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {OPTIONS.map((opt) => {
                  const on = prefs[opt.key];
                  return (
                    <label
                      key={opt.key}
                      className="group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-brand-sky/30"
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        onClick={() => toggle(opt.key)}
                        className={`mt-0.5 relative inline-flex h-5 w-9 shrink-0 rounded-full transition-all duration-300 ease-out ${
                          on
                            ? 'bg-gradient-to-r from-brand-navy to-brand-blue shadow-glow-soft'
                            : 'bg-gray-200'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ease-out ${
                            on ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                      <div className="flex-1 transition-transform duration-200 group-hover:translate-x-0.5">
                        <p className="text-sm font-semibold text-brand-navy">{opt.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2 text-sm font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-5 py-2 text-sm font-semibold shadow-glow-blue hover:shadow-glow-navy hover:-translate-y-px transition-all duration-200 ease-out"
                >
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Enregistré
                    </>
                  ) : (
                    <>Enregistrer</>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-400 text-center">
                Les préférences sont sauvegardées localement. Synchronisation serveur à venir.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

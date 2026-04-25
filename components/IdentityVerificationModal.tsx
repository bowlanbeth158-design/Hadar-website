'use client';

import { useEffect, useState } from 'react';
import { X, IdCard, ScanFace, ShieldCheck, Sparkles, Loader2, Check } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

type Status = 'idle' | 'pending' | 'done';

export function IdentityVerificationModal({
  trigger,
  onVerified,
}: {
  trigger: React.ReactNode;
  onVerified?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

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
          aria-labelledby="ident-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default animate-fade-in"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-glow-navy overflow-hidden animate-modal-pop">
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

              <div className="flex items-center gap-2">
                <VerifiedBadge className="h-7 w-7" />
                <h2 id="ident-modal-title" className="text-xl font-bold text-brand-navy">
                  Vérifier mon identité
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Activez le badge bleu vérifié à côté de votre nom — c&apos;est{' '}
                <span className="font-semibold text-green-600">gratuit</span> et ça renforce la
                confiance dans vos signalements.
              </p>

              <ol className="mt-5 space-y-3">
                <Step
                  n={1}
                  Icon={IdCard}
                  title="Photo de votre CIN"
                  desc="Prenez en photo le recto et le verso de votre carte d’identité nationale."
                />
                <Step
                  n={2}
                  Icon={ScanFace}
                  title="Reconnaissance faciale (Face ID)"
                  desc="Une courte vidéo selfie pour confirmer que c’est bien vous. Aucune donnée biométrique n’est conservée."
                />
                <Step
                  n={3}
                  Icon={ShieldCheck}
                  title="Vérification sous 24 h"
                  desc="Notre équipe valide manuellement votre dossier puis active votre badge."
                />
              </ol>

              <div className="mt-5 rounded-xl bg-brand-sky/40 border border-brand-sky p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" aria-hidden />
                <p className="text-xs text-brand-navy">
                  Votre CIN n&apos;est jamais publiée. Elle sert uniquement à confirmer votre
                  identité, puis est chiffrée et accessible uniquement à notre équipe de
                  vérification.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={status === 'pending'}
                  className="rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Plus tard
                </button>
                <button
                  type="button"
                  disabled={status !== 'idle'}
                  onClick={() => {
                    setStatus('pending');
                    // Simulated verification — replace with real API call
                    setTimeout(() => {
                      setStatus('done');
                      onVerified?.();
                      setTimeout(() => {
                        setOpen(false);
                        setStatus('idle');
                      }, 900);
                    }, 1200);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-5 py-2 text-sm font-semibold shadow-glow-blue hover:shadow-glow-navy hover:-translate-y-px transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                >
                  {status === 'pending' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Vérification…
                    </>
                  )}
                  {status === 'done' && (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Vérifié !
                    </>
                  )}
                  {status === 'idle' && (
                    <>
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      Démarrer — gratuit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({
  n,
  Icon,
  title,
  desc,
}: {
  n: number;
  Icon: typeof IdCard;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-navy to-brand-blue text-white shadow-glow-soft">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-[10px] font-bold text-brand-navy flex items-center justify-center shadow">
          {n}
        </span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-navy">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

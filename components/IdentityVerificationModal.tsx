'use client';

import { useEffect, useState } from 'react';
import { X, IdCard, ScanFace, ShieldCheck, Sparkles, Loader2, Check } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { useI18n } from '@/lib/i18n/provider';

type Status = 'idle' | 'pending' | 'done';

export function IdentityVerificationModal({
  trigger,
  onVerified,
}: {
  trigger: React.ReactNode;
  onVerified?: () => void;
}) {
  const { t } = useI18n();
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

  // Build the intro paragraph from the translation by splitting on
  // the {free} placeholder, so the green-highlighted "gratuit"
  // word stays styled across all 3 locales.
  const introTemplate = t('profile.identity.modal.intro');
  const [introBefore, introAfter] = introTemplate.split('{free}');

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
            aria-label={t('profile.identity.modal.close')}
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
                aria-label={t('profile.identity.modal.close')}
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy hover:rotate-90 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              <div className="flex items-center gap-2">
                <VerifiedBadge className="h-7 w-7" />
                <h2 id="ident-modal-title" className="text-xl font-bold text-brand-navy">
                  {t('profile.identity.modal.title')}
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {introBefore}
                <span className="font-semibold text-green-600">
                  {t('profile.identity.modal.intro.free')}
                </span>
                {introAfter}
              </p>

              <ol className="mt-5 space-y-3">
                <Step
                  n={1}
                  Icon={IdCard}
                  title={t('profile.identity.modal.step1.title')}
                  desc={t('profile.identity.modal.step1.desc')}
                />
                <Step
                  n={2}
                  Icon={ScanFace}
                  title={t('profile.identity.modal.step2.title')}
                  desc={t('profile.identity.modal.step2.desc')}
                />
                <Step
                  n={3}
                  Icon={ShieldCheck}
                  title={t('profile.identity.modal.step3.title')}
                  desc={t('profile.identity.modal.step3.desc')}
                />
              </ol>

              <div className="mt-5 rounded-xl bg-brand-sky/40 border border-brand-sky p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" aria-hidden />
                <p className="text-xs text-brand-navy">
                  {t('profile.identity.modal.privacy')}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={status === 'pending'}
                  className="rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t('profile.identity.modal.later')}
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
                      {t('profile.identity.modal.pending')}
                    </>
                  )}
                  {status === 'done' && (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      {t('profile.identity.modal.done')}
                    </>
                  )}
                  {status === 'idle' && (
                    <>
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      {t('profile.identity.modal.start')}
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

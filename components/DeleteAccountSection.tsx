'use client';

import { useEffect, useState } from 'react';
import { Trash2, X, HeartCrack, Heart, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Status = 'idle' | 'ask' | 'deleting' | 'deleted' | 'happy';

export function DeleteAccountSection() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>('idle');
  const open = status !== 'idle';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'ask') setStatus('idle');
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, status]);

  const startDelete = () => {
    setStatus('deleting');
    setTimeout(() => setStatus('deleted'), 1500);
  };

  const stay = () => {
    setStatus('happy');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <>
      <section className="mt-6 rounded-2xl bg-red-50 border border-red-100 p-6 shadow-glow-red">
        <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5" aria-hidden />
          {t('profile.dangerZone.title')}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t('profile.dangerZone.body')}</p>
        <button
          type="button"
          onClick={() => setStatus('ask')}
          className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-red hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t('profile.dangerZone.cta')}
        </button>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label={t('profile.dangerZone.close')}
            onClick={() => status === 'ask' && setStatus('idle')}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default animate-fade-in"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-glow-navy overflow-hidden animate-modal-pop">
            <div
              aria-hidden
              className={`h-1.5 w-full bg-gradient-to-r ${
                status === 'happy'
                  ? 'from-green-500 via-emerald-500 to-green-600'
                  : status === 'ask'
                    ? 'from-orange-500 via-red-500 to-red-700'
                    : 'from-red-500 via-red-600 to-red-700'
              }`}
            />

            {/* CLOSE button only available before any decision */}
            {status === 'ask' && (
              <button
                type="button"
                aria-label={t('profile.dangerZone.close')}
                onClick={() => setStatus('idle')}
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy hover:rotate-90 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}

            <div className="p-6 md:p-7 text-center">
              {status === 'ask' && <AskState onStay={stay} onDelete={startDelete} t={t} />}
              {status === 'deleting' && <DeletingState t={t} />}
              {status === 'deleted' && <DeletedState t={t} />}
              {status === 'happy' && <HappyState t={t} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type T = (key: string) => string;

function AskState({ onStay, onDelete, t }: { onStay: () => void; onDelete: () => void; t: T }) {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <HeartCrack className="h-8 w-8 text-red-500 animate-siren-wiggle" aria-hidden />
      </div>
      <h3 id="delete-modal-title" className="text-xl font-bold text-brand-navy">
        {t('profile.dangerZone.ask.title')}
      </h3>
      <p className="mt-2 text-sm text-gray-600">{t('profile.dangerZone.ask.body')}</p>
      <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-white border border-red-200 text-red-500 px-5 py-2.5 text-sm font-semibold hover:bg-red-50 hover:-translate-y-px transition-all duration-200"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t('profile.dangerZone.ask.confirmDelete')}
        </button>
        <button
          type="button"
          onClick={onStay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-glow-green hover:shadow-lg hover:-translate-y-px transition-all duration-200"
        >
          <Heart className="h-4 w-4 fill-white" aria-hidden />
          {t('profile.dangerZone.ask.stay')}
        </button>
      </div>
    </>
  );
}

function DeletingState({ t }: { t: T }) {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <HeartCrack className="h-8 w-8 text-red-500 animate-siren-wiggle" aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-brand-navy inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-red-500" aria-hidden />
        {t('profile.dangerZone.deleting.title')}
      </h3>
      <p className="mt-2 text-sm text-gray-500">{t('profile.dangerZone.deleting.body')}</p>
    </>
  );
}

function DeletedState({ t }: { t: T }) {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 border border-red-200 animate-fade-in">
        <HeartCrack className="h-9 w-9 text-red-600" aria-hidden />
      </div>
      <h3 className="text-xl font-bold text-brand-navy">{t('profile.dangerZone.deleted.title')}</h3>
      <p className="mt-2 text-sm text-gray-600">{t('profile.dangerZone.deleted.body')}</p>
      <a
        href="/"
        className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('profile.dangerZone.deleted.backHome')}
      </a>
    </>
  );
}

function HappyState({ t }: { t: T }) {
  return (
    <div className="relative">
      {/* Floating sparkles */}
      <Sparkles
        className="pointer-events-none absolute top-2 left-6 h-4 w-4 text-yellow-400 animate-sparkle-pop"
        aria-hidden
      />
      <Sparkles
        className="pointer-events-none absolute top-4 right-6 h-5 w-5 text-brand-blue animate-sparkle-pop"
        style={{ animationDelay: '300ms' }}
        aria-hidden
      />
      <Sparkles
        className="pointer-events-none absolute bottom-2 left-12 h-3 w-3 text-green-500 animate-sparkle-pop"
        style={{ animationDelay: '600ms' }}
        aria-hidden
      />

      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-glow-green animate-modal-pop">
        <Heart className="h-9 w-9 text-white fill-white animate-siren-wiggle" aria-hidden />
      </div>
      <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        {t('profile.dangerZone.happy.title')}
      </h3>
      <p className="mt-2 text-sm text-gray-600">{t('profile.dangerZone.happy.body')}</p>
    </div>
  );
}

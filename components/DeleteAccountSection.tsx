'use client';

import { useEffect, useState } from 'react';
import { Trash2, X, HeartCrack, Heart, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

type Status = 'idle' | 'ask' | 'deleting' | 'deleted' | 'happy';

export function DeleteAccountSection() {
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
          Zone dangereuse
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          La suppression de votre compte est irréversible après 30 jours. Les signalements
          publiés seront conservés en mode anonyme.
        </p>
        <button
          type="button"
          onClick={() => setStatus('ask')}
          className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-red hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Supprimer mon compte
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
            aria-label="Fermer"
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
                aria-label="Fermer"
                onClick={() => setStatus('idle')}
                className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy hover:rotate-90 transition-all duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}

            <div className="p-6 md:p-7 text-center">
              {status === 'ask' && <AskState onStay={stay} onDelete={startDelete} />}
              {status === 'deleting' && <DeletingState />}
              {status === 'deleted' && <DeletedState />}
              {status === 'happy' && <HappyState />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AskState({ onStay, onDelete }: { onStay: () => void; onDelete: () => void }) {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <HeartCrack className="h-8 w-8 text-red-500 animate-siren-wiggle" aria-hidden />
      </div>
      <h3 id="delete-modal-title" className="text-xl font-bold text-brand-navy">
        Nous sommes tristes de vous voir partir 💔
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Êtes-vous sûr de vouloir supprimer votre compte ? Vos signalements publiés resteront
        anonymes pour protéger la communauté, mais votre profil disparaîtra sous 30 jours.
      </p>
      <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-white border border-red-200 text-red-500 px-5 py-2.5 text-sm font-semibold hover:bg-red-50 hover:-translate-y-px transition-all duration-200"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Oui, supprimer
        </button>
        <button
          type="button"
          onClick={onStay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-pill bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 text-sm font-bold shadow-glow-green hover:shadow-lg hover:-translate-y-px transition-all duration-200"
        >
          <Heart className="h-4 w-4 fill-white" aria-hidden />
          Non, je reste !
        </button>
      </div>
    </>
  );
}

function DeletingState() {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <HeartCrack className="h-8 w-8 text-red-500 animate-siren-wiggle" aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-brand-navy inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-red-500" aria-hidden />
        Suppression en cours…
      </h3>
      <p className="mt-2 text-sm text-gray-500">Nous traitons votre demande.</p>
    </>
  );
}

function DeletedState() {
  return (
    <>
      <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 border border-red-200 animate-fade-in">
        <HeartCrack className="h-9 w-9 text-red-600" aria-hidden />
      </div>
      <h3 className="text-xl font-bold text-brand-navy">Au revoir 😢</h3>
      <p className="mt-2 text-sm text-gray-600">
        Votre compte sera définitivement supprimé sous 30 jours. Vous pouvez encore changer
        d&apos;avis en vous reconnectant pendant cette période.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour à l&apos;accueil
      </a>
    </>
  );
}

function HappyState() {
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
        Merci de rester avec nous ! 💚
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Votre vigilance protège la communauté. À tout de suite.
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { UserRound, X } from 'lucide-react';
import { Logo } from './Logo';
import { LoginFormContent } from './LoginFormContent';

export function LoginButton() {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-4 py-1.5 text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
      >
        <UserRound className="h-4 w-4" aria-hidden />
        Se connecter
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label="Fermer la fenêtre de connexion"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-8 animate-in fade-in zoom-in-95">
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand-navy flex items-center justify-center"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <div className="flex justify-center mb-6">
              <Logo size="md" />
            </div>
            <h2
              id="login-modal-title"
              className="text-2xl font-bold text-brand-navy text-center mb-2"
            >
              Se connecter
            </h2>
            <div className="mt-6">
              <LoginFormContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

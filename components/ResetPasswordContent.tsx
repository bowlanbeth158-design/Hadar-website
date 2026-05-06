'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { apiCall, ApiClientError } from '@/lib/api/client';

export function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    !!token &&
    newPassword.length >= 12 &&
    newPassword === confirm &&
    !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiCall('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: { token, newPassword },
      });
      setDone(true);
      setTimeout(() => router.push('/connexion'), 2500);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.userMessage
          : 'Réinitialisation impossible.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-3 text-sm font-semibold text-red-700">Lien invalide.</p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-4 inline-flex text-sm text-brand-blue hover:underline"
        >
          Refaire une demande
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <p className="text-sm font-semibold text-green-700">
          Mot de passe réinitialisé.
        </p>
        <p className="text-xs text-gray-500">
          Redirection vers la connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-brand-navy text-center mb-2">
        Choisir un nouveau mot de passe
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        12 caractères minimum, avec lettres, chiffres et symboles.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="np" className="block text-xs font-semibold text-brand-navy mb-1">
            Nouveau mot de passe
          </label>
          <input
            id="np"
            type="password"
            required
            minLength={12}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label htmlFor="cp" className="block text-xs font-semibold text-brand-navy mb-1">
            Confirmer
          </label>
          <input
            id="cp"
            type="password"
            required
            minLength={12}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
          />
          {confirm && newPassword !== confirm && (
            <p className="mt-1 text-[11px] text-red-600">Les mots de passe ne correspondent pas.</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            'Réinitialiser'
          )}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import { apiCall, ApiClientError } from '@/lib/api/client';

// Body + footer of /mot-de-passe-oublie pulled into client components
// so they can call useI18n(); the page itself stays a server component
// to keep its metadata export.
export function ForgotPasswordContent() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiCall('/api/auth/password-reset/request', {
        method: 'POST',
        body: { email: email.trim() },
      });
      // L'API renvoie toujours 200 OK même si l'email n'existe pas
      // (anti-énumération). On affiche un message de confirmation
      // générique dans tous les cas.
      setDone(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.userMessage);
      } else {
        setError(t('auth.forgot.errorGeneric'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm text-brand-navy font-semibold">{t('auth.forgot.successTitle')}</p>
        <p className="text-xs text-gray-500">{t('auth.forgot.successBody')}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 text-center mb-6">{t('auth.forgot.intro')}</p>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-brand-navy mb-1">
            {t('auth.email.label')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email.placeholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.forgot.submitting')}
            </>
          ) : (
            t('auth.forgot.submit')
          )}
        </button>
      </form>
    </>
  );
}

export function ForgotPasswordFooter() {
  const { t } = useI18n();
  return (
    <Link href="/connexion" className="text-brand-blue font-semibold hover:underline">
      {t('auth.forgot.backToLogin')}
    </Link>
  );
}

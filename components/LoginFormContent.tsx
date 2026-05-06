'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useI18n } from '@/lib/i18n/provider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ApiClientError } from '@/lib/api/client';

type Props = {
  onNavigate?: () => void;
};

export function LoginFormContent({ onNavigate }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await login({
        email: email.trim(),
        password,
        totpCode: needsTotp ? totpCode.trim() : undefined,
      });
      if (r.mfaRequired) {
        setNeedsTotp(true);
        return;
      }
      router.push('/mon-profil');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.userMessage);
      } else {
        setError(t('auth.login.errorGeneric'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 rounded-pill bg-green-100 text-green-700 px-3 py-1.5 text-xs font-medium mb-6">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {t('auth.login.trustPill')}
      </div>

      <button
        type="button"
        disabled
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="h-4 w-4" />
        {t('auth.login.continueWithGoogle')}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        {t('auth.or')}
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-brand-navy mb-1">
            {t('auth.email.label')}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email.placeholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-brand-navy mb-1"
          >
            {t('auth.password.label')}
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.passwordPlaceholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {needsTotp && (
          <div>
            <label
              htmlFor="login-totp"
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy mb-1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" aria-hidden />
              {t('auth.login.totpLabel')}
            </label>
            <input
              id="login-totp"
              name="totpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy tracking-widest font-mono placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
              autoFocus
            />
            <p className="mt-1 text-[11px] text-gray-500">{t('auth.login.totpHint')}</p>
          </div>
        )}

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
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.login.submitting')}
            </>
          ) : (
            t('auth.login.submit')
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-500">
          {t('auth.login.notRegistered')}{' '}
          <Link
            href="/inscription"
            onClick={onNavigate}
            className="text-brand-blue font-semibold hover:underline"
          >
            {t('auth.login.signupLink')}
          </Link>
        </p>
        <Link
          href="/mot-de-passe-oublie"
          onClick={onNavigate}
          className="mt-2 inline-block text-xs text-gray-500 hover:text-brand-navy"
        >
          {t('auth.login.forgotPassword')}
        </Link>
      </div>
    </>
  );
}

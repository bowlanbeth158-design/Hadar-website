'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useI18n } from '@/lib/i18n/provider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ApiClientError } from '@/lib/api/client';

// Body of /inscription pulled into a client component so it can use
// the i18n provider (the page itself stays a Server Component for
// the metadata export).
export function SignupFormContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 12 &&
    accept &&
    !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await signup({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        locale,
      });
      router.push('/mon-profil');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.userMessage);
      } else {
        setError(t('auth.signup.errorGeneric'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="h-4 w-4" />
        {t('auth.signup.googleButton')}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        {t('auth.or')}
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold text-brand-navy mb-1">
              {t('auth.signup.firstName')}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-semibold text-brand-navy mb-1">
              {t('auth.signup.lastName')}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

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

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-brand-navy mb-1">
            {t('auth.password.label')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.signup.passwordPlaceholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
          <p className="mt-1 text-[11px] text-gray-500">
            {t('auth.password.hint')}
          </p>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            id="accept"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="accept">
            {t('auth.signup.acceptIntro')}{' '}
            <Link href="/conditions-generales" className="text-brand-blue hover:underline">
              {t('auth.signup.acceptTerms')}
            </Link>{' '}
            {t('auth.signup.acceptAnd')}{' '}
            <Link href="/politique-confidentialite" className="text-brand-blue hover:underline">
              {t('auth.signup.acceptPrivacy')}
            </Link>
            .
          </label>
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
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue hover:bg-brand-navy disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('auth.signup.submitting')}
            </>
          ) : (
            t('auth.signup.submit')
          )}
        </button>
      </form>
    </>
  );
}

// Small client wrapper used by the inscription page footer so the
// "Already have an account? Sign in" line can also be translated.
export function SignupFormFooter() {
  const { t } = useI18n();
  return (
    <p className="text-gray-500">
      {t('auth.signup.alreadyAccount')}{' '}
      <Link href="/connexion" className="text-brand-blue font-semibold hover:underline">
        {t('auth.signup.loginLink')}
      </Link>
    </p>
  );
}

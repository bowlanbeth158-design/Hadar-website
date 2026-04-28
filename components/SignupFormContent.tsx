'use client';

import Link from 'next/link';
import { GoogleIcon } from './GoogleIcon';
import { useI18n } from '@/lib/i18n/provider';

// Body of /inscription pulled into a client component so it can use
// the i18n provider (the page itself stays a Server Component for
// the metadata export).
export function SignupFormContent() {
  const { t } = useI18n();
  return (
    <>
      <button
        type="button"
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2"
      >
        <GoogleIcon className="h-4 w-4" />
        {t('auth.signup.googleButton')}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        {t('auth.or')}
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold text-brand-navy mb-1">
              {t('auth.signup.firstName')}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
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
            placeholder={t('auth.signup.passwordPlaceholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" id="accept" className="mt-1" />
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

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t('auth.signup.submit')}
        </button>

        <p className="text-xs text-gray-400 text-center">{t('auth.signup.disabled')}</p>
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

'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/provider';

// Body + footer of /mot-de-passe-oublie pulled into client components
// so they can call useI18n(); the page itself stays a server component
// to keep its metadata export.
export function ForgotPasswordContent() {
  const { t } = useI18n();
  return (
    <>
      <p className="text-sm text-gray-500 text-center mb-6">{t('auth.forgot.intro')}</p>

      <form className="space-y-4">
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

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t('auth.forgot.submit')}
        </button>

        <p className="text-xs text-gray-400 text-center">{t('auth.forgot.disabled')}</p>
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

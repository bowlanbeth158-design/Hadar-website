'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  onNavigate?: () => void;
};

export function LoginFormContent({ onNavigate }: Props) {
  const { t } = useI18n();
  return (
    <>
      <div className="flex items-center justify-center gap-2 rounded-pill bg-green-100 text-green-700 px-3 py-1.5 text-xs font-medium mb-6">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {t('auth.login.trustPill')}
      </div>

      <button
        type="button"
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2"
      >
        <GoogleIcon className="h-4 w-4" />
        {t('auth.login.continueWithGoogle')}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        {t('auth.or')}
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-brand-navy mb-1">
            {t('auth.email.label')}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
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
            placeholder={t('auth.login.passwordPlaceholder')}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t('auth.login.submit')}
        </button>

        <p className="text-xs text-gray-400 text-center">{t('auth.login.disabled')}</p>
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

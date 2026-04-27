'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  // Either a literal title (legacy) OR an i18n key. titleKey wins
  // when both are passed so callers can migrate one page at a time.
  title?: string;
  titleKey?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, titleKey, children, footer }: Props) {
  const { t } = useI18n();
  const resolvedTitle = titleKey ? t(titleKey) : (title ?? '');
  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-glow-navy p-8">
        <Link href="/" className="flex justify-center mb-6" aria-label={t('auth.aria.home')}>
          <Logo size="md" />
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy text-center mb-2">{resolvedTitle}</h1>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-center gap-3 text-xs text-gray-400">
          <Link href="/conditions-generales" className="hover:text-brand-navy">
            {t('auth.legal.terms')}
          </Link>
          <span>·</span>
          <Link href="/politique-confidentialite" className="hover:text-brand-navy">
            {t('auth.legal.privacy')}
          </Link>
          <span>·</span>
          <Link href="/donnees-personnelles-cookies" className="hover:text-brand-navy">
            {t('auth.legal.cookies')}
          </Link>
        </div>
      </div>
    </div>
  );
}

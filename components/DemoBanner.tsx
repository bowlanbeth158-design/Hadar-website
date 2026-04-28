'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-brand-blue/30 bg-brand-sky/50 px-4 py-3 text-sm text-brand-navy">
      <Info className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden />
      <p>
        <span className="font-semibold">{t('userPages.demoBanner.label')}</span>{' '}
        {t('userPages.demoBanner.body')}{' '}
        <Link href="/connexion" className="font-semibold underline hover:text-brand-blue">
          {t('userPages.demoBanner.cta')}
        </Link>
        .
      </p>
    </div>
  );
}

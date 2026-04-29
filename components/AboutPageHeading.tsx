'use client';

import { useI18n } from '@/lib/i18n/provider';

// Tiny client wrapper used by /qui-sommes-nous to render the H1
// through useI18n() while the page itself stays a server component
// for the metadata + markdown fetch.
export function AboutPageHeading() {
  const { t } = useI18n();
  return (
    <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent mb-6 md:mb-8">
      {t('aboutPage.title')}
    </h1>
  );
}

'use client';

import { useI18n } from '@/lib/i18n/provider';

// Tiny client wrapper used by /qui-sommes-nous to render the H1
// through useI18n() while the page itself stays a server component
// for the metadata + markdown fetch.
export function AboutPageHeading() {
  const { t } = useI18n();
  return (
    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-navy mb-8">
      {t('aboutPage.title')}
    </h1>
  );
}

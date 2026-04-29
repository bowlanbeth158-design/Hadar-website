'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  href?: string;
  // Either a literal label (legacy) OR an i18n key. labelKey wins
  // when both are passed.
  label?: string;
  labelKey?: string;
};

export function BackButton({ href = '/', label, labelKey }: Props) {
  const { t } = useI18n();
  // Default to the existing common.back key (already in the admin
  // translations) so every BackButton without explicit copy says
  // "Retour" / "Back" / "رجوع" depending on the active locale.
  const resolved = labelKey ? t(labelKey) : (label ?? t('common.back'));
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue hover:text-brand-blue transition-colors"
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
      {resolved}
    </Link>
  );
}

'use client';

import { useI18n } from '@/lib/i18n/provider';

type Props = {
  // Either a literal title (legacy) OR an i18n key. titleKey wins
  // when both are passed so callers can migrate one page at a time.
  title?: string;
  titleKey?: string;
  subtitle?: string;
  subtitleKey?: string;
  accent?: 'navy' | 'red' | 'gradient';
  align?: 'center' | 'left';
};

export function PageHeading({
  title,
  titleKey,
  subtitle,
  subtitleKey,
  accent = 'navy',
  align = 'center',
}: Props) {
  const { t } = useI18n();
  const resolvedTitle = titleKey ? t(titleKey) : (title ?? '');
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;

  const titleClass =
    accent === 'red'
      ? 'text-red-500'
      : accent === 'gradient'
        ? 'bg-grad-stat-navy bg-clip-text text-transparent'
        : 'text-brand-navy';
  const isLeft = align === 'left';
  return (
    <div className={`mb-10 md:mb-14 ${isLeft ? 'text-left' : 'text-center'}`}>
      <h1
        className={`text-3xl md:text-5xl font-bold tracking-tight ${titleClass}`}
      >
        {resolvedTitle}
      </h1>
      {resolvedSubtitle && (
        <p
          className={`mt-3 text-base md:text-lg text-gray-500 ${isLeft ? '' : 'max-w-2xl mx-auto'}`}
        >
          {resolvedSubtitle}
        </p>
      )}
    </div>
  );
}

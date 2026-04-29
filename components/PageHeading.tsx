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
  accent = 'gradient',
  align = 'center',
}: Props) {
  const { t } = useI18n();
  const resolvedTitle = titleKey ? t(titleKey) : (title ?? '');
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;

  const titleClass =
    accent === 'red'
      ? 'text-red-500'
      : accent === 'gradient'
        ? // Brand-vibrant gradient — same recipe as the home
          // banner H1 highlight (navy → brand-blue → sky-400)
          // so legal / info page titles read as part of the
          // same identity instead of a flat navy heading.
          'bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent'
        : 'text-brand-navy';
  const isLeft = align === 'left';
  // text-start is "left" in LTR and "right" in RTL — so the
  // /mes-alertes and /mes-signalements headings naturally land on
  // the right edge of the column when the user picks Arabic.
  return (
    <div className={`mb-8 md:mb-14 ${isLeft ? 'text-start' : 'text-center'}`}>
      <h1
        className={`text-2xl md:text-5xl font-bold tracking-tight ${titleClass}`}
      >
        {resolvedTitle}
      </h1>
      {resolvedSubtitle && (
        <p
          className={`mt-2 md:mt-3 text-sm md:text-lg text-gray-500 dark:bg-gradient-to-r dark:from-white dark:via-brand-sky dark:to-sky-400 dark:bg-clip-text dark:text-transparent ${isLeft ? '' : 'max-w-2xl mx-auto'}`}
        >
          {resolvedSubtitle}
        </p>
      )}
    </div>
  );
}

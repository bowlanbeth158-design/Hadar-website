'use client';

import { useI18n } from '@/lib/i18n/provider';

export type Period = 'today' | 'yesterday' | 'week' | 'month';

// Period i18n keys reuse the admin stats keys defined in messages.ts
// (period.today / .yesterday / .7d / .30d), so the same labels show
// up consistently across the admin dashboard and the public
// statistiques page.
const PERIODS: { id: Period; labelKey: string }[] = [
  { id: 'today',     labelKey: 'period.today' },
  { id: 'yesterday', labelKey: 'period.yesterday' },
  { id: 'week',      labelKey: 'period.7d' },
  { id: 'month',     labelKey: 'period.30d' },
];

type Props = {
  value: Period;
  onChange: (id: Period) => void;
};

export function StatsPeriodTabs({ value, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div
      role="tablist"
      aria-label={t('period.label')}
      className="flex flex-wrap justify-center gap-3 mb-8"
    >
      {PERIODS.map((p) => {
        const isActive = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.id)}
            className={
              isActive
                ? 'rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy scale-[1.03] transition-all'
                : 'rounded-pill bg-white/70 backdrop-blur-sm border border-white/80 text-brand-navy/70 px-5 py-2 text-sm font-medium hover:bg-white hover:text-brand-navy hover:-translate-y-0.5 hover:shadow-sm transition-all'
            }
          >
            {t(p.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

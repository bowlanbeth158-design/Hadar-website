'use client';

export type Period = 'today' | 'yesterday' | 'week' | 'month';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'today',     label: 'Aujourd’hui' },
  { id: 'yesterday', label: 'Hier' },
  { id: 'week',      label: 'Derniers 7 jours' },
  { id: 'month',     label: 'Derniers 30 jours' },
];

type Props = {
  value: Period;
  onChange: (id: Period) => void;
};

export function StatsPeriodTabs({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Période d'analyse"
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
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

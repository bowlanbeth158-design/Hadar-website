'use client';

import { useState } from 'react';

const DEFAULT_PERIODS = ['Aujourd’hui', 'Hier', '7 jours', '30 jours', '365 jours', 'Personnalisé'];

type Props = {
  periods?: string[];
  defaultActive?: number;
  onChange?: (period: string, index: number) => void;
};

export function PeriodTabs({ periods = DEFAULT_PERIODS, defaultActive = 0, onChange }: Props) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div role="tablist" aria-label="Période d'analyse" className="flex flex-wrap gap-2">
      {periods.map((p, i) => {
        const on = i === active;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => {
              setActive(i);
              onChange?.(p, i);
            }}
            className={
              on
                ? 'rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium shadow-glow-navy'
                : 'rounded-pill bg-brand-sky/60 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky transition-colors'
            }
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

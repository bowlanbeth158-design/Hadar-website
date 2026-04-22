'use client';

import { useState } from 'react';

const PERIODS = ['Aujourd’hui', 'Hier', 'Derniers 7 jours', 'Derniers 30 jours'] as const;

export function StatsPeriodTabs() {
  const [active, setActive] = useState<(typeof PERIODS)[number]>(PERIODS[0]);

  return (
    <div
      role="tablist"
      aria-label="Période d'analyse"
      className="flex flex-wrap justify-center gap-3 mb-8"
    >
      {PERIODS.map((p) => {
        const isActive = p === active;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(p)}
            className={
              isActive
                ? 'rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-sm'
                : 'rounded-pill bg-gray-100 text-gray-500 px-5 py-2 text-sm font-medium hover:bg-gray-200 transition-colors'
            }
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

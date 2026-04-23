'use client';

import { useState } from 'react';

type Props = {
  label: string;
  defaultOn?: boolean;
  locked?: boolean;
};

export function PermissionToggle({ label, defaultOn = false, locked = false }: Props) {
  const [on, setOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-glow-soft">
      <span className="text-sm text-brand-navy flex items-center gap-2">
        {label}
        {locked && <span aria-label="Super-admin uniquement" title="Super-admin uniquement">🔒</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={locked}
        onClick={() => !locked && setOn((v) => !v)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          locked
            ? on
              ? 'bg-green-400 cursor-not-allowed opacity-80'
              : 'bg-gray-300 cursor-not-allowed'
            : on
              ? 'bg-green-500'
              : 'bg-gray-200'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            on ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

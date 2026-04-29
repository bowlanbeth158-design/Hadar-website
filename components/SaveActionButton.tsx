'use client';

import { useState } from 'react';
import { Loader2, Check, Save, RefreshCcw, type LucideIcon } from 'lucide-react';

type Status = 'idle' | 'saving' | 'saved';
type IconKey = 'save' | 'refresh';

const ICONS: Record<IconKey, LucideIcon> = {
  save: Save,
  refresh: RefreshCcw,
};

type Props = {
  label: string;
  savingLabel?: string;
  savedLabel?: string;
  /** Icon key — kept as a plain string so this client component can be used
   *  from a server component without crossing the function boundary. */
  icon: IconKey;
  className?: string;
  /** Simulated work duration (ms) before showing the success state. */
  savingMs?: number;
  /** How long the success state stays before auto-resetting (ms). */
  savedMs?: number;
};

/**
 * Click → "Saving…" spinner → "Saved ✓" success state → reset.
 * Pure UI feedback; the actual server save is wired later.
 */
export function SaveActionButton({
  label,
  savingLabel = 'Enregistrement…',
  savedLabel = 'Enregistré',
  icon,
  className = '',
  savingMs = 1000,
  savedMs = 1600,
}: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const Icon = ICONS[icon];

  const onClick = () => {
    if (status !== 'idle') return;
    setStatus('saving');
    setTimeout(() => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), savedMs);
    }, savingMs);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status !== 'idle'}
      className={`inline-flex items-center gap-1.5 rounded-pill text-white px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-px disabled:cursor-default disabled:opacity-95 ${className}`}
    >
      {status === 'idle' && (
        <>
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </>
      )}
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {savingLabel}
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 animate-fade-in" aria-hidden />
          {savedLabel}
        </>
      )}
    </button>
  );
}

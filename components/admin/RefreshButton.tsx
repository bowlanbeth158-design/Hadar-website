'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

type Props = {
  onRefresh?: () => void;
  label?: string;
};

export function RefreshButton({ onRefresh, label = 'Rafraîchir' }: Props) {
  const [loading, setLoading] = useState(false);
  const [justDone, setJustDone] = useState(false);

  const handle = () => {
    if (loading) return;
    setLoading(true);
    setJustDone(false);
    onRefresh?.();
    setTimeout(() => {
      setLoading(false);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 1500);
    }, 900);
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue disabled:opacity-70 disabled:cursor-wait transition-all"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
      {loading ? 'Mise à jour…' : justDone ? 'À jour' : label}
    </button>
  );
}

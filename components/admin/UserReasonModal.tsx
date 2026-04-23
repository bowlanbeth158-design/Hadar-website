'use client';

import { useEffect, useState } from 'react';
import { X, Ban, Trash2, AlertTriangle } from 'lucide-react';

export type ReasonAction = 'block' | 'delete';

type Props = {
  open: boolean;
  action: ReasonAction | null;
  targetLabel: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

const PRESETS: Record<ReasonAction, string[]> = {
  block: [
    'Signalements répétés non retenus',
    'Comportement abusif dans le chat',
    'Suspicion de spam ou usurpation',
    'Demande interne (support)',
  ],
  delete: [
    'Demande explicite de l’utilisateur',
    'Violation grave des CGU',
    'Compte factice / bot',
    'Décision de la direction',
  ],
};

const TITLES: Record<ReasonAction, { title: string; cta: string; Icon: typeof Ban; tone: string; ctaTone: string }> = {
  block: {
    title: 'Bloquer cet utilisateur',
    cta: 'Bloquer',
    Icon: Ban,
    tone: 'bg-orange-500',
    ctaTone: 'bg-orange-500 hover:bg-orange-700 shadow-glow-orange',
  },
  delete: {
    title: 'Supprimer cet utilisateur',
    cta: 'Supprimer',
    Icon: Trash2,
    tone: 'bg-red-500',
    ctaTone: 'bg-red-500 hover:bg-red-700 shadow-glow-red',
  },
};

export function UserReasonModal({ open, action, targetLabel, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason('');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open || !action) return null;
  const cfg = TITLES[action];
  const presets = PRESETS[action];
  const canSubmit = reason.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-reason-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-glow-navy overflow-hidden">
        <div className={`flex items-center justify-between px-6 py-4 text-white ${cfg.tone}`}>
          <div className="flex items-center gap-2">
            <cfg.Icon className="h-5 w-5" aria-hidden />
            <h2 id="user-reason-title" className="text-lg font-bold">
              {cfg.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl bg-brand-sky/40 border border-brand-blue/30 px-4 py-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-brand-blue" aria-hidden />
            <p className="text-brand-navy">
              Action sur :{' '}
              <span className="font-semibold">{targetLabel}</span>
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Motifs fréquents
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className={
                    reason === p
                      ? 'inline-flex items-center rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold shadow-glow-navy'
                      : 'inline-flex items-center rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue'
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-xs font-semibold text-brand-navy mb-1.5"
            >
              Motif personnalisé <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Expliquez brièvement la raison de cette action…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-y"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canSubmit) return;
              onConfirm(reason.trim());
            }}
            disabled={!canSubmit}
            className={`inline-flex items-center gap-1.5 rounded-pill text-white px-5 py-2 text-sm font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none ${cfg.ctaTone}`}
          >
            <cfg.Icon className="h-4 w-4" aria-hidden />
            Confirmer — {cfg.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

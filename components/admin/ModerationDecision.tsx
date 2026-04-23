'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, PencilLine, Send } from 'lucide-react';

type Decision = 'publie' | 'non_retenu' | 'a_corriger';

const DECISIONS: {
  id: Decision;
  label: string;
  bg: string;
  ring: string;
  glow: string;
  cta: string;
  ctaClass: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    id: 'publie',
    label: 'Publié',
    bg: 'bg-green-500',
    ring: 'ring-green-500',
    glow: 'shadow-glow-green',
    cta: 'Publier le signalement',
    ctaClass: 'bg-green-500 hover:bg-green-700 shadow-glow-green',
    icon: CheckCircle2,
  },
  {
    id: 'non_retenu',
    label: 'Non retenu',
    bg: 'bg-red-500',
    ring: 'ring-red-500',
    glow: 'shadow-glow-red',
    cta: 'Refuser le signalement',
    ctaClass: 'bg-red-500 hover:bg-red-700 shadow-glow-red',
    icon: XCircle,
  },
  {
    id: 'a_corriger',
    label: 'À corriger',
    bg: 'bg-brand-navy',
    ring: 'ring-brand-navy',
    glow: 'shadow-glow-navy',
    cta: 'Demander correction',
    ctaClass: 'bg-brand-navy hover:bg-brand-blue shadow-glow-navy',
    icon: PencilLine,
  },
];

export function ModerationDecision() {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selected = DECISIONS.find((d) => d.id === decision);
  const reasonRequired = decision === 'non_retenu';
  const canSubmit =
    decision !== null && (reasonRequired ? reason.trim().length > 0 : true);

  const submit = () => {
    if (!canSubmit) return;
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2200);
  };

  return (
    <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-brand-navy text-center">
        Décision de modération
      </h2>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Sélectionnez une décision puis confirmez avec le bouton en bas.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {DECISIONS.map((d) => {
          const active = decision === d.id;
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={active}
              onClick={() => setDecision(d.id)}
              className={`inline-flex items-center gap-2 rounded-pill ${d.bg} text-white px-5 py-2.5 text-sm font-semibold transition-all ${
                active ? `${d.glow} ring-2 ${d.ring} ring-offset-2` : 'opacity-75 hover:opacity-100'
              }`}
            >
              <d.icon className="h-4 w-4" aria-hidden />
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="moderation-reason" className="block text-sm font-semibold text-brand-navy mb-2">
          Motif de décision
          {reasonRequired && <span className="text-red-500"> *</span>}
          {!reasonRequired && decision === 'a_corriger' && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (fortement recommandé pour que l&apos;utilisateur sache quoi corriger)
            </span>
          )}
        </label>
        <textarea
          id="moderation-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Motif de décision"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue resize-y"
        />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-pill text-white px-5 py-3 text-sm font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none ${
            selected ? selected.ctaClass : ''
          }`}
        >
          <Send className="h-4 w-4" aria-hidden />
          {confirmed
            ? 'Décision enregistrée'
            : selected
              ? selected.cta
              : 'Choisissez une décision'}
        </button>
        {confirmed && (
          <p className="mt-3 text-xs text-center text-green-700">
            L&apos;utilisateur et l&apos;audit log ont été mis à jour (simulation).
          </p>
        )}
      </div>
    </section>
  );
}

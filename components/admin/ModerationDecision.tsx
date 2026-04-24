'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, PencilLine, Send } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

export type Decision = 'publie' | 'non_retenu' | 'a_corriger';

type DecisionItem = {
  id: Decision;
  labelKey: string;
  bg: string;
  ring: string;
  glow: string;
  ctaKey: string;
  ctaClass: string;
  icon: typeof CheckCircle2;
};

const DECISIONS: DecisionItem[] = [
  {
    id: 'publie',
    labelKey: 'status.publie',
    bg: 'bg-green-500',
    ring: 'ring-green-500',
    glow: 'shadow-glow-green',
    ctaKey: 'moderation.decision.publish',
    ctaClass: 'bg-green-500 hover:bg-green-700 shadow-glow-green',
    icon: CheckCircle2,
  },
  {
    id: 'non_retenu',
    labelKey: 'status.non_retenu',
    bg: 'bg-red-500',
    ring: 'ring-red-500',
    glow: 'shadow-glow-red',
    ctaKey: 'moderation.decision.reject',
    ctaClass: 'bg-red-500 hover:bg-red-700 shadow-glow-red',
    icon: XCircle,
  },
  {
    id: 'a_corriger',
    labelKey: 'status.a_corriger',
    bg: 'bg-brand-navy',
    ring: 'ring-brand-navy',
    glow: 'shadow-glow-navy',
    ctaKey: 'moderation.decision.correct',
    ctaClass: 'bg-brand-navy hover:bg-brand-blue shadow-glow-navy',
    icon: PencilLine,
  },
];

type Props = {
  onSubmit?: (decision: Decision, reason: string) => void;
  currentDecision?: Decision | null;
};

export function ModerationDecision({ onSubmit, currentDecision = null }: Props) {
  const { t } = useI18n();
  const [decision, setDecision] = useState<Decision | null>(currentDecision);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selected = DECISIONS.find((d) => d.id === decision);
  const reasonRequired = decision === 'non_retenu';
  const canSubmit =
    decision !== null && (reasonRequired ? reason.trim().length > 0 : true);

  const submit = () => {
    if (!canSubmit || !decision) return;
    onSubmit?.(decision, reason);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2200);
  };

  return (
    <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-brand-navy text-center">
        {t('moderation.title')}
      </h2>
      <p className="mt-2 text-sm text-gray-500 text-center">{t('moderation.subtitle')}</p>

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
              {t(d.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="moderation-reason" className="block text-sm font-semibold text-brand-navy mb-2">
          {t('moderation.reasonLabel')}
          {reasonRequired && <span className="text-red-500"> *</span>}
          {!reasonRequired && decision === 'a_corriger' && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {t('moderation.reasonHint')}
            </span>
          )}
        </label>
        <textarea
          id="moderation-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={t('moderation.reasonPlaceholder')}
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
            ? t('moderation.saved')
            : selected
              ? t(selected.ctaKey)
              : t('moderation.chooseDecision')}
        </button>
        {confirmed && (
          <p className="mt-3 text-xs text-center text-green-700">
            {t('moderation.savedNote')}
          </p>
        )}
      </div>
    </section>
  );
}

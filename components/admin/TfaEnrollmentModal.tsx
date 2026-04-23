'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Mail,
  MessageSquare,
  Smartphone,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

export type TfaMethodId = 'app' | 'sms' | 'email';

export type TfaEnrollment = {
  target: string;
  enrolledAt: string;
};

type Props = {
  method: TfaMethodId;
  defaultEmail: string;
  defaultPhone: string;
  onClose: () => void;
  onEnroll: (method: TfaMethodId, enrollment: TfaEnrollment) => void;
};

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function randomSecret(len = 32): string {
  let s = '';
  for (let i = 0; i < len; i++) s += BASE32[Math.floor(Math.random() * 32)];
  return s;
}

function formatSecret(s: string): string {
  return s.match(/.{1,4}/g)?.join(' ') ?? s;
}

const TITLE_KEY: Record<TfaMethodId, string> = {
  app: 'tfa.title.app',
  sms: 'tfa.title.sms',
  email: 'tfa.title.email',
};

const ICON: Record<TfaMethodId, typeof Smartphone> = {
  app: Smartphone,
  sms: MessageSquare,
  email: Mail,
};

export function TfaEnrollmentModal({
  method,
  defaultEmail,
  defaultPhone,
  onClose,
  onEnroll,
}: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [secret] = useState(() => randomSecret(32));
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const Icon = ICON[method];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failure silently
    }
  };

  const sendCode = () => {
    setErr(null);
    if (method === 'sms') {
      if (!/^\+?[\d\s.-]{8,}$/.test(phone.trim())) {
        setErr(t('tfa.err.phone'));
        return;
      }
    }
    if (method === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErr(t('tfa.err.email'));
        return;
      }
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setStep('verify');
    }, 600);
  };

  const verify = () => {
    setErr(null);
    if (!/^\d{6}$/.test(code)) {
      setErr(t('tfa.err.code'));
      return;
    }
    const target =
      method === 'app' ? secret : method === 'sms' ? phone.trim() : email.trim();
    onEnroll(method, { target, enrolledAt: new Date().toISOString() });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tfa-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-glow-navy overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" aria-hidden />
            <h2 id="tfa-modal-title" className="text-lg font-bold">
              {t(TITLE_KEY[method])}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-brand-sky/30 text-xs font-semibold">
          <span className={step === 'setup' ? 'text-brand-blue' : 'text-brand-navy/40'}>
            {t('tfa.step.setup')}
          </span>
          <span className="text-brand-navy/40">›</span>
          <span className={step === 'verify' ? 'text-brand-blue' : 'text-brand-navy/40'}>
            {t('tfa.step.verify')}
          </span>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {err && (
            <div className="rounded-xl bg-red-100 border border-red-300 text-red-800 px-4 py-2 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {err}
            </div>
          )}

          {step === 'setup' && method === 'app' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t('tfa.app.instructions')}</p>
              <div className="flex flex-col items-center gap-3 bg-brand-sky/30 rounded-xl p-4">
                <QrPreview secret={secret} />
                <p className="text-[11px] text-gray-500 italic">{t('tfa.app.demoNote')}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  {t('tfa.app.secretLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={formatSecret(secret)}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-brand-navy bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={copySecret}
                    className="rounded-xl border border-brand-navy px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t('common.copied') : t('common.copy')}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="w-full rounded-xl bg-grad-stat-navy text-white px-4 py-2.5 text-sm font-semibold shadow-glow-navy hover:brightness-110"
              >
                {t('common.continue')}
              </button>
            </div>
          )}

          {step === 'setup' && method === 'sms' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t('tfa.sms.instructions')}</p>
              <label className="block">
                <span className="block text-xs font-semibold text-brand-navy mb-1">
                  {t('tfa.sms.phoneLabel')}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 ..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </label>
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="w-full rounded-xl bg-grad-stat-navy text-white px-4 py-2.5 text-sm font-semibold shadow-glow-navy hover:brightness-110 disabled:opacity-60"
              >
                {sending ? t('common.sending') : t('tfa.sendCode')}
              </button>
            </div>
          )}

          {step === 'setup' && method === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t('tfa.email.instructions')}</p>
              <label className="block">
                <span className="block text-xs font-semibold text-brand-navy mb-1">
                  {t('tfa.email.emailLabel')}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </label>
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="w-full rounded-xl bg-grad-stat-navy text-white px-4 py-2.5 text-sm font-semibold shadow-glow-navy hover:brightness-110 disabled:opacity-60"
              >
                {sending ? 'Envoi…' : 'Envoyer le code'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {method === 'app' && t('tfa.verify.instructions.app')}
                {method === 'sms' && t('tfa.verify.instructions.sms', { target: phone })}
                {method === 'email' && t('tfa.verify.instructions.email', { target: email })}
              </p>
              <label className="block">
                <span className="block text-xs font-semibold text-brand-navy mb-1">
                  {t('tfa.verify.codeLabel')}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-center text-2xl font-mono tracking-[0.5em] text-brand-navy focus:outline-none focus:border-brand-blue"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('setup');
                    setCode('');
                    setErr(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-gray-50"
                >
                  {t('common.back')}
                </button>
                <button
                  type="button"
                  onClick={verify}
                  className="flex-1 rounded-xl bg-grad-stat-navy text-white px-4 py-2.5 text-sm font-semibold shadow-glow-navy hover:brightness-110"
                >
                  {t('common.activate')}
                </button>
              </div>
              <p className="text-[11px] text-center text-gray-400">{t('tfa.verify.demoNote')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QrPreview({ secret }: { secret: string }) {
  const size = 25;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < secret.length; i++) h = (h ^ secret.charCodeAt(i)) * 16777619 >>> 0;
  const cells: boolean[] = new Array(size * size);
  for (let i = 0; i < size * size; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    cells[i] = ((h >>> 17) & 1) === 1;
  }
  const finder = (r0: number, c0: number) => {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r >= size || c >= size) continue;
        const on =
          dr === 0 ||
          dr === 6 ||
          dc === 0 ||
          dc === 6 ||
          (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        cells[r * size + c] = on;
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  return (
    <div
      className="grid bg-white p-2 rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        width: 200,
        height: 200,
      }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-brand-navy' : 'bg-white'} />
      ))}
    </div>
  );
}

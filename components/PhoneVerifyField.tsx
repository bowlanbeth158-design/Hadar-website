'use client';

import { useEffect, useState } from 'react';
import { Phone, Check, Loader2, MessageCircle } from 'lucide-react';

const DEMO_CODE = '12345';
const KEY = 'hadar:phone-verified';

type Step =
  | 'idle'
  | 'sending'
  | 'awaiting-code'
  | 'verifying'
  | 'verified'
  | 'error';

export function PhoneVerifyField({
  defaultValue = '',
  hint,
}: {
  defaultValue?: string;
  hint?: string;
}) {
  const [phone, setPhone] = useState(defaultValue);
  const [step, setStep] = useState<Step>('idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Restore persisted "verified" state across refreshes (demo only).
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { phone: string };
      if (parsed.phone) {
        setPhone(parsed.phone);
        setStep('verified');
      }
    } catch {
      // ignore
    }
  }, []);

  const sendCode = () => {
    if (!phone.trim()) return;
    setError(null);
    setCode('');
    setStep('sending');
    setTimeout(() => setStep('awaiting-code'), 900);
  };

  const verifyCode = () => {
    setStep('verifying');
    setError(null);
    setTimeout(() => {
      if (code === DEMO_CODE) {
        setStep('verified');
        try {
          localStorage.setItem(KEY, JSON.stringify({ phone }));
        } catch {
          // ignore
        }
      } else {
        setStep('error');
        setError(
          `Code incorrect, réessayez. (Code de démonstration : ${DEMO_CODE})`,
        );
      }
    }, 800);
  };

  const reset = () => {
    setStep('idle');
    setCode('');
    setError(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  };

  const isVerified = step === 'verified';
  const isLocked = isVerified;
  const codeUiVisible =
    step === 'awaiting-code' || step === 'verifying' || step === 'error';

  return (
    <div>
      <label
        htmlFor="phone-field"
        className="block text-sm font-semibold text-brand-navy mb-1.5"
      >
        Numéro de téléphone
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Phone className="h-4 w-4" aria-hidden />
        </span>

        <input
          id="phone-field"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          readOnly={isLocked}
          placeholder="212 6 00 00 00 00"
          className={`w-full rounded-pill border bg-white pl-10 pr-32 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 outline-none transition-all ${
            isVerified
              ? 'border-green-500 bg-green-50/40'
              : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
          }`}
        />

        {/* Right-side action: Vérifier button OR "Vérifié" pill */}
        {!isVerified && (
          <button
            type="button"
            onClick={sendCode}
            disabled={!phone.trim() || step === 'sending'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-3.5 py-1.5 text-xs font-semibold shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === 'sending' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Envoi…
              </>
            ) : (
              <>
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Vérifier
              </>
            )}
          </button>
        )}
        {isVerified && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-pill bg-green-500 text-white px-3 py-1.5 text-xs font-bold shadow-glow-green">
            <Check className="h-3.5 w-3.5" aria-hidden />
            Vérifié
          </span>
        )}
      </div>

      {hint && !codeUiVisible && !isVerified && (
        <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>
      )}

      {/* 5-digit code entry */}
      {codeUiVisible && (
        <div className="mt-3 rounded-xl bg-brand-sky/30 border border-brand-sky p-3 animate-fade-in-down">
          <p className="text-xs text-brand-navy mb-2 inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-green-600" aria-hidden />
            Un code à 5 chiffres a été envoyé sur WhatsApp à{' '}
            <span className="font-semibold">{phone}</span>.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                if (error) setError(null);
              }}
              placeholder="• • • • •"
              aria-label="Code de vérification à 5 chiffres"
              className={`w-32 rounded-pill border bg-white px-4 py-2 text-center text-base font-bold tracking-[0.4em] text-brand-navy outline-none transition-all ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
              }`}
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={code.length !== 5 || step === 'verifying'}
              className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-4 py-2 text-xs font-semibold shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {step === 'verifying' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Vérification…
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Confirmer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={sendCode}
              className="text-xs font-medium text-brand-blue hover:underline"
            >
              Renvoyer le code
            </button>
          </div>
          {error && (
            <p
              role="alert"
              className="mt-2 text-xs font-semibold text-red-600 animate-fade-in"
            >
              {error}
            </p>
          )}
        </div>
      )}

      {isVerified && (
        <button
          type="button"
          onClick={reset}
          className="mt-2 text-[11px] text-gray-400 hover:text-brand-blue hover:underline"
        >
          Modifier le numéro
        </button>
      )}
    </div>
  );
}

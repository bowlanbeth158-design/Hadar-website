'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Modal d'enrôlement 2FA TOTP — appelle les vraies routes backend.
//
// Flow :
//   1. Mount → POST /api/auth/2fa/setup → reçoit otpauthUri + secretBase32.
//   2. Génère un QR code DataURL avec la lib `qrcode`.
//   3. User scanne avec son authenticator + tape un code de 6 chiffres.
//   4. POST /api/auth/2fa/verify → valide + reçoit 8 recoveryCodes.
//   5. Affiche les codes en clair (1 seule fois) avec bouton "J'ai noté".
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  X,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import QRCode from 'qrcode';
import { apiCall, ApiClientError } from '@/lib/api/client';

type Phase = 'init' | 'qr' | 'verifying' | 'codes' | 'error';

export function Tfa2faEnrollmentLive({
  open,
  onClose,
  onEnrolled,
}: {
  open: boolean;
  onClose: () => void;
  onEnrolled?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('init');
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secretBase32, setSecretBase32] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setPhase('init');
    setError(null);
    setCode('');
    setCodes([]);

    (async () => {
      try {
        const res = await apiCall<{ otpauthUri: string; secretBase32: string }>(
          '/api/auth/2fa/setup',
          { method: 'POST' },
        );
        const dataUrl = await QRCode.toDataURL(res.otpauthUri, {
          margin: 1,
          width: 240,
        });
        setQrDataUrl(dataUrl);
        setSecretBase32(res.secretBase32);
        setPhase('qr');
      } catch (err) {
        setPhase('error');
        setError(
          err instanceof ApiClientError
            ? err.userMessage
            : 'Impossible de démarrer l\'enrôlement.',
        );
      }
    })();
  }, [open]);

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Code attendu sur 6 chiffres.');
      return;
    }
    setPhase('verifying');
    setError(null);
    try {
      const res = await apiCall<{ enabled: boolean; recoveryCodes: string[] }>(
        '/api/auth/2fa/verify',
        { method: 'POST', body: { code } },
      );
      setCodes(res.recoveryCodes);
      setPhase('codes');
    } catch (err) {
      setPhase('qr');
      setError(
        err instanceof ApiClientError ? err.userMessage : 'Code invalide.',
      );
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const finish = () => {
    onEnrolled?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        aria-label="Fermer"
        onClick={phase === 'codes' ? finish : onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-glow-navy overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-bold">Activer la 2FA</h2>
          </div>
          {phase !== 'codes' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="h-8 w-8 rounded-full hover:bg-white/10 grid place-items-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-100 border border-red-300 text-red-800 px-4 py-2 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {phase === 'init' && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
              <p className="mt-3 text-sm text-gray-500">Génération du secret…</p>
            </div>
          )}

          {phase === 'qr' && qrDataUrl && secretBase32 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Scanne ce QR code avec ton authenticator (Google
                Authenticator, Authy, 1Password, …) :
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR code TOTP"
                  className="rounded-xl border border-gray-200"
                />
              </div>
              <div className="text-center text-xs text-gray-500">
                <p>ou tape ce secret manuellement :</p>
                <code className="font-mono text-brand-navy bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {secretBase32}
                </code>
              </div>

              <div>
                <label
                  htmlFor="totp"
                  className="block text-xs font-semibold text-brand-navy mb-1"
                >
                  Code à 6 chiffres
                </label>
                <input
                  id="totp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center text-lg font-mono tracking-widest"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={verify}
                disabled={code.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy disabled:opacity-60"
              >
                Activer la 2FA
              </button>
            </div>
          )}

          {phase === 'verifying' && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
              <p className="mt-3 text-sm text-gray-500">Vérification…</p>
            </div>
          )}

          {phase === 'codes' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-900">
                <p className="font-semibold">2FA activée 🎉</p>
                <p className="text-xs mt-1">
                  Conserve ces 8 codes de récupération en lieu sûr (1Password,
                  Bitwarden, papier dans un coffre). Ils permettent de
                  reprendre le contrôle si tu perds ton authenticator. Chaque
                  code ne sert qu&apos;une fois. ⚠ Ils ne s&apos;afficheront
                  plus jamais.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {codes.map((c) => (
                  <div
                    key={c}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center"
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyCodes}
                  className="inline-flex items-center gap-1 rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-2 text-sm font-semibold hover:border-brand-blue"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copié' : 'Copier les codes'}
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="ml-auto inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue"
                >
                  J&apos;ai noté les codes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

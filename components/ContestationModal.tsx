'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Modal de contestation publique pour une personne signalée.
// POST /api/reports/[id]/contestation — pas d'auth requise, rate
// limit 3/h/IP côté serveur, email d'accusé envoyé.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type FormEvent } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Scale,
} from 'lucide-react';
import { apiCall, ApiClientError } from '@/lib/api/client';

export function ContestationModal({
  open,
  reportId,
  onClose,
}: {
  open: boolean;
  reportId: string;
  onClose: () => void;
}) {
  const [contesterEmail, setContesterEmail] = useState('');
  const [contesterReason, setContesterReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (contesterReason.length < 20) {
      setError('Motif trop court (20 caractères minimum).');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiCall(`/api/reports/${reportId}/contestation`, {
        method: 'POST',
        body: { contesterEmail, contesterReason },
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.userMessage
          : 'Envoi impossible.',
      );
    } finally {
      setSubmitting(false);
    }
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
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-glow-navy overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-bold">Contester ce signalement</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="h-8 w-8 rounded-full hover:bg-white/10 grid place-items-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {done ? (
            <div className="text-center space-y-3 py-8">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
              <p className="text-sm font-semibold text-green-700">
                Contestation reçue.
              </p>
              <p className="text-xs text-gray-600">
                Notre équipe examinera ta demande dans les 7 jours. Tu
                recevras la décision par email.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Si tu es la personne ou l&apos;entité signalée et que tu
                penses que ce signalement est erroné, tu peux le contester.
                Notre équipe modération examinera ta demande.
              </p>

              <div>
                <label
                  htmlFor="cemail"
                  className="block text-xs font-semibold text-brand-navy mb-1"
                >
                  Ton email *
                </label>
                <input
                  id="cemail"
                  type="email"
                  required
                  value={contesterEmail}
                  onChange={(e) => setContesterEmail(e.target.value)}
                  placeholder="toi@exemple.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="creason"
                  className="block text-xs font-semibold text-brand-navy mb-1"
                >
                  Motif de la contestation *
                </label>
                <textarea
                  id="creason"
                  required
                  rows={5}
                  minLength={20}
                  maxLength={5000}
                  value={contesterReason}
                  onChange={(e) => setContesterReason(e.target.value)}
                  placeholder="Explique pourquoi tu contestes ce signalement…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  {contesterReason.length}/5000 caractères. Minimum 20.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 inline-flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi…
                  </>
                ) : (
                  'Envoyer la contestation'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

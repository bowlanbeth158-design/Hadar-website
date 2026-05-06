'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { apiCall, ApiClientError } from '@/lib/api/client';

type Phase = 'idle' | 'verifying' | 'success' | 'error';

export function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPhase('error');
      setError('Lien invalide.');
      return;
    }
    setPhase('verifying');
    apiCall('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
      .then(() => setPhase('success'))
      .catch((err) => {
        setPhase('error');
        setError(
          err instanceof ApiClientError
            ? err.userMessage
            : 'Échec de la vérification.',
        );
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Vérification de l’email</h1>

      {phase === 'verifying' && (
        <div className="rounded-2xl bg-white border border-gray-200 p-8 space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
          <p className="text-sm text-gray-500">Vérification en cours…</p>
        </div>
      )}

      {phase === 'success' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-8 space-y-3">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <p className="text-sm font-semibold text-green-700">
            Ton email est vérifié 🎉
          </p>
          <p className="text-xs text-gray-600">
            Tu peux maintenant soumettre des signalements.
          </p>
          <Link
            href="/mon-profil"
            className="inline-flex rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue"
          >
            Aller à mon profil
          </Link>
        </div>
      )}

      {phase === 'error' && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-8 space-y-3">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <Link
            href="/connexion"
            className="inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-5 py-2 text-sm font-semibold hover:border-brand-blue"
          >
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}

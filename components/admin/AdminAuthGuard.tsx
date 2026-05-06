'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Garde côté client pour les pages /admin/*. Si l'utilisateur n'est
// pas un Member (staff), on redirige vers /connexion.
//
// Le serveur fait aussi le contrôle dans les routes /api/admin/* via
// requireMember(), donc même si quelqu'un manipule le client pour
// rester sur la page, il n'aura accès à aucune donnée.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!me || me.kind !== 'member') {
      router.replace('/connexion?next=/admin');
    }
  }, [me, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-400">
        Chargement…
      </div>
    );
  }

  if (!me || me.kind !== 'member') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Redirection vers la connexion…
      </div>
    );
  }

  return <>{children}</>;
}

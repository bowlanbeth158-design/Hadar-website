'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminPlatformConfigLive } from '@/components/admin/AdminPlatformConfigLive';
import { Tfa2faEnrollmentLive } from '@/components/admin/Tfa2faEnrollmentLive';

export default function Page() {
  const [tfaOpen, setTfaOpen] = useState(false);
  const [enrolledAt, setEnrolledAt] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sécurité du compte et configuration plateforme.
        </p>
      </div>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-navy" />
            <div>
              <h2 className="text-base font-semibold text-brand-navy">
                Authentification à deux facteurs (TOTP)
              </h2>
              <p className="text-sm text-gray-500">
                Obligatoire pour les rôles Admin et Super-admin. Utilisez Google
                Authenticator, Authy ou 1Password.
              </p>
              {enrolledAt && (
                <p className="mt-1 text-sm text-emerald-700">
                  ✓ Activé le {new Date(enrolledAt).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTfaOpen(true)}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue"
          >
            {enrolledAt ? 'Ré-enrôler' : 'Activer le 2FA'}
          </button>
        </div>
      </section>

      <Tfa2faEnrollmentLive
        open={tfaOpen}
        onClose={() => setTfaOpen(false)}
        onEnrolled={() => setEnrolledAt(new Date().toISOString())}
      />

      <section>
        <h2 className="text-base font-semibold text-brand-navy mb-2">
          Configuration plateforme
        </h2>
        <p className="mb-3 text-sm text-gray-500">
          Édition clé / valeur JSON. Audit automatique des modifications.
        </p>
        <AdminPlatformConfigLive />
      </section>
    </div>
  );
}

'use client';

import { AdminMembersListLive } from '@/components/admin/AdminMembersListLive';

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Membres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestion de l&apos;équipe staff (Admin / Modérateur / Support).
        </p>
      </div>
      <AdminMembersListLive />
    </div>
  );
}

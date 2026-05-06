'use client';

import { AdminAnnouncementsLive } from '@/components/admin/AdminAnnouncementsLive';

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Annonces</h1>
        <p className="mt-1 text-sm text-gray-500">
          Annonces poussées aux utilisateurs (banner / email).
        </p>
      </div>
      <AdminAnnouncementsLive />
    </div>
  );
}

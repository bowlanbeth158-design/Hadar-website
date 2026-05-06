'use client';

import { AdminStatsLive } from '@/components/admin/AdminStatsLive';

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">
          KPI globaux de la plateforme en direct.
        </p>
      </div>
      <AdminStatsLive />
    </div>
  );
}

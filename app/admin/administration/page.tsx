'use client';

import { AdminAuditLogLive } from '@/components/admin/AdminAuditLogLive';

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
          Administration
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Journal d&apos;audit complet (lecture seule, SUPER_ADMIN).
        </p>
      </div>
      <AdminAuditLogLive />
    </div>
  );
}

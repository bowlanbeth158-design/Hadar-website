'use client';

import { AdminTicketsListLive } from '@/components/admin/AdminTicketsListLive';

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
          Assistant
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          File des tickets de support, triés par échéance SLA.
        </p>
      </div>
      <AdminTicketsListLive />
    </div>
  );
}

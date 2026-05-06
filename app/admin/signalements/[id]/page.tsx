'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminReportDetailLive } from '@/components/admin/AdminReportDetailLive';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <Link
        href="/admin/signalements"
        className="inline-flex items-center gap-2 text-sm text-brand-blue hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour à la file
      </Link>
      <AdminReportDetailLive id={id} />
    </div>
  );
}

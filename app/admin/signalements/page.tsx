'use client';

import { AdminReportsListLive } from '@/components/admin/AdminReportsListLive';
import { useI18n } from '@/lib/i18n/provider';

export default function Page() {
  const { t } = useI18n();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
          {t('page.signalements.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          File de modération en direct depuis le backend.
        </p>
      </div>
      <AdminReportsListLive />
    </div>
  );
}

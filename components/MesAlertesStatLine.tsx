'use client';

import { useI18n } from '@/lib/i18n/provider';

// Tiny client wrapper for the "3 alertes actives · 3 nouvelles
// notifications" line above the alerts list. Keeps the parent page
// a Server Component for its metadata export.
export function MesAlertesStatLine({
  active,
  newNotifs,
}: {
  active: number;
  newNotifs: number;
}) {
  const { t } = useI18n();
  return (
    <p className="text-sm text-gray-500">
      {t('userPages.alerts.stats', { active, newNotifs })}
    </p>
  );
}

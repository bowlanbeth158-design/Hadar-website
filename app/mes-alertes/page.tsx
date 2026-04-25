import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';
import { MesAlertesList } from '@/components/MesAlertesList';

export const metadata: Metadata = {
  title: 'Mes alertes',
  description:
    'Suivez les alertes sur les contacts que vous surveillez et recevez une notification à chaque nouveau signalement.',
};

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Mes alertes"
        subtitle="Suivez les contacts que vous surveillez et soyez notifié à chaque nouveau signalement."
        align="left"
      />
      <DemoBanner />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">3 alertes actives · 3 nouvelles notifications</p>
        <NotificationSettingsModal />
      </div>

      <MesAlertesList />
    </PageLayout>
  );
}

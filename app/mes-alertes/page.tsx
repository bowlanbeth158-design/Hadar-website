import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';
import { MesAlertesList } from '@/components/MesAlertesList';
import { MesAlertesStatLine } from '@/components/MesAlertesStatLine';

export const metadata: Metadata = {
  title: 'Mes alertes',
  description:
    'Suivez les alertes sur les contacts que vous surveillez et recevez une notification à chaque nouveau signalement.',
};

type PageProps = {
  searchParams: { alert?: string; settings?: string };
};

export default function Page({ searchParams }: PageProps) {
  const initialExpandId = searchParams.alert ?? null;
  const settingsOpen = searchParams.settings === '1';

  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        titleKey="userPages.alerts.title"
        subtitleKey="userPages.alerts.subtitle"
        align="left"
      />
      <DemoBanner />

      <div className="flex items-center justify-between mb-6">
        <MesAlertesStatLine active={3} newNotifs={3} />
        <NotificationSettingsModal defaultOpen={settingsOpen} />
      </div>

      <MesAlertesList initialExpandId={initialExpandId} />
    </PageLayout>
  );
}

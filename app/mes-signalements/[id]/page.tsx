import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { ReportDetailBodyLive } from '@/components/ReportDetailBodyLive';

export const metadata: Metadata = {
  title: 'Détail de l’expérience',
  description: 'Consultez le détail complet de votre expérience et son évolution.',
};

type PageProps = { params: { id: string } };

export default function Page({ params }: PageProps) {
  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton href="/mes-signalements" labelKey="reportDetail.backLabel" />
      </div>
      <DemoBanner />
      <ReportDetailBodyLive id={params.id} />
    </PageLayout>
  );
}

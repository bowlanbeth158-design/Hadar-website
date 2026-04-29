import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { ReportDetailBody } from '@/components/ReportDetailBody';
import { USER_REPORTS } from '@/lib/mock/user-reports';

export const metadata: Metadata = {
  title: 'Détail du signalement',
  description: 'Consultez le détail complet de votre signalement et son évolution.',
};

type PageProps = { params: { id: string } };

export default function Page({ params }: PageProps) {
  const report = USER_REPORTS.find((r) => r.id === params.id);
  if (!report) notFound();

  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton href="/mes-signalements" labelKey="reportDetail.backLabel" />
      </div>
      <DemoBanner />
      <ReportDetailBody report={report} />
    </PageLayout>
  );
}

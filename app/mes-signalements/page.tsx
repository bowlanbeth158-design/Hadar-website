import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';
import { MesSignalementsList } from '@/components/MesSignalementsList';

export const metadata: Metadata = {
  title: 'Mes expériences',
  description: 'Consultez et gérez les expériences que vous avez partagées.',
};

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        titleKey="userPages.reports.title"
        subtitleKey="userPages.reports.subtitle"
        align="left"
      />
      <DemoBanner />

      <MesSignalementsList />
    </PageLayout>
  );
}

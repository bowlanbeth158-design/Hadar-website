import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';
import { MesSignalementsList } from '@/components/MesSignalementsList';

export const metadata: Metadata = {
  title: 'Mes signalements',
  description: 'Consultez et gérez les signalements que vous avez soumis.',
};

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Mes signalements"
        subtitle="Suivez l’état de vos signalements en temps réel."
        align="left"
      />
      <DemoBanner />

      <MesSignalementsList />
    </PageLayout>
  );
}

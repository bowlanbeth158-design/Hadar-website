import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { HowItWorksGrid } from '@/components/HowItWorksGrid';

export const metadata: Metadata = {
  title: 'Comment ça marche ?',
  description:
    'Deux actions simples pour prendre de meilleures décisions sur Hadar : vérifier un contact, partager une expérience.',
};

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading titleKey="howPage.title" subtitleKey="howPage.subtitle" />
      <HowItWorksGrid />
    </PageLayout>
  );
}

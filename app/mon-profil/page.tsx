import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { MonProfilBody } from '@/components/MonProfilBody';

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Gérez votre identité, votre mot de passe et vos préférences sur Hadar.',
};

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mb-6">
        <BackButton />
      </div>

      <DemoBanner />

      <MonProfilBody />
    </PageLayout>
  );
}

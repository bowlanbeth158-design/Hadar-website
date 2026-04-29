import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { SignalerPageBody } from '@/components/SignalerPageBody';

export const metadata: Metadata = {
  title: 'Partager une expérience',
  description:
    "Partagez votre expérience concernant un contact, un site ou un moyen de paiement. Votre contribution aide la communauté Hadar à prendre de meilleures décisions.",
};

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton />
      </div>
      <SignalerPageBody />
    </PageLayout>
  );
}

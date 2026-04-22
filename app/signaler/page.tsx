import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { ReportForm } from '@/components/ReportForm';

export const metadata: Metadata = {
  title: 'Signaler un contact',
  description:
    'Signalez un numéro, un email, un site ou un moyen de paiement suspect. Votre signalement aide à protéger la communauté.',
};

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Signaler un contact ou un profil"
        subtitle="Votre signalement aide à protéger d'autres utilisateurs."
        accent="red"
      />
      <ReportForm />
    </PageLayout>
  );
}

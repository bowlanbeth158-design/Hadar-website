import type { Metadata } from 'next';
import { ResetPasswordContent } from '@/components/ResetPasswordContent';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Réinitialiser mon mot de passe',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PageLayout narrow>
      <ResetPasswordContent />
    </PageLayout>
  );
}

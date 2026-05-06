import type { Metadata } from 'next';
import { VerifyEmailContent } from '@/components/VerifyEmailContent';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Vérifier mon email',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PageLayout narrow>
      <VerifyEmailContent />
    </PageLayout>
  );
}

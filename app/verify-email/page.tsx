import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/VerifyEmailContent';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Vérifier mon email',
  robots: { index: false, follow: false },
};

// useSearchParams() nécessite un Suspense boundary pour le build
// statique de Next.js — sinon erreur "missing-suspense-with-csr-bailout".
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <PageLayout narrow>
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </PageLayout>
  );
}

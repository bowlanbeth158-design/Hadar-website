import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordContent } from '@/components/ResetPasswordContent';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Réinitialiser mon mot de passe',
  robots: { index: false, follow: false },
};

// useSearchParams() nécessite un Suspense boundary pour le build
// statique de Next.js — sinon erreur "missing-suspense-with-csr-bailout".
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <PageLayout narrow>
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </PageLayout>
  );
}

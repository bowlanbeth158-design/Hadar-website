import type { Metadata } from 'next';
import { AuthCard } from '@/components/AuthCard';
import { SignupFormContent, SignupFormFooter } from '@/components/SignupFormContent';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez un compte Hadar pour signaler et être alerté.',
};

export default function Page() {
  return (
    <AuthCard titleKey="auth.signup.title" footer={<SignupFormFooter />}>
      <SignupFormContent />
    </AuthCard>
  );
}

import type { Metadata } from 'next';
import { AuthCard } from '@/components/AuthCard';
import { LoginFormContent } from '@/components/LoginFormContent';

export const metadata: Metadata = {
  // Title kept in French in the metadata (the rest of the page is
  // dynamically translated via the AuthCard's titleKey prop).
  title: 'Se connecter',
  description: 'Connectez-vous à votre compte Hadar.',
};

export default function Page() {
  return (
    <AuthCard titleKey="auth.login.title">
      <LoginFormContent />
    </AuthCard>
  );
}

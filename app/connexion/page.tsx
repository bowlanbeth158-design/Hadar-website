import type { Metadata } from 'next';
import { AuthCard } from '@/components/AuthCard';
import { LoginFormContent } from '@/components/LoginFormContent';

export const metadata: Metadata = {
  title: 'Se connecter',
  description: 'Connectez-vous à votre compte Hadar.ma.',
};

export default function Page() {
  return (
    <AuthCard title="Se connecter">
      <LoginFormContent />
    </AuthCard>
  );
}

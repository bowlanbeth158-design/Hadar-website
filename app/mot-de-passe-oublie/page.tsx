import type { Metadata } from 'next';
import { AuthCard } from '@/components/AuthCard';
import {
  ForgotPasswordContent,
  ForgotPasswordFooter,
} from '@/components/ForgotPasswordContent';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe Hadar.',
};

export default function Page() {
  return (
    <AuthCard titleKey="auth.forgot.title" footer={<ForgotPasswordFooter />}>
      <ForgotPasswordContent />
    </AuthCard>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe Hadar.',
};

export default function Page() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      footer={
        <Link href="/connexion" className="text-brand-blue font-semibold hover:underline">
          ← Retour à la connexion
        </Link>
      }
    >
      <p className="text-sm text-gray-500 text-center mb-6">
        Entrez votre email. Si un compte existe, vous recevrez un lien de réinitialisation.
      </p>

      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-brand-navy mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="vous@exemple.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Envoyer le lien
        </button>

        <p className="text-xs text-gray-400 text-center">
          Envoi activé prochainement.
        </p>
      </form>
    </AuthCard>
  );
}

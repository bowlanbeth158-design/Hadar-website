import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';

export const metadata: Metadata = {
  title: 'Se connecter',
  description: 'Connectez-vous à votre compte Hadar.ma.',
};

export default function Page() {
  return (
    <AuthCard
      title="Se connecter"
      footer={
        <>
          <p className="text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-brand-blue font-semibold hover:underline">
              S&apos;inscrire
            </Link>
          </p>
          <Link
            href="/mot-de-passe-oublie"
            className="mt-2 inline-block text-xs text-gray-500 hover:text-brand-navy"
          >
            Mot de passe oublié ?
          </Link>
        </>
      }
    >
      <div className="flex items-center justify-center gap-2 rounded-pill bg-green-100 text-green-700 px-3 py-1.5 text-xs font-medium mb-6">
        <span aria-hidden>✓</span> Plateforme sécurisée · +1200 signalements
      </div>

      <button
        type="button"
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2"
      >
        <span aria-hidden>G</span> Continuer avec Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        ou
        <span className="flex-1 h-px bg-gray-200" />
      </div>

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

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-brand-navy mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Se connecter
        </button>

        <p className="text-xs text-gray-400 text-center">
          Authentification activée prochainement.
        </p>
      </form>
    </AuthCard>
  );
}

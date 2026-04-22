import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/AuthCard';
import { GoogleIcon } from '@/components/GoogleIcon';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez un compte Hadar.ma pour signaler et être alerté.',
};

export default function Page() {
  return (
    <AuthCard
      title="Créer un compte"
      footer={
        <p className="text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-brand-blue font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      }
    >
      <button
        type="button"
        className="w-full rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2.5 text-sm font-semibold hover:border-brand-blue transition-colors flex items-center justify-center gap-2"
      >
        <GoogleIcon className="h-4 w-4" />
        S&apos;inscrire avec Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex-1 h-px bg-gray-200" />
        ou
        <span className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold text-brand-navy mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-semibold text-brand-navy mb-1">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

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
            placeholder="12 caractères minimum"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" id="accept" className="mt-1" />
          <label htmlFor="accept">
            J&apos;accepte les{' '}
            <Link href="/conditions-generales" className="text-brand-blue hover:underline">
              conditions générales
            </Link>{' '}
            et la{' '}
            <Link href="/politique-confidentialite" className="text-brand-blue hover:underline">
              politique de confidentialité
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Créer mon compte
        </button>

        <p className="text-xs text-gray-400 text-center">
          Inscription activée prochainement.
        </p>
      </form>
    </AuthCard>
  );
}

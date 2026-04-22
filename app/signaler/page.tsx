import type { Metadata } from 'next';
import { Megaphone, UploadCloud } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';

export const metadata: Metadata = {
  title: 'Signaler un contact',
  description:
    'Signalez un numéro, un email, un site ou un moyen de paiement suspect. Votre signalement aide à protéger la communauté.',
};

const CONTACT_TYPES = [
  'Téléphone',
  'WhatsApp',
  'Email',
  'RIB',
  'Site web',
  'Réseaux sociaux',
  'PayPal',
  'Binance',
];

const PROBLEM_TYPES = [
  'Non livraison',
  'Bloqué après paiement',
  'Produit non conforme',
  "Usurpation d'identité",
];

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Signaler un contact ou un profil"
        subtitle="Votre signalement aide à protéger d'autres utilisateurs."
        accent="red"
      />

      <form className="mx-auto max-w-2xl space-y-8 rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
        <fieldset>
          <legend className="block text-sm font-semibold text-brand-navy mb-3">
            Type de contact <span className="text-red-500">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {CONTACT_TYPES.map((t, i) => (
              <button
                key={t}
                type="button"
                className={
                  i === 0
                    ? 'rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium'
                    : 'rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors'
                }
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="contactValue" className="block text-sm font-semibold text-brand-navy mb-2">
            Information à signaler <span className="text-red-500">*</span>
          </label>
          <input
            id="contactValue"
            name="contactValue"
            type="text"
            placeholder="Ex : 212 6 00 00 00 00"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-semibold text-brand-navy mb-3">
            Type de problème <span className="text-red-500">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className="rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-brand-navy mb-2">
            Montant estimé <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            placeholder="Ex : 5 000 MAD"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-brand-navy mb-2">
            Description <span className="text-gray-400 font-normal">(optionnel, max 300)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={300}
            placeholder="Décrivez brièvement la situation (informations factuelles uniquement)"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue resize-y"
          />
          <p className="mt-2 text-xs text-red-500">
            Merci de décrire la situation de manière factuelle. Évitez les jugements ou
            accusations.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-2">
            Preuves <span className="text-gray-400 font-normal">(fortement recommandé)</span>
          </label>
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            <UploadCloud className="mx-auto h-8 w-8 mb-2 text-gray-400" aria-hidden />
            <p>Choisir un fichier ou glisser ici (capture, reçu, conversation…)</p>
            <p className="mt-1 text-xs">JPG · PNG · WEBP · MP4 · WEBM · MOV — 5 fichiers max</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" id="accept" className="mt-1" />
          <label htmlFor="accept">
            Je confirme que les informations fournies respectent les règles de la plateforme.
          </label>
        </div>

        <button
          type="submit"
          disabled
          className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 text-white px-5 py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Megaphone className="h-4 w-4" aria-hidden />
          Envoyer le signalement
        </button>

        <p className="text-xs text-gray-400 text-center">
          Authentification, upload sécurisé des preuves et soumission seront activés prochainement.
        </p>
      </form>
    </PageLayout>
  );
}

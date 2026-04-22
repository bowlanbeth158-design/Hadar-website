import type { Metadata } from 'next';
import { Lock, BadgeCheck, Trash2, Star } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Gérez votre identité, votre mot de passe et vos préférences sur Hadar.ma.',
};

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Mon profil"
        subtitle="Gérez vos informations personnelles, votre sécurité et vos préférences."
      />
      <DemoBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-2xl font-bold">
              HM
            </div>
            <p className="mt-4 font-semibold text-brand-navy flex items-center justify-center gap-1.5">
              Hadar Utilisateur
              <BadgeCheck className="h-4 w-4 text-brand-blue" aria-hidden />
            </p>
            <p className="text-sm text-gray-500">membre depuis avril 2026</p>
            <div className="mt-4 rounded-xl bg-brand-sky/50 p-3">
              <p className="text-xs text-gray-500">Taux de validation</p>
              <p className="text-2xl font-bold text-brand-navy mt-1">87%</p>
              <p className="mt-0.5 text-xs text-gray-500">13 signalements publiés sur 15</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Badges
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-brand-navy">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden />
                Contributeur régulier
              </li>
              <li className="flex items-center gap-2 text-brand-navy">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden />
                Signalements validés
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Star className="h-4 w-4" aria-hidden />
                Modérateur communautaire
              </li>
            </ul>
          </div>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-4">Informations personnelles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Prénom</label>
                <input
                  type="text"
                  defaultValue="Hadar"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">Nom</label>
                <input
                  type="text"
                  defaultValue="Utilisateur"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-navy mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="utilisateur@hadar.ma"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy"
                />
              </div>
            </div>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex items-center rounded-pill bg-green-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Enregistrer les modifications
            </button>
          </section>

          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" aria-hidden />
              Sécurité
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  placeholder="12 caractères minimum"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy"
                />
              </div>
            </div>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex items-center rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Mettre à jour le mot de passe
            </button>
          </section>

          <section className="rounded-2xl bg-red-50 border border-red-100 p-6 shadow-glow-red">
            <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
              <Trash2 className="h-5 w-5" aria-hidden />
              Zone dangereuse
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              La suppression de votre compte est irréversible après 30 jours. Les signalements
              publiés seront conservés en mode anonyme.
            </p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-red disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer mon compte
            </button>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

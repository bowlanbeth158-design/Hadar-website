import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description:
    'Découvrez comment vérifier un contact, signaler un profil suspect, vous protéger et suivre vos alertes sur Hadar.ma.',
};

const STEPS = [
  {
    title: 'Vérifiez',
    color: 'border-green-500',
    labelColor: 'text-green-700',
    icon: '🔍',
    description:
      'Avant une transaction, entrez le numéro, email, site ou moyen de paiement pour vérifier s’il a déjà été signalé.',
  },
  {
    title: 'Signalez',
    color: 'border-red-500',
    labelColor: 'text-red-700',
    icon: '🚨',
    description:
      'Partagez rapidement un signalement factuel avec preuves à l’appui pour protéger la communauté.',
  },
  {
    title: 'Protégez',
    color: 'border-orange-500',
    labelColor: 'text-orange-600',
    icon: '🛡️',
    description:
      'Adoptez les bonnes pratiques : ne payez jamais d’avance à un inconnu, vérifiez l’identité, conservez vos échanges.',
  },
  {
    title: 'Suivez',
    color: 'border-brand-blue',
    labelColor: 'text-brand-blue',
    icon: '📬',
    description:
      'Activez les alertes sur les contacts qui vous concernent et recevez une notification à chaque nouveau signalement.',
  },
] as const;

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Restez en sécurité en 4 étapes"
        subtitle="Vérifiez, signalez, protégez et suivez en quelques clics."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className={`rounded-2xl bg-white border-2 ${s.color} p-6`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span aria-hidden className="text-3xl">
                {s.icon}
              </span>
              <h2 className={`text-xl font-bold ${s.labelColor}`}>{s.title}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            <div className="mt-5 aspect-video rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
              🎬 Vidéo à venir
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

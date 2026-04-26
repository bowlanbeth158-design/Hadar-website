import type { Metadata } from 'next';
import { Search, Siren, Film, Play, type LucideIcon } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';

export const metadata: Metadata = {
  title: 'Comment ça marche',
  description:
    'Découvrez comment vérifier un contact et signaler un profil suspect sur Hadar.',
};

type Step = {
  title: string;
  cardBorder: string;
  iconChipBg: string;
  iconColor: string;
  titleColor: string;
  Icon: LucideIcon;
  description: string;
  frameRing: string;
  playBg: string;
  glow: string;
};

const STEPS: Step[] = [
  {
    title: 'Vérifiez',
    cardBorder: 'border-green-500/40',
    iconChipBg: 'bg-green-100',
    iconColor: 'text-green-700',
    titleColor: 'text-green-700',
    Icon: Search,
    description:
      "Avant une transaction, entrez le numéro, email, site ou moyen de paiement pour vérifier s’il a déjà été signalé.",
    frameRing: 'ring-green-500/30',
    playBg: 'bg-green-500',
    glow: 'shadow-glow-green',
  },
  {
    title: 'Signalez',
    cardBorder: 'border-red-500/40',
    iconChipBg: 'bg-red-100',
    iconColor: 'text-red-700',
    titleColor: 'text-red-700',
    Icon: Siren,
    description:
      "Partagez rapidement un signalement factuel avec preuves à l’appui pour protéger la communauté.",
    frameRing: 'ring-red-500/30',
    playBg: 'bg-red-500',
    glow: 'shadow-glow-red',
  },
];

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Comment ça marche"
        subtitle="Découvrez en deux étapes comment Hadar vous aide à éviter les fraudes."
      />

      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className={`group relative rounded-2xl bg-white border-2 ${s.cardBorder} ${s.glow} p-6 transition-all hover:-translate-y-1 hover:shadow-glow-navy duration-300 ease-out overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Icon chip — light tinted square, scales + sparkle-pops on
                  hover (banner rhythm). Sparkle is gated behind the card's
                  `group` so it only fires while hovering, not as constant
                  background motion. */}
              <span
                aria-hidden
                className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl ${s.iconChipBg} ${s.iconColor} ring-1 ring-current/10 transition-transform duration-300 group-hover:scale-110`}
              >
                <s.Icon className="h-6 w-6 group-hover:animate-sparkle-pop drop-shadow-sm" aria-hidden />
              </span>
              <h2 className={`text-xl font-bold ${s.titleColor}`}>{s.title}</h2>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>

            {/* Video frame — smaller (max-w + 5/3 aspect for a tighter
                preview thumb), tinted ring in the step's colour, soft
                shimmer light on hover, big circular play button that
                scales-up on hover. Stays a placeholder for now ("Vidéo
                à venir") — wire up to a real video URL when ready. */}
            <div
              className={`relative mt-5 mx-auto max-w-sm aspect-[5/3] rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-50 ring-1 ${s.frameRing} flex items-center justify-center text-gray-400 text-xs gap-2 overflow-hidden`}
            >
              {/* Diagonal shimmer light passes across the frame on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
              />

              {/* Centered play button — coloured pill with the step's tint,
                  pulses gently (animate-float-soft) and scales on card hover. */}
              <span
                aria-hidden
                className={`relative inline-flex items-center justify-center h-12 w-12 rounded-full ${s.playBg} text-white shadow-md animate-float-soft group-hover:scale-110 transition-transform duration-300`}
              >
                <Play className="h-5 w-5 fill-white" aria-hidden />
              </span>

              {/* Bottom-left "Vidéo à venir" caption */}
              <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-[10px] font-medium text-gray-400">
                <Film className="h-3 w-3" aria-hidden />
                Vidéo à venir
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

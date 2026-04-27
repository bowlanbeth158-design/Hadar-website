import type { Metadata } from 'next';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { ReportForm } from '@/components/ReportForm';

export const metadata: Metadata = {
  title: 'Partager une expérience',
  description:
    "Partagez votre expérience concernant un contact, un site ou un moyen de paiement. Votre contribution aide la communauté Hadar à prendre de meilleures décisions.",
};

const TRUST_BADGES = [
  {
    Icon: Lock,
    title: 'Protégé',
    desc: '100% anonyme',
    pill: 'bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy',
    ring: 'border-brand-blue/30',
  },
  {
    Icon: ShieldCheck,
    title: 'Chiffré',
    desc: 'Données protégées',
    pill: 'bg-gradient-to-r from-green-100 to-green-100/70 text-green-700',
    ring: 'border-green-500/30',
  },
  {
    Icon: UserCheck,
    title: 'Vérifié',
    desc: 'Examiné avant publication',
    // text-brand-navy on the orange-100 wash gives high contrast — the
    // earlier text-orange-500 disappeared into the pill background.
    pill: 'bg-gradient-to-r from-orange-100 to-orange-100/70 text-brand-navy',
    ring: 'border-orange-500/40',
  },
];

const PROCESS = [
  {
    n: 1,
    Icon: AlertCircle,
    title: 'Vous signalez',
    desc: 'Vous décrivez la situation et joignez vos preuves.',
    bar: 'bg-gradient-to-r from-brand-blue via-brand-blue/50 to-transparent',
    ring: 'ring-brand-blue/25',
    chip: 'bg-brand-blue/10 text-brand-blue',
  },
  {
    n: 2,
    Icon: Eye,
    title: 'Nous examinons',
    desc: 'Notre équipe vérifie le contenu sous 48 h ouvrées.',
    bar: 'bg-gradient-to-r from-orange-500 via-orange-500/50 to-transparent',
    ring: 'ring-orange-500/30',
    chip: 'bg-orange-500/10 text-orange-500',
  },
  {
    n: 3,
    Icon: CheckCircle2,
    title: 'C’est publié',
    desc: 'Si conforme, le signalement protège la communauté.',
    bar: 'bg-gradient-to-r from-green-500 via-green-500/50 to-transparent',
    ring: 'ring-green-500/30',
    chip: 'bg-green-500/10 text-green-700',
  },
];

// Wider wrapper so the trust pills row fits "Vérifié · Examiné avant
// publication" without truncation, and the form below matches that
// width edge-to-edge.
const WRAPPER = 'mx-auto max-w-4xl';

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton />
      </div>

      {/* Brand pill */}
      <div className="flex justify-center mb-5">
        <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/70 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-4 py-1.5 text-xs md:text-sm font-semibold shadow-glow-blue overflow-hidden animate-float-soft">
          <Sparkles className="h-3.5 w-3.5 text-brand-blue animate-sparkle-pop" aria-hidden />
          <span className="relative flex h-2 w-2">
            <span
              aria-hidden
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"
            />
            <span
              aria-hidden
              className="relative inline-flex h-2 w-2 rounded-full bg-green-500"
            />
          </span>
          <span className="relative z-10">Signalement protégé · 100% anonyme</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>

      <PageHeading
        title="Partager une expérience"
        subtitle="Partagez votre expérience concernant un contact, un site ou un moyen de paiement. Votre contribution aide la communauté à prendre de meilleures décisions."
        accent="red"
      />

      {/* Trust badges row + form share the same max-w-4xl wrapper. */}
      <div className={WRAPPER}>
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRUST_BADGES.map(({ Icon, title, desc, pill, ring }) => (
            <span
              key={title}
              className={`inline-flex items-center justify-center gap-2 rounded-pill ${pill} border ${ring} px-3 py-2 text-xs md:text-sm font-semibold shadow-sm`}
            >
              <Icon className="h-4 w-4 animate-sparkle-pop shrink-0" aria-hidden />
              <span className="truncate">
                {title} <span className="font-normal opacity-80">· {desc}</span>
              </span>
            </span>
          ))}
        </div>

        <ReportForm />
      </div>

      {/* Post-submit process — same width wrapper so the row aligns
          vertically with the form above. */}
      <section className={`mt-10 ${WRAPPER}`}>
        <h2 className="text-center text-lg md:text-xl font-bold text-brand-navy mb-6">
          Que se passe-t-il après votre signalement&nbsp;?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PROCESS.map((p) => (
            <div
              key={p.n}
              className="group relative rounded-2xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-5 shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ring-1 ${p.ring} ${p.chip} transition-transform group-hover:scale-110`}
                  aria-hidden
                >
                  <p.Icon className="h-4 w-4 group-hover:animate-sparkle-pop" />
                </span>
                <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] rounded-pill bg-white/70 text-xs font-bold text-brand-navy/80 px-2 tabular-nums">
                  {p.n}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-navy">{p.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-2 left-5 right-5 h-1 rounded-full ${p.bar}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Délai d&apos;examen moyen&nbsp;:{' '}
          <span className="font-semibold text-brand-navy">48 heures ouvrées</span>
        </div>
      </section>
    </PageLayout>
  );
}

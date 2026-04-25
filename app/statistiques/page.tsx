import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  CreditCard,
  MessageCircle,
  AtSign,
  Globe,
  PackageX,
  Ban,
  AlertTriangle,
  VenetianMask,
  type LucideIcon,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { StatsPeriodTabs } from '@/components/StatsPeriodTabs';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AnimatedDonut } from '@/components/AnimatedDonut';

export const metadata: Metadata = {
  title: 'Statistiques de la plateforme',
  description:
    'Analysez l’évolution et les tendances des signalements sur Hadar.ma.',
};

const GLOBAL_STATS: {
  label: string;
  value: string;
  gradient: string;
  glow: string;
  Icon: LucideIcon;
}[] = [
  { label: 'Utilisateurs actifs', value: '2 500', gradient: 'bg-grad-stat-navy', glow: 'shadow-glow-navy', Icon: Users },
  { label: 'Signalements enregistrés', value: '1 245', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: Siren },
  { label: 'Contacts signalés', value: '346', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Smartphone },
  { label: 'Vérifications réalisées', value: '+15 000', gradient: 'bg-grad-stat-sky', glow: 'shadow-glow-sky', Icon: ShieldCheck },
  { label: 'Montant signalé', value: '420 000 MAD', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Wallet },
  { label: 'Dernier signalement', value: 'il y a 2 h', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock },
];

const PROBLEMS: { label: string; pct: number; Icon: LucideIcon }[] = [
  { label: 'Non livraison', pct: 50, Icon: PackageX },
  { label: 'Blocage après paiement', pct: 25, Icon: Ban },
  { label: 'Produit non conforme', pct: 15, Icon: AlertTriangle },
  { label: "Usurpation d'identité", pct: 5, Icon: VenetianMask },
];

const CHANNELS: { label: string; pct: number; Icon: LucideIcon; accent: string; badgeBg: string }[] = [
  {
    label: 'RIB',
    pct: 35,
    Icon: CreditCard,
    accent: 'border-orange-500',
    badgeBg: 'bg-orange-500',
  },
  {
    label: 'WhatsApp',
    pct: 17,
    Icon: MessageCircle,
    accent: 'border-green-500',
    badgeBg: 'bg-green-500',
  },
  {
    label: 'Réseaux sociaux',
    pct: 15,
    Icon: AtSign,
    accent: 'border-violet-500',
    badgeBg: 'bg-violet-500',
  },
  {
    label: 'Site web',
    pct: 7,
    Icon: Globe,
    accent: 'border-brand-blue',
    badgeBg: 'bg-brand-blue',
  },
];

const ACTIVITY: { label: string; pct: number; color: string }[] = [
  { label: 'Faible', pct: 10, color: 'bg-brand-blue' },
  { label: 'Vigilance', pct: 30, color: 'bg-yellow-500' },
  { label: 'Modéré', pct: 80, color: 'bg-orange-500' },
  { label: 'Élevé', pct: 45, color: 'bg-red-500' },
];

const STATUS: {
  label: string;
  value: string;
  color: string;
  textColor: string;
  glow: string;
}[] = [
  { label: 'Signalements soumis', value: '1 900', color: 'bg-orange-500', textColor: 'text-white', glow: 'shadow-glow-orange' },
  { label: 'Signalements refusés', value: '655', color: 'bg-gray-400', textColor: 'text-white', glow: 'shadow-glow-soft' },
  { label: 'Signalements publiés', value: '1 245', color: 'bg-green-500', textColor: 'text-white', glow: 'shadow-glow-green' },
];

// Donut evolution value (center %)
const EVOLUTION_PCT = 12;

export default function Page() {
  const processingPct = 65;

  return (
    <PageLayout>
      <div className="mb-6">
        <BackButton />
      </div>

      <PageHeading
        title="Statistiques de la plateforme"
        subtitle="Analysez l’évolution et les tendances des signalements sur la plateforme."
        accent="gradient"
      />

      <StatsPeriodTabs />

      <section aria-label="Indicateurs globaux" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GLOBAL_STATS.map((s) => (
          <div
            key={s.label}
            className={`${s.gradient} ${s.glow} text-white rounded-2xl p-5 flex items-center justify-between`}
          >
            <div>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-sm font-medium opacity-90 mt-1">{s.label}</p>
            </div>
            <s.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy mb-5">Types de problèmes signalés</h2>
          <ul className="space-y-4">
            {PROBLEMS.map((p) => (
              <li key={p.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy">
                    <p.Icon className="h-4 w-4 text-brand-navy" aria-hidden />
                    {p.label}
                  </span>
                  <span className="text-sm font-bold text-brand-navy">{p.pct}%</span>
                </div>
                <div className="h-1.5 rounded-pill bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-pill bg-brand-blue"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy mb-5">Canaux plus signalés</h2>
          <div className="grid grid-cols-2 gap-3">
            {CHANNELS.map((c) => {
              const cardGlow =
                c.badgeBg === 'bg-orange-500'
                  ? 'shadow-glow-orange'
                  : c.badgeBg === 'bg-green-500'
                    ? 'shadow-glow-green'
                    : c.badgeBg === 'bg-violet-500'
                      ? 'shadow-glow-violet'
                      : 'shadow-glow-blue';
              return (
                <div
                  key={c.label}
                  className={`rounded-2xl bg-white border-2 ${c.accent} ${cardGlow} p-4`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                    <c.Icon className="h-4 w-4" aria-hidden />
                    {c.label}
                  </div>
                  <div
                    className={`mt-3 inline-flex items-center justify-center rounded-pill ${c.badgeBg} text-white text-sm font-bold px-3 py-1`}
                  >
                    {c.pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-brand-navy mb-5">
            Niveau d&apos;activité des signalements
          </h2>
          <div className="flex items-end gap-4 h-56 px-2">
            <div className="flex flex-col justify-between h-full text-[10px] text-gray-400 pr-2">
              {[80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-4 items-end gap-4 h-full">
              {ACTIVITY.map((a) => (
                <div key={a.label} className="flex flex-col items-center h-full justify-end">
                  <span className="text-xs font-bold text-brand-navy mb-1">{a.pct}%</span>
                  <div
                    className={`w-full ${a.color} rounded-t-xl`}
                    style={{ height: `${a.pct}%` }}
                  />
                  <span className="mt-2 text-xs font-medium text-gray-500">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-brand-navy mb-5">Evolution des signalements</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">+{EVOLUTION_PCT}% vs semaine dernière</p>
                <span className="mt-1 inline-flex items-center rounded-pill bg-red-500 text-white font-bold px-4 py-1.5 text-sm shadow-glow-red">
                  <AnimatedCounter value="1 900" />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">+45% aujourd&apos;hui</p>
                <span className="mt-1 inline-flex items-center rounded-pill bg-red-500 text-white font-bold px-4 py-1.5 text-sm shadow-glow-red">
                  <AnimatedCounter value="345" />
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <AnimatedDonut value={EVOLUTION_PCT} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
        <h2 className="text-lg font-bold text-brand-navy text-center mb-5">
          Statut des signalements
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-5">
          {STATUS.map((s) => (
            <div
              key={s.label}
              className={`inline-flex items-center gap-2 rounded-pill ${s.color} ${s.textColor} ${s.glow} px-4 py-2 text-sm font-semibold`}
            >
              <Siren className="h-4 w-4" aria-hidden />
              <span className="text-base font-bold">
                <AnimatedCounter value={s.value} />
              </span>
              <span className="text-xs opacity-90">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="relative h-2 rounded-pill bg-gray-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-pill bg-brand-navy"
            style={{ width: `${processingPct}%` }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-bold text-brand-navy">{processingPct}%</p>
      </section>

      <section className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-6 py-3 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Vérifier un contact
        </Link>
        <Link
          href="/signaler"
          className="inline-flex items-center gap-2 rounded-pill bg-red-500 hover:bg-red-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-red transition-all"
        >
          <Siren className="h-4 w-4" aria-hidden />
          Signaler un contact
        </Link>
      </section>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
        Les données présentées sont issues de signalements publiés et sont fournies à titre
        indicatif. Aucune donnée personnelle n&apos;est affichée.
      </p>
    </PageLayout>
  );
}

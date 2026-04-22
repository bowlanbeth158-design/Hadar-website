import type { Metadata } from 'next';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  TrendingUp,
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  Globe,
  AtSign,
  Coins,
  type LucideIcon,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';

export const metadata: Metadata = {
  title: 'Statistiques de la plateforme',
  description:
    'Statistiques détaillées de la plateforme Hadar.ma : signalements, vérifications, montants, utilisateurs.',
};

const GLOBAL_STATS: { label: string; value: string; gradient: string; Icon: LucideIcon }[] = [
  { label: 'Utilisateurs actifs', value: '12 593', gradient: 'bg-grad-stat-navy', Icon: Users },
  { label: 'Signalements enregistrés', value: '19 840', gradient: 'bg-grad-stat-red', Icon: Siren },
  { label: 'Contacts signalés', value: '9 594', gradient: 'bg-grad-stat-violet', Icon: Smartphone },
  {
    label: 'Vérifications réalisées',
    value: '18 978',
    gradient: 'bg-grad-stat-sky',
    Icon: ShieldCheck,
  },
  { label: 'Montant signalé', value: '504 000 MAD', gradient: 'bg-grad-stat-green', Icon: Wallet },
  {
    label: 'Dernier signalement',
    value: 'il y a 2h',
    gradient: 'bg-grad-stat-orange',
    Icon: Clock,
  },
];

const MONTHLY_EVOLUTION = [
  { month: 'Nov', value: 42 },
  { month: 'Déc', value: 55 },
  { month: 'Jan', value: 61 },
  { month: 'Fév', value: 73 },
  { month: 'Mar', value: 82 },
  { month: 'Avr', value: 95 },
];

const PROBLEMS = [
  { label: 'Non livraison', value: 38, color: 'bg-red-500' },
  { label: 'Bloqué après paiement', value: 27, color: 'bg-orange-500' },
  { label: 'Produit non conforme', value: 22, color: 'bg-yellow-500' },
  { label: "Usurpation d'identité", value: 13, color: 'bg-violet-500' },
];

const CHANNELS: { label: string; value: number; Icon: LucideIcon }[] = [
  { label: 'WhatsApp', value: 31, Icon: MessageCircle },
  { label: 'Téléphone', value: 24, Icon: Phone },
  { label: 'Site web', value: 17, Icon: Globe },
  { label: 'Email', value: 12, Icon: Mail },
  { label: 'Réseaux sociaux', value: 8, Icon: AtSign },
  { label: 'RIB', value: 4, Icon: CreditCard },
  { label: 'PayPal', value: 3, Icon: Wallet },
  { label: 'Binance', value: 1, Icon: Coins },
];

const SATISFACTION = [
  { label: 'Score de satisfaction', value: '4.4 / 5', accent: 'text-green-600' },
  { label: 'Taux de satisfaction', value: '82%', accent: 'text-brand-blue' },
  { label: 'Taux d’insatisfaction', value: '6%', accent: 'text-red-500' },
  { label: 'Taux de retour', value: '27%', accent: 'text-violet-500' },
];

export default function Page() {
  const maxEvo = Math.max(...MONTHLY_EVOLUTION.map((m) => m.value));

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Statistiques de la plateforme"
        subtitle="Les chiffres clés mis à jour à partir des contributions de la communauté."
        accent="gradient"
      />

      <section aria-label="Indicateurs globaux">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GLOBAL_STATS.map((s) => (
            <div
              key={s.label}
              className={`${s.gradient} text-white rounded-2xl p-6 shadow-sm flex items-center justify-between`}
            >
              <div>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm font-medium opacity-90 mt-1">{s.label}</p>
              </div>
              <s.Icon className="h-9 w-9 opacity-70" aria-hidden />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center max-w-3xl mx-auto">
          Les informations affichées sont basées sur les signalements et les expériences des
          utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif
          uniquement.
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-white border border-gray-200 p-6" aria-label="Évolution des signalements">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-blue" aria-hidden />
            Évolution des signalements (6 derniers mois)
          </h2>
          <span className="text-xs font-semibold text-green-600">+126% sur la période</span>
        </div>
        <div className="flex items-end gap-3 h-48">
          {MONTHLY_EVOLUTION.map((m) => {
            const pct = Math.max((m.value / maxEvo) * 100, 6);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-xl bg-grad-stat-navy relative"
                    style={{ height: `${pct}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-brand-navy">
                      {m.value}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500">{m.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-brand-navy mb-5">Répartition par type de fraude</h2>
          <ul className="space-y-4">
            {PROBLEMS.map((p) => (
              <li key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-brand-navy">{p.label}</span>
                  <span className="text-sm font-semibold text-brand-navy">{p.value}%</span>
                </div>
                <div className="h-2 rounded-pill bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-pill ${p.color}`}
                    style={{ width: `${p.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-brand-navy mb-5">Canaux les plus signalés</h2>
          <ul className="space-y-3">
            {CHANNELS.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-brand-sky flex items-center justify-center shrink-0">
                  <c.Icon className="h-4 w-4 text-brand-navy" aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand-navy truncate">{c.label}</span>
                    <span className="text-xs font-semibold text-gray-500">{c.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-pill bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-pill bg-brand-blue"
                      style={{ width: `${c.value * 3}%`, maxWidth: '100%' }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-2xl bg-white border border-gray-200 p-6" aria-label="Satisfaction des utilisateurs">
        <h2 className="text-lg font-bold text-brand-navy mb-5">Satisfaction des utilisateurs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SATISFACTION.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center"
            >
              <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Basé sur les évaluations données par les utilisateurs après soumission d&apos;un
          signalement (échelle 1 à 5 étoiles).
        </p>
      </section>
    </PageLayout>
  );
}

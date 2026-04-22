import type { Metadata } from 'next';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  BarChart3,
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

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Statistiques de la plateforme"
        subtitle="Données mises à jour en temps réel à partir des contributions de la communauté."
      />

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

      <p className="mt-6 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les informations affichées sont basées sur les signalements et les expériences des
        utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif
        uniquement.
      </p>

      <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <BarChart3 className="mx-auto h-10 w-10 text-brand-navy" aria-hidden />
        <p className="mt-3 text-brand-navy font-semibold">
          Statistiques détaillées (par problème, par canal, UX)
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Les pages détaillées (répartition des types de fraude, canaux utilisés, satisfaction
          utilisateurs) arrivent prochainement.
        </p>
      </div>
    </PageLayout>
  );
}

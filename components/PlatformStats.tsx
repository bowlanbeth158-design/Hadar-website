import Link from 'next/link';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';

const KPI_STATS: { label: string; value: string; gradient: string; Icon: LucideIcon }[] = [
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

export function PlatformStats() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Statistiques de la plateforme
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_STATS.map((s) => (
          <div
            key={s.label}
            className={`${s.gradient} text-white rounded-2xl p-5 shadow-sm flex items-center justify-between`}
          >
            <div>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium opacity-90 mt-1">{s.label}</p>
            </div>
            <s.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          href="/statistiques"
          className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
        >
          Voir plus
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <p className="mt-4 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les informations affichées sont basées sur les signalements et les expériences des
        utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif
        uniquement.
      </p>
    </section>
  );
}

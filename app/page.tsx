import Link from 'next/link';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  ArrowUpRight,
  Search,
  Gavel,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SupportFab } from '@/components/SupportFab';
import { HomeHero } from '@/components/HomeHero';

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

const STEPS: {
  n: number;
  title: string;
  description: string;
  color: string;
  Icon: LucideIcon;
}[] = [
  {
    n: 1,
    title: 'Signalement',
    description: 'Un utilisateur partage un signalement sur un contact ou un moyen de paiement.',
    color: 'bg-brand-blue',
    Icon: Siren,
  },
  {
    n: 2,
    title: 'Examen',
    description: 'Le contenu est examiné selon les règles de la plateforme.',
    color: 'bg-violet-500',
    Icon: Search,
  },
  {
    n: 3,
    title: 'Modération',
    description: 'Le contenu peut être modifié ou supprimé si nécessaire.',
    color: 'bg-orange-500',
    Icon: Gavel,
  },
  {
    n: 4,
    title: 'Publication',
    description: 'Les signalements conformes sont publiés sur la plateforme.',
    color: 'bg-green-500',
    Icon: CheckCircle2,
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HomeHero />

        <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy text-center">
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

        <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy text-center">
            Processus des signalements
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative bg-white border border-gray-200 rounded-2xl p-5 overflow-hidden"
              >
                <span
                  aria-hidden
                  className="absolute top-3 right-4 text-7xl font-bold text-gray-200 leading-none select-none"
                >
                  {s.n}
                </span>
                <div
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${s.color} text-white`}
                  aria-hidden
                >
                  <s.Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Step {s.n}
                </p>
                <h3 className="mt-1 text-lg font-bold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.description}</p>
                <div
                  className={`mt-4 h-1 ${s.color} rounded-pill`}
                  style={{ width: `${25 * s.n}%` }}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <SupportFab />
    </>
  );
}

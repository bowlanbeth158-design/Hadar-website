import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SupportFab } from '@/components/SupportFab';

const CONTACT_FILTERS = [
  { id: 'telephone', label: 'Téléphone', icon: '📞' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
  { id: 'email', label: 'Email', icon: '✉️' },
  { id: 'rib', label: 'RIB', icon: '💳' },
  { id: 'site_web', label: 'Site web', icon: '🌐' },
  { id: 'reseaux_sociaux', label: 'Réseaux sociaux', icon: '📡' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'binance', label: 'Binance', icon: '🔶' },
] as const;

const KPI_STATS = [
  { label: 'Utilisateurs actifs', value: '12 593', gradient: 'bg-grad-stat-navy', icon: '👥' },
  { label: 'Signalements enregistrés', value: '19 840', gradient: 'bg-grad-stat-red', icon: '🚨' },
  { label: 'Contacts signalés', value: '9 594', gradient: 'bg-grad-stat-violet', icon: '📱' },
  { label: 'Vérifications réalisées', value: '18 978', gradient: 'bg-grad-stat-sky', icon: '🛡️' },
  { label: 'Montant signalé', value: '504 000 MAD', gradient: 'bg-grad-stat-green', icon: '💰' },
  { label: 'Dernier signalement', value: 'il y a 2h', gradient: 'bg-grad-stat-orange', icon: '⏱️' },
] as const;

const STEPS = [
  {
    n: 1,
    title: 'Signalement',
    description: 'Un utilisateur partage un signalement sur un contact ou un moyen de paiement.',
    color: 'bg-brand-blue',
    icon: '🚨',
  },
  {
    n: 2,
    title: 'Examen',
    description: 'Le contenu est examiné selon les règles de la plateforme.',
    color: 'bg-violet-500',
    icon: '🔍',
  },
  {
    n: 3,
    title: 'Modération',
    description: 'Le contenu peut être modifié ou supprimé si nécessaire.',
    color: 'bg-orange-500',
    icon: '🛠️',
  },
  {
    n: 4,
    title: 'Publication',
    description: 'Les signalements conformes sont publiés sur la plateforme.',
    color: 'bg-green-500',
    icon: '✅',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <section className="mx-auto max-w-5xl px-4 md:px-6 pt-12 md:pt-20 pb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-navy">
            Avant d&apos;acheter, vérifiez.
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-gray-500">
            Recherchez un numéro, un email, un site web ou un moyen de paiement pour vérifier s&apos;il
            a déjà été signalé.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
            {CONTACT_FILTERS.map((f, i) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={i === 0}
                className={
                  i === 0
                    ? 'inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-2 text-sm font-medium shadow-sm'
                    : 'inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors'
                }
              >
                <span aria-hidden>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          <form
            role="search"
            action="/recherche"
            method="get"
            className="mt-8 mx-auto max-w-3xl flex items-center gap-2 rounded-pill bg-white border border-gray-200 shadow-sm pl-5 pr-1 py-1"
          >
            <span aria-hidden className="text-gray-400 text-lg">
              🔍
            </span>
            <input
              type="search"
              name="q"
              placeholder="Ex : 212 6 00 00 00 00"
              aria-label="Rechercher un contact à vérifier"
              className="flex-1 bg-transparent outline-none text-brand-navy placeholder:text-gray-400 py-2 text-base"
            />
            <button
              type="button"
              aria-label="Recherche vocale"
              className="p-2 text-gray-400 hover:text-brand-navy"
            >
              🎤
            </button>
            <button
              type="submit"
              className="rounded-pill bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Vérifier maintenant
            </button>
          </form>
        </section>

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
                <span aria-hidden className="text-3xl opacity-80">
                  {s.icon}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <a
              href="/statistiques"
              className="inline-flex items-center gap-2 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
            >
              Voir plus ↗
            </a>
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
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${s.color} text-white text-lg`}
                  aria-hidden
                >
                  {s.icon}
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

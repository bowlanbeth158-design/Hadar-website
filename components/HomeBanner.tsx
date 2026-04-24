import Link from 'next/link';
import {
  ShieldCheck,
  Siren,
  Sparkles,
  Phone,
  Star,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

const BULLETS = [
  '+10 000 signalements vérifiés',
  'Recherche instantanée',
  '100% gratuit et anonyme',
  'Communauté marocaine',
];

export function HomeBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-sky via-white to-white">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — copy + CTAs */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-brand-sky text-brand-navy px-3 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-brand-blue" aria-hidden />
            La plateforme marocaine de prévention des fraudes
          </span>

          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-brand-navy leading-[1.05]">
            Avant d&apos;acheter,<br />
            <span className="bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent">
              vérifiez.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-gray-500">
            Recensez les arnaques signalées par la communauté marocaine : numéros, emails, sites,
            RIB, comptes crypto… Un réflexe simple, avant toute transaction.
          </p>

          <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-brand-navy">
                <VerifiedBadge className="h-5 w-5 shrink-0" />
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>

          {/* Stat callout */}
          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-sm text-gray-500">Déjà</span>
            <span className="text-4xl md:text-5xl font-bold text-brand-navy">3 247</span>
            <span className="inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2 py-1 text-xs font-bold">
              <TrendingUp className="h-3 w-3" aria-hidden />
              +18%
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">arnaques bloquées ce mois-ci.</p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#recherche"
              className="inline-flex items-center gap-2 rounded-pill bg-green-500 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-green transition-all hover:scale-[1.03]"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
              Vérifier maintenant
            </Link>
            <Link
              href="/signaler"
              className="inline-flex items-center gap-2 rounded-pill border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03]"
            >
              <Siren className="h-5 w-5" aria-hidden />
              Signaler une arnaque
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Sans inscription pour vérifier · Anonyme ·{' '}
            <span className="font-semibold text-brand-navy">Made in Morocco 🇲🇦</span>
          </p>
        </div>

        {/* RIGHT — floating product cards */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[5/6] max-w-md">
            {/* Shield watermark */}
            <ShieldCheck
              aria-hidden
              className="absolute inset-0 m-auto h-[380px] w-[380px] text-brand-blue/10"
            />

            {/* Card 1 — High risk search result */}
            <div
              className="absolute top-2 left-0 w-72 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft"
              style={{ animationDelay: '0s' }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-red-100 text-red-700 px-2.5 py-1 text-[11px] font-bold">
                  <XCircle className="h-3 w-3" aria-hidden />
                  Risque élevé
                </span>
                <span className="text-[10px] text-gray-400">il y a 2 min</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" aria-hidden />
                <span className="font-semibold text-brand-navy text-sm">+212 6 12 34 56 78</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">12 signalements</span>
                <div className="flex items-center gap-0.5">
                  <span className="h-1.5 w-6 rounded-full bg-red-500" />
                  <span className="h-1.5 w-6 rounded-full bg-red-500" />
                  <span className="h-1.5 w-6 rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            {/* Card 2 — Trust / reviews */}
            <div
              className="absolute top-32 right-0 w-60 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-grad-stat-violet ring-2 ring-white" />
                  <div className="h-7 w-7 rounded-full bg-grad-stat-green ring-2 ring-white" />
                  <div className="h-7 w-7 rounded-full bg-grad-stat-orange ring-2 ring-white" />
                  <div className="h-7 w-7 rounded-full bg-grad-stat-navy ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">
                    +2k
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                ))}
                <span className="ml-1 text-xs font-bold text-brand-navy">4.9</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                <span className="font-semibold text-brand-navy">2 000+</span> utilisateurs protégés
              </p>
            </div>

            {/* Card 3 — Comparison / free */}
            <div
              className="absolute bottom-0 left-6 w-80 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft"
              style={{ animationDelay: '3s' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Comparatif
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold">
                  Gratuit à vie
                </span>
              </div>
              <ul className="mt-2 space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                    <ShieldCheck className="h-4 w-4 text-brand-blue" aria-hidden />
                    Hadar
                  </span>
                  <span className="text-green-700 font-bold">0 MAD</span>
                </li>
                <li className="flex items-center justify-between text-gray-400">
                  <span>Autres plateformes</span>
                  <span className="line-through">Payant</span>
                </li>
                <li className="flex items-center justify-between text-gray-400">
                  <span>Solution classique</span>
                  <span className="line-through">Inexistant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

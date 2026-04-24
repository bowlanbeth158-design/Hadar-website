import Link from 'next/link';
import { ShieldCheck, Siren, Sparkles, Search, Users, Zap } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

// URL postimg de la photo ambassadeur Hadar (Gemini + fond transparent via remove.bg)
const AMBASSADOR_IMAGE_URL =
  'https://i.postimg.cc/tC71QjQp/Gemini-Generated-Image-5qi7u35qi7u35qi7-removebg-preview.png';

const BULLETS = [
  '+10 000 vérifications communautaires',
  '100% gratuit et confidentiel',
  'Résultat immédiat',
  'Plateforme marocaine de confiance',
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
            La plateforme marocaine de vérification des contacts
          </span>

          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-brand-navy leading-[1.05]">
            Avant d&apos;acheter,<br />
            <span className="bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent">
              vérifiez.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-gray-500">
            Plateforme de vérification des contacts. Prenez des décisions éclairées avant toute
            transaction.
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
            <span className="text-4xl md:text-5xl font-bold text-brand-navy">3 247</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">vérifications utiles ce mois-ci.</p>

          {/* CTAs — same pulse + wiggle effect as the old header buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#recherche"
              className="inline-flex items-center gap-2 rounded-pill bg-green-500 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-green animate-verify-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
            >
              <ShieldCheck className="h-5 w-5 animate-siren-wiggle" aria-hidden />
              Vérifier maintenant
            </Link>
            <Link
              href="/signaler"
              className="inline-flex items-center gap-2 rounded-pill bg-red-500 hover:bg-red-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-red animate-alert-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
            >
              <Siren className="h-5 w-5 animate-siren-wiggle" aria-hidden />
              Signaler une arnaque
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Expérience anonyme ·{' '}
            <span className="font-semibold text-brand-navy">Made in Morocco 🇲🇦</span>
          </p>
        </div>

        {/* RIGHT — ambassador photo + floating product cards (Ultahost-style) */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] max-w-lg">
            {/* Soft halo behind the person */}
            <div
              aria-hidden
              className="absolute inset-12 rounded-full bg-gradient-to-br from-brand-sky via-white to-brand-sky blur-2xl"
            />

            {/* Ambassador photo — face visible top-center, fades into page background at bottom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AMBASSADOR_IMAGE_URL}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain object-top [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
            />

            {/* Card 1 — Search action (MID-LEFT, extends outside) */}
            <div
              className="absolute top-[38%] -left-10 w-64 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft"
              style={{ animationDelay: '0s' }}
            >
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-brand-sky flex items-center justify-center">
                  <Search className="h-4 w-4 text-brand-blue" aria-hidden />
                </div>
                <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wide">
                  Vérification
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-brand-navy leading-snug">
                Vérifiez un numéro, email ou RIB
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                <Zap className="h-3 w-3 text-brand-blue" aria-hidden />
                Recherche instantanée
              </p>
            </div>

            {/* Card 2 — Community / consulted reports (TOP-RIGHT, beside head) */}
            <div
              className="absolute top-4 -right-8 w-56 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-3.5 animate-float-soft"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full bg-grad-stat-violet ring-2 ring-white" />
                <div className="h-7 w-7 rounded-full bg-grad-stat-green ring-2 ring-white" />
                <div className="h-7 w-7 rounded-full bg-grad-stat-orange ring-2 ring-white" />
                <div className="h-7 w-7 rounded-full bg-grad-stat-navy ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">
                  +2k
                </div>
              </div>
              <p className="mt-2.5 text-base font-bold text-brand-navy leading-tight">
                +10 000
              </p>
              <p className="text-[11px] text-gray-500">signalements consultés</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue">
                <Users className="h-3 w-3" aria-hidden />
                Communauté active marocaine
              </p>
            </div>

            {/* Card 3 — Risk levels overview (BOTTOM-RIGHT, wider, extends right) */}
            <div
              className="absolute bottom-6 -right-10 w-72 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft"
              style={{ animationDelay: '3s' }}
            >
              <div className="pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Niveaux de risque
                </span>
              </div>
              <ul className="mt-2.5 space-y-2.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-green-100" />
                    Risque faible
                  </span>
                  <span className="text-gray-500">0 signalement récent</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-yellow-100" />
                    Risque modéré
                  </span>
                  <span className="text-gray-500">2 signalements</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
                    Risque élevé
                  </span>
                  <span className="text-gray-500">7 signalements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

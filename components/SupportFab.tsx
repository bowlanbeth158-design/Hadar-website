'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  ChevronRight,
  ChevronDown,
  Globe,
  ArrowRight,
  Search,
  Home,
  MessageSquare,
  HelpCircle,
  Ticket,
  Mail,
  Inbox,
} from 'lucide-react';
import { OFFICIAL_LOGO_URL } from './Logo';

type Tab = 'accueil' | 'messages' | 'aide' | 'tickets';

const HELP_ARTICLES: { id: string; title: string }[] = [
  { id: '1', title: 'Comment Hadar protège-t-il mes données personnelles ?' },
  { id: '2', title: 'Comment fonctionne la modération des signalements ?' },
  { id: '3', title: 'Que signifient les 4 niveaux de risque ?' },
  { id: '4', title: 'Comment activer la vérification d’identité gratuite ?' },
];

const TABS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'accueil', label: 'Accueil', Icon: Home },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
  { id: 'aide', label: 'Aide', Icon: HelpCircle },
  { id: 'tickets', label: 'Tickets', Icon: Ticket },
];

export function SupportFab() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('accueil');

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  return (
    <>
      {/* Floating chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Centre d’aide Hadar"
          className="fixed bottom-24 right-5 z-40 w-[calc(100vw-40px)] sm:w-[380px] h-[640px] max-h-[calc(100vh-130px)] rounded-2xl bg-white shadow-glow-navy overflow-hidden flex flex-col animate-modal-pop"
        >
          {/* Top brand-navy section */}
          <div className="relative bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white px-5 pt-5 pb-14 shrink-0">
            {/* Subtle radial glow for premium feel */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]"
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={OFFICIAL_LOGO_URL}
                  alt=""
                  aria-hidden
                  className="h-6 w-6 object-contain brightness-0 invert opacity-90"
                />
                <span className="text-xs font-semibold tracking-wide opacity-90">
                  Hadar Support
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Changer de langue"
                  className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Réduire"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <p className="relative mt-4 text-sm">Bonjour 👋</p>
            <h2 className="relative mt-1 text-2xl font-bold leading-tight">
              Comment pouvons-nous vous aider ?
            </h2>
          </div>

          {/* Body — scrollable, lives below the curved overlap with header */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 -mt-7">
            {tab === 'accueil' && <AccueilContent />}
            {tab === 'messages' && (
              <Placeholder
                Icon={Mail}
                title="Aucun message"
                body="Vos conversations avec notre équipe apparaîtront ici."
              />
            )}
            {tab === 'aide' && <AideContent />}
            {tab === 'tickets' && (
              <Placeholder
                Icon={Ticket}
                title="Aucun ticket ouvert"
                body="Vous n’avez aucune demande de support en cours."
              />
            )}
          </div>

          {/* Bottom navigation tabs */}
          <nav className="shrink-0 border-t border-gray-100 bg-white px-2 py-2 flex items-center justify-around">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={`group flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                    active ? 'text-brand-navy' : 'text-gray-400 hover:text-brand-navy'
                  }`}
                >
                  <t.Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      active ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                    aria-hidden
                  />
                  <span className={`text-[10px] font-semibold ${active ? '' : 'opacity-80'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* FAB — always visible */}
      <button
        type="button"
        aria-label={open ? 'Fermer le centre d’aide' : 'Ouvrir le centre d’aide'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white shadow-glow-navy hover:scale-110 hover:shadow-glow-blue transition-all duration-200 ease-out flex items-center justify-center"
      >
        {open ? (
          <X className="h-5 w-5 animate-fade-in" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6 animate-fade-in" aria-hidden />
        )}
      </button>
    </>
  );
}

/* ---------- TAB CONTENT ---------- */

function AccueilContent() {
  return (
    <>
      {/* "Send us a message" overlapping card */}
      <Link
        href="#"
        className="group relative block rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 hover:shadow-glow-blue hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-navy">Envoyez-nous un message</p>
            <p className="text-xs text-gray-500 mt-0.5">Nous répondons instantanément</p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-glow-soft group-hover:scale-110 transition-transform">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>

      {/* Search */}
      <div className="mt-5 relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Rechercher de l’aide"
          className="w-full rounded-pill bg-gray-100 border-0 pl-10 pr-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all"
        />
      </div>

      {/* Help articles */}
      <ul className="mt-3 space-y-1.5">
        {HELP_ARTICLES.map((a) => (
          <li key={a.id}>
            <Link
              href="#"
              className="group flex items-center justify-between gap-3 rounded-xl bg-gray-100 hover:bg-brand-sky/30 px-4 py-3 text-sm text-brand-navy transition-colors"
            >
              <span className="line-clamp-2 font-medium">{a.title}</span>
              <ChevronRight
                className="h-4 w-4 text-gray-400 shrink-0 transition-all duration-200 group-hover:text-brand-blue group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function AideContent() {
  return (
    <>
      <p className="mt-2 mb-3 px-1 text-xs uppercase tracking-wide font-semibold text-gray-500">
        Articles populaires
      </p>
      <ul className="space-y-1.5">
        {HELP_ARTICLES.map((a) => (
          <li key={a.id}>
            <Link
              href="#"
              className="group flex items-center justify-between gap-3 rounded-xl bg-gray-100 hover:bg-brand-sky/30 px-4 py-3 text-sm text-brand-navy transition-colors"
            >
              <span className="line-clamp-2 font-medium">{a.title}</span>
              <ChevronRight
                className="h-4 w-4 text-gray-400 shrink-0 transition-all duration-200 group-hover:text-brand-blue group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Placeholder({
  Icon,
  title,
  body,
}: {
  Icon: typeof Inbox;
  title: string;
  body: string;
}) {
  return (
    <div className="mt-10 px-4 text-center">
      <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-sky/40 border border-brand-sky">
        <Icon className="h-6 w-6 text-brand-blue" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-brand-navy">{title}</p>
      <p className="mt-1 text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed">{body}</p>
    </div>
  );
}

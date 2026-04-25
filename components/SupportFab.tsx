'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  MessageCircle,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Globe,
  ArrowRight,
  Search,
  Home,
  MessageSquare,
  HelpCircle,
  Ticket,
  Mail,
  Inbox,
  Send,
  Check,
  Loader2,
  Plus,
} from 'lucide-react';
import { OFFICIAL_LOGO_URL } from './Logo';

type Tab = 'accueil' | 'messages' | 'aide' | 'tickets';
type View = 'main' | 'message' | 'article';
type Lang = 'fr' | 'ar' | 'en';

type Article = {
  id: string;
  title: string;
  body: string;
};

const HELP_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Comment Hadar protège-t-il mes données personnelles ?',
    body:
      'Vos signalements sont chiffrés en transit (TLS 1.3) et au repos (AES-256). Seule notre équipe de modération peut accéder aux données nécessaires à la vérification, et tout accès est tracé dans un journal d’audit. Vos informations ne sont jamais revendues à des tiers.',
  },
  {
    id: '2',
    title: 'Comment fonctionne la modération des signalements ?',
    body:
      'Chaque signalement passe par un cycle : Soumis → En cours d’examen → Décision (Publié, À corriger ou Refusé). Notre équipe vérifie les preuves fournies et compare avec d’autres signalements similaires avant validation. Vous recevez une notification à chaque étape.',
  },
  {
    id: '3',
    title: 'Que signifient les 4 niveaux de risque ?',
    body:
      '🟢 Faible — aucun signalement récent. 🟡 Vigilance — 1 à 2 signalements. 🟠 Modéré — 3 à 4 signalements. 🔴 Élevé — 5 signalements ou plus. Le niveau est calculé automatiquement et mis à jour en temps réel.',
  },
  {
    id: '4',
    title: 'Comment activer la vérification d’identité gratuite ?',
    body:
      'Rendez-vous sur Mon profil et cliquez sur « Activer ma vérification d’identité — gratuit ». Suivez les 3 étapes : photo de votre CIN (recto + verso), reconnaissance faciale (Face ID), puis validation manuelle sous 24 heures.',
  },
];

const TABS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'accueil', label: 'Accueil', Icon: Home },
  { id: 'messages', label: 'Messages', Icon: MessageSquare },
  { id: 'aide', label: 'Aide', Icon: HelpCircle },
  { id: 'tickets', label: 'Tickets', Icon: Ticket },
];

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'ar', label: 'العربية', flag: '🇲🇦' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
];

const LANG_KEY = 'hadar:support-lang';

export function SupportFab() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('accueil');
  const [view, setView] = useState<View>('main');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<Lang>('fr');
  const [langOpen, setLangOpen] = useState(false);

  // Restore stored language
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
    if (stored && LANGS.some((l) => l.id === stored)) setLang(stored as Lang);
  }, []);

  // ESC closes the right thing depending on the current state
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (langOpen) setLangOpen(false);
      else if (view !== 'main') setView('main');
      else setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, view, langOpen]);

  // Reset sub-view when switching tabs
  useEffect(() => {
    setView('main');
    setActiveArticle(null);
    setQuery('');
  }, [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter((a) => a.title.toLowerCase().includes(q));
  }, [query]);

  const openArticle = (a: Article) => {
    setActiveArticle(a);
    setView('article');
  };

  const goBack = () => {
    setView('main');
    setActiveArticle(null);
  };

  const pickLang = (id: Lang) => {
    setLang(id);
    try {
      localStorage.setItem(LANG_KEY, id);
    } catch {
      // ignore quota errors
    }
    setLangOpen(false);
  };

  const currentLang = LANGS.find((l) => l.id === lang)!;

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

              <div className="relative flex items-center gap-2">
                {/* Language switcher */}
                <button
                  type="button"
                  aria-label="Changer de langue"
                  aria-expanded={langOpen}
                  onClick={() => setLangOpen((v) => !v)}
                  className="relative h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  <span className="absolute -bottom-1 -right-1 text-[10px]">
                    {currentLang.flag}
                  </span>
                </button>

                {/* Minimize */}
                <button
                  type="button"
                  aria-label="Réduire"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>

                {/* Language popover */}
                {langOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 rounded-xl bg-white text-brand-navy border border-gray-200 shadow-xl z-10 overflow-hidden animate-fade-in-down">
                    {LANGS.map((l) => {
                      const active = l.id === lang;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => pickLang(l.id)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                            active ? 'font-semibold' : 'text-gray-600'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="text-base leading-none">{l.flag}</span>
                            {l.label}
                          </span>
                          {active && <Check className="h-4 w-4 text-brand-blue" aria-hidden />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <p className="relative mt-4 text-sm">Bonjour 👋</p>
            <h2 className="relative mt-1 text-2xl font-bold leading-tight">
              {view === 'message'
                ? 'Envoyez-nous un message'
                : view === 'article'
                  ? 'Centre d’aide'
                  : 'Comment pouvons-nous vous aider ?'}
            </h2>
          </div>

          {/* Body — scrollable, lives below the curved overlap with header */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 -mt-7">
            {view === 'message' ? (
              <MessageForm onBack={goBack} />
            ) : view === 'article' && activeArticle ? (
              <ArticleView article={activeArticle} onBack={goBack} />
            ) : tab === 'accueil' ? (
              <AccueilContent
                articles={filtered}
                query={query}
                setQuery={setQuery}
                onArticleClick={openArticle}
                onMessageClick={() => setView('message')}
              />
            ) : tab === 'messages' ? (
              <MessagesEmpty onStart={() => setView('message')} />
            ) : tab === 'aide' ? (
              <AideContent
                articles={filtered}
                query={query}
                setQuery={setQuery}
                onArticleClick={openArticle}
              />
            ) : (
              <TicketsEmpty onCreate={() => setView('message')} />
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

function AccueilContent({
  articles,
  query,
  setQuery,
  onArticleClick,
  onMessageClick,
}: {
  articles: Article[];
  query: string;
  setQuery: (v: string) => void;
  onArticleClick: (a: Article) => void;
  onMessageClick: () => void;
}) {
  return (
    <>
      {/* "Send us a message" overlapping card */}
      <button
        type="button"
        onClick={onMessageClick}
        className="group w-full text-left relative block rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 hover:shadow-glow-blue hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-navy">Envoyez-nous un message</p>
            <p className="text-xs text-gray-500 mt-0.5">Nous répondons instantanément</p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-glow-soft group-hover:scale-110 group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </button>

      <SearchInput value={query} onChange={setQuery} />

      <ArticleList articles={articles} onClick={onArticleClick} query={query} />
    </>
  );
}

function AideContent({
  articles,
  query,
  setQuery,
  onArticleClick,
}: {
  articles: Article[];
  query: string;
  setQuery: (v: string) => void;
  onArticleClick: (a: Article) => void;
}) {
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <p className="mt-4 mb-2 px-1 text-[11px] uppercase tracking-wide font-semibold text-gray-500">
        Articles populaires
      </p>
      <ArticleList articles={articles} onClick={onArticleClick} query={query} />
    </>
  );
}

function MessagesEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="mt-10 px-4 text-center">
      <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-sky/40 border border-brand-sky">
        <Mail className="h-6 w-6 text-brand-blue" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-brand-navy">Aucun message</p>
      <p className="mt-1 text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed">
        Vos conversations avec notre équipe apparaîtront ici.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-4 py-2 text-xs font-semibold shadow-glow-blue hover:shadow-glow-navy hover:-translate-y-px transition-all"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        Démarrer une conversation
      </button>
    </div>
  );
}

function TicketsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mt-10 px-4 text-center">
      <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-sky/40 border border-brand-sky">
        <Ticket className="h-6 w-6 text-brand-blue" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-brand-navy">Aucun ticket ouvert</p>
      <p className="mt-1 text-xs text-gray-500 max-w-[260px] mx-auto leading-relaxed">
        Vous n’avez aucune demande de support en cours.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-4 py-2 text-xs font-semibold shadow-glow-blue hover:shadow-glow-navy hover:-translate-y-px transition-all"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Créer un ticket
      </button>
    </div>
  );
}

/* ---------- SUB-VIEWS ---------- */

function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-glow-soft p-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Retour
      </button>
      <h3 className="mt-3 text-base font-bold text-brand-navy leading-snug">{article.title}</h3>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{article.body}</p>
    </article>
  );
}

function MessageForm({ onBack }: { onBack: () => void }) {
  type Status = 'idle' | 'sending' | 'sent';
  const [status, setStatus] = useState<Status>('idle');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
    }, 900);
  };

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-glow-soft p-5 text-center">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-glow-green animate-modal-pop">
          <Check className="h-7 w-7 text-white animate-fade-in" aria-hidden />
        </div>
        <p className="text-sm font-bold text-brand-navy">Message envoyé !</p>
        <p className="mt-1 text-xs text-gray-500 max-w-[260px] mx-auto">
          Notre équipe revient vers vous dans les plus brefs délais.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1 rounded-pill border border-gray-200 text-brand-navy px-4 py-2 text-xs font-semibold hover:border-brand-blue hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Retour
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-gray-200 shadow-glow-soft p-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Retour
      </button>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="msg-subject" className="block text-xs font-semibold text-brand-navy mb-1">
            Sujet
          </label>
          <input
            id="msg-subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex : Question sur la vérification"
            className="w-full rounded-pill border border-gray-200 bg-white px-3.5 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
          />
        </div>
        <div>
          <label htmlFor="msg-body" className="block text-xs font-semibold text-brand-navy mb-1">
            Votre message
          </label>
          <textarea
            id="msg-body"
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Décrivez votre demande…"
            className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status !== 'idle' || !subject.trim() || !body.trim()}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-4 py-2.5 text-sm font-semibold shadow-glow-blue hover:shadow-glow-navy hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden />
            Envoyer
          </>
        )}
      </button>
    </form>
  );
}

/* ---------- SHARED PIECES ---------- */

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-5 relative">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher de l’aide"
        className="w-full rounded-pill bg-gray-100 border-0 pl-10 pr-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all"
      />
    </div>
  );
}

function ArticleList({
  articles,
  onClick,
  query,
}: {
  articles: Article[];
  onClick: (a: Article) => void;
  query: string;
}) {
  if (articles.length === 0) {
    return (
      <div className="mt-6 px-4 text-center">
        <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Inbox className="h-5 w-5 text-gray-400" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-brand-navy">Aucun résultat</p>
        <p className="mt-1 text-xs text-gray-500">
          Aucun article ne correspond à « {query} ».
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-3 space-y-1.5">
      {articles.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            onClick={() => onClick(a)}
            className="group w-full text-left flex items-center justify-between gap-3 rounded-xl bg-gray-100 hover:bg-brand-sky/30 px-4 py-3 text-sm text-brand-navy transition-colors"
          >
            <span className="line-clamp-2 font-medium">{a.title}</span>
            <ChevronRight
              className="h-4 w-4 text-gray-400 shrink-0 transition-all duration-200 group-hover:text-brand-blue group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  MessageCircle,
  X,
  Home,
  MessageSquare,
  HelpCircle,
  Folder,
  Search,
  Send,
  ChevronRight,
  ChevronLeft,
  Globe,
  Check,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import type { Locale } from '@/lib/i18n/messages';
import { OFFICIAL_LOGO_URL } from './Logo';

type Tab = 'home' | 'messages' | 'help' | 'tickets';

// Each "article key" maps to a question label + body in messages.ts.
type ArticleKey = string;

const POPULAR_QUESTIONS: ArticleKey[] = [
  'chatbot.home.popular.q1',
  'chatbot.home.popular.q2',
  'chatbot.home.popular.q3',
  'chatbot.home.popular.q4',
];

type CatId = 'verification' | 'signalement' | 'compte' | 'alertes';

const HELP_CATEGORIES: { id: CatId; items: string[] }[] = [
  { id: 'verification', items: ['q1', 'q2', 'q3', 'q4'] },
  { id: 'signalement',  items: ['q1', 'q2', 'q3', 'q4'] },
  { id: 'compte',       items: ['q1', 'q2', 'q3', 'q4'] },
  { id: 'alertes',      items: ['q1', 'q2', 'q3'] },
];

type DemoTicket = {
  id: string;
  titleKey: string;
  status: 'review' | 'validated' | 'replied';
  timeKey: string;
};

const DEMO_TICKETS: DemoTicket[] = [
  { id: 't1', titleKey: 'chatbot.tickets.t1.title', status: 'review',    timeKey: 'chatbot.tickets.t1.time' },
  { id: 't2', titleKey: 'chatbot.tickets.t2.title', status: 'validated', timeKey: 'chatbot.tickets.t2.time' },
  { id: 't3', titleKey: 'chatbot.tickets.t3.title', status: 'replied',   timeKey: 'chatbot.tickets.t3.time' },
];

const STATUS_STYLE: Record<DemoTicket['status'], { dot: string; bg: string; text: string; key: string }> = {
  review:    { dot: 'bg-yellow-300', bg: 'bg-yellow-100', text: 'text-yellow-700', key: 'chatbot.tickets.status.review' },
  validated: { dot: 'bg-green-500',  bg: 'bg-green-100',  text: 'text-green-700',  key: 'chatbot.tickets.status.validated' },
  replied:   { dot: 'bg-blue-400',   bg: 'bg-blue-100',   text: 'text-blue-700',   key: 'chatbot.tickets.status.replied' },
};

const LANGS: { id: Locale; native: string; flag: string }[] = [
  { id: 'fr', native: 'Français', flag: '🇫🇷' },
  { id: 'ar', native: 'العربية', flag: '🇲🇦' },
  { id: 'en', native: 'English', flag: '🇬🇧' },
];

type ChatMessage = { id: number; from: 'user' | 'bot'; text: string };

export function SupportFab() {
  const { t, dir, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  // article view overlays the body when a question is tapped
  const [activeArticle, setActiveArticle] = useState<ArticleKey | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  // Esc closes the right thing depending on the current state.
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (langOpen) setLangOpen(false);
      else if (activeArticle) setActiveArticle(null);
      else setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, langOpen, activeArticle]);

  // Switching tab clears the article overlay.
  useEffect(() => {
    setActiveArticle(null);
  }, [tab]);

  const currentLang = LANGS.find((l) => l.id === locale) ?? LANGS[0]!;

  const headerTitle = activeArticle
    ? t('chatbot.help.title')
    : tab === 'messages'
      ? t('chatbot.messages.title')
      : tab === 'help'
        ? t('chatbot.help.title')
        : tab === 'tickets'
          ? t('chatbot.tickets.title')
          : t('chatbot.home.title');

  return (
    <>
      {/* Floating launcher — only visible when the panel is closed. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('chatbot.openLabel')}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white shadow-glow-blue hover:scale-105 transition-transform duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t('chatbot.brand')}
          dir={dir}
          className="fixed bottom-5 right-4 sm:right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(640px,calc(100vh-3rem))] rounded-2xl bg-white shadow-glow-navy overflow-hidden flex flex-col animate-modal-pop"
        >
          {/* Brand-gradient header — restored from the previous design,
              with the radial-glow overlay, the curved overlap into the
              body (pb-14 + body -mt-7), the "Bonjour 👋" salutation
              and a contextual H2. The right-hand side carries the
              language switcher (Globe + flag badge) and the close
              button — both kept, as requested. */}
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
                  {t('chatbot.brand')}
                </span>
              </div>

              <div className="relative flex items-center gap-2">
                {/* Language switcher — local to the chatbot but talks
                    to the GLOBAL i18n provider via setLocale, so a
                    pick here also flips the rest of the site. */}
                <button
                  type="button"
                  aria-label={t('chatbot.langSwitch.label')}
                  aria-expanded={langOpen}
                  onClick={() => setLangOpen((v) => !v)}
                  className="relative h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  <span className="absolute -bottom-1 -right-1 text-[10px]">
                    {currentLang.flag}
                  </span>
                </button>

                {/* Close — keeps the panel-state vs. closing distinct
                    from the language switcher. */}
                <button
                  type="button"
                  aria-label={t('chatbot.close.label')}
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>

                {langOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 rounded-xl bg-white text-brand-navy border border-gray-200 shadow-xl z-10 overflow-hidden animate-fade-in-down">
                    {LANGS.map((l) => {
                      const active = l.id === locale;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => {
                            setLocale(l.id);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                            active ? 'font-semibold' : 'text-gray-600'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span aria-hidden className="text-base leading-none">
                              {l.flag}
                            </span>
                            {l.native}
                          </span>
                          {active && <Check className="h-4 w-4 text-brand-blue" aria-hidden />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <p className="relative mt-4 text-sm">{t('chatbot.home.greeting')}</p>
            <h2 className="relative mt-1 text-2xl font-bold leading-tight">{headerTitle}</h2>
          </div>

          {/* Body — overlaps the header by 28 px (-mt-7) for the
              curved-card feel of the original design. */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 -mt-7 bg-gray-50">
            {activeArticle ? (
              <ArticleView articleKey={activeArticle} onBack={() => setActiveArticle(null)} />
            ) : tab === 'home' ? (
              <HomeTab onJump={(target) => setTab(target)} onAsk={(k) => setActiveArticle(k)} />
            ) : tab === 'messages' ? (
              <MessagesTab />
            ) : tab === 'help' ? (
              <HelpTab onAsk={(k) => setActiveArticle(k)} />
            ) : (
              <TicketsTab />
            )}
          </div>

          {/* Bottom navigation — 4 tabs. Hidden when an article is open
              so the user can read without a distracting nav. */}
          {!activeArticle && <BottomNav tab={tab} setTab={setTab} />}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// Reusable list item — same recipe used across Home / Help.
// ---------------------------------------------------------------------
function QuestionItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center justify-between gap-3 rounded-xl bg-white hover:bg-brand-sky/30 border border-gray-200 hover:border-brand-blue/40 px-3.5 py-2.5 text-sm text-brand-navy transition-colors text-left"
    >
      <span className="line-clamp-2">{label}</span>
      <ChevronRight
        className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all rtl:rotate-180"
        aria-hidden
      />
    </button>
  );
}

// ---------------------------------------------------------------------
// PAGE 1 — Accueil
// ---------------------------------------------------------------------
function HomeTab({
  onJump,
  onAsk,
}: {
  onJump: (t: Tab) => void;
  onAsk: (k: ArticleKey) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="pt-4 pb-2 space-y-4">
      {/* CTA card — opens Messages */}
      <button
        type="button"
        onClick={() => onJump('messages')}
        className="group w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-gray-200 hover:border-brand-blue/50 hover:shadow-glow-soft transition-all px-4 py-3.5 text-left"
      >
        <span>
          <p className="text-sm font-semibold text-brand-navy">{t('chatbot.home.cta.title')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('chatbot.home.cta.subtitle')}</p>
        </span>
        <ChevronRight
          className="h-4 w-4 text-gray-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all rtl:rotate-180"
          aria-hidden
        />
      </button>

      {/* Pseudo search — jumps to Help */}
      <button
        type="button"
        onClick={() => onJump('help')}
        className="w-full flex items-center gap-2 rounded-pill bg-white border border-gray-200 hover:border-brand-blue/50 px-3.5 py-2 text-sm text-gray-500 transition-colors"
      >
        <Search className="h-4 w-4" aria-hidden />
        {t('chatbot.home.search.placeholder')}
      </button>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          {t('chatbot.home.popular.title')}
        </p>
        <ul className="space-y-1.5">
          {POPULAR_QUESTIONS.map((k) => (
            <li key={k}>
              <QuestionItem label={t(k)} onClick={() => onAsk(k)} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onJump('help')}
          className="mt-3 w-full text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors"
        >
          {t('chatbot.home.viewAll')}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// PAGE 2 — Messages (WhatsApp-style chat)
// ---------------------------------------------------------------------
function MessagesTab() {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  // Seed the conversation with a bot greeting so the empty state still
  // has something to read.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 0, from: 'bot', text: t('chatbot.bot.greeting') },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counter = useRef(1);

  // Refresh greeting when locale changes (mounted message vs t() at
  // a different moment).
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 0 ? { ...m, text: t('chatbot.bot.greeting') } : m)),
    );
  }, [t]);

  // Auto-scroll to bottom on every new message / typing change.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    setDraft('');
    const userMsg: ChatMessage = { id: counter.current++, from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    // Bot replies after 1.2 s — long enough to see the typing
    // indicator, short enough to feel snappy.
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: counter.current++,
        from: 'bot',
        text: t('chatbot.bot.ack'),
      };
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full pt-3">
      <p className="inline-flex self-start items-center gap-1.5 rounded-pill bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold mb-3">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        {t('chatbot.messages.status')}
      </p>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-3">
        {messages.map((m) => (
          <ChatBubble key={m.id} from={m.from} text={m.text} />
        ))}
        {typing && (
          <div className="flex justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-gray-200 px-3.5 py-2 text-xs text-gray-400 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              {t('chatbot.bot.typing')}
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-2 flex items-center gap-2 sticky bottom-0 bg-gray-50 pt-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chatbot.messages.input.placeholder')}
          className="flex-1 rounded-pill border border-gray-200 bg-white px-4 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.trim() || typing}
          aria-label={t('chatbot.messages.send')}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand-blue text-white hover:bg-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function ChatBubble({ from, text }: { from: 'user' | 'bot'; text: string }) {
  const isUser = from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <span
        className={
          isUser
            ? 'inline-block max-w-[78%] rounded-2xl rounded-br-sm bg-brand-blue text-white px-3.5 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-line'
            : 'inline-block max-w-[78%] rounded-2xl rounded-bl-sm bg-white border border-gray-200 text-brand-navy px-3.5 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-line'
        }
      >
        {text}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------
// PAGE 3 — Aide
// ---------------------------------------------------------------------
function HelpTab({ onAsk }: { onAsk: (k: ArticleKey) => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HELP_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((it) =>
        q === '' ? true : t(`chatbot.help.${cat.id}.${it}`).toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query, t]);

  return (
    <div className="pt-4 pb-2 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('chatbot.help.search.placeholder')}
          className="w-full rounded-pill bg-white border border-gray-200 pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">{t('chatbot.empty')}</p>
      ) : (
        filtered.map((cat) => (
          <div key={cat.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">
              {t(`chatbot.help.cat.${cat.id}`)}
            </p>
            <ul className="space-y-1">
              {cat.items.map((it) => {
                const k = `chatbot.help.${cat.id}.${it}`;
                return (
                  <li key={it}>
                    <QuestionItem label={t(k)} onClick={() => onAsk(k)} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// PAGE 4 — Suivi
// ---------------------------------------------------------------------
function TicketsTab() {
  const { t } = useI18n();
  return (
    <div className="pt-4 pb-2 space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-gradient-to-br from-brand-sky/40 to-white border border-brand-blue/20 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums bg-grad-stat-navy bg-clip-text text-transparent">
            2
          </p>
          <p className="text-xs text-gray-600">{t('chatbot.tickets.stats.active')}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-100 to-white border border-green-500/20 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-green-700">5</p>
          <p className="text-xs text-gray-600">{t('chatbot.tickets.stats.resolved')}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {DEMO_TICKETS.map((tk) => {
          const s = STATUS_STYLE[tk.status];
          return (
            <li key={tk.id}>
              <button
                type="button"
                className="w-full text-left rounded-xl bg-white border border-gray-200 hover:border-brand-blue/40 hover:shadow-glow-soft p-3.5 transition-all"
              >
                <p className="text-sm font-semibold text-brand-navy">{t(tk.titleKey)}</p>
                <p
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-pill ${s.bg} ${s.text} px-2 py-0.5 text-[11px] font-semibold`}
                >
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {t(s.key)}
                </p>
                <p className="mt-1.5 text-xs text-gray-400">{t(tk.timeKey)}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------
// Article overlay — full body of a tapped question + Back button.
// Falls back to a friendly "answer coming" message when a question
// has no dedicated body in messages.ts.
// ---------------------------------------------------------------------
function ArticleView({ articleKey, onBack }: { articleKey: ArticleKey; onBack: () => void }) {
  const { t } = useI18n();
  const bodyKey = `${articleKey}.body`;
  const body = t(bodyKey);
  // Fallback when no dedicated body exists (t() returns the key).
  const text = body === bodyKey ? t('chatbot.article.fallback') : body;

  return (
    <div className="pt-4 pb-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy transition-colors mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        {t('chatbot.article.back')}
      </button>

      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-brand-navy leading-snug">{t(articleKey)}</h3>
        <p className="mt-2.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Bottom navigation
// ---------------------------------------------------------------------
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { t } = useI18n();
  const items: { id: Tab; Icon: typeof Home; label: string }[] = [
    { id: 'home',     Icon: Home,           label: t('chatbot.tab.home') },
    { id: 'messages', Icon: MessageSquare,  label: t('chatbot.tab.messages') },
    { id: 'help',     Icon: HelpCircle,     label: t('chatbot.tab.help') },
    { id: 'tickets',  Icon: Folder,         label: t('chatbot.tab.tickets') },
  ];

  return (
    <nav className="border-t border-gray-200 bg-white grid grid-cols-4">
      {items.map(({ id, Icon, label }) => {
        const active = id === tab;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              active ? 'text-brand-blue' : 'text-gray-400 hover:text-brand-navy'
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? 'text-brand-blue' : ''}`} aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

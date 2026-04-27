'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  MessageCircle,
  X,
  Home,
  MessageSquare,
  HelpCircle,
  Folder,
  Search,
  Send,
  Mail,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import { OFFICIAL_LOGO_URL } from './Logo';

type Tab = 'home' | 'messages' | 'help' | 'tickets';

const POPULAR_QUESTIONS = ['q1', 'q2', 'q3', 'q4'] as const;

const HELP_CATEGORIES: { id: 'verification' | 'signalement' | 'compte' | 'alertes'; items: string[] }[] = [
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

export function SupportFab() {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('home');

  // Allow Esc to close the panel.
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
      {/* Floating launcher — swaps icon when the panel is open. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('chatbot.close') : t('chatbot.openLabel')}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white shadow-glow-blue hover:scale-105 transition-transform duration-200"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t('chatbot.brand')}
          dir={dir}
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(620px,calc(100vh-7rem))] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-down"
        >
          {/* Header — brand gradient strip with the logo and brand name. */}
          <div className="relative bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white px-5 py-4">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OFFICIAL_LOGO_URL}
                alt=""
                aria-hidden
                className="h-7 w-7 object-contain bg-white/95 rounded-md p-1"
              />
              <span className="text-base font-semibold">{t('chatbot.brand')}</span>
            </div>
          </div>

          {/* Tab content — scrollable. */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
            {tab === 'home'     && <HomeTab onJump={(target) => setTab(target)} />}
            {tab === 'messages' && <MessagesTab />}
            {tab === 'help'     && <HelpTab />}
            {tab === 'tickets'  && <TicketsTab />}
          </div>

          {/* Bottom navigation — 4 tabs. */}
          <BottomNav tab={tab} setTab={setTab} />
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// PAGE 1 — Accueil
// ---------------------------------------------------------------------
function HomeTab({ onJump }: { onJump: (t: Tab) => void }) {
  const { t } = useI18n();
  return (
    <div className="p-5 space-y-5">
      <div>
        <p className="text-2xl text-brand-navy">{t('chatbot.home.greeting')}</p>
        <h2 className="mt-1 text-xl font-bold text-brand-navy leading-tight">
          {t('chatbot.home.title')}
        </h2>
      </div>

      <button
        type="button"
        onClick={() => onJump('messages')}
        className="group w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-gray-200 hover:border-brand-blue/50 hover:shadow-glow-soft transition-all px-4 py-3.5 text-left"
      >
        <span>
          <p className="text-sm font-semibold text-brand-navy">{t('chatbot.home.cta.title')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('chatbot.home.cta.subtitle')}</p>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" aria-hidden />
      </button>

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
          {POPULAR_QUESTIONS.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onJump('help')}
                className="group w-full flex items-center justify-between gap-3 rounded-xl bg-white hover:bg-brand-sky/30 border border-gray-200 hover:border-brand-blue/40 px-3.5 py-2.5 text-sm text-brand-navy transition-colors text-left"
              >
                <span className="line-clamp-2">{t(`chatbot.home.popular.${q}`)}</span>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" aria-hidden />
              </button>
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
// PAGE 2 — Messages
// ---------------------------------------------------------------------
function MessagesTab() {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setDraft('');
      setTimeout(() => setSent(false), 3000);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5">
        <h2 className="text-xl font-bold text-brand-navy">{t('chatbot.messages.title')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t('chatbot.messages.subtitle')}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          {t('chatbot.messages.status')}
        </p>
      </div>

      <div className="flex-1 px-5 py-6 flex items-center justify-center text-center">
        {sent ? (
          <div className="space-y-2">
            <Mail className="h-8 w-8 text-green-500 mx-auto" aria-hidden />
            <p className="text-sm font-semibold text-brand-navy">{t('chatbot.notif.sent')}</p>
          </div>
        ) : (
          <div className="space-y-1 text-sm text-gray-500">
            <p className="font-medium text-brand-navy">{t('chatbot.messages.empty.title')}</p>
            <p>{t('chatbot.messages.empty.subtitle')}</p>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-gray-200 bg-white p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chatbot.messages.input.placeholder')}
          className="flex-1 rounded-pill border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label={t('chatbot.messages.send')}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand-blue text-white hover:bg-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// PAGE 3 — Aide
// ---------------------------------------------------------------------
function HelpTab() {
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
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-brand-navy">{t('chatbot.help.title')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t('chatbot.help.subtitle')}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('chatbot.help.search.placeholder')}
          className="w-full rounded-pill bg-white border border-gray-200 pl-9 pr-3 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue transition-colors"
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
              {cat.items.map((it) => (
                <li key={it}>
                  <button
                    type="button"
                    className="group w-full flex items-center justify-between gap-3 rounded-xl bg-white hover:bg-brand-sky/30 border border-gray-200 hover:border-brand-blue/40 px-3.5 py-2.5 text-sm text-brand-navy transition-colors text-left"
                  >
                    <span className="line-clamp-2">{t(`chatbot.help.${cat.id}.${it}`)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" aria-hidden />
                  </button>
                </li>
              ))}
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
    <div className="p-5 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-brand-navy">{t('chatbot.tickets.title')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t('chatbot.tickets.subtitle')}</p>
      </div>

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
                <p className={`mt-1 inline-flex items-center gap-1.5 rounded-pill ${s.bg} ${s.text} px-2 py-0.5 text-[11px] font-semibold`}>
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

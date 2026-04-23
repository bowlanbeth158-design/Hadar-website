'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  MessageCircle,
  Bot,
  UserRound,
  Shield,
  Bell,
  Eye,
  Lock,
  RefreshCw,
  Archive,
  UserPlus,
  Flag,
  CheckCircle2,
  X,
  Settings,
} from 'lucide-react';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';

type Status = 'ouvert' | 'en_cours' | 'waiting' | 'resolu';
const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  ouvert: { label: 'Ouvert', cls: 'bg-brand-sky/70 text-brand-navy' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  waiting: { label: 'En attente user', cls: 'bg-gray-100 text-gray-500' },
  resolu: { label: 'Résolu', cls: 'bg-green-100 text-green-700' },
};

type Priority = 'basse' | 'moyenne' | 'haute' | 'urgente';
const PRIORITY_DOT: Record<Priority, string> = {
  basse: 'bg-green-500',
  moyenne: 'bg-gray-400',
  haute: 'bg-orange-500',
  urgente: 'bg-red-500',
};
const PRIORITY_LABEL: Record<Priority, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente',
};

type Message = { author: 'user' | 'bot' | 'member' | 'note'; text: string; time: string };

type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  status: Status;
  priority: Priority;
  unread: boolean;
  time: string;
  assignedTo: string | null;
  mentioned: boolean;
  archived: boolean;
  email: string;
  phone: string;
  lang: string;
  joined: string;
  tags: string[];
  thread: Message[];
};

const CURRENT_MEMBER = 'Rajae OUAZZANI';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 't1',
    name: 'Yahya MOUSSAOUI',
    initials: 'YM',
    preview: 'Bonjour, mon signalement #2454 est refusé sans explication…',
    status: 'ouvert',
    priority: 'haute',
    unread: true,
    time: 'il y a 5 min',
    assignedTo: CURRENT_MEMBER,
    mentioned: true,
    archived: false,
    email: 'yahya.moussaoui@gmail.com',
    phone: '+212 675 487 955',
    lang: 'Français',
    joined: '13/04/26',
    tags: ['modération', 'preuves', 'urgent'],
    thread: [
      { author: 'user', text: 'Bonjour, mon signalement #2454 est refusé sans explication. Pouvez-vous m’aider ?', time: '10:12' },
      { author: 'bot', text: 'Bonjour ! Je transfère votre demande à notre équipe support. Une réponse vous sera donnée sous peu.', time: '10:12' },
      { author: 'member', text: 'Bonjour Yahya, je regarde votre dossier #2454 immédiatement.', time: '10:18' },
      { author: 'note', text: 'Note interne : vérifier les preuves fournies — elles sont partiellement corrompues (PDF illisible).', time: '10:19' },
    ],
  },
  {
    id: 't2',
    name: 'Salma EL AMRANI',
    initials: 'SA',
    preview: 'Merci pour votre réponse rapide !',
    status: 'resolu',
    priority: 'moyenne',
    unread: false,
    time: 'il y a 1 h',
    assignedTo: CURRENT_MEMBER,
    mentioned: false,
    archived: false,
    email: 'salma.elamrani@hadar.ma',
    phone: '+212 661 234 567',
    lang: 'Français',
    joined: '02/03/26',
    tags: ['facturation'],
    thread: [
      { author: 'user', text: 'Bonjour, ma dernière facture est illisible', time: '09:02' },
      { author: 'member', text: 'Je vous la renvoie en PDF tout de suite.', time: '09:08' },
      { author: 'user', text: 'Merci pour votre réponse rapide !', time: '09:10' },
    ],
  },
  {
    id: 't3',
    name: 'Karim BENJELLOUN',
    initials: 'KB',
    preview: 'Je n’arrive pas à réinitialiser mon mot de passe',
    status: 'en_cours',
    priority: 'haute',
    unread: true,
    time: 'il y a 2 h',
    assignedTo: null,
    mentioned: false,
    archived: false,
    email: 'k.benjelloun@yahoo.fr',
    phone: '+212 677 112 233',
    lang: 'Français',
    joined: '19/03/26',
    tags: ['authentification'],
    thread: [
      { author: 'user', text: 'Je n’arrive pas à réinitialiser mon mot de passe, le lien ne fonctionne pas.', time: '08:45' },
      { author: 'bot', text: 'Je transfère votre demande à un agent.', time: '08:45' },
    ],
  },
  {
    id: 't4',
    name: 'Fatima Z.',
    initials: 'FZ',
    preview: 'Bonjour, j’ai une question sur la vérification d’un RIB',
    status: 'waiting',
    priority: 'basse',
    unread: false,
    time: 'il y a 3 h',
    assignedTo: CURRENT_MEMBER,
    mentioned: false,
    archived: false,
    email: 'fatima.z@outlook.com',
    phone: '+212 600 998 877',
    lang: 'Français',
    joined: '07/04/26',
    tags: ['RIB'],
    thread: [
      { author: 'user', text: 'Bonjour, j’ai une question sur la vérification d’un RIB avant un achat.', time: '07:30' },
      { author: 'member', text: 'Bonjour Fatima, pouvez-vous nous envoyer le RIB concerné ?', time: '07:42' },
    ],
  },
  {
    id: 't5',
    name: 'Mehdi TAZI',
    initials: 'MT',
    preview: 'Est-ce que mon compte est bloqué ?',
    status: 'ouvert',
    priority: 'urgente',
    unread: true,
    time: 'il y a 4 h',
    assignedTo: null,
    mentioned: true,
    archived: false,
    email: 'mehdi.tazi@gmail.com',
    phone: '+212 688 443 221',
    lang: 'Français',
    joined: '27/02/26',
    tags: ['blocage'],
    thread: [
      { author: 'user', text: 'Est-ce que mon compte est bloqué ? Je n’arrive plus à me connecter depuis ce matin.', time: '06:15' },
      { author: 'bot', text: 'Je vérifie l’état de votre compte…', time: '06:15' },
    ],
  },
];

const FILTERS = ['Tous', 'Non assignés', 'Mes tickets', 'Mentions', 'Résolus', 'Archivés'] as const;
type Filter = (typeof FILTERS)[number];

function ThreadMenu({
  conv,
  onAction,
}: {
  conv: Conversation;
  onAction: (a: 'archive' | 'reassign' | 'priority' | 'close') => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const items: { label: string; Icon: typeof Archive; a: 'archive' | 'reassign' | 'priority' | 'close' }[] = [
    { label: conv.archived ? 'Désarchiver' : 'Archiver', Icon: Archive, a: 'archive' },
    { label: conv.assignedTo ? 'Réassigner' : 'M’assigner', Icon: UserPlus, a: 'reassign' },
    { label: 'Changer la priorité', Icon: Flag, a: 'priority' },
    { label: conv.status === 'resolu' ? 'Rouvrir' : 'Clore', Icon: CheckCircle2, a: 'close' },
  ];

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-brand-navy"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
        >
          {items.map((it) => (
            <button
              key={it.a}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction(it.a);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <it.Icon className="h-4 w-4" aria-hidden />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatbotPanel() {
  const [enabled, setEnabled] = useState(true);
  const [welcome, setWelcome] = useState(
    "Bonjour ! Je suis l'assistant Hadar. En quoi puis-je vous aider ?",
  );
  const [handoverMin, setHandoverMin] = useState(5);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-blue" aria-hidden />
              Chatbot Hadar
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Réponses automatiques avant passage à un agent humain.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-navy mb-1.5">
            Message de bienvenue
          </label>
          <textarea
            rows={3}
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            disabled={!enabled}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-navy mb-1.5">
            Escalade vers un agent humain après
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={60}
              value={handoverMin}
              onChange={(e) => setHandoverMin(Number(e.target.value) || 1)}
              disabled={!enabled}
              className="w-20 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-400"
            />
            <span className="text-sm text-gray-500">minutes sans résolution</span>
          </div>
        </div>

        <div className="rounded-xl bg-brand-sky/40 border border-brand-blue/20 px-4 py-3 text-xs text-brand-navy flex items-start gap-2">
          <Settings className="h-4 w-4 mt-0.5 shrink-0 text-brand-blue" aria-hidden />
          <p>
            Le chatbot répond à partir de la base FAQ. Les conversations non résolues basculent
            automatiquement dans l&rsquo;onglet <strong>Tickets</strong>.
          </p>
        </div>
      </div>

      <aside className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Performances
        </p>
        <div>
          <p className="text-xs text-gray-500">Résolues par le bot · 30 j</p>
          <p className="text-2xl font-bold text-brand-navy">
            <AnimatedCounter value="68%" />
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Conversations aujourd&rsquo;hui</p>
          <p className="text-2xl font-bold text-brand-navy">
            <AnimatedCounter value="142" />
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Temps moyen de réponse</p>
          <p className="text-2xl font-bold text-brand-navy">
            <AnimatedCounter value="3s" />
          </p>
        </div>
      </aside>
    </section>
  );
}

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<'tickets' | 'chatbot'>('tickets');
  const [activeFilter, setActiveFilter] = useState<Filter>('Tous');
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATIONS[0]!.id);
  const [search, setSearch] = useState('');
  const [composerMode, setComposerMode] = useState<'reply' | 'note'>('reply');
  const [draft, setDraft] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? null : m)), 2200);
  };

  const activeConv =
    conversations.find((c) => c.id === activeId) ?? conversations[0] ?? INITIAL_CONVERSATIONS[0]!;

  const filtered = conversations.filter((c) => {
    if (activeFilter === 'Non assignés') return !c.assignedTo && !c.archived;
    if (activeFilter === 'Mes tickets') return c.assignedTo === CURRENT_MEMBER && !c.archived;
    if (activeFilter === 'Mentions') return c.mentioned && !c.archived;
    if (activeFilter === 'Résolus') return c.status === 'resolu' && !c.archived;
    if (activeFilter === 'Archivés') return c.archived;
    return !c.archived;
  }).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
  });

  const openCount = conversations.filter((c) => c.status === 'ouvert' || c.status === 'en_cours').length;
  const unreadCount = conversations.filter((c) => c.unread).length;

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Utilisateur', 'Statut', 'Priorité', 'Dernier message', 'Heure'],
    ...conversations.map((c) => [
      c.id,
      c.name,
      STATUS_STYLE[c.status].label,
      c.priority,
      c.preview,
      c.time,
    ]),
  ];

  const updateActive = (patch: Partial<Conversation>) => {
    setConversations((list) =>
      list.map((c) => (c.id === activeConv.id ? { ...c, ...patch } : c)),
    );
  };

  const selectConv = (id: string) => {
    setActiveId(id);
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const handleThreadAction = (a: 'archive' | 'reassign' | 'priority' | 'close') => {
    if (a === 'archive') {
      updateActive({ archived: !activeConv.archived });
      showFlash(activeConv.archived ? 'Ticket désarchivé' : 'Ticket archivé');
    }
    if (a === 'reassign') {
      updateActive({ assignedTo: activeConv.assignedTo ? null : CURRENT_MEMBER });
      showFlash(activeConv.assignedTo ? 'Ticket désassigné' : `Assigné à ${CURRENT_MEMBER}`);
    }
    if (a === 'priority') {
      const order: Priority[] = ['basse', 'moyenne', 'haute', 'urgente'];
      const next = order[(order.indexOf(activeConv.priority) + 1) % order.length] ?? 'moyenne';
      updateActive({ priority: next });
      showFlash(`Priorité : ${PRIORITY_LABEL[next]}`);
    }
    if (a === 'close') {
      const closing = activeConv.status !== 'resolu';
      updateActive({ status: closing ? 'resolu' : 'ouvert' });
      showFlash(closing ? 'Ticket clos' : 'Ticket rouvert');
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t) {
      setAddingTag(false);
      return;
    }
    if (!activeConv.tags.includes(t)) {
      updateActive({ tags: [...activeConv.tags, t] });
    }
    setNewTag('');
    setAddingTag(false);
  };

  const removeTag = (t: string) => {
    updateActive({ tags: activeConv.tags.filter((x) => x !== t) });
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const msg: Message =
      composerMode === 'note'
        ? { author: 'note', text, time }
        : { author: 'member', text, time };
    updateActive({
      thread: [...activeConv.thread, msg],
      preview: composerMode === 'note' ? activeConv.preview : text,
      time: "à l'instant",
    });
    setDraft('');
    showFlash(composerMode === 'note' ? 'Note interne ajoutée' : 'Message envoyé');
  };

  const toggleResolved = () => {
    const resolving = activeConv.status !== 'resolu';
    updateActive({ status: resolving ? 'resolu' : 'ouvert' });
    showFlash(resolving ? 'Ticket marqué comme résolu' : 'Ticket rouvert');
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Assistant</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-open`} value={`${openCount}`} /> tickets ouverts
            &middot;{' '}
            <AnimatedCounter key={`${refreshKey}-unread`} value={`${unreadCount}`} /> non lus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-tickets" getRows={exportRows} />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('tickets')}
          aria-pressed={tab === 'tickets'}
          className={
            tab === 'tickets'
              ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
              : 'inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy/5 transition-colors'
          }
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Tickets
        </button>
        <button
          type="button"
          onClick={() => setTab('chatbot')}
          aria-pressed={tab === 'chatbot'}
          className={
            tab === 'chatbot'
              ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
              : 'inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy/5 transition-colors'
          }
        >
          <Bot className="h-4 w-4" aria-hidden />
          Chatbot
        </button>
      </nav>

      {flash && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-brand-sky/60 border border-brand-blue/30 text-brand-navy px-4 py-2 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      {tab === 'chatbot' && <ChatbotPanel />}

      {tab === 'tickets' && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
          <aside className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un ticket…"
                  className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {FILTERS.map((f) => {
                  const isActive = f === activeFilter;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFilter(f)}
                      aria-pressed={isActive}
                      className={
                        isActive
                          ? 'shrink-0 rounded-pill bg-brand-navy text-white px-3 py-1 text-[11px] font-semibold'
                          : 'shrink-0 rounded-pill bg-gray-100 text-gray-500 px-3 py-1 text-[11px] font-medium hover:bg-gray-200'
                      }
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
            <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-xs text-gray-400">Aucun ticket</li>
              )}
              {filtered.map((c) => {
                const s = STATUS_STYLE[c.status];
                const isActive = c.id === activeConv.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectConv(c.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        isActive ? 'bg-brand-sky/30' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="relative shrink-0 h-9 w-9 rounded-full bg-grad-stat-navy text-white text-xs font-bold flex items-center justify-center">
                        {c.initials}
                        {c.unread && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-brand-navy text-sm truncate">{c.name}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{c.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{c.preview}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>
                            {s.label}
                          </span>
                          <span
                            title={`Priorité ${c.priority}`}
                            className={`h-2 w-2 rounded-full ${PRIORITY_DOT[c.priority]}`}
                          />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft flex flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-9 w-9 rounded-full bg-grad-stat-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {activeConv.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy truncate">{activeConv.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[activeConv.status].cls}`}>
                      {STATUS_STYLE[activeConv.status].label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-semibold">
                      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[activeConv.priority]}`} />
                      {PRIORITY_LABEL[activeConv.priority]}
                    </span>
                  </div>
                </div>
              </div>
              <ThreadMenu conv={activeConv} onAction={handleThreadAction} />
            </header>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px] bg-gray-50/50">
              {activeConv.thread.map((m, i) => {
                if (m.author === 'user') {
                  return (
                    <div key={i} className="flex items-end gap-2">
                      <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {activeConv.initials}
                      </span>
                      <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-brand-sky text-brand-navy px-4 py-2 text-sm">
                        <p>{m.text}</p>
                        <p className="mt-1 text-[10px] text-brand-navy/60">{m.time}</p>
                      </div>
                    </div>
                  );
                }
                if (m.author === 'bot') {
                  return (
                    <div key={i} className="flex items-end gap-2">
                      <span className="h-6 w-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                      <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
                        <p>{m.text}</p>
                        <p className="mt-1 text-[10px] text-yellow-700/60">{m.time}</p>
                      </div>
                    </div>
                  );
                }
                if (m.author === 'note') {
                  return (
                    <div key={i} className="rounded-xl bg-yellow-100 border border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-start gap-2">
                      <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
                      <div>
                        <p className="font-semibold text-[11px] uppercase tracking-wide mb-0.5">
                          Note interne
                        </p>
                        <p>{m.text}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex items-end gap-2 justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-brand-navy text-white px-4 py-2 text-sm">
                      <p>{m.text}</p>
                      <p className="mt-1 text-[10px] text-white/70 text-right">{m.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 p-4 bg-white">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    sendDraft();
                  }
                }}
                placeholder={
                  composerMode === 'note'
                    ? 'Note interne (visible uniquement par l’équipe)…'
                    : 'Votre réponse… Tapez / pour insérer une réponse pré-rédigée.'
                }
                className={`w-full rounded-xl border px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none resize-none ${
                  composerMode === 'note'
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-900 focus:border-yellow-500'
                    : 'border-gray-200 text-brand-navy focus:border-brand-blue'
                }`}
              />
              <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Joindre" className="text-gray-400 hover:text-brand-navy">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerMode((m) => (m === 'note' ? 'reply' : 'note'))}
                    aria-pressed={composerMode === 'note'}
                    className={
                      composerMode === 'note'
                        ? 'inline-flex items-center gap-1.5 rounded-pill bg-yellow-500 text-white px-3 py-1.5 text-xs font-semibold shadow-glow-soft'
                        : 'inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 transition-colors'
                    }
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    Note interne
                  </button>
                  <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConv.status === 'resolu'}
                      onChange={toggleResolved}
                    />
                    Marquer comme résolu
                  </label>
                </div>
                <button
                  type="button"
                  onClick={sendDraft}
                  disabled={!draft.trim()}
                  className={
                    composerMode === 'note'
                      ? 'inline-flex items-center gap-1.5 rounded-pill bg-yellow-600 hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-semibold transition-all'
                      : 'inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-semibold shadow-glow-green transition-all'
                  }
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {composerMode === 'note' ? 'Ajouter la note' : 'Répondre'}
                </button>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 space-y-5">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-sm font-bold shadow-glow-navy">
                {activeConv.initials}
              </div>
              <p className="mt-3 font-semibold text-brand-navy">{activeConv.name}</p>
              <p className="text-xs text-gray-500">
                Utilisateur · {activeConv.assignedTo ? `Assigné à ${activeConv.assignedTo}` : 'Non assigné'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Contact
              </p>
              <dl className="space-y-1 text-xs text-brand-navy">
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Email</dt><dd className="truncate">{activeConv.email}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Téléphone</dt><dd>{activeConv.phone}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Langue</dt><dd>{activeConv.lang}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-gray-500">Inscrit le</dt><dd>{activeConv.joined}</dd></div>
              </dl>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Actions rapides
              </p>
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={() => showFlash(`Ouverture du profil de ${activeConv.name}`)}
                  className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  Voir le profil
                </button>
                <button
                  type="button"
                  onClick={() => showFlash('Lien de réinitialisation envoyé par email')}
                  className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-orange-600 px-3 py-1.5 text-xs font-medium hover:bg-orange-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Réinitialiser le mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => showFlash(`${activeConv.name} bloqué`)}
                  className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-50 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                  Bloquer
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Historique
              </p>
              <p className="text-xs text-brand-navy">
                <span className="font-semibold">{activeConv.thread.length} messages</span> · ticket {activeConv.id}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                SLA :{' '}
                <span className="inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-semibold ml-1">
                  <Bell className="h-3 w-3 mr-1" />
                  Dans les temps
                </span>
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {activeConv.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-pill bg-brand-sky/60 text-brand-navy px-2 py-0.5 text-[10px] font-medium"
                  >
                    <UserRound className="h-2.5 w-2.5" />
                    {t}
                    <button
                      type="button"
                      aria-label={`Retirer ${t}`}
                      onClick={() => removeTag(t)}
                      className="text-brand-navy/60 hover:text-red-600"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {addingTag ? (
                  <input
                    type="text"
                    autoFocus
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTag();
                      if (e.key === 'Escape') {
                        setNewTag('');
                        setAddingTag(false);
                      }
                    }}
                    onBlur={addTag}
                    placeholder="nouveau tag"
                    className="rounded-pill border border-brand-blue bg-white text-brand-navy px-2 py-0.5 text-[10px] focus:outline-none w-24"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingTag(true)}
                    className="inline-flex items-center rounded-pill border border-dashed border-gray-300 text-gray-400 px-2 py-0.5 text-[10px] hover:text-brand-navy hover:border-brand-blue transition-colors"
                  >
                    + Ajouter
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

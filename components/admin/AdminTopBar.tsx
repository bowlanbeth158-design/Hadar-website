'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MessageSquare,
  Bell,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronRight,
  Siren,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { REPORTS, STATUS_LABEL as REPORT_STATUS_LABEL } from '@/lib/mock/signalements';
import { INITIAL_USERS } from '@/lib/mock/utilisateurs';
import { INITIAL_MEMBERS } from '@/lib/mock/membres';

type Ticket = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: boolean;
};

const TICKETS: Ticket[] = [
  {
    id: 't1',
    name: 'Yahya MOUSSAOUI',
    initials: 'YM',
    preview: 'Bonjour, mon signalement #2454 est refusé sans explication…',
    time: 'il y a 5 min',
    unread: true,
  },
  {
    id: 't3',
    name: 'Karim BENJELLOUN',
    initials: 'KB',
    preview: 'Je n’arrive pas à réinitialiser mon mot de passe',
    time: 'il y a 2 h',
    unread: true,
  },
  {
    id: 't5',
    name: 'Mehdi TAZI',
    initials: 'MT',
    preview: 'Est-ce que mon compte est bloqué ?',
    time: 'il y a 4 h',
    unread: true,
  },
];

function useClickOutside(ref: React.RefObject<HTMLElement>, onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [ref, onClose, open]);
}

export function AdminTopBar() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(searchRef, () => setSearchOpen(false), searchOpen);
  useClickOutside(msgRef, () => setMsgOpen(false), msgOpen);
  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { reports: [], users: [], members: [] };
    const reports = REPORTS.filter(
      (r) =>
        r.id.includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        r.contactMasked.toLowerCase().includes(q),
    ).slice(0, 5);
    const users = INITIAL_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.includes(q),
    ).slice(0, 5);
    const members = INITIAL_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.includes(q),
    ).slice(0, 5);
    return { reports, users, members };
  }, [query]);

  const totalResults =
    results.reports.length + results.users.length + results.members.length;

  const pendingReports = useMemo(
    () => REPORTS.filter((r) => r.status === 'en_cours').slice(0, 8),
    [],
  );

  const unreadTicketsCount = TICKETS.filter((t) => t.unread).length;

  const openSearch = () => {
    setSearchOpen(true);
    setMsgOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const logout = () => {
    if (!window.confirm('Se déconnecter de la session admin ?')) return;
    setMenuOpen(false);
    router.push('/');
  };

  const goTo = (href: string) => {
    setSearchOpen(false);
    setMsgOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="flex items-center gap-4 px-6 py-3">
        <div ref={searchRef} className="flex-1 max-w-xl relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={openSearch}
            placeholder="Rechercher un signalement, un utilisateur, un membre…"
            className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-11 pr-10 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchOpen(false);
              }}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searchOpen && query.trim() && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-30 max-h-[70vh] overflow-y-auto"
            >
              {totalResults === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  Aucun résultat pour « {query} »
                </p>
              ) : (
                <>
                  {results.reports.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 inline-flex items-center gap-1">
                        <Siren className="h-3 w-3" /> Signalements
                      </p>
                      {results.reports.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => goTo(`/admin/signalements/${r.id}`)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-navy">
                              #{r.id} — {r.problem}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {r.contact} · {r.contactMasked}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {REPORT_STATUS_LABEL[r.status]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.users.length > 0 && (
                    <div className="border-t border-gray-100">
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 inline-flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> Utilisateurs
                      </p>
                      {results.users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => goTo(`/admin/utilisateurs/${u.id}`)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-navy">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            #{u.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.members.length > 0 && (
                    <div className="border-t border-gray-100">
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> Membres
                      </p>
                      {results.members.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => goTo('/admin/membres')}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-navy">{m.name}</p>
                            <p className="text-xs text-gray-500 truncate">{m.email}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            #{m.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div ref={msgRef} className="relative">
            <button
              type="button"
              aria-label="Conversations"
              aria-haspopup="menu"
              aria-expanded={msgOpen}
              onClick={() => {
                setMsgOpen((v) => !v);
                setNotifOpen(false);
                setMenuOpen(false);
              }}
              className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand-navy"
            >
              <MessageSquare className="h-5 w-5" aria-hidden />
              {unreadTicketsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadTicketsCount}
                </span>
              )}
            </button>
            {msgOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-[22rem] rounded-2xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-30"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-brand-navy">Messages</p>
                  <span className="text-[11px] text-gray-500">{TICKETS.length} tickets</span>
                </div>
                <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {TICKETS.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => goTo('/admin/assistant')}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <span className="relative shrink-0 h-9 w-9 rounded-full bg-grad-stat-navy text-white text-xs font-bold flex items-center justify-center">
                          {t.initials}
                          {t.unread && (
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-brand-navy text-sm truncate">
                              {t.name}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {t.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {t.preview}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/assistant"
                  onClick={() => setMsgOpen(false)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-semibold text-brand-blue hover:bg-gray-50 border-t border-gray-100"
                >
                  Voir tous les tickets
                  <ChevronRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            )}
          </div>

          <div ref={notifRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              onClick={() => {
                setNotifOpen((v) => !v);
                setMsgOpen(false);
                setMenuOpen(false);
              }}
              className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand-navy"
            >
              <Bell className="h-5 w-5" aria-hidden />
              {pendingReports.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {pendingReports.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-[22rem] rounded-2xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-30"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-brand-navy">Signalements reçus</p>
                  <span className="text-[11px] text-gray-500">
                    {pendingReports.length} en attente
                  </span>
                </div>
                <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {pendingReports.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => goTo(`/admin/signalements/${r.id}`)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <span className="shrink-0 h-9 w-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Siren className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-brand-navy text-sm truncate">
                              #{r.id} — {r.problem}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {r.date.split(/\s+/)[0]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {r.contact} · {r.contactMasked}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/signalements"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-semibold text-brand-blue hover:bg-gray-50 border-t border-gray-100"
                >
                  Voir tous les signalements
                  <ChevronRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            )}
          </div>

          <span className="hidden md:inline-flex items-center rounded-pill border border-brand-navy text-brand-navy px-3 py-1 text-xs font-semibold">
            Admin
          </span>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Menu du compte administrateur"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((v) => !v);
                setMsgOpen(false);
                setNotifOpen(false);
              }}
              className="h-9 w-9 rounded-full bg-grad-stat-navy text-white font-semibold text-sm flex items-center justify-center hover:brightness-110 transition-all"
            >
              HM
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-30 py-1"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-brand-navy">HM — Admin</p>
                  <p className="text-[11px] text-gray-500">Connecté·e sur Hadar.ma</p>
                </div>
                <Link
                  href="/admin/parametres"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-navy hover:bg-gray-50"
                >
                  <UserIcon className="h-4 w-4" aria-hidden />
                  Mon compte
                </Link>
                <Link
                  href="/admin/parametres"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-navy hover:bg-gray-50"
                >
                  <SettingsIcon className="h-4 w-4" aria-hidden />
                  Paramètres
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

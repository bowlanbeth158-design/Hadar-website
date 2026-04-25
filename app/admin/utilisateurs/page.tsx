'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ListChecks,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
  Undo2,
  X,
  Users as UsersIcon,
  CalendarDays,
  Sparkles,
  UserMinus,
} from 'lucide-react';
import { UserActionsDropdown, type UserAction } from '@/components/admin/UserActionsDropdown';
import { UserReasonModal, type ReasonAction } from '@/components/admin/UserReasonModal';
import { UserGroupsModal } from '@/components/admin/UserGroupsModal';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { INITIAL_USERS, STATUS_STYLE, type Status, type User } from '@/lib/mock/utilisateurs';
import {
  GROUP_COLORS,
  loadGroups,
  monthLabel,
  parseFrDate,
  saveGroups,
  signupMonthKey,
  type UserGroup,
} from '@/lib/groups';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100];
const STATUS_KEY = 'hadar:users:status';
const REASONS_KEY = 'hadar:users:reasons';
// Snapshot of the mock dataset "today" — used for the "Nouveaux inscrits (30 j)" filter
const TODAY_ISO = '2026-04-13';

type StatusStore = Record<string, Status>;
type ReasonStore = Record<string, { action: ReasonAction; reason: string; when: string }>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusOverrides, setStatusOverrides] = useState<StatusStore>({});
  const [reasons, setReasons] = useState<ReasonStore>({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    action: ReasonAction | null;
    ids: string[];
  }>({ open: false, action: null, ids: [] });

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [groupsModal, setGroupsModal] = useState<{ open: boolean; mode: 'manage' | 'add' }>({
    open: false,
    mode: 'manage',
  });
  const [groupFilter, setGroupFilter] = useState<string>('all'); // 'all' | 'new' | groupId
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const monthMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatusOverrides(readJson<StatusStore>(STATUS_KEY, {}));
    setReasons(readJson<ReasonStore>(REASONS_KEY, {}));
    setGroups(loadGroups());
  }, []);

  useEffect(() => {
    if (!groupMenuOpen && !monthMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (groupMenuOpen && !groupMenuRef.current?.contains(e.target as Node))
        setGroupMenuOpen(false);
      if (monthMenuOpen && !monthMenuRef.current?.contains(e.target as Node))
        setMonthMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGroupMenuOpen(false);
        setMonthMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [groupMenuOpen, monthMenuOpen]);

  const persistGroups = (next: UserGroup[]) => {
    setGroups(next);
    saveGroups(next);
  };

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    INITIAL_USERS.forEach((u) => {
      const k = signupMonthKey(u.signup);
      if (k) set.add(k);
    });
    return Array.from(set).sort().reverse();
  }, []);

  useEffect(() => {
    if (!filterOpen && !actionsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (filterOpen && !filterRef.current?.contains(e.target as Node)) setFilterOpen(false);
      if (actionsOpen && !actionsRef.current?.contains(e.target as Node)) setActionsOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFilterOpen(false);
        setActionsOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [filterOpen, actionsOpen]);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? null : m)), 2200);
  };

  const users: User[] = useMemo(
    () =>
      INITIAL_USERS.map((u) => ({
        ...u,
        status: (statusOverrides[u.id] ?? u.status) as Status,
      })),
    [statusOverrides],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const today = new Date(TODAY_ISO);
    const activeGroup = groupFilter !== 'all' && groupFilter !== 'new'
      ? groups.find((g) => g.id === groupFilter)
      : undefined;
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (monthFilter !== 'all' && signupMonthKey(u.signup) !== monthFilter) return false;
      if (groupFilter === 'new') {
        const d = parseFrDate(u.signup);
        if (!d) return false;
        const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
        if (diffDays < 0 || diffDays > 30) return false;
      } else if (activeGroup && !activeGroup.userIds.includes(u.id)) {
        return false;
      }
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.includes(q)
      );
    });
  }, [users, search, statusFilter, monthFilter, groupFilter, groups]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, rowsPerPage, monthFilter, groupFilter]);

  const userGroupsMap = useMemo(() => {
    const map = new Map<string, UserGroup[]>();
    for (const g of groups) {
      for (const uid of g.userIds) {
        const arr = map.get(uid) ?? [];
        arr.push(g);
        map.set(uid, arr);
      }
    }
    return map;
  }, [groups]);

  const createGroup = (
    name: string,
    description: string,
    colorCls: string,
    seedUserIds?: string[],
  ) => {
    const id = `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const stamp = new Date().toLocaleDateString('fr-FR');
    const next: UserGroup = {
      id,
      name,
      description,
      color: colorCls || GROUP_COLORS[0],
      userIds: seedUserIds ?? [],
      createdAt: stamp,
    };
    persistGroups([...groups, next]);
    if (seedUserIds && seedUserIds.length > 0) {
      showFlash(`Groupe « ${name} » créé avec ${seedUserIds.length} utilisateur${seedUserIds.length > 1 ? 's' : ''}`);
    } else {
      showFlash(`Groupe « ${name} » créé`);
    }
    setGroupsModal({ open: false, mode: 'manage' });
    clearSelection();
  };

  const updateGroup = (id: string, patch: Partial<Omit<UserGroup, 'id' | 'createdAt'>>) => {
    persistGroups(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    showFlash('Groupe mis à jour');
  };

  const deleteGroup = (id: string) => {
    persistGroups(groups.filter((g) => g.id !== id));
    if (groupFilter === id) setGroupFilter('all');
    showFlash('Groupe supprimé');
  };

  const addToGroup = (groupId: string, userIds: string[]) => {
    persistGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, userIds: Array.from(new Set([...g.userIds, ...userIds])) }
          : g,
      ),
    );
    const group = groups.find((g) => g.id === groupId);
    showFlash(
      `${userIds.length} utilisateur${userIds.length > 1 ? 's' : ''} ajouté${userIds.length > 1 ? 's' : ''} à « ${group?.name ?? groupId} »`,
    );
    setGroupsModal({ open: false, mode: 'manage' });
    clearSelection();
  };

  const removeFromGroupFilter = () => {
    if (groupFilter !== 'all' && groupFilter !== 'new' && selectedIds.size > 0) {
      const ids = Array.from(selectedIds);
      persistGroups(
        groups.map((g) =>
          g.id === groupFilter
            ? { ...g, userIds: g.userIds.filter((uid) => !ids.includes(uid)) }
            : g,
        ),
      );
      const group = groups.find((g) => g.id === groupFilter);
      showFlash(
        `${ids.length} utilisateur${ids.length > 1 ? 's' : ''} retiré${ids.length > 1 ? 's' : ''} de « ${group?.name ?? ''} »`,
      );
      clearSelection();
      setActionsOpen(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const pageIdsOnScreen = pageRows.map((r) => r.id);
  const allSelectedOnPage =
    pageIdsOnScreen.length > 0 && pageIdsOnScreen.every((id) => selectedIds.has(id));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelectedOnPage) pageIdsOnScreen.forEach((id) => next.delete(id));
      else pageIdsOnScreen.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const persistStatus = (updates: Record<string, Status>) => {
    setStatusOverrides((prev) => {
      const next = { ...prev, ...updates };
      writeJson(STATUS_KEY, next);
      return next;
    });
  };

  const persistReasons = (updates: ReasonStore) => {
    setReasons((prev) => {
      const next = { ...prev, ...updates };
      writeJson(REASONS_KEY, next);
      return next;
    });
  };

  const applyStatus = (ids: string[], nextStatus: Status) => {
    const updates: Record<string, Status> = {};
    for (const id of ids) {
      const u = users.find((x) => x.id === id);
      if (!u) continue;
      if (nextStatus === 'bloque' && u.status === 'supprime') continue;
      if (nextStatus === 'actif' && u.status === 'bloque') updates[id] = 'actif';
      else if (nextStatus === 'actif' && u.status === 'supprime') updates[id] = 'actif';
      else updates[id] = nextStatus;
    }
    persistStatus(updates);
  };

  const openReasonModal = (action: ReasonAction, ids: string[]) => {
    if (ids.length === 0) return;
    setReasonModal({ open: true, action, ids });
  };

  const confirmReason = (reason: string) => {
    const { action, ids } = reasonModal;
    if (!action || ids.length === 0) return;
    const nextStatus: Status = action === 'block' ? 'bloque' : 'supprime';
    applyStatus(ids, nextStatus);
    const stamp = new Date().toLocaleString('fr-FR');
    const newReasons: ReasonStore = {};
    for (const id of ids) newReasons[id] = { action, reason, when: stamp };
    persistReasons(newReasons);
    setReasonModal({ open: false, action: null, ids: [] });
    clearSelection();
    setActionsOpen(false);
    showFlash(
      ids.length > 1
        ? `${ids.length} utilisateurs ${action === 'block' ? 'bloqués' : 'supprimés'}`
        : `Utilisateur ${action === 'block' ? 'bloqué' : 'supprimé'}`,
    );
  };

  const rowAction = (id: string) => (action: UserAction) => {
    const user = users.find((u) => u.id === id);
    const label = user ? user.name : `#${id}`;
    if (action === 'reset') {
      showFlash(`Lien de réinitialisation envoyé à ${label}`);
      return;
    }
    if (action === 'unblock') {
      applyStatus([id], 'actif');
      showFlash(`${label} débloqué`);
      return;
    }
    if (action === 'restore') {
      applyStatus([id], 'actif');
      showFlash(`${label} restauré`);
      return;
    }
    if (action === 'block') openReasonModal('block', [id]);
    if (action === 'delete') openReasonModal('delete', [id]);
  };

  const bulkApply = (action: 'reset' | 'block' | 'unblock' | 'delete' | 'restore') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (action === 'reset') {
      showFlash(`Liens de réinitialisation envoyés (${ids.length})`);
      clearSelection();
      setActionsOpen(false);
      return;
    }
    if (action === 'unblock') {
      applyStatus(ids, 'actif');
      showFlash(`${ids.length} utilisateur(s) débloqué(s)`);
      clearSelection();
      setActionsOpen(false);
      return;
    }
    if (action === 'restore') {
      applyStatus(ids, 'actif');
      showFlash(`${ids.length} utilisateur(s) restauré(s)`);
      clearSelection();
      setActionsOpen(false);
      return;
    }
    if (action === 'block') openReasonModal('block', ids);
    if (action === 'delete') openReasonModal('delete', ids);
  };

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Nom', 'Email', 'Téléphone', 'Inscription', 'Dernière activité', 'Statut', 'Motif'],
    ...filtered.map((u) => [
      `#${u.id}`,
      u.name,
      u.email,
      u.phone,
      u.signup,
      u.lastSeen,
      STATUS_STYLE[u.status].label,
      reasons[u.id]?.reason ?? '',
    ]),
  ];

  const selectionCount = selectedIds.size;
  const reasonTarget =
    reasonModal.ids.length === 1
      ? users.find((u) => u.id === reasonModal.ids[0])?.name ?? `#${reasonModal.ids[0]}`
      : `${reasonModal.ids.length} utilisateurs`;

  const STATUS_FILTERS: { id: 'all' | Status; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'actif', label: 'Actifs' },
    { id: 'inactif', label: 'Inactifs' },
    { id: 'bloque', label: 'Bloqués' },
    { id: 'supprime', label: 'Supprimés' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${users.length}`} /> utilisateurs
            inscrits
            {search && (
              <>
                {' '}·{' '}
                <AnimatedCounter
                  key={`${refreshKey}-filtered-${filtered.length}`}
                  value={`${filtered.length}`}
                />{' '}
                correspondent à « {search} »
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupsModal({ open: true, mode: 'manage' })}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <UsersIcon className="h-4 w-4" aria-hidden />
            Groupes
            {groups.length > 0 && (
              <span className="rounded-full bg-white/20 text-white h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center">
                {groups.length}
              </span>
            )}
          </button>
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-utilisateurs" getRows={exportRows} />
        </div>
      </div>

      {flash && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-brand-sky/60 border border-brand-blue/30 text-brand-navy px-4 py-2 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={filterOpen}
                className="inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 shadow-glow-yellow transition-colors"
              >
                <Filter className="h-3.5 w-3.5" aria-hidden />
                Lignes par page
                <span className="rounded-full bg-yellow-500 text-white h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                  {rowsPerPage}
                </span>
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {filterOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
                >
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    Afficher par page
                  </p>
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="menuitemradio"
                      aria-checked={n === rowsPerPage}
                      onClick={() => {
                        setRowsPerPage(n);
                        setPage(1);
                        setFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        n === rowsPerPage
                          ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{n} lignes</span>
                      {n === rowsPerPage && (
                        <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  aria-pressed={statusFilter === f.id}
                  className={
                    statusFilter === f.id
                      ? 'inline-flex items-center rounded-pill bg-brand-navy text-white px-3 py-1 text-[11px] font-semibold shadow-glow-navy'
                      : 'inline-flex items-center rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-[11px] font-medium hover:border-brand-blue'
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div ref={groupMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setGroupMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={groupMenuOpen}
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-sky/60 text-brand-navy px-3 py-1.5 text-xs font-semibold hover:bg-brand-sky transition-colors"
              >
                <UsersIcon className="h-3.5 w-3.5" aria-hidden />
                {groupFilter === 'all'
                  ? 'Tous les groupes'
                  : groupFilter === 'new'
                    ? 'Nouveaux (30 j)'
                    : groups.find((g) => g.id === groupFilter)?.name ?? 'Groupe'}
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {groupMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1 max-h-72 overflow-y-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setGroupFilter('all');
                      setGroupMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
                      groupFilter === 'all'
                        ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                        : 'text-brand-navy hover:bg-gray-50'
                    }`}
                  >
                    Tous les utilisateurs
                    {groupFilter === 'all' && (
                      <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupFilter('new');
                      setGroupMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
                      groupFilter === 'new'
                        ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                        : 'text-brand-navy hover:bg-gray-50'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                      Nouveaux (30 j)
                    </span>
                    {groupFilter === 'new' && (
                      <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />
                    )}
                  </button>
                  {groups.length > 0 && (
                    <>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 border-t border-gray-100 mt-1">
                        Groupes
                      </p>
                      {groups.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setGroupFilter(g.id);
                            setGroupMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left ${
                            groupFilter === g.id
                              ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                              : 'text-brand-navy hover:bg-gray-50'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full border ${g.color}`}
                              aria-hidden
                            />
                            <span className="truncate">{g.name}</span>
                            <span className="text-[10px] text-gray-400">({g.userIds.length})</span>
                          </span>
                          {groupFilter === g.id && (
                            <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" aria-hidden />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setGroupMenuOpen(false);
                      setGroupsModal({ open: true, mode: 'manage' });
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-brand-blue hover:bg-gray-50 border-t border-gray-100 mt-1 font-semibold"
                  >
                    <UsersIcon className="h-3.5 w-3.5" aria-hidden />
                    Gérer les groupes
                  </button>
                </div>
              )}
            </div>

            <div ref={monthMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setMonthMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={monthMenuOpen}
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-sky/60 text-brand-navy px-3 py-1.5 text-xs font-semibold hover:bg-brand-sky transition-colors"
              >
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {monthFilter === 'all' ? "Tous les mois" : monthLabel(monthFilter)}
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {monthMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-52 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1 max-h-72 overflow-y-auto"
                >
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Mois d&apos;inscription
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthFilter('all');
                      setMonthMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
                      monthFilter === 'all'
                        ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                        : 'text-brand-navy hover:bg-gray-50'
                    }`}
                  >
                    Tous les mois
                    {monthFilter === 'all' && (
                      <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />
                    )}
                  </button>
                  {availableMonths.map((m) => {
                    const count = INITIAL_USERS.filter(
                      (u) => signupMonthKey(u.signup) === m,
                    ).length;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMonthFilter(m);
                          setMonthMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm ${
                          monthFilter === m
                            ? 'bg-brand-sky/30 text-brand-navy font-semibold'
                            : 'text-brand-navy hover:bg-gray-50'
                        }`}
                      >
                        <span>
                          {monthLabel(m)}{' '}
                          <span className="text-[10px] text-gray-400">({count})</span>
                        </span>
                        {monthFilter === m && (
                          <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleAllOnPage}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue shadow-glow-soft transition-all"
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              {allSelectedOnPage ? 'Tout désélectionner' : 'Sélectionner tous'}
            </button>

            <div ref={actionsRef} className="relative">
              <button
                type="button"
                onClick={() => selectionCount > 0 && setActionsOpen((v) => !v)}
                disabled={selectionCount === 0}
                aria-haspopup="menu"
                aria-expanded={actionsOpen}
                className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue shadow-glow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Actions
                {selectionCount > 0 && (
                  <span className="rounded-full bg-brand-navy text-white h-4 min-w-4 px-1.5 text-[10px] flex items-center justify-center">
                    {selectionCount}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {actionsOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
                >
                  <button
                    type="button"
                    onClick={() => bulkApply('reset')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    <KeyRound className="h-4 w-4" aria-hidden />
                    Réinitialiser mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkApply('block')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-navy hover:bg-gray-50"
                  >
                    <Ban className="h-4 w-4" aria-hidden />
                    Bloquer (motif requis)
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkApply('unblock')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Débloquer
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => bulkApply('delete')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Supprimer (motif requis)
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkApply('restore')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <Undo2 className="h-4 w-4" aria-hidden />
                    Restaurer
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setActionsOpen(false);
                      setGroupsModal({ open: true, mode: 'add' });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-navy hover:bg-gray-50"
                  >
                    <UsersIcon className="h-4 w-4" aria-hidden />
                    Ajouter à un groupe
                  </button>
                  {groupFilter !== 'all' && groupFilter !== 'new' && (
                    <button
                      type="button"
                      onClick={removeFromGroupFilter}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
                    >
                      <UserMinus className="h-4 w-4" aria-hidden />
                      Retirer du groupe affiché
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectionCount > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-navy"
              >
                <X className="h-3 w-3" aria-hidden />
                {selectionCount} sélectionné{selectionCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher (nom, email, téléphone…)"
              className="w-72 rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={toggleAllOnPage}
                    aria-label="Tout sélectionner sur cette page"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Téléphone</th>
                <th className="px-4 py-3 text-left font-semibold">Inscription</th>
                <th className="px-4 py-3 text-left font-semibold">Dernière activité</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Aucun utilisateur ne correspond à la recherche.
                  </td>
                </tr>
              ) : (
                pageRows.map((u) => {
                  const s = STATUS_STYLE[u.status];
                  const selected = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={selected ? 'bg-brand-sky/30' : 'hover:bg-gray-50/60'}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleOne(u.id)}
                          aria-label={`Sélectionner ${u.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-brand-navy">#{u.id}</td>
                      <td className="px-4 py-3 font-semibold text-brand-navy whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`/admin/utilisateurs/${u.id}`}
                            className="hover:text-brand-blue"
                          >
                            {u.name}
                          </a>
                          {(userGroupsMap.get(u.id) ?? []).map((g) => (
                            <span
                              key={g.id}
                              className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold border ${g.color}`}
                              title={g.name}
                            >
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.signup}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.lastSeen}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserActionsDropdown
                          status={u.status}
                          userId={u.id}
                          onAction={rowAction(u.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500 flex-wrap gap-2">
          <span>
            Page {safePage} / {totalPages} ·{' '}
            <AnimatedCounter
              key={`${refreshKey}-count-${filtered.length}`}
              value={`${filtered.length}`}
            />{' '}
            utilisateur{filtered.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={
                  p === safePage
                    ? 'px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy'
                    : 'px-2.5 py-1 rounded hover:bg-gray-100'
                }
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <UserReasonModal
        open={reasonModal.open}
        action={reasonModal.action}
        targetLabel={reasonTarget}
        onClose={() => setReasonModal({ open: false, action: null, ids: [] })}
        onConfirm={confirmReason}
      />

      <UserGroupsModal
        open={groupsModal.open}
        mode={groupsModal.mode}
        groups={groups}
        selectedUserIds={Array.from(selectedIds)}
        onClose={() => setGroupsModal({ open: false, mode: 'manage' })}
        onCreate={createGroup}
        onUpdate={updateGroup}
        onDelete={deleteGroup}
        onAddToGroup={addToGroup}
      />
    </div>
  );
}

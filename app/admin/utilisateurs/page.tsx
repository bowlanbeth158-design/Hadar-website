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
} from 'lucide-react';
import { UserActionsDropdown } from '@/components/admin/UserActionsDropdown';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';

type Status = 'actif' | 'inactif' | 'bloque' | 'supprime';

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  actif: { label: 'Actif', cls: 'text-green-700 bg-green-100' },
  inactif: { label: 'Inactif', cls: 'text-brand-navy bg-brand-sky/60' },
  bloque: { label: 'Bloqué', cls: 'text-gray-600 bg-gray-200' },
  supprime: { label: 'Supprimé', cls: 'text-red-700 bg-red-100' },
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  signup: string;
  lastSeen: string;
  status: Status;
};

const BASE_USERS: User[] = [
  { id: '01', name: 'Yahya MOUSSAOUI', email: 'yahya.moussaoui@gmail.com', phone: '0675487955', signup: '13/04/26  23:12:05', lastSeen: '13/04/26  23:12:05', status: 'actif' },
  { id: '18', name: 'Salma EL AMRANI', email: 'salma.elamrani@outlook.com', phone: '0661230987', signup: '05/04/26  09:05:22', lastSeen: '13/04/26  18:41:30', status: 'actif' },
  { id: '16', name: 'Karim BENJELLOUN', email: 'karim.b@yahoo.fr', phone: '0698564123', signup: '28/03/26  14:22:11', lastSeen: '02/04/26  10:15:08', status: 'inactif' },
  { id: '22', name: 'Fatima ZAHRA', email: 'fatimaz@gmail.com', phone: '0600000000', signup: '15/02/26  11:00:45', lastSeen: '20/02/26  12:33:17', status: 'bloque' },
  { id: '07', name: 'Mehdi TAZI', email: 'mehdi.tazi@outlook.com', phone: '0655554433', signup: '01/01/26  08:15:00', lastSeen: '12/01/26  22:10:05', status: 'supprime' },
  { id: '24', name: 'Imane BENALI', email: 'imane.b@gmail.com', phone: '0612345678', signup: '12/04/26  10:05:00', lastSeen: '13/04/26  10:02:00', status: 'actif' },
  { id: '25', name: 'Rachid DEMNATI', email: 'rachid.d@outlook.fr', phone: '0699887766', signup: '11/04/26  14:22:00', lastSeen: '13/04/26  09:17:45', status: 'actif' },
  { id: '26', name: 'Amina KAROUI', email: 'amina.karoui@hadar.ma', phone: '0677001122', signup: '10/04/26  07:30:00', lastSeen: '12/04/26  22:30:00', status: 'inactif' },
  { id: '27', name: 'Nabil EL HOUSSEIN', email: 'nabil.elh@gmail.com', phone: '0688889999', signup: '08/04/26  20:50:00', lastSeen: '13/04/26  08:44:30', status: 'actif' },
  { id: '28', name: 'Leila MOUTAMID', email: 'leila.m@outlook.com', phone: '0644556677', signup: '06/04/26  15:10:00', lastSeen: '10/04/26  17:05:15', status: 'bloque' },
  { id: '29', name: 'Youssef BENDRISS', email: 'y.bendriss@gmail.com', phone: '0622334455', signup: '03/04/26  11:11:11', lastSeen: '11/04/26  13:13:13', status: 'actif' },
  { id: '30', name: 'Asmaa SENHAJI', email: 'a.senhaji@hadar.ma', phone: '0666667777', signup: '31/03/26  18:20:40', lastSeen: '12/04/26  14:28:02', status: 'actif' },
];

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState(BASE_USERS);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click / Escape
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.id.includes(q),
    );
  }, [users, search]);

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
      if (allSelectedOnPage) {
        pageIdsOnScreen.forEach((id) => next.delete(id));
      } else {
        pageIdsOnScreen.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkApply = (action: 'reset' | 'block' | 'unblock' | 'delete' | 'restore') => {
    setUsers((all) =>
      all.map((u) => {
        if (!selectedIds.has(u.id)) return u;
        switch (action) {
          case 'block':
            return u.status === 'supprime' ? u : { ...u, status: 'bloque' };
          case 'unblock':
            return u.status === 'bloque' ? { ...u, status: 'actif' } : u;
          case 'delete':
            return { ...u, status: 'supprime' };
          case 'restore':
            return u.status === 'supprime' ? { ...u, status: 'actif' } : u;
          default:
            return u;
        }
      }),
    );
    clearSelection();
    setActionsOpen(false);
  };

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Nom', 'Email', 'Téléphone', 'Inscription', 'Dernière activité', 'Statut'],
    ...filtered.map((u) => [
      `#${u.id}`,
      u.name,
      u.email,
      u.phone,
      u.signup,
      u.lastSeen,
      STATUS_STYLE[u.status].label,
    ]),
  ];

  const selectionCount = selectedIds.size;

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
                {' '}· <AnimatedCounter key={`${refreshKey}-filtered-${filtered.length}`} value={`${filtered.length}`} />{' '}
                correspondent à « {search} »
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-utilisateurs" getRows={exportRows} />
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
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
                      {n === rowsPerPage && <CheckCircle2 className="h-4 w-4 text-brand-blue" aria-hidden />}
                    </button>
                  ))}
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
                    Bloquer
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
                    Supprimer
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkApply('restore')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <Undo2 className="h-4 w-4" aria-hidden />
                    Restaurer
                  </button>
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
                        {u.name}
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
                        <UserActionsDropdown status={u.status} userId={u.id} />
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
            <AnimatedCounter key={`${refreshKey}-count-${filtered.length}`} value={`${filtered.length}`} />{' '}
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
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { MemberModal, type MemberFormValues } from '@/components/admin/MemberModal';
import {
  INITIAL_MEMBERS,
  ROLE_STYLE,
  STATUS_STYLE,
  type Member,
  type Role,
  type Status,
} from '@/lib/mock/membres';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;
const ROLES: Role[] = ['admin', 'moderateur', 'support'];
const STATUSES: Status[] = ['actif', 'inactif', 'suspendu'];

function useClickOutside(ref: React.RefObject<HTMLElement>, onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOutside();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOutside();
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [ref, onOutside, enabled]);
}

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Set<Role>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<Status>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    initial?: Partial<MemberFormValues>;
  }>({ open: false, mode: 'create' });

  const filtersRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);
  useClickOutside(filtersRef, () => setFiltersOpen(false), filtersOpen);
  useClickOutside(pageSizeRef, () => setPageSizeOpen(false), pageSizeOpen);

  const activeFilterCount = roleFilter.size + statusFilter.size;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter.size > 0 && !roleFilter.has(m.role)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(m.status)) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.includes(q)
      );
    });
  }, [members, search, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Dernière activité'],
    ...filtered.map((m) => [
      `#${m.id}`,
      m.name,
      m.email,
      m.phone,
      ROLE_STYLE[m.role].label,
      STATUS_STYLE[m.status].label,
      m.lastSeen,
    ]),
  ];

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const handleSave = (values: MemberFormValues) => {
    if (values.id) {
      setMembers((list) =>
        list.map((m) =>
          m.id === values.id
            ? {
                ...m,
                name: values.name,
                email: values.email,
                phone: values.phone,
                role: values.role,
                status: values.status,
              }
            : m,
        ),
      );
    } else {
      const nextId = String(
        Math.max(0, ...members.map((m) => Number(m.id) || 0)) + 1,
      ).padStart(2, '0');
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setMembers((list) => [
        {
          id: nextId,
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          status: values.status,
          lastSeen: `${dd}/${mm}/${yy}  ${hh}:${mi}:${ss}`,
        },
        ...list,
      ]);
    }
  };

  const handleDelete = (id: string) => {
    setMembers((list) => list.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
            Membres de l&apos;équipe
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${members.length}`} /> membres dans
            l&apos;équipe Hadar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal({ open: true, mode: 'create' })}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Ajouter un membre
          </button>
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-membres" getRows={exportRows} />
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div ref={filtersRef} className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={filtersOpen}
                className="inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 shadow-glow-yellow transition-colors"
              >
                <Filter className="h-3.5 w-3.5" aria-hidden />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-yellow-500 text-white h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {filtersOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-white border border-gray-200 shadow-glow-navy z-20 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Rôle
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {ROLES.map((r) => (
                      <label
                        key={r}
                        className="flex items-center gap-2 text-sm text-brand-navy cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={roleFilter.has(r)}
                          onChange={() => setRoleFilter((s) => toggle(s, r))}
                          className="accent-brand-navy"
                        />
                        {ROLE_STYLE[r].label}
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Statut
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {STATUSES.map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-2 text-sm text-brand-navy cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={statusFilter.has(s)}
                          onChange={() => setStatusFilter((set) => toggle(set, s))}
                          className="accent-brand-navy"
                        />
                        {STATUS_STYLE[s].label}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRoleFilter(new Set());
                      setStatusFilter(new Set());
                    }}
                    disabled={activeFilterCount === 0}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X className="h-3 w-3" aria-hidden />
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>

            <div ref={pageSizeRef} className="relative">
              <button
                type="button"
                onClick={() => setPageSizeOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={pageSizeOpen}
                className="inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 shadow-glow-yellow transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                Lignes par page
                <span className="rounded-full bg-yellow-600 text-white h-4 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {pageSize}
                </span>
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {pageSizeOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-glow-navy z-20 py-2"
                >
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Afficher par page
                  </p>
                  {PAGE_SIZE_OPTIONS.map((n) => {
                    const active = n === pageSize;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setPageSize(n);
                          setPageSizeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                          active
                            ? 'bg-brand-sky/30 text-brand-navy font-bold'
                            : 'text-brand-navy hover:bg-gray-50'
                        }`}
                      >
                        <span>{n} lignes</span>
                        {active && (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border-2 border-brand-blue text-brand-blue">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un membre"
              className="w-64 rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Rôle</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
                <th className="px-4 py-3 text-left font-semibold">Dernière activité</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    Aucun membre ne correspond à vos critères.
                  </td>
                </tr>
              )}
              {pageItems.map((m) => {
                const r = ROLE_STYLE[m.role];
                const s = STATUS_STYLE[m.status];
                return (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-mono text-brand-navy">#{m.id}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${r.cls}`}
                      >
                        {r.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{m.lastSeen}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            open: true,
                            mode: 'edit',
                            initial: {
                              id: m.id,
                              name: m.name,
                              email: m.email,
                              phone: m.phone,
                              role: m.role,
                              status: m.status,
                              lastSeen: m.lastSeen,
                            },
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-3 py-1.5 text-xs font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            <AnimatedCounter
              key={`${refreshKey}-count-${filtered.length}`}
              value={`${filtered.length}`}
            />{' '}
            membre{filtered.length > 1 ? 's' : ''}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''}` : ''}
            {search ? ` · recherche : « ${search} »` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
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
                aria-current={p === currentPage ? 'page' : undefined}
                className={
                  p === currentPage
                    ? 'px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy'
                    : 'px-2.5 py-1 rounded hover:bg-gray-100 text-brand-navy'
                }
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <aside className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
        <h2 className="text-lg font-bold text-brand-navy mb-4">Matrice des permissions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="text-gray-400">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Action</th>
                <th className="px-3 py-2 font-semibold text-center">Super-admin</th>
                <th className="px-3 py-2 font-semibold text-center">Admin</th>
                <th className="px-3 py-2 font-semibold text-center">Modérateur</th>
                <th className="px-3 py-2 font-semibold text-center">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Voir le dashboard', true, true, true, true],
                ['Modérer un signalement', true, true, true, false],
                ['Bloquer un utilisateur', true, true, true, false],
                ['Supprimer un utilisateur', true, true, false, false],
                ['Ajouter / modifier un membre', true, true, false, false],
                ['Changer le rôle d’un membre 🔒', true, false, false, false],
                ['Purger définitivement 🔒', true, false, false, false],
                ['Modifier les intégrations 🔒', true, false, false, false],
              ].map(([label, ...cells]) => (
                <tr key={String(label)} className="text-brand-navy">
                  <td className="px-3 py-2 font-medium">{label}</td>
                  {cells.map((ok, i) => (
                    <td key={i} className="px-3 py-2 text-center">
                      {ok ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs shadow-glow-green">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-400 text-xs">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      <MemberModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.initial}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

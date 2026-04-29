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
import { useI18n } from '@/lib/i18n/provider';
import { translateRole, translateMemberStatus } from '@/lib/i18n/helpers';

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
  const { t } = useI18n();
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
    [
      t('membres.col.id'),
      t('membres.col.name'),
      t('membres.col.email'),
      t('membres.col.phone'),
      t('membres.col.role'),
      t('membres.col.status'),
      t('membres.col.lastSeen'),
    ],
    ...filtered.map((m) => [
      `#${m.id}`,
      m.name,
      m.email,
      m.phone,
      translateRole(t, m.role),
      translateMemberStatus(t, m.status),
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
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">{t('membres.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${members.length}`} />{' '}
            {t('membres.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal({ open: true, mode: 'create' })}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            {t('membres.addMember')}
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
                {t('membres.filters')}
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
                  className="absolute left-0 rtl:left-auto rtl:right-0 top-full mt-2 w-64 rounded-xl bg-white border border-gray-200 shadow-glow-navy z-20 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {t('membres.field.role')}
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
                        {translateRole(t, r)}
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {t('membres.field.status')}
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
                        {translateMemberStatus(t, s)}
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
                    {t('membres.clearFilters')}
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
                {t('membres.rowsPerPage')}
                <span className="rounded-full bg-yellow-600 text-white h-4 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {pageSize}
                </span>
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
              {pageSizeOpen && (
                <div
                  role="menu"
                  className="absolute left-0 rtl:left-auto rtl:right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-glow-navy z-20 py-2"
                >
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {t('membres.perPage')}
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
                        <span>{t('membres.rows', { n })}</span>
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
              placeholder={t('membres.searchPlaceholder')}
              className="w-64 rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.id')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.name')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.email')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.role')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.status')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('membres.col.lastSeen')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('membres.col.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                    {t('membres.empty')}
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
                        {translateRole(t, m.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
                      >
                        {translateMemberStatus(t, m.status)}
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
                        {t('membres.see')}
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
            {t(filtered.length > 1 ? 'membres.countWord.other' : 'membres.countWord.one')}
            {activeFilterCount > 0
              ? ` · ${t(activeFilterCount > 1 ? 'membres.filter.other' : 'membres.filter.one', { count: activeFilterCount })}`
              : ''}
            {search ? ` · ${t('membres.searchApplied', { query: search })}` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={t('pagination.prev')}
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
              aria-label={t('pagination.next')}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <aside className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
        <h2 className="text-lg font-bold text-brand-navy mb-4">{t('membres.permMatrix')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="text-gray-400">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">{t('membres.col.action')}</th>
                <th className="px-3 py-2 font-semibold text-center">{t('role.superadmin')}</th>
                <th className="px-3 py-2 font-semibold text-center">{t('role.admin')}</th>
                <th className="px-3 py-2 font-semibold text-center">{t('role.moderateur')}</th>
                <th className="px-3 py-2 font-semibold text-center">{t('role.support')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['perm.viewDashboard', true, true, true, true],
                ['perm.moderateReport', true, true, true, false],
                ['perm.blockUser', true, true, true, false],
                ['perm.deleteUser', true, true, false, false],
                ['perm.addEditMember', true, true, false, false],
                ['perm.changeRole', true, false, false, false],
                ['perm.hardDelete', true, false, false, false],
                ['perm.editIntegrations', true, false, false, false],
              ].map(([key, ...cells]) => (
                <tr key={String(key)} className="text-brand-navy">
                  <td className="px-3 py-2 font-medium">{t(String(key))}</td>
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

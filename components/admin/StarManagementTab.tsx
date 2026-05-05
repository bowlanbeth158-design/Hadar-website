'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, Search } from 'lucide-react';
import {
  INITIAL_USERS,
  STAR_TIER_KEY,
  STAR_TIER_STYLE,
  type StarTier,
  type User,
} from '@/lib/mock/utilisateurs';
import { useI18n } from '@/lib/i18n/provider';
import { appendAudit } from './VerificationRequestsTab';

// Tab body for /admin/utilisateurs → "Étoiles". Lists every user
// with their current reputation tier (1-5 stars / Bronze→Diamant)
// and lets the admin bump the count up or down. Each change is
// appended to the audit log via the shared appendAudit() helper
// from VerificationRequestsTab.
//
// State persists in localStorage so the demo survives reloads.

const STARS_KEY = 'hadar:admin:users:stars';
type StarFilter = StarTier | 'all';

const TIERS: StarTier[] = [1, 2, 3, 4, 5];

export function StarManagementTab() {
  const { t } = useI18n();
  // userId → current stars override (defaults to user.stars when missing)
  const [overrides, setOverrides] = useState<Record<string, StarTier>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StarFilter>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STARS_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STARS_KEY, JSON.stringify(overrides));
    } catch {
      /* ignore */
    }
  }, [overrides]);

  // Resolved tier per user: override → fallback to mock value
  const resolvedStars = (u: User): StarTier => overrides[u.id] ?? u.stars;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INITIAL_USERS.filter((u) => {
      const matchesSearch =
        q === '' ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesFilter = filter === 'all' || resolvedStars(u) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, overrides]);

  const counts = useMemo(() => {
    const c: Record<StarFilter, number> = { all: INITIAL_USERS.length, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    INITIAL_USERS.forEach((u) => {
      c[resolvedStars(u)]++;
    });
    return c;
  }, [overrides]);

  const setStars = (user: User, next: StarTier) => {
    const previous = resolvedStars(user);
    if (next === previous) return;
    setOverrides((m) => ({ ...m, [user.id]: next }));
    appendAudit({
      ts: new Date().toLocaleString('fr-FR'),
      scope: 'star',
      action: 'set',
      targetUserId: user.id,
      details: `${previous} → ${next}`,
    });
  };

  const filterButton = (id: StarFilter, count: number, label: string) => (
    <button
      key={String(id)}
      type="button"
      onClick={() => setFilter(id)}
      className={
        filter === id
          ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all'
          : 'inline-flex items-center gap-1.5 rounded-pill bg-white border border-gray-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue px-3 py-1.5 text-xs font-medium transition-all'
      }
    >
      {label}
      <span className="tabular-nums opacity-80">({count})</span>
    </button>
  );

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.stars.searchPlaceholder')}
            className="w-full rounded-pill border border-gray-200 pl-9 pr-3 py-1.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {filterButton('all', counts.all, t('admin.stars.filter.all'))}
          {TIERS.map((tier) =>
            filterButton(tier, counts[tier], `${tier}★ ${t(STAR_TIER_KEY[tier])}`),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">{t('admin.stars.col.user')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.col.email')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.col.reportsPublished')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.col.currentTier')}</th>
              <th className="px-4 py-3 text-left">{t('admin.stars.col.setTier')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  {t('admin.stars.empty')}
                </td>
              </tr>
            )}
            {filtered.map((user) => {
              const current = resolvedStars(user);
              return (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-navy">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums">{user.reportsPublished}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STAR_TIER_STYLE[current]}`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({ length: current }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" aria-hidden />
                        ))}
                      </span>
                      {t(STAR_TIER_KEY[current])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1">
                      {TIERS.map((tier) => {
                        const isActive = current === tier;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setStars(user, tier)}
                            aria-pressed={isActive}
                            aria-label={`${tier} ${t('admin.stars.starsAria')}`}
                            title={t(STAR_TIER_KEY[tier])}
                            className={
                              isActive
                                ? 'inline-flex items-center justify-center h-7 w-7 rounded-full bg-brand-navy text-white shadow-sm'
                                : 'inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-gray-200 text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-colors'
                            }
                          >
                            <Star className={`h-3.5 w-3.5 ${isActive ? 'fill-current' : ''}`} aria-hidden />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-500">{t('admin.stars.note')}</p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { UserPlus, Search, Filter, ChevronDown, Eye } from 'lucide-react';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';

type Role = 'admin' | 'moderateur' | 'support';
type Status = 'actif' | 'inactif' | 'suspendu';

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'text-violet-500 bg-violet-200/40' },
  moderateur: { label: 'Modérateur', cls: 'text-brand-blue bg-brand-sky/60' },
  support: { label: 'Support', cls: 'text-orange-600 bg-orange-100' },
};

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  actif: { label: 'Actif', cls: 'text-green-700 bg-green-100' },
  inactif: { label: 'Inactif', cls: 'text-gray-600 bg-gray-200' },
  suspendu: { label: 'Suspendu', cls: 'text-red-700 bg-red-100' },
};

const MEMBERS: {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastSeen: string;
}[] = [
  { id: '01', name: 'Yahya MOUSSAOUI', email: 'yahya.moussaoui@gmail.com', role: 'admin', status: 'actif', lastSeen: '13/04/26  23:12:05' },
  { id: '02', name: 'Salma EL AMRANI', email: 'salma@hadar.ma', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  18:40:00' },
  { id: '03', name: 'Karim BENJELLOUN', email: 'karim@hadar.ma', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  14:05:17' },
  { id: '04', name: 'Fatima ZAHRA', email: 'fatima@hadar.ma', role: 'support', status: 'inactif', lastSeen: '01/04/26  10:22:44' },
  { id: '05', name: 'Mehdi TAZI', email: 'mehdi@hadar.ma', role: 'support', status: 'suspendu', lastSeen: '15/03/26  12:05:08' },
];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Dernière activité'],
    ...MEMBERS.map((m) => [
      `#${m.id}`,
      m.name,
      m.email,
      ROLE_STYLE[m.role].label,
      STATUS_STYLE[m.status].label,
      m.lastSeen,
    ]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Membres de l&apos;équipe</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${MEMBERS.length}`} /> membres
            dans l&apos;équipe Hadar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Ajouter un membre
          </button>
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-membres" getRows={exportRows} />
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 shadow-glow-yellow transition-colors"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filtres
            <span className="rounded-full bg-yellow-500 text-white h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
              10
            </span>
            <ChevronDown className="h-3 w-3" aria-hidden />
          </button>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden />
            <input
              type="search"
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
              {MEMBERS.map((m) => {
                const r = ROLE_STYLE[m.role];
                const s = STATUS_STYLE[m.status];
                return (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-mono text-brand-navy">#{m.id}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${r.cls}`}>
                        {r.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{m.lastSeen}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
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
            <AnimatedCounter key={`${refreshKey}-count`} value={`${MEMBERS.length}`} /> membres
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">‹</button>
            <button type="button" className="px-2.5 py-1 rounded hover:bg-gray-100">1</button>
            <button type="button" className="px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy">2</button>
            <button type="button" className="px-2.5 py-1 rounded hover:bg-gray-100">3</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">›</button>
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
    </div>
  );
}

'use client';

import { Search, Filter, ChevronDown, ListChecks } from 'lucide-react';
import { UserActionsDropdown } from '@/components/admin/UserActionsDropdown';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useState } from 'react';

type Status = 'actif' | 'inactif' | 'bloque' | 'supprime';

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  actif: { label: 'Actif', cls: 'text-green-700 bg-green-100' },
  inactif: { label: 'Inactif', cls: 'text-brand-navy bg-brand-sky/60' },
  bloque: { label: 'Bloqué', cls: 'text-gray-600 bg-gray-200' },
  supprime: { label: 'Supprimé', cls: 'text-red-700 bg-red-100' },
};

const USERS: {
  id: string;
  name: string;
  email: string;
  phone: string;
  signup: string;
  lastSeen: string;
  status: Status;
}[] = [
  { id: '01', name: 'Yahya MOUSSAOUI', email: 'yahya.moussaoui@gmail.com', phone: '0675487955', signup: '13/04/26  23:12:05', lastSeen: '13/04/26  23:12:05', status: 'actif' },
  { id: '18', name: 'Salma EL AMRANI', email: 'salma.elamrani@outlook.com', phone: '0661230987', signup: '05/04/26  09:05:22', lastSeen: '13/04/26  18:41:30', status: 'actif' },
  { id: '16', name: 'Karim BENJELLOUN', email: 'karim.b@yahoo.fr', phone: '0698564123', signup: '28/03/26  14:22:11', lastSeen: '02/04/26  10:15:08', status: 'inactif' },
  { id: '22', name: 'Fatima ZAHRA', email: 'fatimaz@gmail.com', phone: '0600000000', signup: '15/02/26  11:00:45', lastSeen: '20/02/26  12:33:17', status: 'bloque' },
  { id: '07', name: 'Mehdi TAZI', email: 'mehdi.tazi@outlook.com', phone: '0655554433', signup: '01/01/26  08:15:00', lastSeen: '12/01/26  22:10:05', status: 'supprime' },
];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const total = USERS.length;

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Nom', 'Email', 'Téléphone', 'Inscription', 'Dernière activité', 'Statut'],
    ...USERS.map((u) => [
      `#${u.id}`,
      u.name,
      u.email,
      u.phone,
      u.signup,
      u.lastSeen,
      STATUS_STYLE[u.status].label,
    ]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${total}`} /> utilisateurs inscrits
            sur la plateforme
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
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue shadow-glow-soft transition-all"
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              Sélectionner tous
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue shadow-glow-soft transition-all"
            >
              Actions
              <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Rechercher un utilisateur"
              className="w-64 rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" aria-label="Tout sélectionner" />
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
              {USERS.map((u) => {
                const s = STATUS_STYLE[u.status];
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <input type="checkbox" aria-label={`Sélectionner ${u.name}`} />
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
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            <AnimatedCounter key={`${refreshKey}-count`} value={`${USERS.length}`} /> utilisateurs affichés
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">‹</button>
            <button type="button" className="px-2.5 py-1 rounded hover:bg-gray-100">1</button>
            <button
              type="button"
              className="px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy"
            >
              2
            </button>
            <button type="button" className="px-2.5 py-1 rounded hover:bg-gray-100">3</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100">›</button>
          </div>
        </div>
      </section>
    </div>
  );
}

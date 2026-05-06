'use client';

import {
  Users,
  Siren,
  Smartphone,
  Clock,
  TrendingUp,
  ShieldCheck,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '@/lib/api/hooks';

interface StatsResponse {
  users: { total: number; active: number; blocked: number };
  reports: {
    total: number;
    pending: number;
    published: number;
    last24h: number;
    last7d: number;
  };
  contacts: { flagged: number };
  verifications: { pending: number };
  satisfaction: { averageScore: number | null; ratingsCount: number };
  generatedAt: string;
}

const KPI_TINT = 'bg-white border border-gray-200 shadow-glow-soft';

export function AdminStatsLive() {
  const { data, loading, error } = useApi<StatsResponse>('/api/admin/stats');

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 inline-flex gap-2 items-start">
        <AlertTriangle className="h-4 w-4 mt-0.5" />
        {error?.userMessage ?? 'Erreur de chargement.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        Données générées le {new Date(data.generatedAt).toLocaleString('fr-FR')}.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi Icon={Users} label="Utilisateurs actifs" value={data.users.active} hint={`/ ${data.users.total} total`} />
        <Kpi Icon={Siren} label="Signalements publiés" value={data.reports.published} hint={`${data.reports.pending} en attente`} />
        <Kpi Icon={Smartphone} label="Contacts flagués" value={data.contacts.flagged} />
        <Kpi Icon={ShieldCheck} label="Vérifications attente" value={data.verifications.pending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Kpi Icon={Clock} label="Signalements 24h" value={data.reports.last24h} accent="orange" />
        <Kpi Icon={TrendingUp} label="Signalements 7j" value={data.reports.last7d} accent="blue" />
        <Kpi
          Icon={Star}
          label="Satisfaction moyenne"
          value={data.satisfaction.averageScore !== null ? data.satisfaction.averageScore.toFixed(2) + ' / 5' : '—'}
          hint={`${data.satisfaction.ratingsCount} avis`}
          accent="yellow"
        />
      </div>
    </div>
  );
}

function Kpi({
  Icon,
  label,
  value,
  hint,
  accent,
}: {
  Icon: typeof Users;
  label: string;
  value: number | string;
  hint?: string;
  accent?: 'orange' | 'blue' | 'yellow';
}) {
  const ring = accent === 'orange' ? 'ring-orange-200' : accent === 'blue' ? 'ring-blue-200' : accent === 'yellow' ? 'ring-yellow-200' : 'ring-transparent';
  return (
    <div className={`${KPI_TINT} ring-1 ${ring} rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-brand-navy tabular-nums">
            {value}
          </p>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
        <Icon className="h-5 w-5 text-brand-blue" aria-hidden />
      </div>
    </div>
  );
}

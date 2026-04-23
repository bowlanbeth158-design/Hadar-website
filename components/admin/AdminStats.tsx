'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Siren,
  Copy,
  TrendingUp,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  Globe,
  AtSign,
  Wallet,
  Coins,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PeriodTabs } from './PeriodTabs';
import { RefreshButton } from './RefreshButton';
import { ExportButton } from './ExportButton';
import { daysBetween, frNumber, periodMultiplier, scale, relativeNow } from '@/lib/period';

type Tab = 'global' | 'problems' | 'channels' | 'ux';

const TABS: { id: Tab; label: string }[] = [
  { id: 'global', label: 'Vue globale' },
  { id: 'problems', label: 'Analyse des problèmes' },
  { id: 'channels', label: 'Analyse des canaux' },
  { id: 'ux', label: 'Expérience utilisateur' },
];

const GLOBAL_KPIS_BASE: {
  base: number | null;
  display: string;
  label: string;
  gradient: string;
  glow: string;
  Icon: LucideIcon;
  deltaPct: number | null;
  deltaLabel: string;
}[] = [
  { base: 1820, display: '', label: 'Total signalements', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Siren, deltaPct: -10, deltaLabel: 'vs période précédente' },
  { base: 1300, display: '', label: 'Signalements traités', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Copy, deltaPct: 8, deltaLabel: 'vs période précédente' },
  { base: null, display: '71%', label: 'Taux de traitement', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: TrendingUp, deltaPct: null, deltaLabel: '+3 pts vs période précédente' },
  { base: null, display: '36:35:10', label: 'Temps moyen de traitement', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock, deltaPct: null, deltaLabel: '-5% vs période précédente' },
];

const RISK_KPIS_BASE = [
  { value: '3,35', pct: '', base: null as number | null, label: 'Intensité moy. signalements par contact', cls: 'bg-grad-alert-red shadow-glow-red' },
  { value: '', pct: '44%', base: 800, label: 'Vigilance (1 à 2)', cls: 'bg-grad-stat-sky shadow-glow-sky' },
  { value: '', pct: '36%', base: 670, label: 'Modéré (3 à 4)', cls: 'bg-grad-alert-yellow shadow-glow-yellow' },
  { value: '', pct: '20%', base: 350, label: 'Élevé (≥ 5)', cls: 'bg-grad-stat-green shadow-glow-green' },
];

type Bar = { label: string; value: number; color: string };

function BarChart({ bars, showPct, refreshKey }: { bars: Bar[]; showPct: boolean; refreshKey: number }) {
  const total = bars.reduce((s, b) => s + b.value, 0);
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="flex items-end gap-4 h-56">
      <div className="flex-1 grid items-end gap-4 h-full" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
        {bars.map((b) => {
          const pct = Math.max((b.value / max) * 100, 6);
          const labelValue = showPct
            ? `${Math.round((b.value / total) * 100)}%`
            : b.value.toLocaleString('fr-FR').replace(/,/g, ' ');
          return (
            <div key={b.label} className="flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-brand-navy mb-1 transition-transform group-hover:scale-110">
                <AnimatedCounter key={`${refreshKey}-${b.label}-${showPct}`} value={labelValue} />
              </span>
              <div
                className={`w-full ${b.color} rounded-t-xl transition-all duration-700 group-hover:brightness-110 group-hover:shadow-glow-navy cursor-pointer`}
                style={{ height: `${pct}%` }}
                title={`${b.label} — ${labelValue}`}
              />
              <span className="mt-2 text-xs font-medium text-gray-500 text-center transition-colors group-hover:text-brand-navy">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  subtitle,
  prev,
  curr,
  delta,
  refreshKey,
}: {
  title: string;
  subtitle: string;
  prev: { label: string; value: number };
  curr: { label: string; value: number };
  delta: string;
  refreshKey: number;
}) {
  const max = Math.max(prev.value, curr.value);
  return (
    <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
      <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      <div className="mt-5 space-y-4">
        {[{ ...prev, color: 'bg-grad-stat-red shadow-glow-red' }, { ...curr, color: 'bg-grad-stat-green shadow-glow-green' }].map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-brand-navy font-medium">{b.label}</span>
              <span className="text-brand-navy font-bold">
                <AnimatedCounter
                  key={`${refreshKey}-${b.label}-${b.value}`}
                  value={b.value.toLocaleString('fr-FR').replace(/,/g, ' ')}
                />
              </span>
            </div>
            <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-pill ${b.color} transition-all duration-700`}
                style={{ width: `${(b.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <span className="inline-flex items-center rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold shadow-glow-navy">
          {delta}
        </span>
      </div>
    </section>
  );
}

const CHANNELS = [
  { id: 'telephone', label: 'Téléphone', value: 101, Icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp', value: 600, Icon: MessageCircle },
  { id: 'email', label: 'Email', value: 46, Icon: Mail },
  { id: 'rib', label: 'RIB', value: 168, Icon: CreditCard },
  { id: 'site_web', label: 'Site web', value: 210, Icon: Globe },
  { id: 'reseaux', label: 'Réseaux sociaux', value: 300, Icon: AtSign },
  { id: 'binance', label: 'Binance', value: 120, Icon: Coins },
  { id: 'paypal', label: 'PayPal', value: 35, Icon: Wallet },
];

const PROBLEMS = [
  { id: 'non_livraison', label: 'Non livraison', value: 200, color: 'bg-orange-500' },
  { id: 'bloque', label: 'Bloqué', value: 1020, color: 'bg-red-500' },
  { id: 'non_conforme', label: 'Non conforme', value: 500, color: 'bg-yellow-500' },
  { id: 'usurpation', label: 'Usurpation', value: 100, color: 'bg-brand-navy' },
];

const UX_KPIS_BASE = [
  { base: 15000 as number | null, display: '', label: 'Visites', cls: 'bg-grad-stat-sky shadow-glow-sky' },
  { base: 8500 as number | null, display: '', label: 'Inscriptions', cls: 'bg-grad-stat-green shadow-glow-green' },
  { base: 950 as number | null, display: '', label: 'Utilisateurs actifs', cls: 'bg-grad-stat-red shadow-glow-red' },
  { base: null, display: '57%', label: 'Taux de conversion', cls: 'bg-grad-stat-orange shadow-glow-orange' },
];

const SATISFACTION = [
  { value: '4.2 / 5', label: 'Score de satisfaction' },
  { value: '84%', label: 'Taux de satisfaction' },
  { value: '16%', label: "Taux d'insatisfaction" },
  { value: '62%', label: 'Taux de retour' },
];

export function AdminStats() {
  const [tab, setTab] = useState<Tab>('global');
  const [hybridMode, setHybridMode] = useState<'count' | 'pct'>('count');
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[1]!.id);
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[1]!.id);
  const [refreshKey, setRefreshKey] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(4);
  const [periodLabel, setPeriodLabel] = useState('365 jours');
  const [rangeDays, setRangeDays] = useState<number | undefined>(undefined);
  const [lastUpdate, setLastUpdate] = useState<Date>(() => new Date());
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 15_000);
    return () => window.clearInterval(t);
  }, []);

  const mult = periodMultiplier(periodIndex, rangeDays);
  // Default period for stats page is 365 jours (index 4, mult 210). Relative factor scales everything proportionally.
  const factor = mult / 210;

  const globalKpis = useMemo(
    () =>
      GLOBAL_KPIS_BASE.map((k) => ({
        ...k,
        display: k.base != null ? frNumber(scale(k.base, factor)) : k.display,
      })),
    [factor],
  );
  const riskKpis = useMemo(
    () =>
      RISK_KPIS_BASE.map((k) => ({
        ...k,
        value: k.base != null ? frNumber(scale(k.base, factor)) : k.value,
      })),
    [factor],
  );
  const problems = useMemo(
    () => PROBLEMS.map((p) => ({ ...p, value: scale(p.value, factor) })),
    [factor],
  );
  const channels = useMemo(
    () => CHANNELS.map((c) => ({ ...c, value: scale(c.value, factor) })),
    [factor],
  );
  const uxKpis = useMemo(
    () =>
      UX_KPIS_BASE.map((k) => ({
        ...k,
        display: k.base != null ? frNumber(scale(k.base, factor)) : k.display,
      })),
    [factor],
  );

  const selectedP = problems.find((p) => p.id === selectedProblem) ?? problems[0]!;
  const selectedC = channels.find((c) => c.id === selectedChannel) ?? channels[0]!;

  const exportRows = (): (string | number)[][] => {
    const rows: (string | number)[][] = [['Section', 'Indicateur', 'Valeur', 'Delta / Période']];
    globalKpis.forEach((k) => rows.push(['Vue globale', k.label, k.display, k.deltaLabel]));
    riskKpis.forEach((k) => rows.push(['Niveaux de risque', k.label, k.value, k.pct]));
    problems.forEach((p) => rows.push(['Problèmes', p.label, p.value, periodLabel]));
    channels.forEach((c) => rows.push(['Canaux', c.label, c.value, periodLabel]));
    uxKpis.forEach((k) => rows.push(['UX', k.label, k.display, periodLabel]));
    SATISFACTION.forEach((k) => rows.push(['Satisfaction', k.label, k.value, periodLabel]));
    return rows;
  };

  const secondsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Statistiques</h1>
          <p className="mt-1 text-sm text-gray-500">
            Période : <span className="font-semibold text-brand-navy">{periodLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton
            onRefresh={() => {
              setRefreshKey((k) => k + 1);
              setLastUpdate(new Date());
            }}
          />
          <ExportButton filename="hadar-statistiques" getRows={exportRows} />
        </div>
      </div>

      <div className="mb-8">
        <PeriodTabs
          defaultActive={4}
          onChange={(label, index, range) => {
            setPeriodLabel(label);
            setPeriodIndex(index);
            setRangeDays(range ? daysBetween(range.from, range.to) : undefined);
            setLastUpdate(new Date());
          }}
        />
      </div>

      <nav role="tablist" className="flex flex-wrap justify-center gap-2 mb-8">
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              type="button"
              className={
                on
                  ? 'rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy hover:scale-[1.03] transition-transform'
                  : 'rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy hover:text-white hover:shadow-glow-navy hover:scale-[1.03] transition-all'
              }
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab !== 'ux' && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {globalKpis.map((k) => (
            <div
              key={k.label}
              className={`${k.gradient} ${k.glow} text-white rounded-2xl p-5 flex flex-col gap-2 cursor-default hover:scale-[1.03] hover:brightness-110 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter key={`${refreshKey}-${k.label}-${factor}`} value={k.display} />
                  </p>
                  <p className="text-sm font-medium opacity-90 mt-1">{k.label}</p>
                </div>
                <k.Icon className="h-7 w-7 opacity-70 transition-transform group-hover:rotate-6" aria-hidden />
              </div>
              <p className="text-xs text-white/80">{k.deltaLabel}</p>
            </div>
          ))}
        </section>
      )}

      {(tab === 'problems' || tab === 'channels') && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {riskKpis.map((k) => (
            <div
              key={k.label}
              className={`${k.cls} text-white rounded-2xl p-5 cursor-default hover:scale-[1.03] hover:brightness-110 transition-all duration-300`}
            >
              <p className="text-3xl font-bold">
                <AnimatedCounter key={`${refreshKey}-${k.label}-${factor}`} value={k.value} />
              </p>
              {k.pct && <p className="text-sm font-semibold opacity-90">{k.pct}</p>}
              <p className="mt-1 text-xs font-medium opacity-90">{k.label}</p>
            </div>
          ))}
        </section>
      )}

      {tab === 'global' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-brand-navy">Répartition</h3>
              <div className="inline-flex rounded-pill bg-gray-100 p-1 text-xs">
                <button type="button" onClick={() => setHybridMode('count')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'count' ? 'bg-brand-navy text-white shadow-glow-navy' : 'text-gray-500'}`}>Nombre</button>
                <button type="button" onClick={() => setHybridMode('pct')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'pct' ? 'bg-brand-navy text-white shadow-glow-navy' : 'text-gray-500'}`}>%</button>
              </div>
            </div>
            <BarChart
              bars={[
                { label: 'En cours', value: scale(200, factor), color: 'bg-orange-500' },
                { label: 'Publié', value: scale(1020, factor), color: 'bg-green-500' },
                { label: 'Refusé', value: scale(500, factor), color: 'bg-red-500' },
                { label: 'À corriger', value: scale(100, factor), color: 'bg-brand-blue' },
              ]}
              showPct={hybridMode === 'pct'}
              refreshKey={refreshKey}
            />
          </section>
          <ComparisonCard
            title="Variation des signalements"
            subtitle="Comparaison avec la période précédente"
            prev={{ label: '2025 — période précédente', value: Math.max(1, Math.round(2120 * factor)) }}
            curr={{ label: '2026 — période actuelle', value: scale(1820, factor) }}
            delta={(() => {
              const p = Math.max(1, Math.round(2120 * factor));
              const c = scale(1820, factor);
              const pct = Math.round(((c - p) / p) * 100);
              return `${pct >= 0 ? '+' : ''}${pct}% vs période précédente`;
            })()}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {tab === 'problems' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-brand-navy">Répartition des problèmes</h3>
              <div className="inline-flex rounded-pill bg-gray-100 p-1 text-xs">
                <button type="button" onClick={() => setHybridMode('count')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'count' ? 'bg-brand-navy text-white shadow-glow-navy' : 'text-gray-500'}`}>Nombre</button>
                <button type="button" onClick={() => setHybridMode('pct')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'pct' ? 'bg-brand-navy text-white shadow-glow-navy' : 'text-gray-500'}`}>%</button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {problems.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProblem(p.id)}
                  className={
                    selectedProblem === p.id
                      ? 'rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold shadow-glow-navy hover:scale-[1.05] transition-transform'
                      : 'rounded-pill bg-gray-100 text-gray-600 px-3 py-1 text-xs font-medium hover:bg-brand-navy hover:text-white hover:shadow-glow-navy hover:scale-[1.05] transition-all'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <BarChart bars={problems} showPct={hybridMode === 'pct'} refreshKey={refreshKey} />
          </section>
          <ComparisonCard
            title={`Évolution — ${selectedP.label}`}
            subtitle="Comparaison avec la période précédente"
            prev={{ label: '2025 — période précédente', value: Math.max(1, Math.round(1370 * factor)) }}
            curr={{ label: '2026 — période actuelle', value: selectedP.value }}
            delta={(() => {
              const p = Math.max(1, Math.round(1370 * factor));
              const pct = Math.round(((selectedP.value - p) / p) * 100);
              return `${pct >= 0 ? '+' : ''}${pct}% vs période précédente`;
            })()}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {tab === 'channels' && (
        <div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {channels.map((c) => {
              const on = selectedChannel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChannel(c.id)}
                  className={
                    on
                      ? 'inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-3.5 py-1.5 text-xs font-semibold shadow-glow-navy hover:scale-[1.05] transition-transform'
                      : 'inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-3.5 py-1.5 text-xs font-medium hover:border-brand-blue hover:shadow-glow-navy hover:scale-[1.05] transition-all'
                  }
                >
                  <c.Icon className="h-3.5 w-3.5" aria-hidden />
                  {c.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-brand-navy">Distribution par canal</h3>
                <div className="inline-flex rounded-pill bg-gray-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setHybridMode('count')}
                    className={`px-3 py-1 rounded-pill transition-colors ${
                      hybridMode === 'count'
                        ? 'bg-brand-navy text-white shadow-glow-navy'
                        : 'text-gray-500'
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    type="button"
                    onClick={() => setHybridMode('pct')}
                    className={`px-3 py-1 rounded-pill transition-colors ${
                      hybridMode === 'pct'
                        ? 'bg-brand-navy text-white shadow-glow-navy'
                        : 'text-gray-500'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <BarChart
                bars={channels.map((c) => ({ label: c.label, value: c.value, color: 'bg-grad-stat-navy shadow-glow-navy' }))}
                showPct={hybridMode === 'pct'}
                refreshKey={refreshKey}
              />
            </section>
            <ComparisonCard
              title={`Évolution — ${selectedC.label}`}
              subtitle="Comparaison avec la période précédente"
              prev={{ label: '2025 — période précédente', value: Math.max(1, Math.round(850 * factor)) }}
              curr={{ label: '2026 — période actuelle', value: selectedC.value }}
              delta={(() => {
                const p = Math.max(1, Math.round(850 * factor));
                const pct = Math.round(((selectedC.value - p) / p) * 100);
                return `${pct >= 0 ? '+' : ''}${pct}% vs période précédente`;
              })()}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      )}

      {tab === 'ux' && (
        <div>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {uxKpis.map((k) => (
              <div
                key={k.label}
                className={`${k.cls} text-white rounded-2xl p-5 cursor-default hover:scale-[1.03] hover:brightness-110 transition-all duration-300`}
              >
                <p className="text-3xl font-bold">
                  <AnimatedCounter
                    key={`${refreshKey}-${k.label}-${factor}`}
                    value={k.display}
                  />
                </p>
                <p className="mt-1 text-sm font-medium opacity-90">{k.label}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2 mb-8">
            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
              <h3 className="text-lg font-bold text-brand-navy mb-4">Signalements vs Vérifications</h3>
              <div className="space-y-3">
                {[
                  { label: 'Signalements', value: 300, pct: 31, color: 'bg-grad-stat-violet shadow-glow-violet' },
                  { label: 'Vérifications', value: 650, pct: 69, color: 'bg-grad-stat-navy shadow-glow-navy' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-brand-navy font-medium">{r.label}</span>
                      <span className="text-brand-navy font-bold">
                        <AnimatedCounter key={`${refreshKey}-${r.label}-v`} value={`${r.value}`} /> —{' '}
                        <AnimatedCounter key={`${refreshKey}-${r.label}-p`} value={`${r.pct}%`} />
                      </span>
                    </div>
                    <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-pill ${r.color} transition-all duration-700`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 hover:shadow-glow-navy hover:border-brand-blue transition-all duration-300">
              <h3 className="text-lg font-bold text-brand-navy mb-4">Temps moyen par usage</h3>
              <div className="space-y-3">
                {[
                  { label: 'Signalement', value: '5 min 23 sec', pct: 70, color: 'bg-grad-stat-violet shadow-glow-violet' },
                  { label: 'Vérification', value: '2 min 13 sec', pct: 30, color: 'bg-grad-stat-navy shadow-glow-navy' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-brand-navy font-medium">{r.label}</span>
                      <span className="text-brand-navy font-bold">{r.value}</span>
                    </div>
                    <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-pill ${r.color} transition-all duration-700`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SATISFACTION.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-violet-500/10 border border-violet-500/20 shadow-glow-violet p-5 text-center cursor-default hover:scale-[1.03] hover:bg-violet-500/20 transition-all duration-300"
              >
                <p className="text-3xl font-bold text-violet-500">
                  <AnimatedCounter key={`${refreshKey}-${c.label}`} value={c.value} />
                </p>
                <p className="mt-1 text-xs text-gray-600">{c.label}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 text-right">
        Dernière mise à jour : {relativeNow(secondsAgo)}
      </p>
    </div>
  );
}

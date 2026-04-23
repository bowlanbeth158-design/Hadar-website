'use client';

import { useState } from 'react';
import {
  Siren,
  Copy,
  TrendingUp,
  Clock,
  RefreshCw,
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

type Tab = 'global' | 'problems' | 'channels' | 'ux';

const TABS: { id: Tab; label: string }[] = [
  { id: 'global', label: 'Vue globale' },
  { id: 'problems', label: 'Analyse des problèmes' },
  { id: 'channels', label: 'Analyse des canaux' },
  { id: 'ux', label: 'Expérience utilisateur' },
];

const PERIODS = ['Aujourd’hui', 'Hier', '7 jours', '30 jours', '365 jours', 'Personnalisé'];

const GLOBAL_KPIS: { value: string; label: string; gradient: string; glow: string; Icon: LucideIcon; delta: string }[] = [
  { value: '1 820', label: 'Total signalements', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Siren, delta: '-10% vs période précédente' },
  { value: '1 300', label: 'Signalements traités', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Copy, delta: '+8% vs période précédente' },
  { value: '71%', label: 'Taux de traitement', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: TrendingUp, delta: '+3 pts vs période précédente' },
  { value: '36:35:10', label: 'Temps moyen de traitement', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock, delta: '-5% vs période précédente' },
];

const RISK_KPIS = [
  { value: '3,35', label: 'Intensité moy. signalements par contact', cls: 'bg-grad-alert-red shadow-glow-red' },
  { value: '800', pct: '44%', label: 'Vigilance (1 à 2)', cls: 'bg-grad-stat-sky shadow-glow-sky' },
  { value: '670', pct: '36%', label: 'Modéré (3 à 4)', cls: 'bg-grad-alert-yellow shadow-glow-yellow' },
  { value: '350', pct: '20%', label: 'Élevé (≥ 5)', cls: 'bg-grad-stat-green shadow-glow-green' },
];

type Bar = { label: string; value: number; color: string };

function BarChart({ bars, showPct }: { bars: Bar[]; showPct: boolean }) {
  const total = bars.reduce((s, b) => s + b.value, 0);
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="flex items-end gap-4 h-56">
      <div className="flex-1 grid items-end gap-4 h-full" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
        {bars.map((b) => {
          const pct = Math.max((b.value / max) * 100, 6);
          const labelValue = showPct ? `${Math.round((b.value / total) * 100)}%` : b.value.toLocaleString('fr-FR');
          return (
            <div key={b.label} className="flex flex-col items-center h-full justify-end">
              <span className="text-xs font-bold text-brand-navy mb-1">{labelValue}</span>
              <div className={`w-full ${b.color} rounded-t-xl`} style={{ height: `${pct}%` }} />
              <span className="mt-2 text-xs font-medium text-gray-500 text-center">{b.label}</span>
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
}: {
  title: string;
  subtitle: string;
  prev: { label: string; value: number };
  curr: { label: string; value: number };
  delta: string;
}) {
  const max = Math.max(prev.value, curr.value);
  return (
    <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
      <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      <div className="mt-5 space-y-4">
        {[{ ...prev, color: 'bg-red-500' }, { ...curr, color: 'bg-green-500' }].map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-brand-navy font-medium">{b.label}</span>
              <span className="text-brand-navy font-bold">{b.value.toLocaleString('fr-FR')}</span>
            </div>
            <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-pill ${b.color}`} style={{ width: `${(b.value / max) * 100}%` }} />
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

export function AdminStats() {
  const [tab, setTab] = useState<Tab>('global');
  const [hybridMode, setHybridMode] = useState<'count' | 'pct'>('count');
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[1]!.id);
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[1]!.id);

  const selectedP = PROBLEMS.find((p) => p.id === selectedProblem)!;
  const selectedC = CHANNELS.find((c) => c.id === selectedChannel)!;
  const channelTotal = CHANNELS.reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Statistiques</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PERIODS.map((p, i) => (
          <button
            key={p}
            type="button"
            className={
              i === 4
                ? 'rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium shadow-glow-navy'
                : 'rounded-pill bg-brand-sky/60 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky'
            }
          >
            {p}
          </button>
        ))}
      </div>

      <nav role="tablist" className="flex flex-wrap gap-2 mb-8">
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
                  ? 'rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
                  : 'rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy/5 transition-colors'
              }
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab !== 'ux' && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {GLOBAL_KPIS.map((k) => (
            <div
              key={k.label}
              className={`${k.gradient} ${k.glow} text-white rounded-2xl p-5 flex flex-col gap-2`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{k.value}</p>
                  <p className="text-sm font-medium opacity-90 mt-1">{k.label}</p>
                </div>
                <k.Icon className="h-7 w-7 opacity-70" aria-hidden />
              </div>
              <p className="text-xs text-white/80">{k.delta}</p>
            </div>
          ))}
        </section>
      )}

      {(tab === 'problems' || tab === 'channels') && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {RISK_KPIS.map((k) => (
            <div key={k.label} className={`${k.cls} text-white rounded-2xl p-5`}>
              <p className="text-3xl font-bold">{k.value}</p>
              {k.pct && <p className="text-sm font-semibold opacity-90">{k.pct}</p>}
              <p className="mt-1 text-xs font-medium opacity-90">{k.label}</p>
            </div>
          ))}
        </section>
      )}

      {tab === 'global' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-brand-navy">Répartition</h3>
              <div className="inline-flex rounded-pill bg-gray-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setHybridMode('count')}
                  className={`px-3 py-1 rounded-pill transition-colors ${
                    hybridMode === 'count' ? 'bg-brand-navy text-white' : 'text-gray-500'
                  }`}
                >
                  Nombre
                </button>
                <button
                  type="button"
                  onClick={() => setHybridMode('pct')}
                  className={`px-3 py-1 rounded-pill transition-colors ${
                    hybridMode === 'pct' ? 'bg-brand-navy text-white' : 'text-gray-500'
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <BarChart
              bars={[
                { label: 'En cours', value: 200, color: 'bg-orange-500' },
                { label: 'Publié', value: 1020, color: 'bg-green-500' },
                { label: 'Refusé', value: 500, color: 'bg-red-500' },
                { label: 'À corriger', value: 100, color: 'bg-brand-blue' },
              ]}
              showPct={hybridMode === 'pct'}
            />
          </section>
          <ComparisonCard
            title="Variation des signalements"
            subtitle="Comparaison avec la période précédente"
            prev={{ label: '2025 — période précédente', value: 2120 }}
            curr={{ label: '2026 — période actuelle', value: 1820 }}
            delta="-14% vs période précédente"
          />
        </div>
      )}

      {tab === 'problems' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-brand-navy">Répartition des problèmes</h3>
              <div className="inline-flex rounded-pill bg-gray-100 p-1 text-xs">
                <button type="button" onClick={() => setHybridMode('count')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'count' ? 'bg-brand-navy text-white' : 'text-gray-500'}`}>Nombre</button>
                <button type="button" onClick={() => setHybridMode('pct')} className={`px-3 py-1 rounded-pill transition-colors ${hybridMode === 'pct' ? 'bg-brand-navy text-white' : 'text-gray-500'}`}>%</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {PROBLEMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProblem(p.id)}
                  className={
                    selectedProblem === p.id
                      ? 'rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold shadow-glow-navy'
                      : 'rounded-pill bg-gray-100 text-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-200'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <BarChart bars={PROBLEMS} showPct={hybridMode === 'pct'} />
          </section>
          <ComparisonCard
            title={`Évolution — ${selectedP.label}`}
            subtitle="Comparaison avec la période précédente"
            prev={{ label: '2025 — période précédente', value: 1370 }}
            curr={{ label: '2026 — période actuelle', value: selectedP.value }}
            delta={`${selectedP.value >= 1370 ? '+' : '-'}${Math.abs(Math.round(((selectedP.value - 1370) / 1370) * 100))}% vs période précédente`}
          />
        </div>
      )}

      {tab === 'channels' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {CHANNELS.map((c) => {
              const pct = Math.round((c.value / channelTotal) * 100);
              const on = selectedChannel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChannel(c.id)}
                  className={
                    on
                      ? 'inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-3.5 py-1.5 text-xs font-semibold shadow-glow-navy'
                      : 'inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-3.5 py-1.5 text-xs font-medium hover:border-brand-blue transition-colors'
                  }
                >
                  <c.Icon className="h-3.5 w-3.5" aria-hidden />
                  {c.label}
                  <span className={on ? 'opacity-90 text-[10px]' : 'text-[10px] text-gray-500'}>
                    {c.value} · {pct}%
                  </span>
                </button>
              );
            })}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-lg font-bold text-brand-navy mb-4">Distribution par canal</h3>
              <BarChart
                bars={CHANNELS.map((c) => ({ label: c.label, value: c.value, color: 'bg-sky-500' }))}
                showPct={hybridMode === 'pct'}
              />
            </section>
            <ComparisonCard
              title={`Évolution — ${selectedC.label}`}
              subtitle="Comparaison avec la période précédente"
              prev={{ label: '2025 — période précédente', value: 850 }}
              curr={{ label: '2026 — période actuelle', value: selectedC.value }}
              delta={`${selectedC.value >= 850 ? '+' : '-'}${Math.abs(Math.round(((selectedC.value - 850) / 850) * 100))}% vs période précédente`}
            />
          </div>
        </div>
      )}

      {tab === 'ux' && (
        <div>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { value: '15 000', label: 'Visites', cls: 'bg-grad-stat-sky shadow-glow-sky' },
              { value: '8 500', label: 'Inscriptions', cls: 'bg-grad-stat-green shadow-glow-green' },
              { value: '950', label: 'Utilisateurs actifs', cls: 'bg-grad-stat-red shadow-glow-red' },
              { value: '57%', label: 'Taux de conversion', cls: 'bg-grad-stat-orange shadow-glow-orange' },
            ].map((k) => (
              <div key={k.label} className={`${k.cls} text-white rounded-2xl p-5`}>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="mt-1 text-sm font-medium opacity-90">{k.label}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-2 mb-8">
            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-lg font-bold text-brand-navy mb-4">
                Signalements vs Vérifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Signalements', value: 300, pct: 31, color: 'bg-violet-500' },
                  { label: 'Vérifications', value: 650, pct: 69, color: 'bg-brand-navy' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-brand-navy font-medium">{r.label}</span>
                      <span className="text-brand-navy font-bold">
                        {r.value} — {r.pct}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-pill ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-lg font-bold text-brand-navy mb-4">
                Temps moyen par usage
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Signalement', value: '5 min 23 sec', pct: 70, color: 'bg-violet-500' },
                  { label: 'Vérification', value: '2 min 13 sec', pct: 30, color: 'bg-brand-navy' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-brand-navy font-medium">{r.label}</span>
                      <span className="text-brand-navy font-bold">{r.value}</span>
                    </div>
                    <div className="h-2.5 rounded-pill bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-pill ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '4.2 / 5', label: 'Score de satisfaction' },
              { value: '84%', label: 'Taux de satisfaction' },
              { value: '16%', label: "Taux d'insatisfaction" },
              { value: '62%', label: 'Taux de retour' },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-violet-500/10 border border-violet-500/20 shadow-glow-violet p-5 text-center"
              >
                <p className="text-3xl font-bold text-violet-500">{c.value}</p>
                <p className="mt-1 text-xs text-gray-600">{c.label}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 text-right">Dernière mise à jour : il y a 2 min</p>
    </div>
  );
}

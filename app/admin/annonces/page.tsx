'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Megaphone,
  Mail,
  MessageCircle,
  Send,
  Layers,
  FileText,
  Plug,
  ScrollText,
  MoreVertical,
  Eye,
  Copy,
  Pencil,
  Trash2,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const TABS = [
  { id: 'campagnes', label: 'Campagnes', Icon: Megaphone },
  { id: 'automations', label: 'Automations', Icon: Layers },
  { id: 'templates', label: 'Templates', Icon: FileText },
  { id: 'integrations', label: 'Intégrations', Icon: Plug },
  { id: 'logs', label: 'Logs & Audit', Icon: ScrollText },
] as const;

type TabId = (typeof TABS)[number]['id'];

type Status = 'brouillon' | 'planifiee' | 'en_cours' | 'envoyee' | 'echec';
const STATUS: Record<Status, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' },
  planifiee: { label: 'Planifiée', cls: 'bg-brand-sky/70 text-brand-navy' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  envoyee: { label: 'Envoyée', cls: 'bg-green-100 text-green-700' },
  echec: { label: 'Échec', cls: 'bg-red-100 text-red-700' },
};

type Campaign = {
  id: string;
  name: string;
  channels: string[];
  status: Status;
  audience: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  scheduled: string;
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Lancement Hadar — vague 1', channels: ['email', 'whatsapp'], status: 'envoyee', audience: '8 500 users', sent: 8500, delivered: 8390, opened: 3420, clicked: 930, scheduled: '22/04/26 14:32' },
  { id: 'c2', name: 'Rappel vigilance fin de mois', channels: ['email'], status: 'planifiee', audience: 'Actifs 30j · 6 120', sent: 0, delivered: 0, opened: 0, clicked: 0, scheduled: '30/04/26 09:00' },
  { id: 'c3', name: 'Mise à jour règles publication', channels: ['email', 'banner'], status: 'brouillon', audience: 'Tous', sent: 0, delivered: 0, opened: 0, clicked: 0, scheduled: '—' },
  { id: 'c4', name: 'Alerte risque élevé — segment surveillé', channels: ['whatsapp'], status: 'en_cours', audience: 'Users à haut risque · 312', sent: 180, delivered: 172, opened: 98, clicked: 41, scheduled: 'Maintenant' },
];

type Automation = { id: string; name: string; trigger: string; channels: string[]; active: boolean };
const INITIAL_AUTOMATIONS: Automation[] = [
  { id: 'a1', name: 'Bienvenue + vérif email', trigger: 'user.created', channels: ['email'], active: true },
  { id: 'a2', name: 'Confirmation publication', trigger: 'report.published', channels: ['email', 'banner'], active: true },
  { id: 'a3', name: 'Notif refus + motif', trigger: 'report.rejected', channels: ['email'], active: true },
  { id: 'a4', name: 'Demande correction + motif', trigger: 'report.needsCorrection', channels: ['email', 'banner'], active: true },
  { id: 'a5', name: 'Alerte sécurité connexion inhabituelle', trigger: 'login.unusual', channels: ['email'], active: false },
];

const TEMPLATES = [
  { id: 'tpl1', name: 'Bienvenue — vérif email', channel: 'email', updated: '18/04/26', language: 'FR' },
  { id: 'tpl2', name: 'Signalement refusé', channel: 'email', updated: '15/04/26', language: 'FR' },
  { id: 'tpl3', name: 'Rappel vigilance', channel: 'whatsapp', updated: '12/04/26', language: 'FR' },
  { id: 'tpl4', name: 'Confirmation publication', channel: 'email', updated: '10/04/26', language: 'FR' },
  { id: 'tpl5', name: 'Bandeau alerte risque', channel: 'banner', updated: '08/04/26', language: 'FR' },
  { id: 'tpl6', name: 'Alerte connexion inhabituelle', channel: 'email', updated: '02/04/26', language: 'FR' },
];

const INTEGRATIONS = [
  { id: 'int1', name: 'SMTP transactionnel', provider: 'AWS SES', status: 'ok' as const, lastSync: 'il y a 2 min' },
  { id: 'int2', name: 'WhatsApp Business', provider: 'Meta Cloud API', status: 'ok' as const, lastSync: 'il y a 4 min' },
  { id: 'int3', name: 'Bandeau in-app', provider: 'Hadar internal', status: 'ok' as const, lastSync: 'temps réel' },
  { id: 'int4', name: 'SMS secours', provider: 'Twilio', status: 'warn' as const, lastSync: 'il y a 3 h' },
];

const LOGS = [
  { id: 'l1', when: '22/04/26 14:32', who: 'Rajae OUAZZANI', action: 'campaign.sent', target: 'Lancement Hadar — vague 1', outcome: 'success' as const },
  { id: 'l2', when: '22/04/26 11:14', who: 'Hakim CHRAIBI', action: 'template.updated', target: 'Rappel vigilance', outcome: 'success' as const },
  { id: 'l3', when: '21/04/26 18:05', who: 'système', action: 'automation.paused', target: 'Alerte sécurité connexion inhabituelle', outcome: 'warning' as const },
  { id: 'l4', when: '21/04/26 09:41', who: 'Rajae OUAZZANI', action: 'integration.synced', target: 'WhatsApp Business', outcome: 'success' as const },
  { id: 'l5', when: '20/04/26 22:18', who: 'système', action: 'campaign.failed', target: 'Alerte risque élevé — preview', outcome: 'error' as const },
];

function ChannelPills({ channels }: { channels: string[] }) {
  const map: Record<string, { Icon: React.ComponentType<{ className?: string }>; cls: string; label: string }> = {
    email: { Icon: Mail, cls: 'bg-blue-100 text-blue-700', label: 'Email' },
    whatsapp: { Icon: MessageCircle, cls: 'bg-green-100 text-green-700', label: 'WhatsApp' },
    banner: { Icon: Megaphone, cls: 'bg-orange-100 text-orange-700', label: 'Bandeau' },
  };
  return (
    <div className="flex items-center gap-1">
      {channels.map((c) => {
        const m = map[c];
        if (!m) return null;
        const Icon = m.Icon;
        return (
          <span
            key={c}
            title={m.label}
            className={`inline-flex items-center gap-1 rounded-pill ${m.cls} px-2 py-0.5 text-[10px] font-semibold`}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </span>
        );
      })}
    </div>
  );
}

function CampaignRowMenu({
  onSelect,
}: {
  onSelect: (action: 'view' | 'duplicate' | 'edit' | 'delete') => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const items: {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    action: 'view' | 'duplicate' | 'edit' | 'delete';
    tone: 'default' | 'danger';
  }[] = [
    { label: 'Voir', Icon: Eye, action: 'view', tone: 'default' },
    { label: 'Dupliquer', Icon: Copy, action: 'duplicate', tone: 'default' },
    { label: 'Modifier', Icon: Pencil, action: 'edit', tone: 'default' },
    { label: 'Supprimer', Icon: Trash2, action: 'delete', tone: 'danger' },
  ];

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-brand-navy"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
        >
          {items.map((it) => (
            <button
              key={it.action}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect(it.action);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                it.tone === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-brand-navy hover:bg-gray-50'
              }`}
            >
              <it.Icon className="h-4 w-4" aria-hidden />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('campagnes');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? null : m)), 2200);
  };

  const exportRows = (): (string | number)[][] => [
    ['Nom', 'Canaux', 'Statut', 'Audience', 'Envoyés', 'Délivrés', 'Ouverts', 'Cliqués', 'Date'],
    ...campaigns.map((c) => [
      c.name,
      c.channels.join(' · '),
      STATUS[c.status].label,
      c.audience,
      c.sent,
      c.delivered,
      c.opened,
      c.clicked,
      c.scheduled,
    ]),
  ];

  const handleCampaignAction = (c: Campaign, action: 'view' | 'duplicate' | 'edit' | 'delete') => {
    if (action === 'view') showFlash(`Aperçu de « ${c.name} »`);
    if (action === 'edit') showFlash(`Édition de « ${c.name} »`);
    if (action === 'duplicate') {
      setCampaigns((list) => [
        ...list,
        {
          ...c,
          id: `${c.id}-copy-${Date.now()}`,
          name: `${c.name} (copie)`,
          status: 'brouillon',
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          scheduled: '—',
        },
      ]);
      showFlash(`« ${c.name} » dupliquée`);
    }
    if (action === 'delete') {
      setCampaigns((list) => list.filter((x) => x.id !== c.id));
      showFlash(`« ${c.name} » supprimée`);
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomations((list) =>
      list.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Annonces</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-total`} value={`${campaigns.length}`} /> campagnes
            &middot;{' '}
            <AnimatedCounter key={`${refreshKey}-auto`} value={`${automations.filter((a) => a.active).length}`} />{' '}
            automations actives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showFlash('Nouvelle campagne — assistant à venir')}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-5 py-2 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <Send className="h-4 w-4" aria-hidden />
            Nouvelle campagne
          </button>
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-annonces" getRows={exportRows} />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
        {TABS.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy'
                  : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors'
              }
            >
              <t.Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>

      {flash && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-brand-sky/60 border border-brand-blue/30 text-brand-navy px-4 py-2 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      {activeTab === 'campagnes' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-visible mb-8">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-brand-navy">Campagnes récentes</h2>
            <span className="text-xs text-gray-500">{campaigns.length} campagnes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nom</th>
                  <th className="px-4 py-3 text-left font-semibold">Canaux</th>
                  <th className="px-4 py-3 text-left font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold">Audience</th>
                  <th className="px-4 py-3 text-right font-semibold">Env.</th>
                  <th className="px-4 py-3 text-right font-semibold">Délivr.</th>
                  <th className="px-4 py-3 text-right font-semibold">Ouv.</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((c) => {
                  const s = STATUS[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-semibold text-brand-navy">{c.name}</td>
                      <td className="px-4 py-3">
                        <ChannelPills channels={c.channels} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{c.audience}</td>
                      <td className="px-4 py-3 text-right text-brand-navy font-semibold">
                        <AnimatedCounter
                          key={`${refreshKey}-sent-${c.id}`}
                          value={c.sent.toLocaleString('fr-FR').replace(/,/g, ' ')}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        <AnimatedCounter
                          key={`${refreshKey}-del-${c.id}`}
                          value={c.delivered.toLocaleString('fr-FR').replace(/,/g, ' ')}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        <AnimatedCounter
                          key={`${refreshKey}-op-${c.id}`}
                          value={c.opened.toLocaleString('fr-FR').replace(/,/g, ' ')}
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        <AnimatedCounter
                          key={`${refreshKey}-cl-${c.id}`}
                          value={c.clicked.toLocaleString('fr-FR').replace(/,/g, ' ')}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{c.scheduled}</td>
                      <td className="px-4 py-3 text-right">
                        <CampaignRowMenu onSelect={(action) => handleCampaignAction(c, action)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'automations' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-brand-navy">Automations</h2>
            <span className="text-xs text-gray-500">
              {automations.filter((a) => a.active).length} / {automations.length} actives
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {automations.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-glow-soft hover:shadow-glow-navy transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-brand-navy">{a.name}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        a.active
                          ? 'inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold'
                          : 'inline-flex items-center rounded-pill bg-gray-100 text-gray-500 px-2.5 py-0.5 text-[11px] font-semibold'
                      }
                    >
                      {a.active ? 'Actif' : 'En pause'}
                    </span>
                    <Toggle
                      checked={a.active}
                      onChange={() => toggleAutomation(a.id)}
                      label={`Activer ${a.name}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Déclencheur :{' '}
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                    {a.trigger}
                  </code>
                </p>
                <div className="mt-3">
                  <ChannelPills channels={a.channels} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'templates' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-brand-navy">Templates</h2>
            <span className="text-xs text-gray-500">{TEMPLATES.length} modèles</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-glow-soft hover:shadow-glow-navy transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-brand-navy text-sm">{t.name}</p>
                  <ChannelPills channels={[t.channel]} />
                </div>
                <p className="text-xs text-gray-500">
                  Langue : <span className="text-brand-navy font-medium">{t.language}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Mis à jour : <span className="text-brand-navy font-medium">{t.updated}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'integrations' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-brand-navy">Intégrations</h2>
            <span className="text-xs text-gray-500">{INTEGRATIONS.length} connecteurs</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-glow-soft hover:shadow-glow-navy transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-brand-navy">{i.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fournisseur : <span className="text-brand-navy font-medium">{i.provider}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Dernière sync : <span className="text-brand-navy font-medium">{i.lastSync}</span>
                  </p>
                </div>
                <span
                  className={
                    i.status === 'ok'
                      ? 'inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold'
                      : 'inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2.5 py-0.5 text-[11px] font-semibold'
                  }
                >
                  {i.status === 'ok' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3" /> Attention
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'logs' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-brand-navy">Logs & Audit</h2>
            <span className="text-xs text-gray-500">{LOGS.length} entrées</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Auteur</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Cible</th>
                  <th className="px-4 py-3 text-left font-semibold">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {LOGS.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{l.when}</td>
                    <td className="px-4 py-3 text-brand-navy font-medium">{l.who}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">{l.action}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.target}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          l.outcome === 'success'
                            ? 'inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[11px] font-semibold'
                            : l.outcome === 'warning'
                              ? 'inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2 py-0.5 text-[11px] font-semibold'
                              : 'inline-flex items-center gap-1 rounded-pill bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold'
                        }
                      >
                        {l.outcome === 'success' && <Check className="h-3 w-3" />}
                        {l.outcome === 'warning' && <AlertTriangle className="h-3 w-3" />}
                        {l.outcome === 'error' && <X className="h-3 w-3" />}
                        {l.outcome === 'success' ? 'OK' : l.outcome === 'warning' ? 'Avertissement' : 'Échec'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

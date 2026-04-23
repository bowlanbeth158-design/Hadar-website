'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plug,
  FileText,
  Settings2,
  Search,
  Check,
  X,
} from 'lucide-react';
import { PermissionToggle } from '@/components/admin/PermissionToggle';

type Tab = 'roles' | 'logs' | 'config' | 'integrations';
type RoleKey = 'admin' | 'mod' | 'support';

type Perm = { id: string; label: string; defaultOn: boolean; locked?: boolean };

const ADMIN_PERMS: Perm[] = [
  { id: 'adm-dashboard', label: 'Accéder au tableau de bord', defaultOn: true },
  { id: 'adm-export', label: 'Exporter les KPI du dashboard', defaultOn: true },
  { id: 'adm-moderate', label: 'Modérer un signalement', defaultOn: true },
  { id: 'adm-block', label: 'Bloquer un utilisateur', defaultOn: true },
  { id: 'adm-softdelete', label: 'Supprimer un utilisateur (soft-delete)', defaultOn: true },
  { id: 'adm-members', label: 'Ajouter / modifier un membre', defaultOn: true },
  { id: 'adm-announce', label: 'Publier une annonce', defaultOn: true },
  { id: 'adm-assistant', label: "Superviser l'Assistant", defaultOn: true },
  { id: 'adm-role', label: "Changer le rôle d'un membre", defaultOn: false, locked: true },
  { id: 'adm-harddelete', label: 'Purger un utilisateur (hard-delete)', defaultOn: false, locked: true },
  { id: 'adm-integrations', label: 'Modifier les intégrations', defaultOn: false, locked: true },
  { id: 'adm-permissions', label: 'Modifier la matrice des permissions', defaultOn: false, locked: true },
  { id: 'adm-platform', label: 'Configurer les paramètres globaux', defaultOn: false, locked: true },
];

const MOD_PERMS: Perm[] = [
  { id: 'mod-dashboard', label: 'Accéder au tableau de bord', defaultOn: true },
  { id: 'mod-moderate', label: 'Modérer un signalement', defaultOn: true },
  { id: 'mod-users', label: 'Voir la liste des utilisateurs', defaultOn: true },
  { id: 'mod-reset', label: 'Réinitialiser un mot de passe user', defaultOn: true },
  { id: 'mod-block', label: 'Bloquer un utilisateur', defaultOn: true },
  { id: 'mod-export', label: 'Exporter les KPI du dashboard', defaultOn: false },
  { id: 'mod-delete', label: 'Supprimer un utilisateur', defaultOn: false },
  { id: 'mod-members', label: 'Ajouter un membre', defaultOn: false },
];

const SUPPORT_PERMS: Perm[] = [
  { id: 'sup-dashboard', label: 'Accéder au tableau de bord', defaultOn: true },
  { id: 'sup-users', label: 'Voir la liste des utilisateurs', defaultOn: true },
  { id: 'sup-reset', label: 'Réinitialiser un mot de passe user', defaultOn: true },
  { id: 'sup-chat', label: 'Répondre aux conversations Assistant', defaultOn: true },
  { id: 'sup-moderate', label: 'Modérer un signalement', defaultOn: false },
  { id: 'sup-block', label: 'Bloquer un utilisateur', defaultOn: false },
];

const ALL_PERMS: Record<RoleKey, Perm[]> = {
  admin: ADMIN_PERMS,
  mod: MOD_PERMS,
  support: SUPPORT_PERMS,
};

const STORAGE_KEY = 'hadar:admin:permissions';

type PermState = Record<string, boolean>;

function initialState(): PermState {
  const out: PermState = {};
  (Object.keys(ALL_PERMS) as RoleKey[]).forEach((k) => {
    ALL_PERMS[k].forEach((p) => {
      out[p.id] = p.defaultOn;
    });
  });
  return out;
}

function readStored(): PermState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PermState) : null;
  } catch {
    return null;
  }
}

const AUDIT_LOGS = [
  { dt: '13/04/26 23:12', who: 'Rajae OUAZZANI', action: 'member.role.changed', target: 'Karim BENJELLOUN → Admin', severity: 'high' as const },
  { dt: '13/04/26 21:44', who: 'Mohamed Ossama MOUSSAOUI', action: 'permissions.updated', target: 'Modérateur — export KPI', severity: 'medium' as const },
  { dt: '13/04/26 18:20', who: 'Hakim CHRAIBI', action: 'user.blocked', target: 'user #345651', severity: 'high' as const },
  { dt: '13/04/26 15:08', who: 'Nadia BELHAJ', action: 'report.published', target: 'signalement #2452', severity: 'low' as const },
  { dt: '13/04/26 11:02', who: 'système', action: 'integration.synced', target: 'WhatsApp Business', severity: 'low' as const },
  { dt: '12/04/26 22:55', who: 'Mohamed Ossama MOUSSAOUI', action: 'platform.maintenance.enabled', target: 'Bandeau global', severity: 'medium' as const },
  { dt: '12/04/26 09:18', who: 'Rajae OUAZZANI', action: 'member.created', target: 'Kenza LAHMADI', severity: 'medium' as const },
  { dt: '11/04/26 20:05', who: 'système', action: 'login.unusual', target: 'user #345612', severity: 'high' as const },
];

type Integration = {
  id: string;
  name: string;
  provider: string;
  active: boolean;
  endpoint: string;
  status: 'ok' | 'warn' | 'off';
};

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'smtp', name: 'SMTP transactionnel', provider: 'AWS SES', active: true, endpoint: 'email-smtp.eu-west-1.amazonaws.com', status: 'ok' },
  { id: 'whatsapp', name: 'WhatsApp Business', provider: 'Meta Cloud API', active: true, endpoint: 'graph.facebook.com/v20.0', status: 'ok' },
  { id: 'sms', name: 'SMS secours', provider: 'Twilio', active: true, endpoint: 'api.twilio.com/2010-04-01', status: 'warn' },
  { id: 'captcha', name: 'Anti-bot', provider: 'Cloudflare Turnstile', active: true, endpoint: 'challenges.cloudflare.com', status: 'ok' },
  { id: 'storage', name: 'Stockage preuves', provider: 'DigitalOcean Spaces', active: true, endpoint: 'fra1.digitaloceanspaces.com', status: 'ok' },
  { id: 'analytics', name: 'Analytics anonymisé', provider: 'Plausible', active: false, endpoint: 'plausible.io/api', status: 'off' },
];

type PlatformConfig = {
  maintenance: boolean;
  banner: string;
  publicSearch: boolean;
  registrationsOpen: boolean;
  maxUploadMb: number;
  sessionMinutes: number;
};

const CONFIG_KEY = 'hadar:admin:platform-config';
const INITIAL_CONFIG: PlatformConfig = {
  maintenance: false,
  banner: '',
  publicSearch: true,
  registrationsOpen: true,
  maxUploadMb: 10,
  sessionMinutes: 15,
};

export default function Page() {
  const [tab, setTab] = useState<Tab>('roles');
  const [perms, setPerms] = useState<PermState>(initialState);
  const [savedPerms, setSavedPerms] = useState<PermState>(initialState);
  const [flash, setFlash] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [logQuery, setLogQuery] = useState('');
  const [logSeverity, setLogSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const [config, setConfig] = useState<PlatformConfig>(INITIAL_CONFIG);
  const [savedConfig, setSavedConfig] = useState<PlatformConfig>(INITIAL_CONFIG);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setPerms(stored);
      setSavedPerms(stored);
    }
    try {
      const raw = window.localStorage.getItem(CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlatformConfig;
        setConfig(parsed);
        setSavedConfig(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? null : m)), 2200);
  };

  const permsDirty = useMemo(
    () => Object.keys(perms).some((k) => perms[k] !== savedPerms[k]),
    [perms, savedPerms],
  );
  const configDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(savedConfig),
    [config, savedConfig],
  );
  const dirty = (tab === 'roles' && permsDirty) || (tab === 'config' && configDirty);

  const savePerms = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
    setSavedPerms(perms);
    showFlash('Matrice des permissions enregistrée');
  };
  const saveConfig = () => {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setSavedConfig(config);
    showFlash('Configuration plateforme enregistrée');
  };
  const resetPerms = () => setPerms(savedPerms);
  const resetConfig = () => setConfig(savedConfig);

  const toggleIntegration = (id: string) => {
    setIntegrations((list) =>
      list.map((i) =>
        i.id === id
          ? { ...i, active: !i.active, status: !i.active ? (i.status === 'off' ? 'ok' : i.status) : 'off' }
          : i,
      ),
    );
  };
  const syncIntegration = (id: string) => {
    const it = integrations.find((i) => i.id === id);
    if (!it) return;
    showFlash(`« ${it.name} » synchronisée`);
  };

  const filteredLogs = useMemo(() => {
    const q = logQuery.trim().toLowerCase();
    return AUDIT_LOGS.filter((l) => {
      if (logSeverity !== 'all' && l.severity !== logSeverity) return false;
      if (!q) return true;
      return (
        l.who.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q)
      );
    });
  }, [logQuery, logSeverity]);

  const onSave = () => {
    if (tab === 'roles') savePerms();
    else if (tab === 'config') saveConfig();
  };
  const onReset = () => {
    if (tab === 'roles') resetPerms();
    else if (tab === 'config') resetConfig();
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Administration</h1>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {flash && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-brand-sky/60 border border-brand-blue/30 text-brand-navy px-4 py-2 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      <nav role="tablist" className="flex flex-wrap gap-2 mb-8">
        {([
          { id: 'roles', label: 'Rôles & permissions', Icon: ShieldCheck },
          { id: 'logs', label: "Logs d'audit", Icon: FileText },
          { id: 'config', label: 'Configuration plateforme', Icon: Settings2 },
          { id: 'integrations', label: 'Intégrations', Icon: Plug },
        ] as const).map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={
                on
                  ? 'inline-flex items-center gap-1.5 rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
                  : 'inline-flex items-center gap-1.5 rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky transition-colors'
              }
            >
              <t.Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === 'roles' && (
        <div className="space-y-5">
          <section className="rounded-2xl bg-grad-stat-violet shadow-glow-violet p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <span className="font-semibold">Super-admin</span>
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">1-2 personnes max</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-90">Tous les accès activés</span>
                <span
                  role="switch"
                  aria-checked="true"
                  aria-disabled="true"
                  className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-green-400 opacity-90"
                >
                  <span className="absolute top-0.5 left-4 h-4 w-4 rounded-full bg-white shadow" />
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs opacity-90">
              Rôle figé — non désactivable. Exclusif aux propriétaire / CTO (garde-fou opérationnel).
            </p>
          </section>

          {(
            [
              ['admin', 'Admin', ADMIN_PERMS],
              ['mod', 'Modérateur', MOD_PERMS],
              ['support', 'Support', SUPPORT_PERMS],
            ] as const
          ).map(([key, title, list]) => (
            <section
              key={key}
              className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <span className="inline-flex items-center gap-2 rounded-pill bg-yellow-100 text-yellow-700 px-4 py-1.5 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  {title}
                </span>
                <span className="text-xs text-gray-500">
                  {list.filter((p) => perms[p.id]).length} / {list.length} permissions
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((p) => (
                  <PermissionToggle
                    key={p.id}
                    label={p.label}
                    locked={p.locked}
                    checked={!!perms[p.id]}
                    onChange={(v) => setPerms((prev) => ({ ...prev, [p.id]: v }))}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {(['all', 'low', 'medium', 'high'] as const).map((s) => {
                const active = logSeverity === s;
                const label = { all: 'Tous', low: 'Info', medium: 'Moyenne', high: 'Critique' }[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLogSeverity(s)}
                    aria-pressed={active}
                    className={
                      active
                        ? 'inline-flex items-center rounded-pill bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold shadow-glow-navy'
                        : 'inline-flex items-center rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-xs font-medium hover:border-brand-blue'
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="relative ml-auto w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                placeholder="Rechercher (auteur, action, cible)…"
                className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Auteur</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Cible</th>
                  <th className="px-4 py-3 text-left font-semibold">Sévérité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                      Aucun log ne correspond à vos critères.
                    </td>
                  </tr>
                )}
                {filteredLogs.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{l.dt}</td>
                    <td className="px-4 py-3 text-brand-navy font-medium">{l.who}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                        {l.action}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.target}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          l.severity === 'high'
                            ? 'inline-flex items-center gap-1 rounded-pill bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold'
                            : l.severity === 'medium'
                              ? 'inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2 py-0.5 text-[11px] font-semibold'
                              : 'inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[11px] font-semibold'
                        }
                      >
                        {l.severity === 'high' && <AlertTriangle className="h-3 w-3" />}
                        {l.severity === 'high'
                          ? 'Critique'
                          : l.severity === 'medium'
                            ? 'Moyenne'
                            : 'Info'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''}
          </div>
        </section>
      )}

      {tab === 'config' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <PermissionToggle
              label="Mode maintenance (bandeau global + écritures désactivées)"
              checked={config.maintenance}
              onChange={(v) => setConfig((c) => ({ ...c, maintenance: v }))}
            />
            <PermissionToggle
              label="Recherche publique ouverte"
              checked={config.publicSearch}
              onChange={(v) => setConfig((c) => ({ ...c, publicSearch: v }))}
            />
            <PermissionToggle
              label="Inscriptions ouvertes"
              checked={config.registrationsOpen}
              onChange={(v) => setConfig((c) => ({ ...c, registrationsOpen: v }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy mb-1.5">
              Bandeau d&apos;annonce global
            </label>
            <input
              type="text"
              value={config.banner}
              onChange={(e) => setConfig((c) => ({ ...c, banner: e.target.value }))}
              placeholder="Ex. : Nouvelle règle de publication en vigueur dès le 01/05."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
            />
            <p className="mt-1 text-xs text-gray-400">
              Laisser vide pour masquer le bandeau.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                Taille max d&apos;upload (Mo)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.maxUploadMb}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, maxUploadMb: Number(e.target.value) || 1 }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                Durée de session JWT (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={config.sessionMinutes}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, sessionMinutes: Number(e.target.value) || 5 }))
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            💡 Les modifications sont enregistrées localement pour prévisualisation. Cliquez sur
            « Enregistrer les modifications » en haut.
          </p>
        </section>
      )}

      {tab === 'integrations' && (
        <section className="grid gap-3 sm:grid-cols-2">
          {integrations.map((i) => (
            <div
              key={i.id}
              className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-navy">{i.name}</p>
                  <p className="text-xs text-gray-500">
                    {i.provider} ·{' '}
                    <code className="font-mono text-[11px]">{i.endpoint}</code>
                  </p>
                </div>
                <span
                  className={
                    i.status === 'ok'
                      ? 'inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[11px] font-semibold'
                      : i.status === 'warn'
                        ? 'inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2 py-0.5 text-[11px] font-semibold'
                        : 'inline-flex items-center gap-1 rounded-pill bg-gray-100 text-gray-500 px-2 py-0.5 text-[11px] font-semibold'
                  }
                >
                  {i.status === 'ok' && <Check className="h-3 w-3" />}
                  {i.status === 'warn' && <AlertTriangle className="h-3 w-3" />}
                  {i.status === 'off' && <X className="h-3 w-3" />}
                  {i.status === 'ok' ? 'OK' : i.status === 'warn' ? 'Attention' : 'Désactivée'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => syncIntegration(i.id)}
                  disabled={!i.active}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plug className="h-3.5 w-3.5" aria-hidden />
                  Synchroniser
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={i.active}
                  onClick={() => toggleIntegration(i.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    i.active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      i.active ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

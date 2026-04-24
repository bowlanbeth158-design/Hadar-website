'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Plus,
  Trash2,
  Megaphone,
  Repeat,
  Bell,
  Info,
  Wrench,
  Coffee,
  Rocket,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';
import { PermissionToggle } from '@/components/admin/PermissionToggle';
import {
  AdminAnnouncementBanner,
  dispatchConfigUpdate,
} from '@/components/admin/AdminAnnouncementBanner';
import { MaintenancePreview } from '@/components/admin/AdminMaintenanceGate';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { useI18n } from '@/lib/i18n/provider';
import { translateRole } from '@/lib/i18n/helpers';
import {
  INITIAL_PLATFORM_CONFIG as INITIAL_CONFIG,
  MAINTENANCE_GROUPS,
  MAINTENANCE_LABEL_KEY,
  MAX_BANNER_MESSAGES as MAX_MESSAGES,
  PLATFORM_CONFIG_KEY as CONFIG_KEY,
  type PlatformConfig,
} from '@/lib/admin-config';

function BannerPreview({ config }: { config: PlatformConfig }) {
  return (
    <AdminAnnouncementBanner
      mode="preview"
      config={{
        bannerEnabled: config.bannerEnabled,
        bannerType: config.bannerType,
        bannerMessages: config.bannerMessages,
        bannerIntervalSec: config.bannerIntervalSec,
      }}
    />
  );
}

type Tab = 'roles' | 'logs' | 'config' | 'integrations';
type RoleKey = 'admin' | 'mod' | 'support';

type Perm = { id: string; labelKey: string; defaultOn: boolean; locked?: boolean };

const ADMIN_PERMS: Perm[] = [
  { id: 'adm-dashboard', labelKey: 'admin.perm.adm.dashboard', defaultOn: true },
  { id: 'adm-export', labelKey: 'admin.perm.adm.export', defaultOn: true },
  { id: 'adm-moderate', labelKey: 'admin.perm.adm.moderate', defaultOn: true },
  { id: 'adm-block', labelKey: 'admin.perm.adm.block', defaultOn: true },
  { id: 'adm-softdelete', labelKey: 'admin.perm.adm.softdelete', defaultOn: true },
  { id: 'adm-members', labelKey: 'admin.perm.adm.members', defaultOn: true },
  { id: 'adm-announce', labelKey: 'admin.perm.adm.announce', defaultOn: true },
  { id: 'adm-assistant', labelKey: 'admin.perm.adm.assistant', defaultOn: true },
  { id: 'adm-role', labelKey: 'admin.perm.adm.role', defaultOn: false, locked: true },
  { id: 'adm-harddelete', labelKey: 'admin.perm.adm.harddelete', defaultOn: false, locked: true },
  { id: 'adm-integrations', labelKey: 'admin.perm.adm.integrations', defaultOn: false, locked: true },
  { id: 'adm-permissions', labelKey: 'admin.perm.adm.permissions', defaultOn: false, locked: true },
  { id: 'adm-platform', labelKey: 'admin.perm.adm.platform', defaultOn: false, locked: true },
];

const MOD_PERMS: Perm[] = [
  { id: 'mod-dashboard', labelKey: 'admin.perm.mod.dashboard', defaultOn: true },
  { id: 'mod-moderate', labelKey: 'admin.perm.mod.moderate', defaultOn: true },
  { id: 'mod-users', labelKey: 'admin.perm.mod.users', defaultOn: true },
  { id: 'mod-reset', labelKey: 'admin.perm.mod.reset', defaultOn: true },
  { id: 'mod-block', labelKey: 'admin.perm.mod.block', defaultOn: true },
  { id: 'mod-export', labelKey: 'admin.perm.mod.export', defaultOn: false },
  { id: 'mod-delete', labelKey: 'admin.perm.mod.delete', defaultOn: false },
  { id: 'mod-members', labelKey: 'admin.perm.mod.members', defaultOn: false },
];

const SUPPORT_PERMS: Perm[] = [
  { id: 'sup-dashboard', labelKey: 'admin.perm.sup.dashboard', defaultOn: true },
  { id: 'sup-users', labelKey: 'admin.perm.sup.users', defaultOn: true },
  { id: 'sup-reset', labelKey: 'admin.perm.sup.reset', defaultOn: true },
  { id: 'sup-chat', labelKey: 'admin.perm.sup.chat', defaultOn: true },
  { id: 'sup-moderate', labelKey: 'admin.perm.sup.moderate', defaultOn: false },
  { id: 'sup-block', labelKey: 'admin.perm.sup.block', defaultOn: false },
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

export default function Page() {
  const { t } = useI18n();
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
        const parsed = JSON.parse(raw) as Partial<PlatformConfig>;
        const merged: PlatformConfig = {
          ...INITIAL_CONFIG,
          ...parsed,
          maintenancePages: Array.isArray(parsed.maintenancePages)
            ? (parsed.maintenancePages as PlatformConfig['maintenancePages'])
            : [],
          maintenancePreset:
            parsed.maintenancePreset === 'scheduled' ||
            parsed.maintenancePreset === 'new-version' ||
            parsed.maintenancePreset === 'short-break'
              ? parsed.maintenancePreset
              : INITIAL_CONFIG.maintenancePreset,
          bannerMessages:
            Array.isArray(parsed.bannerMessages) && parsed.bannerMessages.length > 0
              ? (parsed.bannerMessages as PlatformConfig['bannerMessages'])
              : INITIAL_CONFIG.bannerMessages,
          bannerType:
            parsed.bannerType === 'topbar' ||
            parsed.bannerType === 'carousel' ||
            parsed.bannerType === 'toast'
              ? parsed.bannerType
              : INITIAL_CONFIG.bannerType,
          siteName:
            typeof parsed.siteName === 'string' ? parsed.siteName : INITIAL_CONFIG.siteName,
          siteTagline:
            typeof parsed.siteTagline === 'string' ? parsed.siteTagline : INITIAL_CONFIG.siteTagline,
          siteTitleFormat:
            typeof parsed.siteTitleFormat === 'string'
              ? parsed.siteTitleFormat
              : INITIAL_CONFIG.siteTitleFormat,
          seoTitle:
            typeof parsed.seoTitle === 'string' ? parsed.seoTitle : INITIAL_CONFIG.seoTitle,
          seoDescription:
            typeof parsed.seoDescription === 'string'
              ? parsed.seoDescription
              : INITIAL_CONFIG.seoDescription,
          seoKeywords:
            typeof parsed.seoKeywords === 'string' ? parsed.seoKeywords : INITIAL_CONFIG.seoKeywords,
          seoCanonicalUrl:
            typeof parsed.seoCanonicalUrl === 'string'
              ? parsed.seoCanonicalUrl
              : INITIAL_CONFIG.seoCanonicalUrl,
          seoRobotsIndex:
            typeof parsed.seoRobotsIndex === 'boolean'
              ? parsed.seoRobotsIndex
              : INITIAL_CONFIG.seoRobotsIndex,
          seoRobotsFollow:
            typeof parsed.seoRobotsFollow === 'boolean'
              ? parsed.seoRobotsFollow
              : INITIAL_CONFIG.seoRobotsFollow,
          seoGaId: typeof parsed.seoGaId === 'string' ? parsed.seoGaId : INITIAL_CONFIG.seoGaId,
          seoGtmId:
            typeof parsed.seoGtmId === 'string' ? parsed.seoGtmId : INITIAL_CONFIG.seoGtmId,
          seoMetaPixelId:
            typeof parsed.seoMetaPixelId === 'string'
              ? parsed.seoMetaPixelId
              : INITIAL_CONFIG.seoMetaPixelId,
          seoTiktokPixelId:
            typeof parsed.seoTiktokPixelId === 'string'
              ? parsed.seoTiktokPixelId
              : INITIAL_CONFIG.seoTiktokPixelId,
          seoClarityId:
            typeof parsed.seoClarityId === 'string'
              ? parsed.seoClarityId
              : INITIAL_CONFIG.seoClarityId,
          seoGoogleVerification:
            typeof parsed.seoGoogleVerification === 'string'
              ? parsed.seoGoogleVerification
              : INITIAL_CONFIG.seoGoogleVerification,
          seoTwitterHandle:
            typeof parsed.seoTwitterHandle === 'string'
              ? parsed.seoTwitterHandle
              : INITIAL_CONFIG.seoTwitterHandle,
        };
        setConfig(merged);
        setSavedConfig(merged);
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const resizeMaintenanceImage = (file: File, size = 720): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read-fail'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('img-fail'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(size / img.width, size / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no-ctx'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleMaintenanceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showFlash(t('settings.account.photoErrType'));
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }
    try {
      setImageUploading(true);
      const dataUrl = await resizeMaintenanceImage(file, 720);
      setConfig((c) => ({ ...c, maintenanceImage: dataUrl }));
    } catch {
      showFlash(t('settings.account.photoErr'));
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const savePerms = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
    setSavedPerms(perms);
    showFlash(t('admin.flash.permsSaved'));
  };
  const saveConfig = () => {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setSavedConfig(config);
    dispatchConfigUpdate();
    showFlash(t('admin.flash.configSaved'));
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
    showFlash(t('admin.flash.syncDone', { name: it.name }));
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
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
          {t('page.administration.title')}
        </h1>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
              {t('admin.cancel')}
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty}
            className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t('admin.saveChanges')}
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
          { id: 'roles', labelKey: 'admin.tab.roles', Icon: ShieldCheck },
          { id: 'logs', labelKey: 'admin.tab.logs', Icon: FileText },
          { id: 'config', labelKey: 'admin.tab.config', Icon: Settings2 },
          { id: 'integrations', labelKey: 'admin.tab.integrations', Icon: Plug },
        ] as const).map((item) => {
          const on = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(item.id)}
              className={
                on
                  ? 'inline-flex items-center gap-1.5 rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
                  : 'inline-flex items-center gap-1.5 rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky transition-colors'
              }
            >
              <item.Icon className="h-3.5 w-3.5" aria-hidden />
              {t(item.labelKey)}
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
                <span className="font-semibold">{t('role.superadmin')}</span>
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{t('admin.superadmin.maxPersons')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-90">{t('admin.superadmin.allAccess')}</span>
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
            <p className="mt-2 text-xs opacity-90">{t('admin.superadmin.note')}</p>
          </section>

          {(
            [
              ['admin', 'admin', ADMIN_PERMS],
              ['mod', 'moderateur', MOD_PERMS],
              ['support', 'support', SUPPORT_PERMS],
            ] as const
          ).map(([key, roleId, list]) => (
            <section
              key={key}
              className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <span className="inline-flex items-center gap-2 rounded-pill bg-yellow-100 text-yellow-700 px-4 py-1.5 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  {translateRole(t, roleId)}
                </span>
                <span className="text-xs text-gray-500">
                  {t('admin.permsCount', {
                    on: list.filter((p) => perms[p.id]).length,
                    total: list.length,
                  })}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((p) => (
                  <PermissionToggle
                    key={p.id}
                    label={t(p.labelKey)}
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
                const labelKey = { all: 'admin.logs.all', low: 'admin.logs.low', medium: 'admin.logs.medium', high: 'admin.logs.high' }[s];
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
                    {t(labelKey)}
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
                placeholder={t('admin.logs.search')}
                className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.logs.col.date')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.logs.col.author')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.logs.col.action')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.logs.col.target')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('admin.logs.col.severity')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                      {t('admin.logs.empty')}
                    </td>
                  </tr>
                )}
                {filteredLogs.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{l.dt}</td>
                    <td className="px-4 py-3 text-brand-navy font-medium">
                      {l.who === 'système' ? t('admin.logs.author.system') : l.who}
                    </td>
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
                          ? t('admin.logs.high')
                          : l.severity === 'medium'
                            ? t('admin.logs.medium')
                            : t('admin.logs.low')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            {t(filteredLogs.length > 1 ? 'admin.logs.count.other' : 'admin.logs.count.one', {
              count: filteredLogs.length,
            })}
          </div>
        </section>
      )}

      {tab === 'config' && (
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <PermissionToggle
              label={t('admin.config.maintenance')}
              checked={config.maintenance}
              onChange={(v) => setConfig((c) => ({ ...c, maintenance: v }))}
            />
            <PermissionToggle
              label={t('admin.config.publicSearch')}
              checked={config.publicSearch}
              onChange={(v) => setConfig((c) => ({ ...c, publicSearch: v }))}
            />
            <PermissionToggle
              label={t('admin.config.registrationsOpen')}
              checked={config.registrationsOpen}
              onChange={(v) => setConfig((c) => ({ ...c, registrationsOpen: v }))}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="inline-flex items-center gap-2">
              <Wrench className="h-4 w-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-bold text-brand-navy">
                {t('admin.maintenance.section')}
              </h3>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('admin.maintenance.pages')}
              </p>
              <div className="space-y-4">
                {MAINTENANCE_GROUPS.map((group) => (
                  <div key={group.labelKey}>
                    <p className="text-[11px] font-semibold text-brand-navy/70 mb-2">
                      {t(group.labelKey)}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.ids.map((pageId) => {
                        const on = config.maintenancePages.includes(pageId);
                        return (
                          <label
                            key={pageId}
                            className={
                              on
                                ? 'flex items-center gap-2 rounded-xl border-2 border-orange-400 bg-orange-50 px-3 py-2 text-sm text-brand-navy cursor-pointer transition-colors'
                                : 'flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy cursor-pointer hover:border-gray-300 transition-colors'
                            }
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                setConfig((c) => ({
                                  ...c,
                                  maintenancePages: on
                                    ? c.maintenancePages.filter((x) => x !== pageId)
                                    : [...c.maintenancePages, pageId],
                                }))
                              }
                              className="accent-orange-500"
                            />
                            <span className="font-medium">
                              {t(MAINTENANCE_LABEL_KEY[pageId])}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-gray-500">
                {t('admin.maintenance.pagesHint')}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('admin.maintenance.preset.label')}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'short-break', Icon: Coffee, titleKey: 'admin.maintenance.preset.short.title', descKey: 'admin.maintenance.preset.short.desc' },
                    { id: 'scheduled', Icon: Wrench, titleKey: 'admin.maintenance.preset.scheduled.title', descKey: 'admin.maintenance.preset.scheduled.desc' },
                    { id: 'new-version', Icon: Rocket, titleKey: 'admin.maintenance.preset.newVersion.title', descKey: 'admin.maintenance.preset.newVersion.desc' },
                  ] as const
                ).map((opt) => {
                  const on = config.maintenancePreset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, maintenancePreset: opt.id }))}
                      aria-pressed={on}
                      className={
                        on
                          ? 'flex flex-col gap-1 rounded-xl border-2 border-brand-blue bg-white p-3 text-left shadow-glow-blue'
                          : 'flex flex-col gap-1 rounded-xl border-2 border-gray-200 bg-white p-3 text-left hover:border-gray-300'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                        <opt.Icon className="h-3.5 w-3.5" aria-hidden />
                        {t(opt.titleKey)}
                      </span>
                      <span className="text-[11px] text-gray-500">{t(opt.descKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                {t('admin.maintenance.customMessage')}
              </label>
              <textarea
                value={config.maintenanceMessage}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))
                }
                rows={2}
                placeholder={t('admin.maintenance.customMessagePlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-y"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                {t('admin.maintenance.customMessageHint')}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                {t('admin.maintenance.image')}
              </label>
              <div className="flex items-start gap-3 flex-wrap">
                {config.maintenanceImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={config.maintenanceImage}
                    alt=""
                    className="h-24 w-32 object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-32 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-300">
                    <ImageIcon className="h-6 w-6" aria-hidden />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-3 py-1.5 text-xs font-semibold hover:bg-brand-navy hover:text-white disabled:opacity-60 disabled:cursor-wait transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden />
                    {imageUploading
                      ? t('settings.account.photoUploading')
                      : config.maintenanceImage
                        ? t('admin.maintenance.changeImage')
                        : t('admin.maintenance.addImage')}
                  </button>
                  {config.maintenanceImage && (
                    <button
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, maintenanceImage: undefined }))}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                      {t('admin.maintenance.removeImage')}
                    </button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMaintenanceImage}
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('admin.maintenance.preview')}
              </p>
              <MaintenancePreview
                preset={config.maintenancePreset}
                message={config.maintenanceMessage}
                image={config.maintenanceImage}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="inline-flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-brand-blue" aria-hidden />
                <h3 className="text-sm font-bold text-brand-navy">
                  {t('admin.banner.section')}
                </h3>
              </div>
              <PermissionToggle
                label={t('admin.banner.enabled')}
                checked={config.bannerEnabled}
                onChange={(v) => setConfig((c) => ({ ...c, bannerEnabled: v }))}
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('admin.banner.type.label')}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: 'topbar', Icon: Bell, labelKey: 'admin.banner.type.topbar', hintKey: 'admin.banner.typeHint.topbar' },
                    { id: 'carousel', Icon: Repeat, labelKey: 'admin.banner.type.carousel', hintKey: 'admin.banner.typeHint.carousel' },
                    { id: 'toast', Icon: Info, labelKey: 'admin.banner.type.toast', hintKey: 'admin.banner.typeHint.toast' },
                  ] as const
                ).map((opt) => {
                  const on = config.bannerType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, bannerType: opt.id }))}
                      aria-pressed={on}
                      className={
                        on
                          ? 'flex flex-col gap-1 rounded-xl border-2 border-brand-blue bg-white p-3 text-left shadow-glow-blue transition-all'
                          : 'flex flex-col gap-1 rounded-xl border-2 border-gray-200 bg-white p-3 text-left hover:border-gray-300 transition-all'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy">
                        <opt.Icon className="h-3.5 w-3.5" aria-hidden />
                        {t(opt.labelKey)}
                      </span>
                      <span className="text-[11px] text-gray-500">{t(opt.hintKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {t('admin.banner.messages')} ({config.bannerMessages.length}/{MAX_MESSAGES})
                </p>
                {config.bannerMessages.length < MAX_MESSAGES && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((c) => ({
                        ...c,
                        bannerMessages: [
                          ...c.bannerMessages,
                          { id: `m${Date.now()}`, text: '' },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-pill border border-brand-navy text-brand-navy px-3 py-1 text-xs font-semibold hover:bg-brand-navy hover:text-white transition-colors"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    {t('admin.banner.addMessage')}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {config.bannerMessages.map((m, idx) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-brand-navy">
                        {t('admin.banner.msgNum', { n: idx + 1 })}
                      </span>
                      {config.bannerMessages.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfig((c) => ({
                              ...c,
                              bannerMessages: c.bannerMessages.filter((x) => x.id !== m.id),
                            }))
                          }
                          aria-label={t('admin.banner.removeMessage')}
                          className="h-6 w-6 rounded hover:bg-red-50 text-red-500 flex items-center justify-center"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={m.text}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          bannerMessages: c.bannerMessages.map((x) =>
                            x.id === m.id ? { ...x, text: e.target.value } : x,
                          ),
                        }))
                      }
                      placeholder={t('admin.banner.textPlaceholder')}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                    />
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                      <input
                        type="url"
                        value={m.linkUrl ?? ''}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            bannerMessages: c.bannerMessages.map((x) =>
                              x.id === m.id
                                ? { ...x, linkUrl: e.target.value || undefined }
                                : x,
                            ),
                          }))
                        }
                        placeholder={t('admin.banner.linkUrlPlaceholder')}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
                      />
                      <input
                        type="text"
                        value={m.linkLabel ?? ''}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            bannerMessages: c.bannerMessages.map((x) =>
                              x.id === m.id
                                ? { ...x, linkLabel: e.target.value || undefined }
                                : x,
                            ),
                          }))
                        }
                        placeholder={t('admin.banner.linkLabelPlaceholder')}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(config.bannerType === 'carousel' || config.bannerType === 'toast') &&
              config.bannerMessages.length > 1 && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {t('admin.banner.intervalLabel', { n: config.bannerIntervalSec })}
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    step={1}
                    value={config.bannerIntervalSec}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        bannerIntervalSec: Number(e.target.value) || 5,
                      }))
                    }
                    className="w-full accent-brand-blue"
                  />
                </div>
              )}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('admin.banner.preview')}
              </p>
              <BannerPreview config={config} />
            </div>

            <p className="text-xs text-gray-400">{t('admin.banner.hint')}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-bold text-brand-navy">{t('brand.public.title')}</h3>
            </div>
            <p className="text-xs text-gray-500">{t('brand.public.desc')}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageUploadField
                label={t('brand.public.logoHorizontal')}
                hint={t('brand.public.logoHorizontalHint')}
                width={512}
                height={128}
                fit="contain"
                previewShape="landscape"
                value={config.brandPublicLogo}
                onChange={(v) => setConfig((c) => ({ ...c, brandPublicLogo: v }))}
                onError={showFlash}
              />
              <ImageUploadField
                label={t('brand.public.logoSquare')}
                hint={t('brand.public.logoSquareHint')}
                width={512}
                height={512}
                fit="cover"
                previewShape="square"
                value={config.brandPublicLogoSquare}
                onChange={(v) => setConfig((c) => ({ ...c, brandPublicLogoSquare: v }))}
                onError={showFlash}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-bold text-brand-navy">{t('brand.admin.title')}</h3>
            </div>
            <p className="text-xs text-gray-500">{t('brand.admin.desc')}</p>
            <ImageUploadField
              label={t('brand.admin.logo')}
              hint={t('brand.admin.logoHint')}
              width={256}
              height={256}
              fit="cover"
              previewShape="square"
              value={config.brandAdminLogo}
              onChange={(v) => setConfig((c) => ({ ...c, brandAdminLogo: v }))}
              onError={showFlash}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-bold text-brand-navy">{t('brand.favicons.title')}</h3>
            </div>
            <p className="text-xs text-gray-500">{t('brand.favicons.desc')}</p>
            <div className="grid gap-5 sm:grid-cols-3">
              <ImageUploadField
                label={t('brand.favicons.favicon')}
                hint={t('brand.favicons.faviconHint')}
                width={32}
                height={32}
                fit="cover"
                previewShape="square"
                value={config.brandFavicon}
                onChange={(v) => setConfig((c) => ({ ...c, brandFavicon: v }))}
                onError={showFlash}
              />
              <ImageUploadField
                label={t('brand.favicons.appleTouch')}
                hint={t('brand.favicons.appleTouchHint')}
                width={180}
                height={180}
                fit="cover"
                previewShape="square"
                value={config.brandAppleTouchIcon}
                onChange={(v) => setConfig((c) => ({ ...c, brandAppleTouchIcon: v }))}
                onError={showFlash}
              />
              <ImageUploadField
                label={t('brand.favicons.og')}
                hint={t('brand.favicons.ogHint')}
                width={1200}
                height={630}
                fit="cover"
                previewShape="landscape"
                value={config.brandOgImage}
                onChange={(v) => setConfig((c) => ({ ...c, brandOgImage: v }))}
                onError={showFlash}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5 space-y-5">
            <div className="inline-flex items-center gap-2">
              <Search className="h-4 w-4 text-brand-blue" aria-hidden />
              <h3 className="text-sm font-bold text-brand-navy">{t('brand.seo.title')}</h3>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('brand.identity.section')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.identity.siteName')}
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => setConfig((c) => ({ ...c, siteName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.identity.titleFormat')}
                  </label>
                  <input
                    type="text"
                    value={config.siteTitleFormat}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, siteTitleFormat: e.target.value }))
                    }
                    placeholder="%s · Hadar.ma"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.identity.titleFormatHint')}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.identity.tagline')}
                  </label>
                  <input
                    type="text"
                    value={config.siteTagline}
                    onChange={(e) => setConfig((c) => ({ ...c, siteTagline: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('brand.seo.meta')}
              </p>
              <div className="grid gap-3">
                <div>
                  <label className="flex items-center justify-between text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.metaTitle')}
                    <span className="text-gray-400 font-normal">{config.seoTitle.length}/60</span>
                  </label>
                  <input
                    type="text"
                    value={config.seoTitle}
                    onChange={(e) => setConfig((c) => ({ ...c, seoTitle: e.target.value }))}
                    maxLength={70}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.metaDescription')}
                    <span className="text-gray-400 font-normal">{config.seoDescription.length}/160</span>
                  </label>
                  <textarea
                    value={config.seoDescription}
                    onChange={(e) => setConfig((c) => ({ ...c, seoDescription: e.target.value }))}
                    rows={2}
                    maxLength={180}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-y"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                      {t('brand.seo.keywords')}
                    </label>
                    <input
                      type="text"
                      value={config.seoKeywords}
                      onChange={(e) => setConfig((c) => ({ ...c, seoKeywords: e.target.value }))}
                      placeholder="mot1, mot2, mot3"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                      {t('brand.seo.canonical')}
                    </label>
                    <input
                      type="url"
                      value={config.seoCanonicalUrl}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, seoCanonicalUrl: e.target.value }))
                      }
                      placeholder="https://hadar.ma"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('brand.seo.robots')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <PermissionToggle
                  label={t('brand.seo.robotsIndex')}
                  checked={config.seoRobotsIndex}
                  onChange={(v) => setConfig((c) => ({ ...c, seoRobotsIndex: v }))}
                />
                <PermissionToggle
                  label={t('brand.seo.robotsFollow')}
                  checked={config.seoRobotsFollow}
                  onChange={(v) => setConfig((c) => ({ ...c, seoRobotsFollow: v }))}
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('brand.seo.tracking')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.gaId')}
                  </label>
                  <input
                    type="text"
                    value={config.seoGaId}
                    onChange={(e) => setConfig((c) => ({ ...c, seoGaId: e.target.value }))}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.gaHint')}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.googleVerif')}
                  </label>
                  <input
                    type="text"
                    value={config.seoGoogleVerification}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, seoGoogleVerification: e.target.value }))
                    }
                    placeholder="abc123XYZ..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.googleVerifHint')}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.gtmId')}
                  </label>
                  <input
                    type="text"
                    value={config.seoGtmId}
                    onChange={(e) => setConfig((c) => ({ ...c, seoGtmId: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.gtmHint')}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.metaPixel')}
                  </label>
                  <input
                    type="text"
                    value={config.seoMetaPixelId}
                    onChange={(e) => setConfig((c) => ({ ...c, seoMetaPixelId: e.target.value }))}
                    placeholder="1234567890123456"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.metaPixelHint')}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.tiktokPixel')}
                  </label>
                  <input
                    type="text"
                    value={config.seoTiktokPixelId}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, seoTiktokPixelId: e.target.value }))
                    }
                    placeholder="C4XXXXXXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.tiktokPixelHint')}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.clarity')}
                  </label>
                  <input
                    type="text"
                    value={config.seoClarityId}
                    onChange={(e) => setConfig((c) => ({ ...c, seoClarityId: e.target.value }))}
                    placeholder="abc1d2e3f4"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">{t('brand.seo.clarityHint')}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-brand-navy mb-1">
                    {t('brand.seo.twitter')}
                  </label>
                  <input
                    type="text"
                    value={config.seoTwitterHandle}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, seoTwitterHandle: e.target.value }))
                    }
                    placeholder="@hadar_ma"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {t('brand.seo.preview')}
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 mb-1.5 inline-flex items-center gap-1">
                    <Search className="h-3 w-3" aria-hidden />
                    {t('brand.seo.preview.google')}
                  </p>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[11px] text-gray-400 truncate">
                      {config.seoCanonicalUrl || 'https://hadar.ma'}
                    </p>
                    <p className="text-base text-blue-700 font-semibold mt-1 line-clamp-1">
                      {config.seoTitle || config.siteName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {config.seoDescription || config.siteTagline}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-500 mb-1.5 inline-flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" aria-hidden />
                    {t('brand.seo.preview.social')}
                  </p>
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {config.brandOgImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={config.brandOgImage}
                        alt=""
                        className="w-full aspect-[1200/630] object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-full aspect-[1200/630] bg-gray-100 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto opacity-40" aria-hidden />
                          <p className="mt-1 text-[10px]">{t('brand.seo.preview.ogPlaceholder')}</p>
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                      <p className="text-[10px] uppercase text-gray-400 tracking-wide truncate">
                        {(() => {
                          try {
                            return new URL(config.seoCanonicalUrl || 'https://hadar.ma').hostname;
                          } catch {
                            return 'hadar.ma';
                          }
                        })()}
                      </p>
                      <p className="text-sm font-semibold text-brand-navy mt-0.5 line-clamp-2">
                        {config.seoTitle || config.siteName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {config.seoDescription || config.siteTagline}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-gray-400">
                    {t('brand.seo.preview.socialHint')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">{t('brand.seo.hint')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                {t('admin.config.maxUpload')}
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
                {t('admin.config.sessionMinutes')}
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

          <p className="text-xs text-gray-400">{t('admin.config.previewNote')}</p>
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
                  {i.status === 'ok'
                    ? t('admin.integration.status.ok')
                    : i.status === 'warn'
                      ? t('admin.integration.status.warn')
                      : t('admin.integration.status.off')}
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
                  {t('admin.integration.sync')}
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

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Shield,
  Globe,
  Clock,
  Calendar,
  LogOut,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  TfaEnrollmentModal,
  type TfaEnrollment,
  type TfaMethodId,
} from './TfaEnrollmentModal';
import { useI18n } from '@/lib/i18n/provider';
import { LOCALES, type Locale } from '@/lib/i18n/messages';

type Tab = 'compte' | 'securite' | 'general';

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'compte', labelKey: 'settings.tab.compte' },
  { id: 'securite', labelKey: 'settings.tab.securite' },
  { id: 'general', labelKey: 'settings.tab.general' },
];

const PROFILE_KEY = 'hadar:settings:profile';
const GENERAL_KEY = 'hadar:settings:general';
const TFA_KEY = 'hadar:settings:tfa-enrolled';

type Profile = { firstName: string; lastName: string; phone: string; email: string };
const DEFAULT_PROFILE: Profile = {
  firstName: 'Mohamed Ossama',
  lastName: 'MOUSSAOUI',
  phone: '212698000000',
  email: 'mohamedossama@hadar.ma',
};

type General = { timezone: string; dateFormat: string };
const DEFAULT_GENERAL: General = {
  timezone: 'Casablanca, Maroc',
  dateFormat: 'JJ/MM/AAAA',
};

const TIMEZONES = ['Casablanca, Maroc', 'Paris, France', 'Londres, Royaume-Uni', 'UTC'];
const DATE_FORMATS = ['JJ/MM/AAAA', 'AAAA-MM-JJ', 'MM/JJ/AAAA'];

const TFA_METHODS: { id: TfaMethodId; labelKey: string }[] = [
  { id: 'app', labelKey: 'settings.security.method.app' },
  { id: 'sms', labelKey: 'settings.security.method.sms' },
  { id: 'email', labelKey: 'settings.security.method.email' },
];

type TfaState = Partial<Record<TfaMethodId, TfaEnrollment>>;

function maskPhone(p: string): string {
  const s = p.replace(/\s/g, '');
  if (s.length <= 4) return p;
  return `${s.slice(0, 4)} •••• •• ${s.slice(-2)}`;
}

function maskEmail(e: string): string {
  const at = e.indexOf('@');
  if (at <= 0) return e;
  const local = e.slice(0, at);
  const domain = e.slice(at);
  const visible = local.slice(0, 1);
  return `${visible}${'•'.repeat(Math.max(3, local.length - 1))}${domain}`;
}

function formatEnrolledDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return '';
  }
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-brand-navy mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••••••"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
        />
        <button
          type="button"
          aria-label={show ? 'Masquer' : 'Afficher'}
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-brand-navy"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group rounded-2xl border border-gray-200 bg-brand-sky/40 shadow-glow-soft open:bg-white open:shadow-glow-blue open:border-brand-blue transition-all"
      open={defaultOpen}
    >
      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-brand-navy font-semibold list-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown
          className="h-4 w-4 text-brand-blue transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>
    </details>
  );
}

function Dropdown({
  label,
  Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
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

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5">
      <div className="inline-flex items-center gap-2 rounded-pill bg-grad-alert-orange text-white px-3 py-1 text-xs font-semibold shadow-glow-orange">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div ref={ref} className="relative mt-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full inline-flex items-center justify-between gap-2 rounded-pill bg-brand-sky text-brand-navy px-4 py-2 text-sm font-semibold hover:bg-brand-sky/80 transition-colors"
        >
          {value}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
          >
            {options.map((opt) => {
              const active = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                    active ? 'bg-brand-sky/40 text-brand-navy font-bold' : 'text-brand-navy hover:bg-gray-50'
                  }`}
                >
                  <span>{opt}</span>
                  {active && <Check className="h-4 w-4 text-brand-blue" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsTabs() {
  const { t, locale, setLocale } = useI18n();
  const [active, setActive] = useState<Tab>('compte');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [general, setGeneral] = useState<General>(DEFAULT_GENERAL);
  const [tfaState, setTfaState] = useState<TfaState>({});
  const [enrolling, setEnrolling] = useState<TfaMethodId | null>(null);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    try {
      const p = window.localStorage.getItem(PROFILE_KEY);
      if (p) {
        const parsed = JSON.parse(p) as Profile;
        setProfile(parsed);
        setSavedProfile(parsed);
      }
      const g = window.localStorage.getItem(GENERAL_KEY);
      if (g) setGeneral(JSON.parse(g) as General);
      const tfa = window.localStorage.getItem(TFA_KEY);
      if (tfa) setTfaState(JSON.parse(tfa) as TfaState);
    } catch {
      // ignore
    }
  }, []);

  const showFlash = (type: 'ok' | 'err', msg: string) => {
    setFlash({ type, msg });
    window.setTimeout(() => setFlash((f) => (f && f.msg === msg ? null : f)), 2200);
  };

  const profileDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  const saveProfile = () => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSavedProfile(profile);
    showFlash('ok', t('settings.account.savedMsg'));
  };

  const updatePassword = () => {
    if (!currentPwd || !newPwd) {
      showFlash('err', t('settings.account.errRequired'));
      return;
    }
    if (newPwd !== confirmPwd) {
      showFlash('err', t('settings.account.errMismatch'));
      return;
    }
    if (newPwd.length < 8) {
      showFlash('err', t('settings.account.errTooShort'));
      return;
    }
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    showFlash('ok', t('settings.account.pwdUpdated'));
  };

  const saveGeneral = (next: General) => {
    setGeneral(next);
    window.localStorage.setItem(GENERAL_KEY, JSON.stringify(next));
    showFlash('ok', t('settings.general.updated'));
  };

  const persistTfa = (next: TfaState) => {
    window.localStorage.setItem(TFA_KEY, JSON.stringify(next));
    setTfaState(next);
  };

  const methodLabel = (method: TfaMethodId): string => {
    const key = TFA_METHODS.find((m) => m.id === method)?.labelKey ?? '';
    return t(key);
  };

  const handleEnroll = (method: TfaMethodId, enrollment: TfaEnrollment) => {
    const next: TfaState = { ...tfaState, [method]: enrollment };
    persistTfa(next);
    setEnrolling(null);
    showFlash('ok', t('settings.security.activated', { label: methodLabel(method) }));
  };

  const handleDisenroll = (method: TfaMethodId) => {
    const enrolledCount = Object.values(tfaState).filter(Boolean).length;
    if (enrolledCount <= 1) {
      showFlash('err', t('settings.security.minOneRequired'));
      return;
    }
    const label = methodLabel(method);
    if (!window.confirm(t('settings.security.disableConfirm', { label }))) return;
    const next: TfaState = { ...tfaState };
    delete next[method];
    persistTfa(next);
    showFlash('ok', t('settings.security.disabled', { label }));
  };

  const onMethodClick = (method: TfaMethodId) => {
    if (tfaState[method]) handleDisenroll(method);
    else setEnrolling(method);
  };

  const renderMethodTarget = (method: TfaMethodId): string => {
    const enrollment = tfaState[method];
    if (!enrollment) return '';
    if (method === 'app')
      return t('settings.security.enrolledOn', {
        date: formatEnrolledDate(enrollment.enrolledAt),
      });
    if (method === 'sms') return maskPhone(enrollment.target);
    return maskEmail(enrollment.target);
  };

  const logoutEverywhere = () => {
    if (!window.confirm(t('settings.security.logoutAllConfirm'))) return;
    showFlash('ok', t('settings.security.logoutAllDone'));
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">
        {t('page.parametres.title')}
      </h1>
      <div role="tablist" aria-label={t('settings.sectionsAria')} className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab) => {
          const on = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(tab.id)}
              className={
                on
                  ? 'rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
                  : 'rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky'
              }
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {flash && (
        <div
          role="status"
          className={
            flash.type === 'ok'
              ? 'mb-6 rounded-xl bg-green-100 border border-green-300 text-green-800 px-4 py-2 text-sm font-medium flex items-center gap-2'
              : 'mb-6 rounded-xl bg-red-100 border border-red-300 text-red-800 px-4 py-2 text-sm font-medium flex items-center gap-2'
          }
        >
          {flash.type === 'ok' ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <AlertTriangle className="h-4 w-4" aria-hidden />
          )}
          {flash.msg}
        </div>
      )}

      {active === 'compte' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-xl font-bold shadow-glow-navy">
              {(profile.firstName[0] ?? '') + (profile.lastName[0] ?? '')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-brand-blue font-semibold">{t('settings.role.admin')}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-base font-bold text-brand-navy">
                {t('settings.account.personalTitle')}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{t('settings.account.personalSub')}</p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    {t('settings.account.firstName')}
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    {t('settings.account.lastName')}
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    {t('settings.account.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    {t('settings.account.email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={!profileDirty}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {t('common.save')}
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-base font-bold text-brand-navy">
                {t('settings.account.passwordTitle')}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{t('settings.account.passwordSub')}</p>
              <div className="mt-5 space-y-3">
                <PasswordInput
                  id="current-password"
                  label={t('settings.account.currentPwd')}
                  value={currentPwd}
                  onChange={setCurrentPwd}
                />
                <PasswordInput
                  id="new-password"
                  label={t('settings.account.newPwd')}
                  value={newPwd}
                  onChange={setNewPwd}
                />
                <PasswordInput
                  id="confirm-password"
                  label={t('settings.account.confirmPwd')}
                  value={confirmPwd}
                  onChange={setConfirmPwd}
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={updatePassword}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-5 py-2 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  {t('settings.account.updatePwd')}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {active === 'securite' && (
        <div className="relative">
          <Shield
            aria-hidden
            className="absolute -top-4 right-0 h-40 w-40 text-brand-navy/5 pointer-events-none"
          />
          <div className="relative space-y-3">
            <AccordionItem title={t('settings.security.tfaTitle')} defaultOpen>
              <p className="text-sm text-gray-600 mb-3">{t('settings.security.tfaSub')}</p>
              <ul className="space-y-2">
                {TFA_METHODS.map((m) => {
                  const on = Boolean(tfaState[m.id]);
                  const target = renderMethodTarget(m.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onMethodClick(m.id)}
                        aria-pressed={on}
                        className={
                          on
                            ? 'w-full flex items-center justify-between gap-3 rounded-xl bg-green-100 border border-green-300 text-green-900 px-4 py-3 text-sm font-semibold hover:bg-green-200 transition-colors'
                            : 'w-full flex items-center justify-between gap-3 rounded-xl border-2 border-orange-500 text-orange-700 px-4 py-3 text-sm font-semibold hover:bg-orange-50 transition-colors'
                        }
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {on ? (
                            <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden />
                          ) : (
                            <Shield className="h-4 w-4 flex-none" aria-hidden />
                          )}
                          <span className="truncate">{t(m.labelKey)}</span>
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium flex-none">
                          {on && target && <span className="hidden sm:inline opacity-80">{target}</span>}
                          <span
                            className={
                              on
                                ? 'rounded-pill bg-green-600 text-white px-2 py-0.5 text-[11px]'
                                : 'rounded-pill bg-orange-500 text-white px-2 py-0.5 text-[11px]'
                            }
                          >
                            {on ? t('common.active') : t('common.activate')}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11px] text-gray-400">
                {t(
                  Object.keys(tfaState).length > 1
                    ? 'settings.security.count.other'
                    : 'settings.security.count.one',
                  { count: Object.keys(tfaState).length },
                )}
              </p>
            </AccordionItem>

            <AccordionItem title={t('settings.security.historyTitle')}>
              <ul className="space-y-2 text-sm">
                {[
                  { dt: '13/04/26  23:12', loc: 'Casablanca, MA', ua: 'Chrome · macOS', ok: true },
                  { dt: '12/04/26  09:05', loc: 'Rabat, MA', ua: 'Safari · iOS', ok: true },
                  { dt: '10/04/26  18:44', loc: 'Marrakech, MA', ua: 'Chrome · Windows', ok: false },
                ].map((s) => (
                  <li
                    key={s.dt}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-2 text-xs text-brand-navy">
                      <span className="font-semibold whitespace-nowrap">{s.dt}</span>
                      <span className="truncate">{s.loc}</span>
                      <span className="truncate text-gray-500">{s.ua}</span>
                    </div>
                    <span
                      className={
                        s.ok
                          ? 'inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold'
                          : 'inline-flex items-center rounded-pill bg-red-100 text-red-700 px-2.5 py-0.5 text-[11px] font-semibold'
                      }
                    >
                      {s.ok ? t('common.active') : t('common.close')}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem title={t('settings.security.logoutAll')}>
              <button
                type="button"
                onClick={logoutEverywhere}
                className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-red transition-all"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {t('settings.security.logoutAll')}
              </button>
            </AccordionItem>
          </div>
        </div>
      )}

      {active === 'general' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Dropdown
            label={t('settings.general.language')}
            Icon={Globe}
            value={LOCALES.find((l) => l.id === locale)?.label ?? 'Français'}
            options={LOCALES.map((l) => l.label)}
            onChange={(v) => {
              const match = LOCALES.find((l) => l.label === v);
              if (match) {
                setLocale(match.id as Locale);
                showFlash('ok', t('settings.general.updated'));
              }
            }}
          />
          <Dropdown
            label={t('settings.general.timezone')}
            Icon={Clock}
            value={general.timezone}
            options={TIMEZONES}
            onChange={(v) => saveGeneral({ ...general, timezone: v })}
          />
          <Dropdown
            label={t('settings.general.dateFormat')}
            Icon={Calendar}
            value={general.dateFormat}
            options={DATE_FORMATS}
            onChange={(v) => saveGeneral({ ...general, dateFormat: v })}
          />
        </div>
      )}

      {enrolling && (
        <TfaEnrollmentModal
          method={enrolling}
          defaultEmail={profile.email}
          defaultPhone={profile.phone}
          onClose={() => setEnrolling(null)}
          onEnroll={handleEnroll}
        />
      )}
    </>
  );
}

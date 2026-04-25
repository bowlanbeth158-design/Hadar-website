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

type Tab = 'compte' | 'securite' | 'general';

const TABS: { id: Tab; label: string }[] = [
  { id: 'compte', label: 'Compte' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'general', label: 'Général' },
];

const PROFILE_KEY = 'hadar:settings:profile';
const GENERAL_KEY = 'hadar:settings:general';
const TFA_KEY = 'hadar:settings:tfa';

type Profile = { firstName: string; lastName: string; phone: string; email: string };
const DEFAULT_PROFILE: Profile = {
  firstName: 'Mohamed Ossama',
  lastName: 'MOUSSAOUI',
  phone: '212698000000',
  email: 'mohamedossama@hadar.ma',
};

type General = { language: string; timezone: string; dateFormat: string };
const DEFAULT_GENERAL: General = {
  language: 'Français',
  timezone: 'Casablanca, Maroc',
  dateFormat: 'JJ/MM/AAAA',
};

const LANGUAGES = ['Français', 'العربية', 'English'];
const TIMEZONES = ['Casablanca, Maroc', 'Paris, France', 'Londres, Royaume-Uni', 'UTC'];
const DATE_FORMATS = ['JJ/MM/AAAA', 'AAAA-MM-JJ', 'MM/JJ/AAAA'];
const TFA_METHODS = ['Application (Google Authenticator, Authy)', 'SMS', 'Email'] as const;

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
  const [active, setActive] = useState<Tab>('compte');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [general, setGeneral] = useState<General>(DEFAULT_GENERAL);
  const [tfaMethods, setTfaMethods] = useState<Set<string>>(
    new Set(['Application (Google Authenticator, Authy)']),
  );
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
      const t = window.localStorage.getItem(TFA_KEY);
      if (t) setTfaMethods(new Set(JSON.parse(t) as string[]));
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
    showFlash('ok', 'Informations enregistrées');
  };

  const updatePassword = () => {
    if (!currentPwd || !newPwd) {
      showFlash('err', 'Veuillez remplir tous les champs');
      return;
    }
    if (newPwd !== confirmPwd) {
      showFlash('err', 'La confirmation ne correspond pas');
      return;
    }
    if (newPwd.length < 8) {
      showFlash('err', 'Minimum 8 caractères');
      return;
    }
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    showFlash('ok', 'Mot de passe mis à jour');
  };

  const saveGeneral = (next: General) => {
    setGeneral(next);
    window.localStorage.setItem(GENERAL_KEY, JSON.stringify(next));
    showFlash('ok', 'Préférences mises à jour');
  };

  const toggleTfa = (method: string) => {
    setTfaMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      window.localStorage.setItem(TFA_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const logoutEverywhere = () => {
    if (!window.confirm('Déconnecter toutes les autres sessions ?')) return;
    showFlash('ok', 'Toutes les autres sessions ont été révoquées');
  };

  return (
    <>
      <div role="tablist" aria-label="Sections paramètres" className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={
                on
                  ? 'rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy'
                  : 'rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky'
              }
            >
              {t.label}
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
              <p className="text-sm text-brand-blue font-semibold">Admin</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-base font-bold text-brand-navy">Informations personnelles</h3>
              <p className="mt-1 text-xs text-gray-500">
                Gérez vos informations personnelles en toute sécurité.
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Prénom
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
                    Nom de famille
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
                    Numéro de portable
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Inclure l&apos;indicatif pays (ex : 212…), sans 0 ni +
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Adresse e-mail
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
                  Enregistrer les modifications
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-6">
              <h3 className="text-base font-bold text-brand-navy">Mot de passe</h3>
              <p className="mt-1 text-xs text-gray-500">
                Pour votre sécurité, utilisez un mot de passe unique et sécurisé.
              </p>
              <div className="mt-5 space-y-3">
                <PasswordInput
                  id="current-password"
                  label="Mot de passe actuel"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                />
                <PasswordInput
                  id="new-password"
                  label="Nouveau mot de passe"
                  value={newPwd}
                  onChange={setNewPwd}
                />
                <PasswordInput
                  id="confirm-password"
                  label="Confirmer le nouveau mot de passe"
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
                  Mettre à jour le mot de passe
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
            <AccordionItem
              title="Activer / désactiver la double authentification (2FA)"
              defaultOpen
            >
              <p className="text-sm text-gray-600 mb-3">
                Choisissez les méthodes de double authentification à activer.
              </p>
              <div className="flex flex-wrap gap-2">
                {TFA_METHODS.map((m) => {
                  const on = tfaMethods.has(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleTfa(m)}
                      aria-pressed={on}
                      className={
                        on
                          ? 'rounded-pill bg-grad-alert-orange text-white px-4 py-1.5 text-sm font-semibold shadow-glow-orange'
                          : 'rounded-pill border-2 border-orange-500 text-orange-600 px-4 py-1.5 text-sm font-semibold hover:bg-orange-50'
                      }
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-gray-400">
                {tfaMethods.size} méthode{tfaMethods.size > 1 ? 's' : ''} activée
                {tfaMethods.size > 1 ? 's' : ''}
              </p>
            </AccordionItem>

            <AccordionItem title="Historique des connexions">
              <ul className="space-y-2 text-sm">
                {[
                  { dt: '13/04/26  23:12', loc: 'Casablanca, MA', ua: 'Chrome · macOS', status: 'Réussie' },
                  { dt: '12/04/26  09:05', loc: 'Rabat, MA', ua: 'Safari · iOS', status: 'Réussie' },
                  { dt: '10/04/26  18:44', loc: 'Marrakech, MA', ua: 'Chrome · Windows', status: 'Bloquée' },
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
                        s.status === 'Réussie'
                          ? 'inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold'
                          : 'inline-flex items-center rounded-pill bg-red-100 text-red-700 px-2.5 py-0.5 text-[11px] font-semibold'
                      }
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem title="Déconnexion de tous les appareils">
              <p className="text-sm text-gray-600 mb-4">
                Révoque toutes les autres sessions actives sur vos appareils. Vous resterez
                connecté sur cet appareil.
              </p>
              <button
                type="button"
                onClick={logoutEverywhere}
                className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-red transition-all"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Se déconnecter partout
              </button>
            </AccordionItem>
          </div>
        </div>
      )}

      {active === 'general' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Dropdown
            label="Langue"
            Icon={Globe}
            value={general.language}
            options={LANGUAGES}
            onChange={(v) => saveGeneral({ ...general, language: v })}
          />
          <Dropdown
            label="Fuseau horaire"
            Icon={Clock}
            value={general.timezone}
            options={TIMEZONES}
            onChange={(v) => saveGeneral({ ...general, timezone: v })}
          />
          <Dropdown
            label="Format de date"
            Icon={Calendar}
            value={general.dateFormat}
            options={DATE_FORMATS}
            onChange={(v) => saveGeneral({ ...general, dateFormat: v })}
          />
        </div>
      )}
    </>
  );
}

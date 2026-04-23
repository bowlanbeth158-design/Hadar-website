'use client';

import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, CheckCircle2, ChevronDown, Shield, Globe, Clock, Calendar, LogOut } from 'lucide-react';

type Tab = 'compte' | 'securite' | 'general';

const TABS: { id: Tab; label: string }[] = [
  { id: 'compte', label: 'Compte' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'general', label: 'Général' },
];

function PasswordInput({ id, label }: { id: string; label: string }) {
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
        <ChevronDown className="h-4 w-4 text-brand-blue transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="px-5 pb-5 border-t border-gray-100 pt-4">{children}</div>
    </details>
  );
}

export function SettingsTabs() {
  const [active, setActive] = useState<Tab>('compte');

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

      {active === 'compte' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-xl font-bold shadow-glow-navy">
              MM
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Mohamed Ossama MOUSSAOUI</h3>
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
                  <label className="block text-xs font-semibold text-brand-navy mb-1">Prénom</label>
                  <input
                    type="text"
                    defaultValue="Mohamed Ossama"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-navy mb-1">Nom de famille</label>
                  <input
                    type="text"
                    defaultValue="MOUSSAOUI"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-navy mb-1">
                    Numéro de portable
                  </label>
                  <input
                    type="tel"
                    defaultValue="212698000000"
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
                    defaultValue="mohamedossama@hadar.ma"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green transition-all"
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
                <PasswordInput id="current-password" label="Mot de passe actuel" />
                <PasswordInput id="new-password" label="Nouveau mot de passe" />
                <PasswordInput id="confirm-password" label="Confirmer le nouveau mot de passe" />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
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
            <AccordionItem title="Activer / désactiver la double authentification (2FA)" defaultOpen>
              <p className="text-sm text-gray-600 mb-3">
                Choisissez les méthodes de double authentification à activer.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Application (Google Authenticator, Authy)', 'SMS', 'Email'].map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={
                      i === 0
                        ? 'rounded-pill bg-grad-alert-orange text-white px-4 py-1.5 text-sm font-semibold shadow-glow-orange'
                        : 'rounded-pill border-2 border-orange-500 text-orange-600 px-4 py-1.5 text-sm font-semibold hover:bg-orange-50'
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
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
          {[
            { label: 'Langue', Icon: Globe, value: 'Français' },
            { label: 'Fuseau horaire', Icon: Clock, value: 'Casablanca, Maroc' },
            { label: 'Format de date', Icon: Calendar, value: 'JJ/MM/AAAA' },
          ].map(({ label, Icon, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5"
            >
              <div className="inline-flex items-center gap-2 rounded-pill bg-grad-alert-orange text-white px-3 py-1 text-xs font-semibold shadow-glow-orange">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </div>
              <button
                type="button"
                className="mt-4 w-full inline-flex items-center justify-between gap-2 rounded-pill bg-brand-sky text-brand-navy px-4 py-2 text-sm font-semibold hover:bg-brand-sky/80 transition-colors"
              >
                {value}
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

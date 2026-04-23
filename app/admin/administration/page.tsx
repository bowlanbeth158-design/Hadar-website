import type { Metadata } from 'next';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PermissionToggle } from '@/components/admin/PermissionToggle';

export const metadata: Metadata = { title: 'Administration' };

const ADMIN_PERMS = [
  { label: 'Accéder au tableau de bord', on: true },
  { label: 'Exporter les KPI du dashboard', on: true },
  { label: 'Modérer un signalement', on: true },
  { label: 'Bloquer un utilisateur', on: true },
  { label: 'Supprimer un utilisateur (soft-delete)', on: true },
  { label: 'Ajouter / modifier un membre', on: true },
  { label: 'Publier une annonce', on: true },
  { label: 'Superviser l’Assistant', on: true },
  { label: 'Changer le rôle d’un membre', on: false, locked: true },
  { label: 'Purger un utilisateur (hard-delete)', on: false, locked: true },
  { label: 'Modifier les intégrations', on: false, locked: true },
  { label: 'Modifier la matrice des permissions', on: false, locked: true },
  { label: 'Configurer les paramètres globaux', on: false, locked: true },
];

const MOD_PERMS = [
  { label: 'Accéder au tableau de bord', on: true },
  { label: 'Modérer un signalement', on: true },
  { label: 'Voir la liste des utilisateurs', on: true },
  { label: 'Réinitialiser un mot de passe user', on: true },
  { label: 'Bloquer un utilisateur', on: true },
  { label: 'Exporter les KPI du dashboard', on: false },
  { label: 'Supprimer un utilisateur', on: false },
  { label: 'Ajouter un membre', on: false },
];

const SUPPORT_PERMS = [
  { label: 'Accéder au tableau de bord', on: true },
  { label: 'Voir la liste des utilisateurs', on: true },
  { label: 'Réinitialiser un mot de passe user', on: true },
  { label: 'Répondre aux conversations Assistant', on: true },
  { label: 'Modérer un signalement', on: false },
  { label: 'Bloquer un utilisateur', on: false },
];

function RoleSection({
  title,
  perms,
  badgeClass,
}: {
  title: string;
  perms: { label: string; on: boolean; locked?: boolean }[];
  badgeClass: string;
}) {
  return (
    <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <span className={`inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold ${badgeClass}`}>
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {title}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {perms.map((p) => (
          <PermissionToggle key={p.label} label={p.label} defaultOn={p.on} locked={p.locked} />
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Administration</h1>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Enregistrer les modifications
        </button>
      </div>

      <nav role="tablist" className="flex flex-wrap gap-2 mb-8">
        <button type="button" className="rounded-pill bg-grad-stat-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy">
          Rôles & permissions
        </button>
        <button type="button" className="rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky transition-colors">
          Logs d&apos;audit
        </button>
        <button type="button" className="rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky transition-colors">
          Configuration plateforme
        </button>
        <button type="button" className="rounded-pill bg-brand-sky/60 text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-sky transition-colors">
          Intégrations
        </button>
      </nav>

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

        <RoleSection
          title="Admin"
          perms={ADMIN_PERMS}
          badgeClass="bg-yellow-100 text-yellow-700"
        />
        <RoleSection
          title="Modérateur"
          perms={MOD_PERMS}
          badgeClass="bg-yellow-100 text-yellow-700"
        />
        <RoleSection
          title="Support"
          perms={SUPPORT_PERMS}
          badgeClass="bg-yellow-100 text-yellow-700"
        />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import {
  Lock,
  Star,
  Trash2,
  Siren,
  CheckCircle2,
  ShieldCheck,
  Clock3,
  RefreshCcw,
  Save,
  Award,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { CountUp } from '@/components/CountUp';
import { AvatarUpload } from '@/components/AvatarUpload';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { BadgesCriteriaModal } from '@/components/BadgesCriteriaModal';
import { IdentityVerificationModal } from '@/components/IdentityVerificationModal';

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Gérez votre identité, votre mot de passe et vos préférences sur Hadar.',
};

const PROFILE = {
  firstName: 'Mohamed Ossama',
  lastName: 'MOUSSAOUI',
  email: 'mohamedossama.moussaoui@gmail.com',
  contactType: 'mohamedossama.moussaoui@gmail.com',
  badge: 'Contributeur régulier',
  badgeKey: 'regulier',
  badgeStars: 4,
  validationRate: 100,
  verified: false,
  stats: {
    sent: 5,
    published: 5,
    verifications: 26,
    lastReport: 'Il y a 2h',
  },
};

export default function Page() {
  const initials = `${PROFILE.firstName[0] ?? ''}${PROFILE.lastName[0] ?? ''}`.toUpperCase();

  return (
    <PageLayout>
      <div className="mb-6">
        <BackButton />
      </div>

      <DemoBanner />

      {/* Hero card — avatar + identity */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-sky/60 via-white to-brand-sky/30 border border-gray-200 shadow-glow-soft p-6 md:p-8 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <AvatarUpload initials={initials} />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-navy inline-flex items-center gap-2 flex-wrap">
              <span>
                {PROFILE.firstName} {PROFILE.lastName}
              </span>
              {PROFILE.verified && (
                <VerifiedBadge className="h-6 w-6" />
              )}
            </h1>

            {/* Badge tier — clickable, opens criteria modal */}
            <BadgesCriteriaModal
              highlightKey={PROFILE.badgeKey}
              trigger={
                <span className="mt-1 group inline-flex items-center gap-1.5 rounded-pill bg-white/60 backdrop-blur-sm border border-yellow-200 px-3 py-1 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:bg-white hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
                  <Award className="h-3.5 w-3.5 text-yellow-500" aria-hidden />
                  {PROFILE.badge}
                  <span className="inline-flex items-center gap-0.5 ml-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < PROFILE.badgeStars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        aria-hidden
                      />
                    ))}
                  </span>
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-brand-blue group-hover:underline">
                    Voir les niveaux
                  </span>
                </span>
              }
            />

            <p className="mt-2 text-xs text-gray-500">
              Taux de validation :{' '}
              <span className="font-semibold text-brand-navy">
                <CountUp to={PROFILE.validationRate} />%
              </span>
            </p>

            {/* Identity verification CTA — shown only when not verified */}
            {!PROFILE.verified && (
              <IdentityVerificationModal
                trigger={
                  <span className="mt-3 inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
                    <VerifiedBadge className="h-4 w-4" />
                    Activer ma vérification d&apos;identité —{' '}
                    <span className="text-green-600">gratuit</span>
                  </span>
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* 4 KPI cards with animated counters */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <KpiCard
          icon={Siren}
          label="Signalements envoyés"
          gradient="bg-grad-alert-red"
          glow="hover:shadow-glow-red"
          value={<CountUp to={PROFILE.stats.sent} />}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Signalements publiés"
          gradient="bg-grad-alert-green"
          glow="hover:shadow-glow-green"
          value={<CountUp to={PROFILE.stats.published} />}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Vérifications réalisées"
          gradient="bg-grad-stat-sky"
          glow="hover:shadow-glow-sky"
          value={<CountUp to={PROFILE.stats.verifications} />}
        />
        <KpiCard
          icon={Clock3}
          label="Dernier signalement"
          gradient="bg-grad-alert-orange"
          glow="hover:shadow-glow-orange"
          value={PROFILE.stats.lastReport}
        />
      </section>

      {/* Informations + Mot de passe — side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations personnelles */}
        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy">Informations personnelles</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-5">
            Gérez vos informations personnelles en toute sécurité.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom" name="firstName" defaultValue={PROFILE.firstName} />
            <Field label="Nom de famille" name="lastName" defaultValue={PROFILE.lastName} />
            <div className="sm:col-span-2">
              <Field
                label="Type de contact"
                name="contactType"
                defaultValue={PROFILE.contactType}
                hint="Inclure l’indicatif pays (ex : 212…), sans 0 ni +"
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Adresse e-mail"
                type="email"
                name="email"
                defaultValue={PROFILE.email}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 text-sm font-semibold shadow-glow-green hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out"
            >
              <Save className="h-4 w-4" aria-hidden />
              Enregistrer les modifications
            </button>
          </div>
        </section>

        {/* Mot de passe */}
        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-blue" aria-hidden />
            Mot de passe
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-5">
            Pour votre sécurité, utilisez un mot de passe unique et sécurisé.
          </p>

          <div className="space-y-4">
            <Field
              label="Mot de passe actuel"
              type="password"
              name="currentPassword"
              defaultValue=""
              placeholder="••••••••••••"
            />
            <Field
              label="Nouveau mot de passe"
              type="password"
              name="newPassword"
              defaultValue=""
              placeholder="12 caractères minimum"
            />
            <Field
              label="Confirmer le nouveau mot de passe"
              type="password"
              name="confirmPassword"
              defaultValue=""
              placeholder="Retapez le nouveau mot de passe"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-navy to-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-navy hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden />
              Mettre à jour le mot de passe
            </button>
          </div>
        </section>
      </div>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl bg-red-50 border border-red-100 p-6 shadow-glow-red">
        <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5" aria-hidden />
          Zone dangereuse
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          La suppression de votre compte est irréversible après 30 jours. Les signalements publiés
          seront conservés en mode anonyme.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 text-white px-5 py-2 text-sm font-semibold shadow-glow-red hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Supprimer mon compte
        </button>
      </section>

      <p className="mt-10 text-center text-xs text-gray-400">
        Vos informations sont protégées et traitées de manière confidentielle.
      </p>
    </PageLayout>
  );
}

/* ---------- subcomponents ---------- */

function KpiCard({
  icon: Icon,
  value,
  label,
  gradient,
  glow,
}: {
  icon: typeof Siren;
  value: React.ReactNode;
  label: string;
  gradient: string;
  glow: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl ${gradient} text-white p-4 shadow-md ${glow} hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 ease-out`}
    >
      <Icon
        className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 text-white/40"
        aria-hidden
      />
      <p className="text-2xl md:text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-90 pr-9">{label}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="block text-sm font-semibold text-brand-navy mb-1.5"
      >
        {label}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-pill border border-gray-200 bg-white px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
      />
      {hint && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

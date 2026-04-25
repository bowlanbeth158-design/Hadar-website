import type { Metadata } from 'next';
import { Lock, Siren, CheckCircle2, ShieldCheck, Clock3 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { CountUp } from '@/components/CountUp';
import { AvatarUpload } from '@/components/AvatarUpload';
import { ProfileIdentity } from '@/components/ProfileIdentity';
import { PhoneVerifyField } from '@/components/PhoneVerifyField';
import { SaveActionButton } from '@/components/SaveActionButton';
import { DeleteAccountSection } from '@/components/DeleteAccountSection';

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Gérez votre identité, votre mot de passe et vos préférences sur Hadar.',
};

const PROFILE = {
  firstName: 'Mohamed Ossama',
  lastName: 'MOUSSAOUI',
  /** Email used at sign-up — read-only. All transactional mails go here. */
  email: 'mohamedossama.moussaoui@gmail.com',
  /** Phone number — verified via WhatsApp 5-digit code. */
  phone: '212 6 12 34 56 78',
  badge: 'Contributeur régulier',
  badgeKey: 'regulier',
  badgeStars: 4,
  validationRate: 100,
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
    <PageLayout narrow>
      <div className="mb-6">
        <BackButton />
      </div>

      <DemoBanner />

      {/* Hero card — avatar + identity */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-sky/60 via-white to-brand-sky/30 border border-gray-200 shadow-glow-soft p-6 md:p-8 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <AvatarUpload initials={initials} />

          <ProfileIdentity
            firstName={PROFILE.firstName}
            lastName={PROFILE.lastName}
            badge={PROFILE.badge}
            badgeKey={PROFILE.badgeKey}
            badgeStars={PROFILE.badgeStars}
            validationRate={PROFILE.validationRate}
          />
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
              <PhoneVerifyField
                defaultValue={PROFILE.phone}
                hint="Inclure l’indicatif pays (ex : 212…), sans 0 ni +. Vous recevrez le code par WhatsApp."
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Adresse e-mail"
                type="email"
                name="email"
                defaultValue={PROFILE.email}
                readOnly
                hint="Email utilisé à l’inscription — c’est l’adresse à laquelle nous envoyons les notifications. Non modifiable ici."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <SaveActionButton
              label="Enregistrer les modifications"
              savingLabel="Enregistrement…"
              savedLabel="Modifications enregistrées"
              icon="save"
              className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-glow-green hover:shadow-lg"
            />
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
            <SaveActionButton
              label="Mettre à jour le mot de passe"
              savingLabel="Mise à jour…"
              savedLabel="Mot de passe mis à jour"
              icon="refresh"
              className="bg-gradient-to-r from-brand-navy to-brand-blue shadow-glow-navy hover:shadow-lg"
            />
          </div>
        </section>
      </div>

      {/* Danger zone — interactive (sad/happy modal flow) */}
      <DeleteAccountSection />

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
  readOnly = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
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
        readOnly={readOnly}
        className={`w-full rounded-pill border px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 outline-none transition-all ${
          readOnly
            ? 'border-gray-200 bg-gray-50 cursor-default'
            : 'border-gray-200 bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
        }`}
      />
      {hint && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

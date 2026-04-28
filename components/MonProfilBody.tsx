'use client';

import { Lock, Siren, CheckCircle2, ShieldCheck, Clock3 } from 'lucide-react';
import { CountUp } from './CountUp';
import { AvatarUpload } from './AvatarUpload';
import { ProfileIdentity } from './ProfileIdentity';
import { PhoneVerifyField } from './PhoneVerifyField';
import { SaveActionButton } from './SaveActionButton';
import { DeleteAccountSection } from './DeleteAccountSection';
import { useI18n } from '@/lib/i18n/provider';

const PROFILE = {
  /** Email used at sign-up — read-only. All transactional mails go here. */
  email: 'mohamedossama.moussaoui@gmail.com',
  /** Phone number — verified via WhatsApp 5-digit code. */
  phone: '212 6 12 34 56 78',
  badgeKey: 'regulier',
  badgeStars: 4,
  validationRate: 100,
  stats: {
    sent: 5,
    published: 5,
    verifications: 26,
  },
};

// Body of /mon-profil rendered as a client component so every label,
// hint, button text and disclaimer can come from useI18n() without
// the parent page having to drop its metadata export.
export function MonProfilBody() {
  const { t } = useI18n();
  // Display name follows the active locale (Latin spelling for FR/EN,
  // Arabic script for AR). In production this comes from the user
  // record; for the demo it lives in messages.ts as profile.demo.*.
  const firstName = t('profile.demo.firstName');
  const lastName = t('profile.demo.lastName');
  // Initials: take first character of each (handles non-Latin
  // codepoints correctly via Array.from + Intl-friendly logic).
  const firstChar = Array.from(firstName)[0] ?? '';
  const lastChar = Array.from(lastName)[0] ?? '';
  const initials = `${firstChar}${lastChar}`.toUpperCase();
  const badgeLabel = t('profile.badge.regular');

  return (
    <>
      {/* Hero card — avatar + identity */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-sky/60 via-white to-brand-sky/30 border border-gray-200 shadow-glow-soft p-6 md:p-8 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <AvatarUpload initials={initials} />

          <ProfileIdentity
            firstName={firstName}
            lastName={lastName}
            badge={badgeLabel}
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
          label={t('profile.kpi.sent')}
          gradient="bg-grad-alert-red"
          glow="hover:shadow-glow-red"
          value={<CountUp to={PROFILE.stats.sent} />}
        />
        <KpiCard
          icon={CheckCircle2}
          label={t('profile.kpi.published')}
          gradient="bg-grad-alert-green"
          glow="hover:shadow-glow-green"
          value={<CountUp to={PROFILE.stats.published} />}
        />
        <KpiCard
          icon={ShieldCheck}
          label={t('profile.kpi.verifications')}
          gradient="bg-grad-stat-sky"
          glow="hover:shadow-glow-sky"
          value={<CountUp to={PROFILE.stats.verifications} />}
        />
        <KpiCard
          icon={Clock3}
          label={t('profile.kpi.lastReport')}
          gradient="bg-grad-alert-orange"
          glow="hover:shadow-glow-orange"
          value={t('profile.lastReport.value')}
        />
      </section>

      {/* Informations + Mot de passe — side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy">
            {t('profile.section.identity.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-5">
            {t('profile.section.identity.subtitle')}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('profile.field.firstName')} name="firstName" defaultValue={firstName} />
            <Field label={t('profile.field.lastName')} name="lastName" defaultValue={lastName} />
            <div className="sm:col-span-2">
              <PhoneVerifyField
                defaultValue={PROFILE.phone}
                hint={t('profile.field.phone.hint')}
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t('profile.field.email')}
                type="email"
                name="email"
                defaultValue={PROFILE.email}
                readOnly
                hint={t('profile.field.email.hint')}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <SaveActionButton
              label={t('profile.btn.save')}
              savingLabel={t('profile.btn.save.saving')}
              savedLabel={t('profile.btn.save.saved')}
              icon="save"
              className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-glow-green hover:shadow-lg"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand-blue" aria-hidden />
            {t('profile.section.password.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-5">
            {t('profile.section.password.subtitle')}
          </p>

          <div className="space-y-4">
            <Field
              label={t('profile.field.currentPassword')}
              type="password"
              name="currentPassword"
              defaultValue=""
              placeholder="••••••••••••"
            />
            <Field
              label={t('profile.field.newPassword')}
              type="password"
              name="newPassword"
              defaultValue=""
              placeholder={t('profile.field.newPassword.placeholder')}
            />
            <Field
              label={t('profile.field.confirmPassword')}
              type="password"
              name="confirmPassword"
              defaultValue=""
              placeholder={t('profile.field.confirmPassword.placeholder')}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <SaveActionButton
              label={t('profile.btn.password')}
              savingLabel={t('profile.btn.password.saving')}
              savedLabel={t('profile.btn.password.saved')}
              icon="refresh"
              className="bg-gradient-to-r from-brand-navy to-brand-blue shadow-glow-navy hover:shadow-lg"
            />
          </div>
        </section>
      </div>

      <DeleteAccountSection />

      <p className="mt-10 text-center text-xs text-gray-400">{t('profile.disclaimer')}</p>
    </>
  );
}

// ---------- subcomponents (kept private to this file) ----------

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

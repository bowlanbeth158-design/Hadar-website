'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { detectUnsafeContent } from '@/lib/moderationWords';
import { useCurrency } from '@/lib/currency/provider';
import { useI18n } from '@/lib/i18n/provider';
import {
  CountryCodeSelector,
  DEFAULT_COUNTRY,
  type Country,
} from './CountryCodeSelector';
import { CurrencySwitcher } from './CurrencySwitcher';
import {
  getDescriptionSuggestions,
  type ProblemId,
} from '@/lib/descriptionSuggestions';
import {
  Megaphone,
  UploadCloud,
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  Globe,
  AtSign,
  Wallet,
  Coins,
  PackageX,
  Ban,
  AlertTriangle,
  VenetianMask,
  Wallet as WalletIcon,
  Pencil,
  Lock,
  Paperclip,
  CheckCircle2,
  Heart,
  Users,
  ShieldCheck,
  Sparkles,
  Loader2,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

type ContactType = {
  id: string;
  // i18n keys reused from the homepage hero — same labels +
  // placeholders, so a single source of truth across the site.
  labelKey: string;
  placeholderKey: string;
  Icon: LucideIcon;
};

const CONTACT_TYPES: ContactType[] = [
  { id: 'telephone',       labelKey: 'home.hero.contactType.telephone',       placeholderKey: 'home.hero.placeholder.telephone',       Icon: Phone },
  { id: 'whatsapp',        labelKey: 'home.hero.contactType.whatsapp',        placeholderKey: 'home.hero.placeholder.whatsapp',        Icon: MessageCircle },
  { id: 'email',           labelKey: 'home.hero.contactType.email',           placeholderKey: 'home.hero.placeholder.email',           Icon: Mail },
  { id: 'rib',             labelKey: 'home.hero.contactType.rib',             placeholderKey: 'home.hero.placeholder.rib',             Icon: CreditCard },
  { id: 'site_web',        labelKey: 'home.hero.contactType.site_web',        placeholderKey: 'home.hero.placeholder.site_web',        Icon: Globe },
  { id: 'reseaux_sociaux', labelKey: 'home.hero.contactType.reseaux_sociaux', placeholderKey: 'home.hero.placeholder.reseaux_sociaux', Icon: AtSign },
  { id: 'paypal',          labelKey: 'home.hero.contactType.paypal',          placeholderKey: 'home.hero.placeholder.paypal',          Icon: Wallet },
  { id: 'binance',         labelKey: 'home.hero.contactType.binance',         placeholderKey: 'home.hero.placeholder.binance',         Icon: Coins },
];

type ProblemType = { id: string; labelKey: string; Icon: LucideIcon };

const PROBLEM_TYPES: ProblemType[] = [
  { id: 'non_livraison',          labelKey: 'form.problem.nonDelivery',         Icon: PackageX      },
  { id: 'bloque_apres_paiement',  labelKey: 'form.problem.blockedAfterPayment', Icon: Ban           },
  { id: 'produit_non_conforme',   labelKey: 'form.problem.nonCompliant',        Icon: AlertTriangle },
  { id: 'usurpation_identite',    labelKey: 'form.problem.identityTheft',       Icon: VenetianMask  },
];

type Phase = 'idle' | 'sending' | 'success';

// Per-channel format validation. The phone / WhatsApp paths already
// enforce digits-only + country.digits length on input, so they only
// need a length check here. Every other channel runs a regex picked
// to match the placeholder example shown in step 1 — the user can't
// move to step 2 until the typed value matches the chosen channel,
// mirroring the verification flow's strict format rules.
function validateContact(
  type: string,
  value: string,
  countryDigits: number,
): { valid: boolean; errorKey?: string } {
  const v = value.trim();
  if (!v) return { valid: false };
  switch (type) {
    case 'telephone':
    case 'whatsapp':
      return v.length === countryDigits
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.phone' };
    case 'email':
    case 'paypal':
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.email' };
    case 'rib':
      // IBAN-like: 2 letters then 13–32 alphanumerics (spaces allowed).
      return /^[A-Z]{2}[A-Z0-9](?:[ ]?[A-Z0-9]){12,30}$/i.test(v)
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.rib' };
    case 'site_web':
      return /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[\w\-./?%&=#]*)?$/i.test(v)
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.site' };
    case 'reseaux_sociaux':
      return /^@?[a-zA-Z0-9._-]{2,30}$/.test(v)
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.social' };
    case 'binance':
      // Accept hex (0x..., 26+ chars), Tron (T + 33 base58), or any
      // other 26+ alphanumeric chain string.
      return /^(0x[a-fA-F0-9]{20,})$|^T[1-9A-HJ-NP-Za-km-z]{33}$|^[a-zA-Z0-9]{26,}$/.test(v)
        ? { valid: true }
        : { valid: false, errorKey: 'form.contactValue.error.crypto' };
    default:
      return { valid: true };
  }
}

const MAX_EVIDENCE = 5;
const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

const CONFETTI_COLOURS = [
  'bg-brand-blue',
  'bg-brand-navy',
  'bg-sky-400',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-violet-500',
  'bg-yellow-300',
];

function ConfettiRain() {
  const pieces = Array.from({ length: 36 }, (_, i) => {
    const left = (i * 13.7) % 100;
    const colour = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]!;
    const delay = ((i * 137) % 1500) / 1000;
    const duration = 2.4 + ((i * 71) % 1800) / 1000;
    const size = 6 + (i % 5) * 2;
    const rounded = i % 3 === 0 ? 'rounded-full' : 'rounded-sm';
    return (
      <span
        key={i}
        aria-hidden
        className={`absolute top-0 ${colour} ${rounded} animate-confetti-fall opacity-90`}
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {pieces}
    </div>
  );
}

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS = 5;
const STEP_TITLE_KEYS: Record<Step, string> = {
  1: 'form.step.title.1',
  2: 'form.step.title.2',
  3: 'form.step.title.3',
  4: 'form.step.title.4',
  5: 'form.step.title.5',
};

function Stepper({ step }: { step: Step }) {
  const { t } = useI18n();
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-brand-blue tabular-nums">
          {t('form.step.counter', { step, total: TOTAL_STEPS })}
        </span>
        <span className="text-xs font-semibold text-brand-navy">
          {t(STEP_TITLE_KEYS[step])}
        </span>
      </div>
      <div className="relative">
        <div className="h-1.5 w-full rounded-full bg-gray-200/70 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-blue to-brand-navy transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1">
          {([1, 2, 3, 4, 5] as Step[]).map((n) => {
            const done = n < step;
            const active = n === step;
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                <span
                  className={
                    active
                      ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-bold shadow-glow-navy ring-2 ring-brand-blue/40'
                      : done
                      ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold shadow-sm'
                      : 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/85 border border-gray-200 text-gray-400 text-xs font-bold'
                  }
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : n}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SuccessCelebration({ onAgain }: { onAgain: () => void }) {
  const { t } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Centre the thank-you card in the viewport so the user sees the
    // confirmation immediately without manual scrolling. scrollIntoView
    // with block:'center' is supported across all modern browsers and
    // respects the user's prefers-reduced-motion setting.
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Split the localised "Notre équipe examinera votre signalement sous
  // {duration}." sentence around the duration so the bold span keeps
  // its styling regardless of where the duration sits in the target
  // language (FR puts it at the end, AR puts it after "خلال").
  const etaTpl = t('form.success.eta', { duration: '__DURATION__' });
  const [etaBefore = '', etaAfter = ''] = etaTpl.split('__DURATION__');

  return (
    <div
      ref={cardRef}
      className="relative rounded-3xl bg-gradient-to-br from-green-100/60 via-white to-brand-sky/40 backdrop-blur-sm border border-white/70 shadow-glow-green overflow-hidden animate-modal-pop scroll-mt-20"
    >
      <ConfettiRain />

      <div className="relative px-6 md:px-10 py-12 md:py-16 text-center">
        <div className="relative inline-flex items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-green-500/30 blur-2xl scale-150 animate-pulse"
          />
          <span
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full ring-4 ring-green-500/20 animate-ping"
          />
          <span className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-glow-green animate-verify-pulse">
            <CheckCircle2
              className="h-12 w-12 text-white drop-shadow animate-sparkle-pop"
              aria-hidden
            />
          </span>
        </div>

        <h2 className="mt-7 text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-700 via-green-500 to-green-700 bg-clip-text text-transparent animate-fade-in-down">
          {t('form.success.thanks')}
        </h2>

        <div className="mt-4 mx-auto max-w-lg space-y-3 text-sm md:text-base text-gray-600 leading-relaxed">
          <p className="font-semibold text-brand-navy text-base md:text-lg animate-fade-in-down [animation-delay:120ms]">
            {t('form.success.received')}
          </p>
          <p className="animate-fade-in-down [animation-delay:240ms]">
            {t('form.success.community')}
          </p>
          <p className="animate-fade-in-down [animation-delay:360ms]">
            {etaBefore}
            <span className="font-semibold text-brand-navy">
              {t('form.success.eta.duration')}
            </span>
            {etaAfter}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[
            { Icon: Users,       value: '2 500+',  labelKey: 'form.success.stat.users',    tint: 'text-brand-blue' },
            { Icon: ShieldCheck, value: '+ 10 000', labelKey: 'form.success.stat.contacts', tint: 'text-green-700'  },
            { Icon: Heart,       value: '∞',       labelKey: 'form.success.stat.thanks',   tint: 'text-red-500'    },
          ].map(({ Icon, value, labelKey, tint }) => (
            <div
              key={labelKey}
              className="rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 p-3 shadow-sm"
            >
              <Icon className={`mx-auto h-5 w-5 ${tint} animate-sparkle-pop`} aria-hidden />
              <p className="mt-1 text-base font-bold text-brand-navy tabular-nums">{value}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{t(labelKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAgain}
            className="inline-flex items-center gap-2 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <Sparkles className="h-4 w-4 animate-sparkle-pop" aria-hidden />
            {t('form.success.again')}
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-pill bg-white/85 hover:bg-white border border-white/80 hover:border-brand-blue/40 text-brand-navy px-5 py-2.5 text-sm font-semibold shadow-sm transition-all"
          >
            {t('form.success.home')}
          </a>
        </div>
      </div>
    </div>
  );
}

export function ReportForm() {
  const { t, locale, setLocale } = useI18n();
  // Step 0 — language picker shown before the actual questionnaire.
  // Mobile users can't easily reach the language switcher (it's
  // tucked inside the hamburger drawer), so we surface a one-tap
  // language confirmation up front. Once the user clicks a flag,
  // the locale is applied site-wide and the form jumps to step 1.
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  // Active currency drives the Montant input's placeholder and suffix
  // so the user always types in the unit they're seeing across the
  // rest of the site (header switcher, Montant signalé KPI, etc.).
  const { symbol: currencySymbol, placeholderAmount } = useCurrency();
  const [step, setStep] = useState<Step>(1);
  const [contactType, setContactType] = useState<string>(CONTACT_TYPES[0]!.id);
  const [contactValue, setContactValue] = useState('');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [problemType, setProblemType] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [description, setDescription] = useState('');
  // Free-text notes intended for the moderation team only — never
  // displayed publicly. Public listings (Recent reports) only show
  // the curated `description` phrase picked from the suggestion
  // list; this field gives the user room to add context for admins
  // without exposing potentially defamatory wording.
  const [adminNotes, setAdminNotes] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');

  const activeContact = CONTACT_TYPES.find((c) => c.id === contactType) ?? CONTACT_TYPES[0]!;
  const activeProblem = PROBLEM_TYPES.find((p) => p.id === problemType);

  // Live content moderation on the admin notes. The public
  // `description` field is now picked from a curated suggestion list
  // (see lib/descriptionSuggestions.ts) so it doesn't need filtering.
  // The admin-only free-text field still does — it's never published
  // but we don't want platform-policy violations sitting in our
  // moderation queue either.
  const moderation = useMemo(() => detectUnsafeContent(adminNotes), [adminNotes]);

  const contactValidation = useMemo(
    () => validateContact(contactType, contactValue, country.digits),
    [contactType, contactValue, country.digits],
  );

  const stepValid: Record<Step, boolean> = {
    1: contactValidation.valid,
    2: problemType !== null,
    3: description.trim() !== '' && !moderation.blocked,
    4: evidenceFiles.length > 0,
    5: accepted,
  };

  const canSubmit =
    stepValid[1] &&
    stepValid[2] &&
    stepValid[3] &&
    stepValid[4] &&
    stepValid[5] &&
    phase === 'idle';

  const goNext = () => {
    if (!stepValid[step]) return;
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
  };
  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const next = Array.from(e.target.files).slice(0, MAX_EVIDENCE);
    setEvidenceFiles(next);
  };

  const removeFile = (name: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const reset = () => {
    setStep(1);
    setContactType(CONTACT_TYPES[0]!.id);
    setContactValue('');
    setCountry(DEFAULT_COUNTRY);
    setProblemType(null);
    setAmount('');
    setAccepted(false);
    setDescription('');
    setAdminNotes('');
    setEvidenceFiles([]);
    setPhase('idle');
    scrollToTop();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      goNext();
      return;
    }
    if (!canSubmit) return;
    setPhase('sending');
    setTimeout(() => setPhase('success'), 1200);
  };

  if (phase === 'success') {
    return <SuccessCelebration onAgain={reset} />;
  }

  // Step 0 — language picker (mobile-friendly entry point so users
  // who can't see the header switcher can still pick FR / EN / AR
  // before starting the questionnaire).
  if (!languageConfirmed) {
    const LANGUAGES: { id: typeof locale; flag: string; label: string; native: string }[] = [
      { id: 'fr', flag: '🇫🇷', label: 'Français', native: 'Français' },
      { id: 'en', flag: '🇬🇧', label: 'English',  native: 'English'  },
      { id: 'ar', flag: '🇲🇦', label: 'العربية',  native: 'العربية'  },
    ];
    return (
      <div className="space-y-6 rounded-3xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 md:p-8 shadow-glow-soft animate-fade-in-down">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-2">
            {t('form.languagePicker.title')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('form.languagePicker.subtitle')}
          </p>
        </div>
        <div className="grid gap-2.5 max-w-sm mx-auto">
          {LANGUAGES.map((l) => {
            const isActive = l.id === locale;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLocale(l.id);
                  setLanguageConfirmed(true);
                }}
                className={
                  isActive
                    ? 'group flex items-center gap-3 rounded-2xl bg-brand-navy text-white border border-brand-navy px-4 py-3 text-base font-semibold shadow-glow-navy transition-all'
                    : 'group flex items-center gap-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-gray-200 text-brand-navy hover:border-brand-blue hover:bg-brand-blue/5 hover:-translate-y-px hover:shadow-sm px-4 py-3 text-base font-semibold transition-all'
                }
              >
                <span aria-hidden className="text-2xl leading-none">
                  {l.flag}
                </span>
                <span className="flex-1 text-start">{l.native}</span>
                {isActive && <CheckCircle2 className="h-5 w-5" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-7 rounded-3xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 md:p-8 shadow-glow-soft"
      onSubmit={handleSubmit}
    >
      {/* Small "Change language" link — lets the user reopen step 0
          if they realise they're filling the form in the wrong
          locale. We don't reset the entered values; they remain
          intact across the language change. */}
      <div className="flex justify-end -mt-2 -mr-2">
        <button
          type="button"
          onClick={() => setLanguageConfirmed(false)}
          className="inline-flex items-center gap-1.5 rounded-pill text-xs font-medium text-brand-blue hover:text-brand-navy hover:bg-brand-blue/5 px-2.5 py-1 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" aria-hidden />
          {t('form.languagePicker.change')}
        </button>
      </div>

      <Stepper step={step} />

      {step === 1 && (
      <div className="space-y-6 animate-fade-in-down">
      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
          >
            <Phone className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          {t('form.contactType.label')} <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CONTACT_TYPES.map((c) => {
            const isActive = c.id === contactType;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setContactType(c.id);
                  // Clear the typed value when switching channel so
                  // the user doesn't carry e.g. a phone number into
                  // an email field where the format would be invalid.
                  setContactValue('');
                }}
                className={
                  isActive
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-navy text-white px-3 py-2 text-sm font-medium shadow-glow-navy scale-[1.02] transition-all'
                    : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-gray-200 text-brand-navy px-3 py-2 text-sm font-medium hover:border-brand-blue hover:text-brand-blue hover:-translate-y-0.5 hover:shadow-sm transition-all'
                }
              >
                <c.Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t(c.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="contactValue"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20"
          >
            <activeContact.Icon className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          {t('form.contactValue.label')} <span className="text-red-500">*</span>
        </label>
        {contactType === 'telephone' || contactType === 'whatsapp' ? (
          <div className="flex">
            <CountryCodeSelector
              value={country}
              onChange={(c) => {
                setCountry(c);
                // Truncate any digits already typed beyond the new
                // country's max so we never carry an invalid length
                // across a country switch.
                setContactValue((v) => v.slice(0, c.digits));
              }}
            />
            <input
              id="contactValue"
              name="contactValue"
              type="tel"
              inputMode="numeric"
              value={contactValue}
              onChange={(e) =>
                setContactValue(
                  e.target.value.replace(/\D/g, '').slice(0, country.digits),
                )
              }
              maxLength={country.digits}
              placeholder={country.example}
              className="flex-1 min-w-0 rounded-r-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all"
            />
          </div>
        ) : (
          <input
            id="contactValue"
            name="contactValue"
            type="text"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={t(activeContact.placeholderKey)}
            aria-invalid={
              contactValue.trim() !== '' && !contactValidation.valid
            }
            className={
              contactValue.trim() !== '' && !contactValidation.valid
                ? 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-red-500 ring-2 ring-red-500/20 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:shadow-sm transition-all'
                : 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all'
            }
          />
        )}
        {contactValue.trim() !== '' &&
          !contactValidation.valid &&
          contactValidation.errorKey && (
            <p
              role="alert"
              className="mt-1.5 inline-flex items-start gap-1.5 text-[11px] text-red-600"
            >
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" aria-hidden />
              {t(contactValidation.errorKey)}
            </p>
          )}
      </div>
      </div>
      )}

      {step === 2 && (
      <div className="space-y-6 animate-fade-in-down">
      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
          >
            <AlertTriangle className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          {t('form.problemType.label')} <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROBLEM_TYPES.map((p) => {
            const isActive = p.id === problemType;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setProblemType(p.id)}
                className={
                  isActive
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 text-white px-4 py-2 text-sm font-medium shadow-glow-red scale-[1.02] transition-all'
                    : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-gray-200 text-brand-navy px-4 py-2 text-sm font-medium hover:border-red-500/50 hover:text-red-500 hover:-translate-y-0.5 hover:shadow-sm transition-all'
                }
              >
                <p.Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t(p.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="amount"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-green-500/10 text-green-700 ring-1 ring-green-500/20"
          >
            <WalletIcon className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          {t('form.amount.label')}{' '}
          <span className="text-gray-400 font-normal">{t('form.amount.optional')}</span>
        </label>
        {/* Currency-aware amount input — placeholder example follows
            the active currency. The right-side currency selector lets
            the user pick MAD / EUR / USD inline (it writes through to
            the global CurrencyProvider so the recap step + every
            other amount on the site stay in the chosen unit). */}
        <div className="flex">
          <input
            id="amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Ex : ${placeholderAmount}`}
            className="flex-1 min-w-0 rounded-l-xl bg-white/85 backdrop-blur-sm border border-r-0 border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all"
          />
          <div className="inline-flex items-center rounded-r-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-2">
            <CurrencySwitcher align="end" />
          </div>
        </div>
      </div>
      </div>
      )}

      {step === 3 && (
      <div className="space-y-6 animate-fade-in-down">
        {/* SECTION A — Public phrase, picked from a curated list.
            This is the only text that gets published in the Recent
            Reports feed, so it's locked to the suggestion list to
            avoid defamatory or legally risky wording. */}
        <div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2">
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20"
            >
              <Pencil className="h-3.5 w-3.5 animate-sparkle-pop" />
            </span>
            {t('form.publicPhrase.label')} <span className="text-red-500">*</span>
          </label>

          {(() => {
            const suggestions = getDescriptionSuggestions(
              problemType as ProblemId | null,
              locale,
              amount,
              currencySymbol,
            );
            if (suggestions.length === 0) {
              return (
                <p className="rounded-xl bg-white/60 border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-500">
                  {t('form.publicPhrase.empty')}
                </p>
              );
            }
            return (
              <div className="space-y-1.5">
                {suggestions.map((s) => {
                  const isActive = description === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDescription(s)}
                      aria-pressed={isActive}
                      className={
                        isActive
                          ? 'group w-full flex items-start gap-2 rounded-xl bg-violet-500 text-white border border-violet-500 px-3 py-2.5 text-sm font-medium shadow-glow-soft text-start transition-all'
                          : 'group w-full flex items-start gap-2 rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 text-brand-navy hover:border-violet-500 hover:bg-violet-500/5 hover:-translate-y-px hover:shadow-sm px-3 py-2.5 text-sm font-medium text-start transition-all'
                      }
                    >
                      <span
                        aria-hidden
                        className={
                          isActive
                            ? 'mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-violet-500 shrink-0'
                            : 'mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-violet-500 shrink-0'
                        }
                      >
                        {isActive && <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <span className="flex-1 leading-snug">{s}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <p className="mt-2 text-[11px] text-gray-500">
            {t('form.publicPhrase.note')}
          </p>
        </div>

        {/* SECTION B — Admin-only free text. Never published. */}
        <div>
          <label
            htmlFor="adminNotes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
          >
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/20"
            >
              <Lock className="h-3.5 w-3.5 animate-sparkle-pop" />
            </span>
            {t('form.adminNotes.label')}
            <span className="text-gray-400 font-normal tabular-nums ml-auto">
              ({adminNotes.length}/500)
            </span>
          </label>
          <textarea
            id="adminNotes"
            name="adminNotes"
            rows={5}
            maxLength={500}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={t('form.adminNotes.placeholder')}
            aria-invalid={moderation.blocked}
            aria-describedby={moderation.blocked ? 'admin-notes-moderation' : 'admin-notes-hint'}
            className={
              moderation.blocked
                ? 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-red-500 ring-2 ring-red-500/20 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:shadow-sm transition-all resize-y'
                : 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all resize-y'
            }
          />
          {moderation.blocked ? (
            <div
              id="admin-notes-moderation"
              role="alert"
              className="mt-2 rounded-xl border border-red-500/30 bg-red-50 px-3 py-2.5 text-xs text-red-700 space-y-1.5"
            >
              <p className="font-semibold flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden />
                {t('form.moderation.message')}
              </p>
              <p className="text-red-700/80">{t('form.moderation.hint')}</p>
              <p className="text-red-700/60">
                {t(
                  moderation.matchedWords.length > 1
                    ? 'form.description.detected.plural'
                    : 'form.description.detected.singular',
                )}{' '}
                <span className="font-mono font-semibold">
                  {moderation.matchedWords.join(', ')}
                </span>
              </p>
            </div>
          ) : (
            <p id="admin-notes-hint" className="mt-2 text-[11px] text-gray-500">
              {t('form.adminNotes.hint')}
            </p>
          )}
        </div>
      </div>
      )}

      {step === 4 && (
      <div className="animate-fade-in-down">
        <label
          htmlFor="evidence"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-sky-400/15 text-sky-400 ring-1 ring-sky-400/30"
          >
            <Paperclip className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          {t('form.evidence.label')} <span className="text-red-500">*</span>
        </label>

        <input
          id="evidence"
          name="evidence"
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={handleFiles}
          className="sr-only"
        />

        <label
          htmlFor="evidence"
          className="group block rounded-xl border-2 border-dashed border-brand-blue/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-brand-blue/60 px-4 py-8 text-center text-sm text-gray-500 transition-all cursor-pointer"
        >
          <UploadCloud className="mx-auto h-9 w-9 mb-2 text-brand-blue/70 group-hover:text-brand-blue group-hover:scale-110 group-hover:animate-sparkle-pop transition-all" aria-hidden />
          <p className="text-brand-navy/80 font-medium">{t('form.evidence.cta')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('form.evidence.hint')}</p>
          <p className="mt-2 text-[10px] text-gray-400">
            {t('form.evidence.types', { n: MAX_EVIDENCE })}
          </p>
        </label>

        {evidenceFiles.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {evidenceFiles.map((f) => (
              <li
                key={f.name}
                className="inline-flex items-center gap-2 rounded-pill bg-white/85 backdrop-blur-sm border border-brand-blue/30 px-3 py-1.5 text-xs font-medium text-brand-navy shadow-sm"
              >
                <Paperclip className="h-3 w-3 text-brand-blue" aria-hidden />
                <span className="max-w-[14ch] truncate" title={f.name}>
                  {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(f.name)}
                  className="-mr-1 inline-flex items-center justify-center h-5 w-5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={t('form.evidence.removeLabel', { name: f.name })}
                >
                  <XIcon className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      {step === 5 && (
      <div className="space-y-5 animate-fade-in-down">
        <h3 className="text-base font-bold text-brand-navy">
          {t('form.recap.title')}
        </h3>

        <dl className="grid gap-3 rounded-2xl bg-white/70 border border-white/80 p-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20 shrink-0">
              <activeContact.Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-semibold text-gray-500">
                {t(activeContact.labelKey)}
              </dt>
              <dd className="font-medium text-brand-navy break-words">
                {contactValue ? (
                  contactType === 'telephone' || contactType === 'whatsapp'
                    ? `${country.dial} ${contactValue}`
                    : contactValue
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-red-500/10 text-red-500 ring-1 ring-red-500/20 shrink-0">
              {activeProblem ? (
                <activeProblem.Icon className="h-4 w-4" aria-hidden />
              ) : (
                <AlertTriangle className="h-4 w-4" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-semibold text-gray-500">
                {t('form.problemType.label')}
              </dt>
              <dd className="font-medium text-brand-navy">
                {activeProblem ? t(activeProblem.labelKey) : <span className="text-gray-400">—</span>}
              </dd>
            </div>
          </div>

          {amount.trim() !== '' && (
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-green-500/10 text-green-700 ring-1 ring-green-500/20 shrink-0">
                <WalletIcon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold text-gray-500">
                  {t('form.amount.label')}
                </dt>
                <dd className="font-medium text-brand-navy">
                  {amount} {currencySymbol}
                </dd>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20 shrink-0">
              <Pencil className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-semibold text-gray-500">
                {t('form.publicPhrase.label')}
              </dt>
              <dd className="text-brand-navy whitespace-pre-wrap break-words">
                {description || <span className="text-gray-400">—</span>}
              </dd>
            </div>
          </div>

          {adminNotes.trim() !== '' && (
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/20 shrink-0">
                <Lock className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold text-gray-500">
                  {t('form.adminNotes.label')}{' '}
                  <span className="font-normal text-gray-400">
                    {t('form.adminNotes.recapHelper')}
                  </span>
                </dt>
                <dd className="text-brand-navy whitespace-pre-wrap break-words">
                  {adminNotes}
                </dd>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-sky-400/15 text-sky-400 ring-1 ring-sky-400/30 shrink-0">
              <Paperclip className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-semibold text-gray-500">
                {t('form.evidence.label')} ({evidenceFiles.length})
              </dt>
              <dd className="font-medium text-brand-navy">
                {evidenceFiles.length === 0 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <ul className="flex flex-wrap gap-1.5 mt-1">
                    {evidenceFiles.map((f) => (
                      <li
                        key={f.name}
                        className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-brand-blue/30 px-2 py-1 text-xs"
                      >
                        <Paperclip className="h-3 w-3 text-brand-blue" aria-hidden />
                        <span className="max-w-[14ch] truncate" title={f.name}>
                          {f.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </div>
        </dl>

        <label
          htmlFor="accept"
          className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer rounded-xl bg-white/60 border border-white/70 p-3 hover:bg-white/80 transition-colors"
        >
          <input
            type="checkbox"
            id="accept"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded accent-red-500 cursor-pointer"
          />
          <span>
            {t('form.consent.intro')}{' '}
            <span className="font-semibold text-brand-navy">{t('form.consent.rules')}</span>{' '}
            {t('form.consent.suffix')}
          </span>
        </label>
      </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-white/85 hover:bg-white border border-white/80 hover:border-brand-blue/40 text-brand-navy px-5 py-2.5 text-sm font-semibold shadow-sm transition-all"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t('form.nav.prev')}
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!stepValid[step]}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-navy enabled:hover:bg-brand-blue text-white px-6 py-3 text-sm font-semibold shadow-glow-navy enabled:hover:shadow-glow-blue enabled:hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {t('form.nav.next')}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 enabled:hover:bg-red-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-red enabled:animate-alert-pulse enabled:hover:scale-[1.02] enabled:hover:[animation-play-state:paused] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {phase === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t('form.submit.sending')}
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4 enabled:animate-siren-wiggle" aria-hidden />
                {t('form.submit')}
              </>
            )}
          </button>
        )}
      </div>

      {step === TOTAL_STEPS && (
        <p className="text-xs text-gray-400 text-center">{t('form.disabledNote')}</p>
      )}
    </form>
  );
}

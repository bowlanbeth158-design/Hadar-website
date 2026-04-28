'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  Globe,
  AtSign,
  Wallet,
  Coins,
  Search,
  Mic,
  MicOff,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { SearchResult } from './SearchResult';
import { useI18n } from '@/lib/i18n/provider';
import { OFFICIAL_LOGO_URL } from './Logo';
import { CountUp } from './CountUp';

type ContactType = {
  id: string;
  // i18n keys — resolved at render time so the row reflects the
  // active locale.
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

// Per-contact-type validators — if the user picks "Email" then types
// a phone number (or vice versa), the form refuses to submit and an
// inline error is shown. Patterns are intentionally permissive so we
// don't block valid Moroccan / international variants.
const VALIDATORS: Record<string, RegExp> = {
  telephone:       /^[0-9+\s().-]{6,}$/,
  whatsapp:        /^[0-9+\s().-]{6,}$/,
  email:           /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  rib:             /^[0-9\s-]{20,28}$/,
  site_web:        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w./?#@&%=+-]*)?$/i,
  reseaux_sociaux: /^@?[\w._-]{2,}$/,
  paypal:          /^([^\s@]+@[^\s@]+\.[^\s@]+|[\w.-]{3,})$/,
  binance:         /^[\w@.-]{3,}$/,
};

function isValidContactValue(type: string, value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const regex = VALIDATORS[type];
  return regex ? regex.test(v) : true;
}

type Props = {
  initialType?: string;
  initialQuery?: string;
};

type SpeechRecognitionResult = { transcript: string };
type SpeechRecognitionEventLike = {
  results: { [i: number]: { [j: number]: SpeechRecognitionResult } };
};
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function HomeHero({ initialType, initialQuery = '' }: Props) {
  const defaultType =
    initialType && CONTACT_TYPES.some((c) => c.id === initialType) ? initialType : CONTACT_TYPES[0]!.id;
  const [selected, setSelected] = useState<string>(defaultType);
  const [inputValue, setInputValue] = useState<string>(initialQuery);
  const [submitted, setSubmitted] = useState<{ query: string; type: string } | null>(
    initialQuery ? { query: initialQuery, type: defaultType } : null,
  );
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Format error: shown inline when the typed value doesn't match
  // the active contact type's regex (e.g. typing a phone number
  // while "Email" is selected). Cleared on type or input change.
  const [formatError, setFormatError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Live active-users counter — drifts between 20 and 65, updates every 5s.
  // Seeded at 27 so SSR and first client render match (no hydration mismatch).
  const [activeUsers, setActiveUsers] = useState(27);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2..+2 logical drift
        const next = prev + change;
        return Math.max(20, Math.min(65, next));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { t } = useI18n();
  const active = CONTACT_TYPES.find((c) => c.id === selected) ?? CONTACT_TYPES[0]!;
  const activeLabel = t(active.labelKey);
  const activePlaceholder = t(active.placeholderKey);
  const trimmedInput = inputValue.trim();

  // Result visible only if a search was submitted AND the input still matches it
  const showResult =
    submitted !== null &&
    submitted.query !== '' &&
    trimmedInput === submitted.query &&
    selected === submitted.type;

  const syncUrl = (query: string, type: string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
      params.set('type', type);
    }
    const target = params.toString() ? `/?${params.toString()}` : '/';
    window.history.replaceState(null, '', target);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trimmedInput) {
      setSubmitted(null);
      setFormatError(null);
      syncUrl('', selected);
      return;
    }
    if (!isValidContactValue(selected, trimmedInput)) {
      // Surface a localised error mentioning the active contact type
      // + an example placeholder so the user knows what's expected.
      setFormatError(
        t('home.hero.error.format', {
          type: activeLabel,
          example: activePlaceholder,
        }),
      );
      setSubmitted(null);
      return;
    }
    setFormatError(null);
    setSubmitted({ query: trimmedInput, type: selected });
    syncUrl(trimmedInput, selected);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    if (formatError) setFormatError(null);
    if (!v.trim() && submitted) {
      setSubmitted(null);
      syncUrl('', selected);
    }
  };

  // Selecting a different contact type clears any previous format
  // error so the user isn't shown a stale message about the wrong type.
  useEffect(() => {
    setFormatError(null);
  }, [selected]);

  const toggleMic = () => {
    setError(null);
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError(t('home.hero.voice.unsupported'));
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setError(t('home.hero.voice.error'));
      setListening(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setInputValue(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      {/* Section uses a fully-transparent top edge that fades into a
          solid sky-tinted band, then resolves to white well before the
          verification card. The transparent strip lets the banner's
          body wash continue uninterrupted into the section so there's
          no visible seam where one section ends and the next begins.
          `isolate` still creates the new stacking context that keeps
          the body's fixed corner blobs from bleeding through onto the
          verification card. */}
      <section
        id="recherche"
        className="relative scroll-mt-24 overflow-hidden isolate"
      >
        {/* Soft transition layer — anchored to the top of the section
            but starting fully TRANSPARENT so there is no hard colour step
            at the boundary with the banner above. The sky tint ramps up
            gradually, peaks roughly in the middle of the band, then fades
            back out before the verification card so the eye reads it as
            a gentle wash rather than a "line". h-[26rem] gives the
            gradient enough vertical space to breathe; both endpoints stay
            transparent so any underlying body wash bleeds through cleanly.
            Sits above the body but below the section content. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 inset-x-0 h-[26rem] bg-gradient-to-b from-transparent via-brand-sky/30 to-transparent -z-10"
        />

        {/* Static background — only a centered subtle grid, no side blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #29AAE1 1px, transparent 1px), linear-gradient(to bottom, #29AAE1 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-[1440px] px-4 md:px-6 pt-14 md:pt-20 pb-10 md:pb-14">
          {/* Spotlight card */}
          <div className="relative mx-auto w-full">
            {/* Card body — soft uniform sky gradient over the whole card so the
                left and right sides feel identical (matches the airy right-side
                tint the owner asked for, applied edge-to-edge). */}
            <div
              className="relative rounded-[2rem] bg-gradient-to-br from-white via-brand-sky/30 to-brand-sky/50 ring-1 ring-brand-sky/70 shadow-[0_10px_40px_-10px_rgb(41_170_225_/_0.18)] px-5 md:px-12 lg:px-16 py-12 md:py-16 text-center overflow-hidden"
            >
              {/* Subtle inner dot pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: 'radial-gradient(#29AAE1 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  maskImage:
                    'radial-gradient(ellipse at center, black 35%, transparent 85%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse at center, black 35%, transparent 85%)',
                }}
                aria-hidden
              />

              {/* Top-right floating live counter — dynamic active-users drift,
                  brand-blue palette to match the rest of the section. */}
              <div className="hidden md:flex absolute top-5 right-5 z-10 items-center gap-2 rounded-pill bg-white/85 backdrop-blur-md border border-brand-blue/40 px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live ·{' '}
                <span className="bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-transparent tabular-nums">
                  {activeUsers} utilisateurs actifs
                </span>
              </div>

              {/* Bottom-left floating monthly counter — animated CountUp,
                  rolling 30-day window wording with a vertical-bar separator. */}
              <div className="hidden md:flex absolute bottom-5 left-5 z-10 items-center gap-2 rounded-pill bg-white/85 backdrop-blur-md border border-brand-blue/40 px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-blue animate-sparkle-pop" aria-hidden />
                <span>
                  <span className="bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-transparent tabular-nums">
                    +<CountUp to={12408} duration={1800} />
                  </span>
                  <span className="mx-1.5 text-gray-300" aria-hidden>|</span>
                  {t('home.hero.statsPill.thirtyDays')}
                </span>
              </div>

              {/* Decorative corner brackets */}
              <span className="pointer-events-none absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-brand-blue/40 rounded-tl-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-brand-blue/40 rounded-tr-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-brand-blue/40 rounded-bl-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-brand-blue/40 rounded-br-[2rem]" aria-hidden />

              {/* Real content (kept above all decorations) */}
              <div className="relative z-[1]">
                {/* Brand pill — same shimmer + animated logo + brand-sky
                    gradient as the banner pill, just renamed to "La plateforme N°1". */}
                <div className="inline-flex flex-col">
                  <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/70 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-4 py-1.5 text-xs md:text-sm font-semibold shadow-sm overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={OFFICIAL_LOGO_URL}
                      alt=""
                      aria-hidden
                      className="h-4 w-4 object-contain animate-sparkle-pop drop-shadow"
                    />
                    <span className="relative z-10">
                      {t('home.hero.spotlightPill')}
                    </span>
                    {/* Shimmer light passing across the pill background */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
                    />
                  </span>
                </div>

                <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-brand-navy leading-tight">
                  {t('home.hero.spotlightH2.prefix')}{' '}
                  <span className="bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent">
                    {t('home.hero.spotlightH2.highlight')}
                  </span>
                  <span
                    className="block mx-auto mt-2 h-1 w-32 md:w-48 rounded-full bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 opacity-70"
                    aria-hidden
                  />
                </h2>

                <p className="mt-4 mx-auto max-w-2xl text-sm md:text-base text-gray-500">
                  {t('home.hero.spotlightSubtitle')}
                </p>

                <div
                  role="tablist"
                  aria-label={t('home.hero.contactType.aria')}
                  className="mt-8 mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3"
                >
                  {CONTACT_TYPES.map((f) => {
                    const isActive = f.id === selected;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelected(f.id)}
                        className={
                          isActive
                            ? 'group/pill w-full inline-flex items-center justify-center gap-2 rounded-pill bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white px-4 py-2.5 text-sm font-medium shadow-glow-navy scale-[1.04] transition-all duration-300 ease-out ring-2 ring-brand-blue/30'
                            : 'group/pill w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-2.5 text-sm font-medium hover:border-brand-blue hover:text-brand-blue hover:-translate-y-0.5 hover:shadow-glow-soft hover:scale-[1.02] transition-all duration-300 ease-out'
                        }
                      >
                        <f.Icon
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                            isActive ? 'animate-sparkle-pop' : 'group-hover/pill:scale-110'
                          }`}
                          aria-hidden
                        />
                        <span className="truncate">{t(f.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>

                <form
                  role="search"
                  action="/"
                  method="get"
                  onSubmit={handleSubmit}
                  className={`mt-8 mx-auto max-w-3xl flex items-center gap-2 rounded-pill bg-white border-2 ${
                    formatError
                      ? 'border-red-500 ring-4 ring-red-500/15'
                      : 'border-gray-200 hover:border-brand-blue/50 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/15 focus-within:shadow-glow-blue'
                  } shadow-sm pl-5 pr-1 py-1 transition-all duration-300`}
                >
                  <Search className="h-5 w-5 text-gray-400" aria-hidden />
                  <input type="hidden" name="type" value={selected} />
                  <input
                    type="search"
                    name="q"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={activePlaceholder}
                    aria-label={t('home.hero.search.aria', { label: activeLabel.toLowerCase() })}
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 py-2.5 text-base"
                  />
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={!supported}
                    aria-label={listening ? t('home.hero.voice.stop') : t('home.hero.voice.start')}
                    aria-pressed={listening}
                    title={supported ? (listening ? t('home.hero.voice.stop') : t('home.hero.voice.start')) : t('home.hero.voice.unsupported')}
                    className={
                      listening
                        ? 'relative p-2 text-red-500 animate-pulse'
                        : 'p-2 text-gray-400 hover:text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed'
                    }
                  >
                    {listening ? (
                      <>
                        <Mic className="h-5 w-5" aria-hidden />
                        <span
                          aria-hidden
                          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping"
                        />
                      </>
                    ) : supported ? (
                      <Mic className="h-5 w-5" aria-hidden />
                    ) : (
                      <MicOff className="h-5 w-5" aria-hidden />
                    )}
                  </button>
                  <button
                    type="submit"
                    className="relative rounded-pill bg-gradient-to-r from-green-500 to-green-700 hover:from-green-700 hover:to-green-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 text-sm shadow-glow-green animate-verify-pulse hover:scale-[1.04] hover:[animation-play-state:paused] transition-all duration-300 ease-out"
                  >
                    <span className="relative z-10">{t('home.hero.cta.verifyNow')}</span>
                    {/* Diagonal shimmer light passes across the button on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] opacity-0 hover:opacity-100 hover:animate-shimmer rounded-pill"
                    />
                  </button>
                </form>

                {formatError && (
                  <p
                    className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-red-50 border border-red-200 px-3 py-1.5 text-xs md:text-sm font-medium text-red-700 animate-fade-in-down"
                    role="alert"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {formatError}
                  </p>
                )}
                {error && !formatError && (
                  <p className="mt-3 text-sm text-red-500" role="status">
                    {error}
                  </p>
                )}
                {listening && !error && !formatError && (
                  <p className="mt-3 text-sm text-brand-blue" role="status">
                    {t('home.hero.voice.listening')}
                  </p>
                )}

                {/* Trust strip — brand-navy palette, animated icons matching
                    the banner's sparkle-pop rhythm. */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs md:text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky text-brand-navy shadow-sm border border-brand-blue/30">
                      <ShieldCheck className="h-4 w-4 drop-shadow animate-sparkle-pop" aria-hidden />
                    </span>
                    {t('home.hero.trust.encrypted')}
                  </span>
                  <span className="text-gray-200" aria-hidden>·</span>
                  <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky text-brand-navy shadow-sm border border-brand-blue/30">
                      <Zap className="h-4 w-4 drop-shadow animate-sparkle-pop" aria-hidden />
                    </span>
                    {t('home.hero.trust.instant')}
                  </span>
                  <span className="text-gray-200" aria-hidden>·</span>
                  <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                    <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky text-brand-navy text-xs font-bold shadow-sm border border-brand-blue/30 px-1.5 animate-sparkle-pop">
                      8
                    </span>
                    {t('home.hero.trust.channels')}
                  </span>
                </div>

                {showResult && (
                  <SearchResult
                    query={submitted!.query}
                    contactType={submitted!.type}
                    onAgain={() => {
                      // Clear the typed query + collapse the result, then
                      // scroll the search section back into view and focus
                      // the input so the user can launch the next search
                      // without scrolling.
                      setInputValue('');
                      setSubmitted(null);
                      setFormatError(null);
                      syncUrl('', selected);
                      if (typeof window !== 'undefined') {
                        const target = document.getElementById('recherche');
                        if (target) {
                          const y =
                            target.getBoundingClientRect().top + window.scrollY - 88;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                        // Focus the search input after the scroll completes.
                        setTimeout(() => {
                          const input = document.querySelector<HTMLInputElement>(
                            'input[name="q"]',
                          );
                          input?.focus();
                        }, 600);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

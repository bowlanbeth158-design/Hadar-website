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
  type LucideIcon,
} from 'lucide-react';
import { SearchResult } from './SearchResult';

type ContactType = {
  id: string;
  label: string;
  Icon: LucideIcon;
  placeholder: string;
};

const CONTACT_TYPES: ContactType[] = [
  { id: 'telephone', label: 'Téléphone', Icon: Phone, placeholder: 'Ex : 212 6 00 00 00 00' },
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, placeholder: 'Ex : 212 6 00 00 00 00' },
  { id: 'email', label: 'Email', Icon: Mail, placeholder: 'Ex : contact@exemple.com' },
  { id: 'rib', label: 'RIB', Icon: CreditCard, placeholder: 'Ex : 24 chiffres sans espaces' },
  { id: 'site_web', label: 'Site web', Icon: Globe, placeholder: 'Ex : https://exemple.com' },
  { id: 'reseaux_sociaux', label: 'Réseaux sociaux', Icon: AtSign, placeholder: 'Ex : @pseudo' },
  { id: 'paypal', label: 'PayPal', Icon: Wallet, placeholder: 'Ex : paypal@exemple.com' },
  { id: 'binance', label: 'Binance', Icon: Coins, placeholder: 'Ex : identifiant ou email' },
];

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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const active = CONTACT_TYPES.find((c) => c.id === selected) ?? CONTACT_TYPES[0]!;
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
      syncUrl('', selected);
      return;
    }
    setSubmitted({ query: trimmedInput, type: selected });
    syncUrl(trimmedInput, selected);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    if (!v.trim() && submitted) {
      setSubmitted(null);
      syncUrl('', selected);
    }
  };

  const toggleMic = () => {
    setError(null);
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError('Recherche vocale non supportée sur ce navigateur.');
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
      setError('Micro indisponible ou permission refusée.');
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
      <section
        id="recherche"
        className="relative scroll-mt-24 overflow-hidden"
      >
        {/* Animated background — floating cool-blue blobs + subtle grid */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl animate-float-soft" />
          <div
            className="absolute top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-400/25 blur-3xl animate-float-soft"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-brand-sky/30 blur-3xl animate-float-soft"
            style={{ animationDelay: '0.8s' }}
          />
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
            {/* Outer pulsing halo */}
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sky-400/30 via-brand-sky/40 to-sky-400/30 blur-3xl opacity-70 animate-pulse"
              style={{ animationDuration: '4.5s' }}
              aria-hidden
            />

            {/* Rotating conic-gradient border ring */}
            <div className="absolute -inset-[2px] rounded-[2.05rem] overflow-hidden" aria-hidden>
              <div
                className="absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 230deg, rgba(41, 170, 225, 0.45) 260deg, rgba(41, 170, 225, 0.85) 295deg, rgba(41, 170, 225, 0.45) 330deg, transparent 360deg)',
                }}
              />
            </div>

            {/* Card body */}
            <div className="relative rounded-[2rem] bg-white/92 backdrop-blur-xl shadow-glow-blue px-5 md:px-12 lg:px-16 py-12 md:py-16 text-center overflow-hidden">
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

              {/* Diagonal light beam sweeping across the card */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div
                  className="absolute -inset-y-10 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent skew-x-[-20deg] animate-shimmer"
                  style={{ animationDuration: '7s' }}
                />
              </div>

              {/* Top-right floating live counter */}
              <div className="hidden md:flex absolute top-5 right-5 z-10 items-center gap-2 rounded-pill bg-white/85 backdrop-blur-md border border-sky-400/40 px-3 py-1.5 text-xs font-semibold text-brand-blue/80 shadow-glow-soft animate-float-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live · <span className="bg-gradient-to-r from-sky-400 to-brand-blue/70 bg-clip-text text-transparent">2 vérif/s</span>
              </div>

              {/* Bottom-left floating monthly counter */}
              <div
                className="hidden md:flex absolute bottom-5 left-5 z-10 items-center gap-2 rounded-pill bg-white/85 backdrop-blur-md border border-sky-400/40 px-3 py-1.5 text-xs font-semibold text-brand-blue/80 shadow-glow-soft animate-float-soft"
                style={{ animationDelay: '1.2s' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-sparkle-pop" aria-hidden />
                <span>
                  <span className="bg-gradient-to-r from-sky-400 to-brand-blue/70 bg-clip-text text-transparent">
                    +12 408
                  </span>{' '}
                  ce mois
                </span>
              </div>

              {/* Decorative corner brackets */}
              <span className="pointer-events-none absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-sky-400/40 rounded-tl-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-sky-400/40 rounded-tr-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-sky-400/40 rounded-bl-[2rem]" aria-hidden />
              <span className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-sky-400/40 rounded-br-[2rem]" aria-hidden />

              {/* Real content (kept above all decorations) */}
              <div className="relative z-[1]">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-sky-400/15 via-brand-sky/30 to-sky-400/15 border border-brand-blue/25 px-4 py-1.5 text-xs md:text-sm font-semibold text-brand-blue">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                Outil n°1 de vérification au Maroc
                <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-sparkle-pop" aria-hidden />
              </div>

              <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-sky-400 [text-shadow:0_2px_8px_rgb(41_170_225_/_0.25)]">
                Lancez votre vérification
                <span
                  className="block mx-auto mt-2 h-1 w-32 md:w-48 rounded-full bg-sky-400/60"
                  aria-hidden
                />
              </h2>

              <p className="mt-4 mx-auto max-w-2xl text-sm md:text-base text-gray-500">
                Choisissez le type de contact puis recherchez un numéro, un email, un site web ou un
                moyen de paiement pour vérifier s&apos;il a déjà été signalé.
              </p>

              <div
                role="tablist"
                aria-label="Type de contact à rechercher"
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
                          ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-gradient-to-r from-brand-blue to-brand-blue text-white px-4 py-2.5 text-sm font-medium shadow-glow-blue scale-[1.02] transition-all'
                          : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-blue px-4 py-2.5 text-sm font-medium hover:border-brand-blue hover:-translate-y-0.5 hover:shadow-glow-soft transition-all'
                      }
                    >
                      <f.Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{f.label}</span>
                    </button>
                  );
                })}
              </div>

              <form
                role="search"
                action="/"
                method="get"
                onSubmit={handleSubmit}
                className="mt-8 mx-auto max-w-3xl flex items-center gap-2 rounded-pill bg-white border-2 border-brand-blue/20 hover:border-brand-blue/40 focus-within:border-brand-blue focus-within:shadow-glow-blue shadow-glow-soft pl-5 pr-1 py-1 transition-all"
              >
                <Search className="h-5 w-5 text-brand-blue" aria-hidden />
                <input type="hidden" name="type" value={selected} />
                <input
                  type="search"
                  name="q"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={active.placeholder}
                  aria-label={`Rechercher un ${active.label.toLowerCase()}`}
                  className="flex-1 bg-transparent outline-none text-brand-blue placeholder:text-gray-400 py-2.5 text-base"
                />
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={!supported}
                  aria-label={listening ? 'Arrêter la recherche vocale' : 'Démarrer la recherche vocale'}
                  aria-pressed={listening}
                  title={supported ? (listening ? 'Arrêter' : 'Recherche vocale') : 'Non supporté'}
                  className={
                    listening
                      ? 'relative p-2 text-red-500 animate-pulse'
                      : 'p-2 text-gray-400 hover:text-brand-blue disabled:opacity-40 disabled:cursor-not-allowed'
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
                  className="relative rounded-pill bg-gradient-to-r from-green-500 to-green-700 hover:from-green-700 hover:to-green-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 text-sm shadow-glow-green animate-verify-pulse transition-all"
                >
                  Vérifier maintenant
                </button>
              </form>

              {error && (
                <p className="mt-3 text-sm text-red-500" role="status">
                  {error}
                </p>
              )}
              {listening && !error && (
                <p className="mt-3 text-sm text-brand-blue" role="status">
                  Écoute en cours — parlez maintenant…
                </p>
              )}

              {/* Trust strip */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs md:text-sm text-gray-500">
                <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-sky-400/40 to-brand-sky text-brand-blue shadow-glow-soft border border-sky-400/40">
                    <ShieldCheck className="h-4 w-4 animate-sparkle-pop drop-shadow" aria-hidden />
                  </span>
                  Données chiffrées
                </span>
                <span className="text-gray-200" aria-hidden>·</span>
                <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-sky-400/40 to-brand-sky text-brand-blue shadow-glow-soft border border-sky-400/40">
                    <Zap className="h-4 w-4 animate-sparkle-pop drop-shadow" aria-hidden />
                  </span>
                  Résultat instantané
                </span>
                <span className="text-gray-200" aria-hidden>·</span>
                <span className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gradient-to-br from-brand-sky via-sky-400/40 to-brand-sky text-brand-blue text-xs font-bold shadow-glow-soft border border-sky-400/40 animate-sparkle-pop px-1.5">
                    8
                  </span>
                  canaux couverts
                </span>
              </div>

              {showResult && <SearchResult query={submitted!.query} />}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

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
        className="mx-auto max-w-[1440px] px-4 md:px-6 pt-10 md:pt-14 pb-4 text-center scroll-mt-24"
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-navy">
          Lancez votre vérification
        </h2>
        <p className="mt-3 mx-auto max-w-2xl text-sm md:text-base text-gray-500">
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
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-2.5 text-sm font-medium shadow-glow-navy'
                    : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-2.5 text-sm font-medium hover:border-brand-blue transition-colors'
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
          className="mt-8 mx-auto max-w-3xl flex items-center gap-2 rounded-pill bg-white border border-gray-200 shadow-glow-soft pl-5 pr-1 py-1"
        >
          <Search className="h-5 w-5 text-gray-400" aria-hidden />
          <input type="hidden" name="type" value={selected} />
          <input
            type="search"
            name="q"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={active.placeholder}
            aria-label={`Rechercher un ${active.label.toLowerCase()}`}
            className="flex-1 bg-transparent outline-none text-brand-navy placeholder:text-gray-400 py-2 text-base"
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
            className="rounded-pill bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-2.5 text-sm shadow-glow-green transition-all"
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
      </section>

      {showResult && <SearchResult query={submitted!.query} />}
    </>
  );
}

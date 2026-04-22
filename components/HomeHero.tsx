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
  const [listening, setListening] = useState(false);
  const [query, setQuery] = useState<string>(initialQuery);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  const active = CONTACT_TYPES.find((c) => c.id === selected) ?? CONTACT_TYPES[0]!;

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
      if (transcript) setQuery(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <section className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-14 pb-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-navy">
        Avant d&apos;acheter, vérifiez.
      </h1>
      <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-gray-500">
        Recherchez un numéro, un email, un site web ou un moyen de paiement pour vérifier s&apos;il
        a déjà été signalé.
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
                  ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-2.5 text-sm font-medium shadow-sm'
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
        className="mt-8 mx-auto max-w-3xl flex items-center gap-2 rounded-pill bg-white border border-gray-200 shadow-sm pl-5 pr-1 py-1"
      >
        <Search className="h-5 w-5 text-gray-400" aria-hidden />
        <input type="hidden" name="type" value={selected} />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          className="rounded-pill bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
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
  );
}

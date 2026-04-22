'use client';

import { useState } from 'react';
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

export function HomeHero({ initialType, initialQuery = '' }: Props) {
  const defaultType =
    initialType && CONTACT_TYPES.some((c) => c.id === initialType) ? initialType : CONTACT_TYPES[0]!.id;
  const [selected, setSelected] = useState<string>(defaultType);
  const active = CONTACT_TYPES.find((c) => c.id === selected) ?? CONTACT_TYPES[0]!;

  return (
    <section className="mx-auto max-w-5xl px-4 md:px-6 pt-12 md:pt-20 pb-6 text-center">
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
          defaultValue={initialQuery}
          placeholder={active.placeholder}
          aria-label={`Rechercher un ${active.label.toLowerCase()}`}
          className="flex-1 bg-transparent outline-none text-brand-navy placeholder:text-gray-400 py-2 text-base"
        />
        <button
          type="button"
          aria-label="Recherche vocale"
          className="p-2 text-gray-400 hover:text-brand-navy"
        >
          <Mic className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="submit"
          className="rounded-pill bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
        >
          Vérifier maintenant
        </button>
      </form>
    </section>
  );
}

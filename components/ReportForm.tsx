'use client';

import { useState } from 'react';
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
  Paperclip,
  type LucideIcon,
} from 'lucide-react';

type ContactType = {
  id: string;
  label: string;
  placeholder: string;
  Icon: LucideIcon;
};

const CONTACT_TYPES: ContactType[] = [
  { id: 'telephone', label: 'Téléphone', placeholder: 'Ex : 212 6 00 00 00 00', Icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: 'Ex : 212 6 00 00 00 00', Icon: MessageCircle },
  { id: 'email', label: 'Email', placeholder: 'Ex : contact@exemple.com', Icon: Mail },
  { id: 'rib', label: 'RIB', placeholder: 'Ex : 24 chiffres sans espaces', Icon: CreditCard },
  { id: 'site_web', label: 'Site web', placeholder: 'Ex : https://exemple.com', Icon: Globe },
  { id: 'reseaux_sociaux', label: 'Réseaux sociaux', placeholder: 'Ex : @pseudo', Icon: AtSign },
  { id: 'paypal', label: 'PayPal', placeholder: 'Ex : paypal@exemple.com', Icon: Wallet },
  { id: 'binance', label: 'Binance', placeholder: 'Ex : identifiant ou email', Icon: Coins },
];

type ProblemType = { id: string; label: string; Icon: LucideIcon };

const PROBLEM_TYPES: ProblemType[] = [
  { id: 'non_livraison',          label: 'Non livraison',           Icon: PackageX      },
  { id: 'bloque_apres_paiement',  label: 'Bloqué après paiement',   Icon: Ban           },
  { id: 'produit_non_conforme',   label: 'Produit non conforme',    Icon: AlertTriangle },
  { id: 'usurpation_identite',    label: "Usurpation d'identité",   Icon: VenetianMask  },
];

export function ReportForm() {
  const [contactType, setContactType] = useState<string>(CONTACT_TYPES[0]!.id);
  const [problemType, setProblemType] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [description, setDescription] = useState('');

  const activeContact = CONTACT_TYPES.find((c) => c.id === contactType) ?? CONTACT_TYPES[0]!;
  const canSubmit = accepted && problemType !== null;

  return (
    <form
      // Width is governed by the parent wrapper (max-w-3xl on /signaler).
      // Removing the inline max-w-2xl lets the form match the trust-pills
      // row above as the owner asked.
      className="space-y-7 rounded-3xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 md:p-8 shadow-glow-soft"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Type de contact — owner asked for a strict 4 × 2 grid so each
          row holds exactly four pills of equal width. */}
      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
          >
            <Phone className="h-3.5 w-3.5" />
          </span>
          Type de contact <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CONTACT_TYPES.map((t) => {
            const isActive = t.id === contactType;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setContactType(t.id)}
                className={
                  isActive
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-brand-navy text-white px-3 py-2 text-sm font-medium shadow-glow-navy scale-[1.02] transition-all'
                    : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-gray-200 text-brand-navy px-3 py-2 text-sm font-medium hover:border-brand-blue hover:text-brand-blue hover:-translate-y-0.5 hover:shadow-sm transition-all'
                }
              >
                <t.Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Information à signaler */}
      <div>
        <label
          htmlFor="contactValue"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20"
          >
            <activeContact.Icon className="h-3.5 w-3.5" />
          </span>
          Information à signaler <span className="text-red-500">*</span>
        </label>
        <input
          id="contactValue"
          name="contactValue"
          type="text"
          placeholder={activeContact.placeholder}
          className="w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all"
        />
      </div>

      {/* Type de problème — 2 × 2 on sm+, 1 col on mobile. Active state
          is red to match the danger nature of the field. */}
      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          Type de problème <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROBLEM_TYPES.map((t) => {
            const isActive = t.id === problemType;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setProblemType(t.id)}
                className={
                  isActive
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 text-white px-4 py-2 text-sm font-medium shadow-glow-red scale-[1.02] transition-all'
                    : 'w-full inline-flex items-center justify-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-gray-200 text-brand-navy px-4 py-2 text-sm font-medium hover:border-red-500/50 hover:text-red-500 hover:-translate-y-0.5 hover:shadow-sm transition-all'
                }
              >
                <t.Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Montant estimé */}
      <div>
        <label
          htmlFor="amount"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-green-500/10 text-green-700 ring-1 ring-green-500/20"
          >
            <WalletIcon className="h-3.5 w-3.5" />
          </span>
          Montant estimé <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="Ex : 5 000 MAD"
          className="w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20"
          >
            <Pencil className="h-3.5 w-3.5" />
          </span>
          Description{' '}
          <span className="text-gray-400 font-normal tabular-nums">
            ({description.length}/300)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez brièvement la situation (informations factuelles uniquement)"
          className="w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all resize-y"
        />
        <p className="mt-2 text-xs text-red-500">
          Merci de décrire la situation de manière factuelle. Évitez les jugements ou accusations.
        </p>
      </div>

      {/* Preuves */}
      <div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-sky-400/15 text-sky-400 ring-1 ring-sky-400/30"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </span>
          Preuves <span className="text-gray-400 font-normal">(fortement recommandé)</span>
        </label>
        <div className="group rounded-xl border-2 border-dashed border-brand-blue/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-brand-blue/60 px-4 py-8 text-center text-sm text-gray-500 transition-all cursor-pointer">
          <UploadCloud className="mx-auto h-9 w-9 mb-2 text-brand-blue/70 group-hover:text-brand-blue group-hover:scale-110 group-hover:animate-sparkle-pop transition-all" aria-hidden />
          <p className="text-brand-navy/80 font-medium">
            Choisir un fichier ou glisser ici
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (capture, reçu, conversation…)
          </p>
          <p className="mt-2 text-[10px] text-gray-400">
            JPG · PNG · WEBP · MP4 · WEBM · MOV — 5 fichiers max
          </p>
        </div>
      </div>

      {/* Confirmation checkbox */}
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
          Je confirme que les informations fournies respectent les{' '}
          <span className="font-semibold text-brand-navy">règles de la plateforme</span>{' '}
          et que mon témoignage est factuel.
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 enabled:hover:bg-red-700 text-white px-5 py-3.5 text-sm font-semibold shadow-glow-red enabled:animate-alert-pulse enabled:hover:scale-[1.02] enabled:hover:[animation-play-state:paused] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        <Megaphone className="h-4 w-4 enabled:animate-siren-wiggle" aria-hidden />
        Envoyer le signalement
      </button>

      <p className="text-xs text-gray-400 text-center">
        Authentification, upload sécurisé des preuves et soumission seront activés prochainement.
      </p>
    </form>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  detectUnsafeContent,
  MODERATION_HINT,
} from '@/lib/moderationWords';
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
  CheckCircle2,
  Heart,
  Users,
  ShieldCheck,
  Sparkles,
  Loader2,
  X as XIcon,
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

type Phase = 'idle' | 'sending' | 'success';

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

function SuccessCelebration({ onAgain }: { onAgain: () => void }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-green-100/60 via-white to-brand-sky/40 backdrop-blur-sm border border-white/70 shadow-glow-green overflow-hidden animate-modal-pop scroll-mt-20">
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
          Merci
        </h2>

        <div className="mt-4 mx-auto max-w-lg space-y-3 text-sm md:text-base text-gray-600 leading-relaxed">
          <p className="font-semibold text-brand-navy text-base md:text-lg animate-fade-in-down [animation-delay:120ms]">
            Votre contribution a bien été reçue.
          </p>
          <p className="animate-fade-in-down [animation-delay:240ms]">
            Vous aidez la communauté Hadar à rester vigilante et à
            vérifier en toute confiance.
          </p>
          <p className="animate-fade-in-down [animation-delay:360ms]">
            Notre équipe examinera votre signalement sous{' '}
            <span className="font-semibold text-brand-navy">
              48 heures ouvrées
            </span>
            .
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[
            { Icon: Users,       value: '2 500+',  label: 'utilisateurs aidés', tint: 'text-brand-blue' },
            { Icon: ShieldCheck, value: '+ 10 000', label: 'contacts vérifiés',  tint: 'text-green-700'  },
            { Icon: Heart,       value: '∞',       label: 'merci à vous',        tint: 'text-red-500'    },
          ].map(({ Icon, value, label, tint }) => (
            <div
              key={label}
              className="rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 p-3 shadow-sm"
            >
              <Icon className={`mx-auto h-5 w-5 ${tint} animate-sparkle-pop`} aria-hidden />
              <p className="mt-1 text-base font-bold text-brand-navy tabular-nums">{value}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
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
            Faire un autre signalement
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-pill bg-white/85 hover:bg-white border border-white/80 hover:border-brand-blue/40 text-brand-navy px-5 py-2.5 text-sm font-semibold shadow-sm transition-all"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export function ReportForm() {
  const [contactType, setContactType] = useState<string>(CONTACT_TYPES[0]!.id);
  const [problemType, setProblemType] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');

  const activeContact = CONTACT_TYPES.find((c) => c.id === contactType) ?? CONTACT_TYPES[0]!;

  // Live content moderation on the description. Recomputed on every
  // keystroke; cheap (single regex scan per forbidden lemma over a
  // <=300-char string).
  const moderation = useMemo(() => detectUnsafeContent(description), [description]);

  const canSubmit =
    accepted &&
    problemType !== null &&
    description.trim() !== '' &&
    !moderation.blocked &&
    evidenceFiles.length > 0 &&
    phase === 'idle';

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
    setProblemType(null);
    setAccepted(false);
    setDescription('');
    setEvidenceFiles([]);
    setPhase('idle');
    scrollToTop();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase('sending');
    setTimeout(() => setPhase('success'), 1200);
  };

  if (phase === 'success') {
    return <SuccessCelebration onAgain={reset} />;
  }

  return (
    <form
      className="space-y-7 rounded-3xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 md:p-8 shadow-glow-soft"
      onSubmit={handleSubmit}
    >
      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
          >
            <Phone className="h-3.5 w-3.5 animate-sparkle-pop" />
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

      <fieldset>
        <legend className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-3">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
          >
            <AlertTriangle className="h-3.5 w-3.5 animate-sparkle-pop" />
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

      <div>
        <label
          htmlFor="description"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy mb-2"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20"
          >
            <Pencil className="h-3.5 w-3.5 animate-sparkle-pop" />
          </span>
          Description <span className="text-red-500">*</span>{' '}
          <span className="text-gray-400 font-normal tabular-nums">
            ({description.length}/300)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={300}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez brièvement la situation (informations factuelles uniquement)"
          aria-invalid={moderation.blocked}
          aria-describedby={moderation.blocked ? 'description-moderation' : 'description-hint'}
          className={
            moderation.blocked
              ? 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-red-500 ring-2 ring-red-500/20 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:shadow-sm transition-all resize-y'
              : 'w-full rounded-xl bg-white/85 backdrop-blur-sm border border-gray-200 px-4 py-2.5 text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-sm transition-all resize-y'
          }
        />
        {moderation.blocked ? (
          <div
            id="description-moderation"
            role="alert"
            className="mt-2 rounded-xl border border-red-500/30 bg-red-50 px-3 py-2.5 text-xs text-red-700 space-y-1.5"
          >
            <p className="font-semibold flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden />
              {moderation.message}
            </p>
            <p className="text-red-700/80">{MODERATION_HINT}</p>
            <p className="text-red-700/60">
              Mot{moderation.matchedWords.length > 1 ? 's' : ''} détecté
              {moderation.matchedWords.length > 1 ? 's' : ''} :{' '}
              <span className="font-mono font-semibold">
                {moderation.matchedWords.join(', ')}
              </span>
            </p>
          </div>
        ) : (
          <p id="description-hint" className="mt-2 text-xs text-red-500">
            Merci de décrire la situation de manière factuelle. Évitez les jugements ou accusations.
          </p>
        )}
      </div>

      <div>
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
          Preuves <span className="text-red-500">*</span>
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
          <p className="text-brand-navy/80 font-medium">
            Choisir un fichier ou glisser ici
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (capture, reçu, conversation…)
          </p>
          <p className="mt-2 text-[10px] text-gray-400">
            JPG · PNG · WEBP · MP4 · WEBM · MOV — {MAX_EVIDENCE} fichiers max
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
                  aria-label={`Retirer ${f.name}`}
                >
                  <XIcon className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 enabled:hover:bg-red-700 text-white px-5 py-3.5 text-sm font-semibold shadow-glow-red enabled:animate-alert-pulse enabled:hover:scale-[1.02] enabled:hover:[animation-play-state:paused] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {phase === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Envoi en cours…
          </>
        ) : (
          <>
            <Megaphone className="h-4 w-4 enabled:animate-siren-wiggle" aria-hidden />
            Envoyer le signalement
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Authentification, upload sécurisé des preuves et soumission seront activés prochainement.
      </p>
    </form>
  );
}

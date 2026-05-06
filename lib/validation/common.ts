// ─────────────────────────────────────────────────────────────────────────────
// Schémas Zod réutilisables.
//
// CHAQUE endpoint API doit valider son body via un schéma Zod construit
// à partir d'ici. Les regex et bornes sont calibrées une fois pour
// toutes — pas de validation ad-hoc dans les routes (sinon on aura
// 30 versions différentes de "qu'est-ce qu'un email valide").
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Locale ────────────────────────────────────────────────────────────────
export const localeSchema = z.enum(['fr', 'en', 'ar']);
export type Locale = z.infer<typeof localeSchema>;

// ── Currency ──────────────────────────────────────────────────────────────
export const currencySchema = z.enum(['MAD', 'EUR', 'USD']);
export type Currency = z.infer<typeof currencySchema>;

// ── Email ─────────────────────────────────────────────────────────────────
// Validation volontairement souple sur la regex (z.string().email() suffit) +
// stricte sur la longueur. Trim + lowercase appliqués automatiquement.
// Le caractère "+ alias" (foo+bar@x.com) est accepté.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { message: 'Email trop court.' })
  .max(254, { message: 'Email trop long (max 254 caractères, RFC 5321).' })
  .email({ message: 'Email invalide.' });

// ── Password ──────────────────────────────────────────────────────────────
// Politique : 12+ chars, au moins 3 catégories sur 4 (minuscule, majuscule,
// chiffre, symbole). On ne force PAS les 4 catégories — c'est contre-productif
// (les users mettent "Password1!" qui passe la règle mais est dans toutes les
// listes de bruteforce).
//
// Plus tard on ajoutera un check HIBP (haveibeenpwned.com) qui rejette les
// mots de passe déjà fuités, indépendamment de leur "complexité".
const PASSWORD_MIN = 12;
const PASSWORD_MAX = 128; // limite argon2 raisonnable

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, {
    message: `Mot de passe trop court (minimum ${PASSWORD_MIN} caractères).`,
  })
  .max(PASSWORD_MAX, {
    message: `Mot de passe trop long (maximum ${PASSWORD_MAX} caractères).`,
  })
  .superRefine((value, ctx) => {
    let categories = 0;
    if (/[a-z]/.test(value)) categories++;
    if (/[A-Z]/.test(value)) categories++;
    if (/\d/.test(value)) categories++;
    if (/[^a-zA-Z\d]/.test(value)) categories++;
    if (categories < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Mot de passe trop simple : il doit contenir au moins trois types de caractères parmi (minuscule, majuscule, chiffre, symbole).',
      });
    }
  });

// ── Phone ─────────────────────────────────────────────────────────────────
// On ne valide PAS le format E.164 strict ici (on laisse ça au front qui
// connaît les digits du pays choisi). On garde juste +XX...XX, 7-15 chars.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, {
    message: 'Numéro invalide (format international attendu, ex : +212612345678).',
  });

// ── Names ─────────────────────────────────────────────────────────────────
// 1-100 chars. On accepte tout caractère imprimable car les noms marocains
// peuvent contenir tirets, apostrophes, espaces, lettres arabes.
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Champ requis.' })
  .max(100, { message: 'Trop long (max 100 caractères).' });

// ── TOTP code ─────────────────────────────────────────────────────────────
export const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'Code TOTP attendu sur 6 chiffres.' });

// ── Recovery code ─────────────────────────────────────────────────────────
// Format : XXXXX-XXXXX (alphabet base32 modifié). Normalisé avant compare.
export const recoveryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[2-9A-HJ-NP-Z]{5}-?[2-9A-HJ-NP-Z]{5}$/, {
    message: 'Code de récupération invalide.',
  });

// ── ID (cuid) ─────────────────────────────────────────────────────────────
export const cuidSchema = z
  .string()
  .regex(/^c[a-z0-9]{24}$/, { message: 'Identifiant invalide.' });

// ── Channel + ProblemType (importés du client Prisma) ─────────────────────
// On les redéfinit en Zod pour éviter d'importer le client Prisma dans des
// routes qui ne devraient en théorie pas dépendre du runtime DB.
export const reportChannelSchema = z.enum([
  'TELEPHONE',
  'WHATSAPP',
  'EMAIL',
  'SITE_WEB',
  'RESEAUX_SOCIAUX',
  'PAYPAL',
  'BINANCE',
  'RIB',
  'CIN',
]);

export const problemTypeSchema = z.enum([
  'NON_LIVRAISON',
  'BLOQUE_APRES_PAIEMENT',
  'PRODUIT_NON_CONFORME',
  'USURPATION_IDENTITE',
]);

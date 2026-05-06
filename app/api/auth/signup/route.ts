// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
//
// Création d'un compte utilisateur final. Étapes :
//   1. Validation Zod (email, password, firstName, lastName, locale).
//   2. Rate limit 3/h par IP (anti bot-flood).
//   3. Vérification que l'email n'existe pas déjà (UserPII.email unique).
//   4. Hash argon2id du password.
//   5. Transaction atomique : User + UserPII + UserCredential.
//   6. Génération + envoi d'un token de vérification email.
//   7. Création d'une Session (auto-login) + cookies HttpOnly.
//   8. Audit log : 'auth.signup'.
//   9. Réponse 201 { userId, requiresEmailVerification: true }.
//
// Sécurité :
//   - Tokens email = 32 octets aléatoires, stockés HASHÉS en DB.
//   - Race conditions : on s'appuie sur la contrainte unique email
//     (citext) en DB. Si deux signups simultanés sur le même email,
//     un échouera proprement avec P2002 → CONFLICT 409.
//   - Pas d'énumération : si l'email existe déjà on retourne CONFLICT
//     (acceptable ici car le user a tapé son propre email — pas
//     d'attaque par énumération sur signup).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  localeSchema,
  currencySchema,
} from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { hashPassword } from '@/lib/auth/password';
import { checkHibp } from '@/lib/auth/hibp';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { generateRandomToken, sha256 } from '@/lib/crypto/hash';
import { createSession } from '@/lib/auth/session';
import { setAuthCookies } from '@/lib/auth/cookies';
import { appendAudit } from '@/lib/audit';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';

const bodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  locale: localeSchema.default('fr'),
  currency: currencySchema.default('MAD'),
});

const EMAIL_VERIFICATION_TTL_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const ipHash = hmacIp(ip);
    const userAgentHash = hmacUserAgent(userAgent);

    // ── 1. Rate limit avant tout (économise du CPU sur les bots) ──
    const rl = await checkRateLimit({
      key: `signup:ip:${ipHash}`,
      ...RATE_LIMITS.SIGNUP_PER_IP,
    });
    if (!rl.ok) {
      return jsonError(
        'RATE_LIMITED',
        'Trop de tentatives. Réessaye dans une heure.',
        { headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }

    // ── 2. Parse + validation Zod ──
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'Corps de requête JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonZodError(parsed.error);
    }
    const { email, password, firstName, lastName, locale, currency } = parsed.data;

    // ── 3a. Vérification HIBP — refuse les mots de passe déjà fuités ──
    const hibp = await checkHibp(password);
    if (hibp.pwned) {
      return jsonError(
        'UNPROCESSABLE',
        `Ce mot de passe a été retrouvé dans ${hibp.occurrences.toLocaleString('fr')} fuites de données connues. Choisis-en un autre.`,
      );
    }

    // ── 3b. Hash password (avant d'ouvrir la transaction → ~250 ms en
    //       dehors du lock) ──
    const passwordHash = await hashPassword(password);

    // ── 4. Génération du token de vérification email ──
    const verificationToken = generateRandomToken(32);
    const verificationTokenHash = sha256(verificationToken);
    const verificationExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
    );

    // ── 5. Transaction : User + UserPII + UserCredential + token ──
    let userId: string;
    try {
      userId = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            preferredLanguage: locale,
            preferredCurrency: currency,
          },
        });
        await tx.userPII.create({
          data: {
            userId: user.id,
            email,
            firstName,
            lastName,
          },
        });
        await tx.userCredential.create({
          data: {
            userId: user.id,
            passwordHash,
            passwordChangedAt: new Date(),
          },
        });
        await tx.shortLivedToken.create({
          data: {
            kind: 'EMAIL_VERIFICATION',
            userId: user.id,
            tokenHash: verificationTokenHash,
            expiresAt: verificationExpiresAt,
            ipHash,
          },
        });
        return user.id;
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          // Violation d'unique email — l'email existe déjà.
          return jsonError(
            'CONFLICT',
            'Un compte existe déjà avec cet email.',
          );
        }
      }
      throw err;
    }

    // ── 6. Envoi de l'email de vérification (async, on n'attend pas) ──
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Vérifie ton email — Hadar.ma',
      text: `Bienvenue sur Hadar.\n\nClique sur ce lien pour vérifier ton email (expire dans ${EMAIL_VERIFICATION_TTL_HOURS} heures) :\n${verifyUrl}\n\nSi tu n'es pas à l'origine de cette inscription, ignore ce message.`,
    });

    // ── 7. Auto-login : création de session + cookies ──
    const tokens = await createSession({
      accountId: userId,
      kind: 'user',
      ipHash,
      userAgentHash,
    });

    // ── 8. Audit ──
    await appendAudit({
      actorType: 'USER',
      actorId: userId,
      action: 'auth.signup',
      targetType: 'user',
      targetId: userId,
      ipHash,
      userAgentHash,
      payload: { locale, currency },
    });

    // ── 9. Réponse ──
    const res = jsonOk(
      {
        userId,
        requiresEmailVerification: true,
      },
      { status: 201 },
    );
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res;
  } catch (err) {
    return jsonFromError(err);
  }
}

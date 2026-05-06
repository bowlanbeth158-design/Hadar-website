// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/password-reset/request
//
// Body : { email }
//
// Anti-énumération : on retourne TOUJOURS 200 OK même si l'email
// n'existe pas → un attaquant ne peut pas savoir si un email est
// dans la base. Le mail n'est envoyé que si le compte existe.
//
// Rate limit : 3 par email / heure (anti-spam).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { emailSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { generateRandomToken, sha256 } from '@/lib/crypto/hash';
import { hmacIp, hmacEmail } from '@/lib/crypto/hmac';
import { getClientIp } from '@/lib/api/request';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({ email: emailSchema });

const RESET_TOKEN_TTL_HOURS = 1;

export async function POST(req: NextRequest) {
  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'Corps de requête JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);
    const { email } = parsed.data;

    const ipHash = hmacIp(getClientIp(req));
    const emailHash = hmacEmail(email);

    const rl = await checkRateLimit({
      key: `pwreset:email:${emailHash}`,
      ...RATE_LIMITS.PASSWORD_RESET,
    });
    if (!rl.ok) {
      // Anti-énumération : on retourne quand même 200 (pour ne pas
      // signaler à l'attaquant que l'email a déjà déclenché des resets).
      return jsonOk({ ok: true });
    }

    const userPii = await prisma.userPII.findUnique({
      where: { email },
      select: { userId: true },
    });

    if (userPii) {
      const token = generateRandomToken(32);
      const tokenHash = sha256(token);
      await prisma.shortLivedToken.create({
        data: {
          kind: 'PASSWORD_RESET',
          userId: userPii.userId,
          tokenHash,
          expiresAt: new Date(
            Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000,
          ),
          ipHash,
        },
      });

      const url = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/reset-password?token=${token}`;
      await sendEmail({
        to: email,
        subject: 'Réinitialise ton mot de passe — Hadar.ma',
        text: `Quelqu'un (probablement toi) a demandé une réinitialisation de mot de passe.\n\nClique sur ce lien (expire dans ${RESET_TOKEN_TTL_HOURS}h) :\n${url}\n\nSi ce n'est pas toi, ignore ce message.`,
      });

      await appendAudit({
        actorType: 'USER',
        actorId: userPii.userId,
        action: 'auth.password.reset.requested',
        targetType: 'user',
        targetId: userPii.userId,
        ipHash,
      });
    }

    // Réponse identique dans tous les cas (anti-énumération).
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

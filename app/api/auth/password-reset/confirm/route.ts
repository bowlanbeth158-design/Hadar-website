// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/password-reset/confirm
//
// Body : { token, newPassword }
//
// Flow :
//   1. Hash le token, lookup ShortLivedToken kind=PASSWORD_RESET non
//      utilisé non expiré.
//   2. Hash le nouveau mot de passe (argon2id).
//   3. Transaction :
//      - update UserCredential (passwordHash, passwordChangedAt,
//        failedAttempts=0, lockedUntil=null)
//      - mark token as usedAt
//      - revoke ALL active sessions (changement de mot de passe = on
//        déconnecte tous les appareils par sécurité).
//   4. Audit.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { passwordSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { sha256 } from '@/lib/crypto/hash';
import { hashPassword } from '@/lib/auth/password';
import { checkHibp } from '@/lib/auth/hibp';
import { revokeAllSessions } from '@/lib/auth/session';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({
  token: z.string().min(20).max(100),
  newPassword: passwordSchema,
});

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

    const tokenHash = sha256(parsed.data.token);
    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    const tokenRow = await prisma.shortLivedToken.findUnique({
      where: { tokenHash },
    });
    if (
      !tokenRow ||
      tokenRow.kind !== 'PASSWORD_RESET' ||
      tokenRow.usedAt ||
      tokenRow.expiresAt < new Date()
    ) {
      return jsonError(
        'UNPROCESSABLE',
        'Lien invalide ou expiré. Refais une demande.',
      );
    }

    // HIBP — refuse un mot de passe déjà fuité.
    const hibp = await checkHibp(parsed.data.newPassword);
    if (hibp.pwned) {
      return jsonError(
        'UNPROCESSABLE',
        `Ce mot de passe a été retrouvé dans ${hibp.occurrences.toLocaleString('fr')} fuites de données. Choisis-en un autre.`,
      );
    }

    const newHash = await hashPassword(parsed.data.newPassword);

    await prisma.$transaction([
      prisma.userCredential.update({
        where: { userId: tokenRow.userId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
          mustResetPassword: false,
        },
      }),
      prisma.shortLivedToken.update({
        where: { id: tokenRow.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Sécurité : changement de mot de passe → tous les appareils
    // doivent se reconnecter. Si un attaquant avait volé une session,
    // elle est maintenant invalide.
    await revokeAllSessions(tokenRow.userId, 'user', 'password_changed');

    await appendAudit({
      actorType: 'USER',
      actorId: tokenRow.userId,
      action: 'auth.password.reset.confirmed',
      targetType: 'user',
      targetId: tokenRow.userId,
      ipHash,
      userAgentHash,
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

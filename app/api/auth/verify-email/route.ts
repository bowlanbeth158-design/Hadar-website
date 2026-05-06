// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
//
// Body : { token } (récupéré du lien de l'email envoyé au signup).
//
// Flow :
//   1. Hash le token reçu, lookup dans ShortLivedToken où kind=
//      EMAIL_VERIFICATION.
//   2. Vérifie expiresAt > now() et usedAt is null.
//   3. Marque UserPII.emailVerifiedAt = now() et le token comme usedAt.
//   4. Audit log.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { sha256 } from '@/lib/crypto/hash';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({
  token: z.string().min(20).max(100),
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
      tokenRow.kind !== 'EMAIL_VERIFICATION' ||
      tokenRow.usedAt ||
      tokenRow.expiresAt < new Date()
    ) {
      return jsonError(
        'UNPROCESSABLE',
        'Lien invalide ou expiré. Demande un nouveau lien.',
      );
    }

    await prisma.$transaction([
      prisma.shortLivedToken.update({
        where: { id: tokenRow.id },
        data: { usedAt: new Date() },
      }),
      prisma.userPII.update({
        where: { userId: tokenRow.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    await appendAudit({
      actorType: 'USER',
      actorId: tokenRow.userId,
      action: 'auth.email.verified',
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

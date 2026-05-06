// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/setup
//
// Initie l'enrôlement TOTP. Réservé aux Members (staff). Renvoie le
// secret base32 + l'URI otpauth:// pour QR code.
//
// Le secret est stocké chiffré côté serveur dans MemberCredential
// avec totpEnabledAt = null (état "PENDING"). L'enrôlement n'est
// finalisé qu'après /api/auth/2fa/verify.
//
// Si le member a déjà un TOTP activé, on REFUSE → il doit d'abord
// le désactiver explicitement (route à venir).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { generateTotpEnrollment } from '@/lib/auth/totp';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;

    const cred = await prisma.memberCredential.findUnique({
      where: { memberId: auth.accountId },
      select: { totpSecretEncrypted: true, totpEnabledAt: true },
    });
    if (!cred) {
      return jsonError('UNAUTHORIZED', 'Pas de credential.');
    }

    const isPending = cred.totpSecretEncrypted === 'PENDING_ENROLLMENT';
    const isAlreadyEnrolled =
      cred.totpEnabledAt && cred.totpEnabledAt.getTime() > 0 && !isPending;
    if (isAlreadyEnrolled) {
      return jsonError(
        'CONFLICT',
        '2FA déjà activé. Désactive-le d\'abord pour ré-enrôler.',
      );
    }

    const pii = await prisma.memberPII.findUnique({
      where: { memberId: auth.accountId },
      select: { email: true },
    });
    const label = `Hadar:${pii?.email ?? auth.accountId}`;

    const enrollment = generateTotpEnrollment(label);

    // Stocke le secret en PENDING — totpEnabledAt reste = epoch (placeholder)
    // jusqu'à ce que /verify le flip à now().
    await prisma.memberCredential.update({
      where: { memberId: auth.accountId },
      data: {
        totpSecretEncrypted: enrollment.secretEncrypted,
        // On laisse totpEnabledAt à epoch ; il passera à now() à
        // l'étape verify.
      },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'auth.2fa.setup.start',
      targetType: 'member',
      targetId: auth.accountId,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk({
      otpauthUri: enrollment.otpauthUri,
      // On expose le secret pour les clients qui ne supportent pas le
      // QR (saisie manuelle dans l'authenticator).
      secretBase32: enrollment.secretBase32,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

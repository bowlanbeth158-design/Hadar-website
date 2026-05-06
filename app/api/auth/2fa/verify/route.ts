// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/verify
//
// Finalise l'enrôlement TOTP : l'user a scanné le QR, tape un premier
// code de 6 chiffres → on vérifie qu'il match le secret en attente,
// on flippe totpEnabledAt = now(), on génère + chiffre les 8 codes
// de récupération, on les retourne EN CLAIR au client (à sauvegarder
// hors-ligne).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { verifyTotp } from '@/lib/auth/totp';
import { generateRecoveryCodes } from '@/lib/crypto/codes';
import { encrypt } from '@/lib/crypto/aes';
import { totpCodeSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({ code: totpCodeSchema });

export async function POST(req: NextRequest) {
  try {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'Corps de requête JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const cred = await prisma.memberCredential.findUnique({
      where: { memberId: auth.accountId },
      select: { totpSecretEncrypted: true, totpEnabledAt: true },
    });
    if (!cred) {
      return jsonError('UNAUTHORIZED', 'Pas de credential.');
    }
    if (cred.totpSecretEncrypted === 'PENDING_ENROLLMENT') {
      return jsonError(
        'UNPROCESSABLE',
        'Aucun enrôlement en cours. Lance /setup d\'abord.',
      );
    }

    const ok = verifyTotp(parsed.data.code, cred.totpSecretEncrypted);
    if (!ok) {
      return jsonError('UNAUTHORIZED', 'Code TOTP invalide.');
    }

    // Génère + chiffre les 8 codes de récupération.
    const codes = generateRecoveryCodes(8);
    const codesEncrypted = encrypt(JSON.stringify(codes));

    await prisma.memberCredential.update({
      where: { memberId: auth.accountId },
      data: {
        totpEnabledAt: new Date(),
        recoveryCodesEncrypted: codesEncrypted,
      },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'auth.2fa.enabled',
      targetType: 'member',
      targetId: auth.accountId,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk({
      enabled: true,
      // Codes en CLAIR — au client de les afficher 1 fois et à l'user
      // de les sauvegarder. Le serveur ne les ré-affichera plus jamais.
      recoveryCodes: codes,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports — soumission d'un nouveau signalement par un user.
//
// Pré-requis :
//   - Authentifié (cookie access token valide)
//   - Email vérifié (sinon EMAIL_NOT_VERIFIED 403)
//   - Rate limit 10/jour/user
//
// Étapes :
//   1. Auth + vérification email
//   2. Validation Zod : channel, contactValue brut, problemType,
//      amount, currency, descriptionPublic (curated phrase),
//      adminNotes (optionnel, sera chiffré).
//   3. Normalisation + hash + chiffrement du contactValue.
//   4. Insertion atomique : Report + (au commit) audit log +
//      mise à jour ContactAggregate.
//   5. Évidences : pas dans cette route — flow séparé via signed URLs
//      (à venir).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  reportChannelSchema,
  problemTypeSchema,
  currencySchema,
} from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { requireAuth } from '@/lib/auth/guard';
import {
  hmacContact,
  normalizeContactValue,
  hmacIp,
  hmacUserAgent,
} from '@/lib/crypto/hmac';
import { encrypt, encryptNullable } from '@/lib/crypto/aes';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAuditInTx } from '@/lib/audit';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const bodySchema = z.object({
  channel: reportChannelSchema,
  contactValue: z.string().trim().min(2).max(500),
  problemType: problemTypeSchema,
  amountCents: z.number().int().nonnegative().max(1_000_000_000).optional(),
  currency: currencySchema.default('MAD'),
  descriptionPublic: z.string().min(5).max(500),
  adminNotes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    // Vérifier l'email validé.
    const pii = await prisma.userPII.findUnique({
      where: { userId: auth.accountId },
      select: { emailVerifiedAt: true },
    });
    if (!pii?.emailVerifiedAt) {
      return jsonError(
        'EMAIL_NOT_VERIFIED',
        'Email non vérifié. Confirme ton email pour soumettre un signalement.',
      );
    }

    // Rate limit 10/jour/user.
    const rl = await checkRateLimit({
      key: `report:user:${auth.accountId}`,
      ...RATE_LIMITS.REPORT_SUBMISSION,
    });
    if (!rl.ok) {
      return jsonError(
        'RATE_LIMITED',
        'Limite quotidienne atteinte. Réessaye demain.',
        { headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    // Triple stockage du contactValue.
    const contactValueNormalized = normalizeContactValue(parsed.data.contactValue);
    const contactValueHash = hmacContact(
      contactValueNormalized,
      parsed.data.channel,
    );
    const contactValueEncrypted = encrypt(parsed.data.contactValue);

    // Transaction : insert + agrégat + audit.
    let reportId: string;
    try {
      reportId = await prisma.$transaction(async (tx) => {
        const report = await tx.report.create({
          data: {
            userId: auth.accountId,
            channel: parsed.data.channel,
            contactValueHash,
            contactValueEncrypted,
            contactValueNormalized,
            problemType: parsed.data.problemType,
            amountCents: parsed.data.amountCents,
            currency: parsed.data.currency,
            descriptionPublic: parsed.data.descriptionPublic,
            adminNotesEncrypted: encryptNullable(parsed.data.adminNotes),
            status: 'SUBMITTED',
          },
        });

        // L'agrégat n'est mis à jour QUE quand le signalement passe à
        // PUBLISHED (pas SUBMITTED) — on évite que des signalements
        // non-modérés impactent la recherche publique.

        await appendAuditInTx(tx, {
          actorType: 'USER',
          actorId: auth.accountId,
          action: 'report.submit',
          targetType: 'report',
          targetId: report.id,
          ipHash,
          userAgentHash,
          payload: {
            channel: parsed.data.channel,
            problemType: parsed.data.problemType,
          },
        });

        return report.id;
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return jsonError(
          'CONFLICT',
          'Tu as déjà signalé ce contact sur ce canal.',
        );
      }
      throw err;
    }

    return jsonOk({ reportId }, { status: 201 });
  } catch (err) {
    return jsonFromError(err);
  }
}

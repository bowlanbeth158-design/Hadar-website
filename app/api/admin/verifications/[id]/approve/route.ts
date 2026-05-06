// POST /api/admin/verifications/[id]/approve

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { cuidSchema } from '@/lib/validation/common';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAuditInTx } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const RETENTION_APPROVED_DAYS = 30;

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    const v = await prisma.identityVerification.findUnique({
      where: { id: idValid.data },
      select: { id: true, userId: true, status: true },
    });
    if (!v) return jsonError('NOT_FOUND', 'Demande introuvable.');
    if (v.status !== 'PENDING') {
      return jsonError('CONFLICT', 'Cette demande est déjà traitée.');
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.identityVerification.update({
        where: { id: v.id },
        data: {
          status: 'APPROVED',
          reviewerId: auth.accountId,
          reviewedAt: now,
          autoDeleteAt: new Date(
            now.getTime() + RETENTION_APPROVED_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      });
      // Lier l'identité validée au User pour qu'on puisse le marquer
      // comme "Profil vérifié" dans la liste des users.
      await tx.user.update({
        where: { id: v.userId },
        data: { verifiedIdentityId: v.id },
      });
      await appendAuditInTx(tx, {
        actorType: 'MEMBER',
        actorId: auth.accountId,
        action: 'verification.approve',
        targetType: 'verification',
        targetId: v.id,
        ipHash: hmacIp(getClientIp(req)),
        userAgentHash: hmacUserAgent(getUserAgent(req)),
      });
    });

    return jsonOk({ status: 'APPROVED' });
  } catch (err) {
    return jsonFromError(err);
  }
}

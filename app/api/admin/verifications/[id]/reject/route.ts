// POST /api/admin/verifications/[id]/reject — motif obligatoire.

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { cuidSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const RETENTION_REJECTED_DAYS = 7;

const bodySchema = z.object({
  reason: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const v = await prisma.identityVerification.findUnique({
      where: { id: idValid.data },
      select: { id: true, status: true },
    });
    if (!v) return jsonError('NOT_FOUND', 'Demande introuvable.');
    if (v.status !== 'PENDING') {
      return jsonError('CONFLICT', 'Cette demande est déjà traitée.');
    }

    const now = new Date();
    await prisma.identityVerification.update({
      where: { id: v.id },
      data: {
        status: 'REJECTED',
        reviewerId: auth.accountId,
        reviewedAt: now,
        rejectionReason: parsed.data.reason,
        autoDeleteAt: new Date(
          now.getTime() + RETENTION_REJECTED_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'verification.reject',
      targetType: 'verification',
      targetId: v.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
      payload: { reason: parsed.data.reason },
    });

    return jsonOk({ status: 'REJECTED' });
  } catch (err) {
    return jsonFromError(err);
  }
}

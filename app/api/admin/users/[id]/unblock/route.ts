// POST /api/admin/users/[id]/unblock — repasse un user en ACTIVE.

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { cuidSchema } from '@/lib/validation/common';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'ADMIN');
    if (auth instanceof NextResponse) return auth;

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    const target = await prisma.user.findUnique({
      where: { id: idValid.data },
      select: { id: true, status: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return jsonError('NOT_FOUND', 'Utilisateur introuvable.');
    }
    if (target.status !== 'BLOCKED') {
      return jsonError('CONFLICT', 'Utilisateur non bloqué.');
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { status: 'ACTIVE', sanctionReason: null },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'user.unblock',
      targetType: 'user',
      targetId: target.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

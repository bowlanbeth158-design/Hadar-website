// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users/[id]/block — bloque un user (motif obligatoire).
// Révoque toutes ses sessions actives.
// ─────────────────────────────────────────────────────────────────────────────

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
import { revokeAllSessions } from '@/lib/auth/session';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const bodySchema = z.object({
  reason: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'ADMIN');
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

    const target = await prisma.user.findUnique({
      where: { id: idValid.data },
      select: { id: true, status: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return jsonError('NOT_FOUND', 'Utilisateur introuvable.');
    }
    if (target.status === 'BLOCKED') {
      return jsonError('CONFLICT', 'Utilisateur déjà bloqué.');
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { status: 'BLOCKED', sanctionReason: parsed.data.reason },
    });

    await revokeAllSessions(target.id, 'user', 'admin_block');

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'user.block',
      targetType: 'user',
      targetId: target.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
      payload: { reason: parsed.data.reason },
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

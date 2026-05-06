// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/members/[id] — change rôle ou statut.
// DELETE /api/admin/members/[id] — soft-delete.
// Les deux nécessitent SUPER_ADMIN (action 🔒 changeRole).
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

const patchSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'SUPER_ADMIN');
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
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    if (!parsed.data.role && !parsed.data.status) {
      return jsonError('INVALID_INPUT', 'Au moins un champ requis.');
    }

    const target = await prisma.member.findUnique({
      where: { id: idValid.data },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return jsonError('NOT_FOUND', 'Membre introuvable.');
    }

    await prisma.member.update({
      where: { id: target.id },
      data: parsed.data,
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'member.update',
      targetType: 'member',
      targetId: target.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
      payload: { from: target.role, to: parsed.data.role ?? target.role },
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'SUPER_ADMIN');
    if (auth instanceof NextResponse) return auth;

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    if (idValid.data === auth.accountId) {
      return jsonError('UNPROCESSABLE', 'Tu ne peux pas te supprimer toi-même.');
    }

    const target = await prisma.member.findUnique({
      where: { id: idValid.data },
      select: { id: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return jsonError('NOT_FOUND', 'Membre introuvable.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: target.id },
        data: { deletedAt: new Date(), status: 'SUSPENDED' },
      });
      await tx.memberPII.update({
        where: { memberId: target.id },
        data: {
          email: `deleted-${target.id}@hadar.local`,
          phone: null,
          firstName: 'Membre',
          lastName: 'supprimé',
        },
      });
    });

    await revokeAllSessions(target.id, 'member', 'member_deleted');

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'member.delete',
      targetType: 'member',
      targetId: target.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

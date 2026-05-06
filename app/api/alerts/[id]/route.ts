// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/alerts/[id] — désabonnement d'un contact suivi.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guard';
import { cuidSchema } from '@/lib/validation/common';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { appendAudit } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    const alert = await prisma.alert.findUnique({
      where: { id: idValid.data },
      select: { id: true, userId: true, channel: true },
    });
    if (!alert || alert.userId !== auth.accountId) {
      // 404 même si l'alerte existe mais ne nous appartient pas (anti
      // énumération).
      return jsonError('NOT_FOUND', 'Alerte introuvable.');
    }

    await prisma.alert.delete({ where: { id: alert.id } });

    await appendAudit({
      actorType: 'USER',
      actorId: auth.accountId,
      action: 'alert.delete',
      targetType: 'alert',
      targetId: alert.id,
      payload: { channel: alert.channel },
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

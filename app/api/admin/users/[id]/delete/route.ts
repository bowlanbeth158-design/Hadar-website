// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users/[id]/delete — soft-delete + anonymisation.
//
// Réservé aux SUPER_ADMIN (action 🔒). Exige :
//   - motif obligatoire
//   - step-up : champ `confirmation` doit valoir l'email du target
//     (anti-clic-fortuit, rituel inspiré du soft-delete GitHub).
//
// Effet :
//   - User.status = DELETED, deletedAt = now()
//   - UserPII : email remplacé par "deleted-${userId}@hadar.local",
//     phone vidé, names → "Compte" / "supprimé"
//   - revokeAll sessions
//   - les Reports gardent leur référence (intégrité publique)
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
import { appendAuditInTx } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const bodySchema = z.object({
  reason: z.string().min(5).max(2000),
  // Anti-clic-fortuit : l'admin doit retaper l'email du target.
  confirmEmail: z.string().email(),
});

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    // 🔒 SUPER_ADMIN uniquement.
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
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const target = await prisma.user.findUnique({
      where: { id: idValid.data },
      include: { pii: { select: { email: true } } },
    });
    if (!target || target.deletedAt) {
      return jsonError('NOT_FOUND', 'Utilisateur introuvable.');
    }
    if (
      target.pii?.email.toLowerCase() !== parsed.data.confirmEmail.toLowerCase()
    ) {
      return jsonError(
        'UNPROCESSABLE',
        "L'email de confirmation ne correspond pas.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: target.id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
          sanctionReason: parsed.data.reason,
        },
      });
      await tx.userPII.update({
        where: { userId: target.id },
        data: {
          email: `deleted-${target.id}@hadar.local`,
          phone: null,
          firstName: 'Compte',
          lastName: 'supprimé',
          dateOfBirth: null,
        },
      });
      await appendAuditInTx(tx, {
        actorType: 'MEMBER',
        actorId: auth.accountId,
        action: 'user.delete',
        targetType: 'user',
        targetId: target.id,
        ipHash: hmacIp(getClientIp(req)),
        userAgentHash: hmacUserAgent(getUserAgent(req)),
        payload: { reason: parsed.data.reason },
      });
    });

    await revokeAllSessions(target.id, 'user', 'account_deleted');

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

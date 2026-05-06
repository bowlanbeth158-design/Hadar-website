// ─────────────────────────────────────────────────────────────────────────────
// POST /api/alerts
//
// Body : { channel, contactValue }
//
// L'user "suit" un contact → on l'avertit par email quand le niveau
// de risque évolue. On stocke contactValueHash + channel (jamais la
// valeur en clair côté Alert — c'est l'agrégat qui la connaît).
//
// On tolère que l'agrégat n'existe pas encore (totalReports=0) — on
// crée la ligne quand même, et on créera l'agrégat au premier
// signalement publié sur ce contact.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { reportChannelSchema } from '@/lib/validation/common';
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
} from '@/lib/crypto/hmac';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({
  channel: reportChannelSchema,
  contactValue: z.string().trim().min(2).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const normalized = normalizeContactValue(parsed.data.contactValue);
    const contactValueHash = hmacContact(normalized, parsed.data.channel);

    // S'assurer qu'un ContactAggregate existe (sinon la FK Alert →
    // ContactAggregate échoue). On le crée vide si absent.
    await prisma.contactAggregate.upsert({
      where: {
        contactValueHash_channel: {
          contactValueHash,
          channel: parsed.data.channel,
        },
      },
      update: {},
      create: {
        contactValueHash,
        channel: parsed.data.channel,
        contactValueNormalized: normalized,
        totalReports: 0,
        distinctReporters: 0,
        riskLevel: 'FAIBLE',
      },
    });

    let alertId: string;
    try {
      const alert = await prisma.alert.create({
        data: {
          userId: auth.accountId,
          contactValueHash,
          channel: parsed.data.channel,
          // On capture le niveau actuel pour pouvoir détecter les
          // évolutions au prochain refresh d'agrégat.
          knownRiskLevel: 'FAIBLE',
        },
      });
      alertId = alert.id;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return jsonError('CONFLICT', 'Tu suis déjà ce contact.');
      }
      throw err;
    }

    await appendAudit({
      actorType: 'USER',
      actorId: auth.accountId,
      action: 'alert.create',
      targetType: 'alert',
      targetId: alertId,
      payload: { channel: parsed.data.channel },
    });

    return jsonOk({ alertId }, { status: 201 });
  } catch (err) {
    return jsonFromError(err);
  }
}

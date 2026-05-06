// GET / POST sur le singleton ContributorTierThreshold (édition seuils
// 6 niveaux Visiteur → Expert depuis /admin/utilisateurs > Étoiles).

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const tier = await prisma.contributorTierThreshold.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });
    return jsonOk(tier);
  } catch (err) {
    return jsonFromError(err);
  }
}

const bodySchema = z
  .object({
    nouveau: z.number().int().min(1).max(1000),
    actif: z.number().int().min(1).max(1000),
    regulier: z.number().int().min(1).max(1000),
    avance: z.number().int().min(1).max(1000),
    expert: z.number().int().min(1).max(1000),
  })
  .refine(
    (d) =>
      d.nouveau < d.actif &&
      d.actif < d.regulier &&
      d.regulier < d.avance &&
      d.avance < d.expert,
    { message: 'Les seuils doivent être strictement croissants.' },
  );

export async function POST(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'ADMIN');
    if (auth instanceof NextResponse) return auth;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    await prisma.contributorTierThreshold.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...parsed.data, updatedById: auth.accountId },
      update: { ...parsed.data, updatedById: auth.accountId },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'contributor_tiers.update',
      targetType: 'config',
      targetId: 'default',
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
      payload: parsed.data,
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/platform-config  — lit toute la config plateforme.
// POST /api/admin/platform-config  — upsert d'une clé (ADMIN+, certaines
//   clés réservées à SUPER_ADMIN ex : "integrations").
// ─────────────────────────────────────────────────────────────────────────────

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

const SUPER_ADMIN_ONLY_KEYS = new Set(['integrations']);

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const rows = await prisma.platformConfig.findMany({
      orderBy: { key: 'asc' },
    });
    const config: Record<string, unknown> = {};
    for (const r of rows) config[r.key] = r.value;

    return jsonOk({ config, updatedAt: new Date().toISOString() });
  } catch (err) {
    return jsonFromError(err);
  }
}

const bodySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

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

    if (
      SUPER_ADMIN_ONLY_KEYS.has(parsed.data.key) &&
      auth.role !== 'SUPER_ADMIN'
    ) {
      return jsonError(
        'FORBIDDEN',
        'Cette clé de configuration nécessite SUPER_ADMIN.',
      );
    }

    const before = await prisma.platformConfig.findUnique({
      where: { key: parsed.data.key },
      select: { value: true },
    });

    await prisma.platformConfig.upsert({
      where: { key: parsed.data.key },
      create: {
        key: parsed.data.key,
        value: parsed.data.value as object,
        updatedById: auth.accountId,
      },
      update: {
        value: parsed.data.value as object,
        updatedById: auth.accountId,
      },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'platform.config.update',
      targetType: 'config',
      targetId: parsed.data.key,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
      payload: { before: before?.value, after: parsed.data.value },
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonFromError(err);
  }
}

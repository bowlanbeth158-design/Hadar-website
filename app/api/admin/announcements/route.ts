// GET /api/admin/announcements — liste les annonces, plus récentes en tête.
// POST — crée une annonce (ADMIN+).

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
    const items = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        audience: true,
        publishedAt: true,
        expiresAt: true,
        createdAt: true,
        author: { select: { id: true, pii: { select: { firstName: true, lastName: true } } } },
      },
    });
    return jsonOk({ items });
  } catch (err) {
    return jsonFromError(err);
  }
}

const bodySchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(10_000),
  audience: z.string().min(1).max(50).default('all'),
  publishNow: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
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

    const announcement = await prisma.announcement.create({
      data: {
        authorId: auth.accountId,
        title: parsed.data.title,
        body: parsed.data.body,
        audience: parsed.data.audience,
        publishedAt: parsed.data.publishNow ? new Date() : null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    await appendAudit({
      actorType: 'MEMBER',
      actorId: auth.accountId,
      action: 'announcement.create',
      targetType: 'announcement',
      targetId: announcement.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk({ announcementId: announcement.id }, { status: 201 });
  } catch (err) {
    return jsonFromError(err);
  }
}

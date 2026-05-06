// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users — liste paginée des utilisateurs.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED']).optional(),
  verified: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      verified: url.searchParams.get('verified') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    const where = {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.verified === true
        ? { verifiedIdentityId: { not: null } }
        : {}),
      ...(parsed.data.verified === false ? { verifiedIdentityId: null } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          id: true,
          status: true,
          preferredLanguage: true,
          publishedReportsCount: true,
          verifiedIdentityId: true,
          lastActivityAt: true,
          deletedAt: true,
          sanctionReason: true,
          createdAt: true,
          pii: {
            select: {
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              emailVerifiedAt: true,
            },
          },
        },
      }),
    ]);

    const items = rows.map((u) => ({
      id: u.id,
      status: u.status,
      email: u.pii?.email ?? null,
      phone: u.pii?.phone ?? null,
      firstName: u.pii?.firstName ?? null,
      lastName: u.pii?.lastName ?? null,
      emailVerifiedAt: u.pii?.emailVerifiedAt ?? null,
      identityVerified: !!u.verifiedIdentityId,
      publishedReportsCount: u.publishedReportsCount,
      lastActivityAt: u.lastActivityAt,
      deletedAt: u.deletedAt,
      sanctionReason: u.sanctionReason,
      createdAt: u.createdAt,
      preferredLanguage: u.preferredLanguage,
    }));

    return jsonOk({
      items,
      pagination: {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
        hasMore: parsed.data.page * parsed.data.pageSize < total,
      },
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

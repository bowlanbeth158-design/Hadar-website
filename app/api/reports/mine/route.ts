// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/mine
//
// Liste paginée des signalements de l'utilisateur authentifié.
// Ré-affiche le contactValue déchiffré (l'user voit ses propres
// signalements).
//
// Query params : ?page=1&pageSize=20&status=PUBLISHED
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guard';
import { decrypt } from '@/lib/crypto/aes';
import {
  jsonOk,
  jsonError,
  jsonFromError,
} from '@/lib/api/response';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      'SUBMITTED',
      'UNDER_REVIEW',
      'NEEDS_CORRECTION',
      'PUBLISHED',
      'REJECTED',
      'ARCHIVED',
    ])
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }
    const { page, pageSize, status } = parsed.data;

    const where = {
      userId: auth.accountId,
      ...(status ? { status } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          channel: true,
          contactValueEncrypted: true,
          problemType: true,
          amountCents: true,
          currency: true,
          descriptionPublic: true,
          status: true,
          moderationReason: true,
          createdAt: true,
          reviewedAt: true,
          publishedAt: true,
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      channel: r.channel,
      contactValue: safeDecrypt(r.contactValueEncrypted),
      problemType: r.problemType,
      amountCents: r.amountCents,
      currency: r.currency,
      descriptionPublic: r.descriptionPublic,
      status: r.status,
      moderationReason: r.moderationReason,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      publishedAt: r.publishedAt,
    }));

    return jsonOk({
      items,
      pagination: { page, pageSize, total, hasMore: page * pageSize < total },
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

function safeDecrypt(value: string): string {
  try {
    return decrypt(value);
  } catch {
    // Si une rotation de clé est en cours, on évite de crash la liste
    // entière à cause d'une seule ligne illisible.
    return '[déchiffrement échoué]';
  }
}

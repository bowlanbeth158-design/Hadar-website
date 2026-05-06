// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports
//
// Liste paginée des signalements pour la file de modération.
// Réservée aux MODERATOR+. Filtres : status, channel, problemType, q.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { decrypt, decryptNullable } from '@/lib/crypto/aes';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

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
  channel: z
    .enum([
      'TELEPHONE',
      'WHATSAPP',
      'EMAIL',
      'SITE_WEB',
      'RESEAUX_SOCIAUX',
      'PAYPAL',
      'BINANCE',
      'RIB',
      'CIN',
    ])
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
      channel: url.searchParams.get('channel') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    const where = {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.channel ? { channel: parsed.data.channel } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          id: true,
          userId: true,
          channel: true,
          contactValueEncrypted: true,
          problemType: true,
          amountCents: true,
          currency: true,
          descriptionPublic: true,
          adminNotesEncrypted: true,
          status: true,
          moderationReason: true,
          createdAt: true,
          reviewedAt: true,
          publishedAt: true,
          moderator: {
            select: {
              id: true,
              pii: { select: { firstName: true, lastName: true } },
            },
          },
          evidences: {
            select: { id: true, mimeType: true, sizeBytes: true },
          },
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      channel: r.channel,
      contactValue: tryDecrypt(r.contactValueEncrypted),
      problemType: r.problemType,
      amountCents: r.amountCents,
      currency: r.currency,
      descriptionPublic: r.descriptionPublic,
      adminNotes: tryDecryptNullable(r.adminNotesEncrypted),
      status: r.status,
      moderationReason: r.moderationReason,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      publishedAt: r.publishedAt,
      moderator: r.moderator
        ? {
            id: r.moderator.id,
            firstName: r.moderator.pii?.firstName,
            lastName: r.moderator.pii?.lastName,
          }
        : null,
      evidencesCount: r.evidences.length,
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

function tryDecrypt(s: string): string {
  try {
    return decrypt(s);
  } catch {
    return '[déchiffrement échoué]';
  }
}
function tryDecryptNullable(s: string | null): string | null {
  try {
    return decryptNullable(s);
  } catch {
    return null;
  }
}

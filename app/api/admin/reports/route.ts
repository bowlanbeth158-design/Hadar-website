// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports
//
// Liste paginée des signalements pour la file de modération.
// Réservée aux MODERATOR+. Filtres : status (CSV), channel, q, from, to.
//
// Status acceptés en CSV : `?status=SUBMITTED,UNDER_REVIEW` pour le
// bucket "En cours" (les deux états d'attente de modération).
//
// La réponse inclut `counts` par statut (pour les KPI cards), calculés
// sur l'ensemble qui matche les filtres date+q, ignorant le filtre statut.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { decrypt, decryptNullable } from '@/lib/crypto/aes';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

const ALL_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_CORRECTION',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
] as const;
type Status = (typeof ALL_STATUSES)[number];

const statusSet = new Set<string>(ALL_STATUSES);

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
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
  q: z.string().trim().max(120).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
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
      q: url.searchParams.get('q') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    // Statut CSV → array filtré (ignore les valeurs inconnues).
    const statuses: Status[] = parsed.data.status
      ? parsed.data.status
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter((s): s is Status => statusSet.has(s))
      : [];

    // Filtres date : on inclut from à 00:00:00 et to à 23:59:59 si l'UI
    // les a déjà mis en ISO timestamp à minuit, sinon ce sont les bornes
    // exactes envoyées par le client.
    const dateFilter =
      parsed.data.from || parsed.data.to
        ? {
            createdAt: {
              ...(parsed.data.from ? { gte: new Date(parsed.data.from) } : {}),
              ...(parsed.data.to ? { lte: new Date(parsed.data.to) } : {}),
            },
          }
        : {};

    // q : recherche sur problemType (texte libre côté table) et ID prefix.
    // contactValue est chiffré → pas indexable, donc on l'exclut de q
    // pour ne pas casser les perfs (cf. recherche admin dédiée plus tard).
    const qFilter = parsed.data.q
      ? {
          OR: [
            { problemType: { contains: parsed.data.q, mode: 'insensitive' as const } },
            { id: { startsWith: parsed.data.q } },
          ],
        }
      : {};

    const baseWhere = {
      ...dateFilter,
      ...qFilter,
      ...(parsed.data.channel ? { channel: parsed.data.channel } : {}),
    };

    const where = {
      ...baseWhere,
      ...(statuses.length > 0 ? { status: { in: statuses } } : {}),
    };

    // Counts par statut sur le scope filtré (date+q+channel) — ignore le
    // filtre statut pour que les KPI cards reflètent l'ensemble sur lequel
    // l'admin filtre, pas seulement le sous-ensemble visible.
    const [total, rows, groupedCounts] = await Promise.all([
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
      prisma.report.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
    ]);

    // Counts complets (toutes les valeurs à 0 par défaut, surchargées
    // par ce que Prisma a retourné).
    const counts: Record<Status, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      NEEDS_CORRECTION: 0,
      PUBLISHED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
    };
    for (const g of groupedCounts) {
      counts[g.status as Status] = g._count._all;
    }
    const countsTotal =
      counts.SUBMITTED +
      counts.UNDER_REVIEW +
      counts.NEEDS_CORRECTION +
      counts.PUBLISHED +
      counts.REJECTED +
      counts.ARCHIVED;

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
      counts,
      countsTotal,
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

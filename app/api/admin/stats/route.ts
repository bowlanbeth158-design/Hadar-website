// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats — KPI globaux du tableau de bord admin.
//
// Requêtes lourdes : on les groupe en parallèle pour minimiser le
// temps total (toutes des aggregates DB, pas de N+1).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { jsonOk, jsonFromError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      usersTotal,
      usersActive,
      usersBlocked,
      reportsTotal,
      reportsPending,
      reportsPublished,
      reportsLast24h,
      reportsLast7d,
      contactsTotal,
      verificationsPending,
      ratingAggregate,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'BLOCKED', deletedAt: null } }),
      prisma.report.count(),
      prisma.report.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      prisma.report.count({ where: { status: 'PUBLISHED' } }),
      prisma.report.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.report.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.contactAggregate.count({ where: { totalReports: { gt: 0 } } }),
      prisma.identityVerification.count({
        where: { status: 'PENDING', filesDeletedAt: null },
      }),
      prisma.reportRating.aggregate({
        _avg: { score: true },
        _count: { _all: true },
      }),
    ]);

    return jsonOk({
      users: {
        total: usersTotal,
        active: usersActive,
        blocked: usersBlocked,
      },
      reports: {
        total: reportsTotal,
        pending: reportsPending,
        published: reportsPublished,
        last24h: reportsLast24h,
        last7d: reportsLast7d,
      },
      contacts: {
        flagged: contactsTotal,
      },
      verifications: {
        pending: verificationsPending,
      },
      satisfaction: {
        averageScore: ratingAggregate._avg.score ?? null,
        ratingsCount: ratingAggregate._count._all,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

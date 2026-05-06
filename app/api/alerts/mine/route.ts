// ─────────────────────────────────────────────────────────────────────────────
// GET /api/alerts/mine — liste des contacts suivis par l'user.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guard';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    const alerts = await prisma.alert.findMany({
      where: { userId: auth.accountId },
      orderBy: { createdAt: 'desc' },
      include: {
        aggregate: {
          select: {
            contactValueNormalized: true,
            totalReports: true,
            riskLevel: true,
            lastReportAt: true,
          },
        },
      },
    });

    const items = alerts.map((a) => ({
      id: a.id,
      channel: a.channel,
      contactValueMasked: maskContact(a.aggregate.contactValueNormalized, a.channel),
      knownRiskLevel: a.knownRiskLevel,
      currentRiskLevel: a.aggregate.riskLevel,
      // hasUpdate = vrai si le risque a évolué depuis souscription
      hasUpdate: a.knownRiskLevel !== a.aggregate.riskLevel,
      totalReports: a.aggregate.totalReports,
      lastReportAt: a.aggregate.lastReportAt,
      createdAt: a.createdAt,
    }));

    return jsonOk({ items });
  } catch (err) {
    return jsonFromError(err);
  }
}

function maskContact(normalized: string, channel: string): string {
  if (channel === 'TELEPHONE' || channel === 'WHATSAPP') {
    if (normalized.length < 6) return '•••';
    return `${normalized.slice(0, 4)}••••${normalized.slice(-2)}`;
  }
  if (normalized.length < 4) return '•••';
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/reports/[id]/moderate
//
// Décision de modération sur un signalement. Body :
//   { action: 'publish' | 'reject' | 'request_correction', reason? }
//
// 'reject' et 'request_correction' EXIGENT un motif.
//
// Effet 'publish' :
//   - status = PUBLISHED, publishedAt, moderatorId
//   - met à jour ContactAggregate (totalReports++, distinctReporters
//     recalculé, riskLevel recalculé)
//   - propage aux Alerts (futur job — flag les Alert où knownRiskLevel
//     != aggregate.riskLevel)
//   - planifie l'auto-purge des évidences à publishedAt + 90j
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { cuidSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAuditInTx } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const bodySchema = z
  .object({
    action: z.enum(['publish', 'reject', 'request_correction']),
    reason: z.string().min(5).max(2000).optional(),
  })
  .refine(
    (d) => d.action === 'publish' || (d.reason && d.reason.length >= 5),
    { message: 'Motif obligatoire pour reject / request_correction.' },
  );

const EVIDENCE_RETENTION_DAYS = 90;

function nextRiskLevel(distinctReporters: number) {
  if (distinctReporters === 0) return 'FAIBLE' as const;
  if (distinctReporters <= 2) return 'VIGILANCE' as const;
  if (distinctReporters <= 4) return 'MODERE' as const;
  return 'ELEVE' as const;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const auth = await requireMember(req, 'MODERATOR');
    if (auth instanceof NextResponse) return auth;

    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    const report = await prisma.report.findUnique({
      where: { id: idValid.data },
      select: {
        id: true,
        userId: true,
        channel: true,
        contactValueHash: true,
        contactValueNormalized: true,
        status: true,
      },
    });
    if (!report) return jsonError('NOT_FOUND', 'Signalement introuvable.');

    if (parsed.data.action === 'publish') {
      // Transaction : update report + agrégat + audit + recompte
      // distinctReporters par scan des reports PUBLISHED de ce contact.
      await prisma.$transaction(async (tx) => {
        const publishedAt = new Date();
        await tx.report.update({
          where: { id: report.id },
          data: {
            status: 'PUBLISHED',
            moderatorId: auth.accountId,
            reviewedAt: publishedAt,
            publishedAt,
            evidenceAutoPurgeAt: new Date(
              publishedAt.getTime() + EVIDENCE_RETENTION_DAYS * 24 * 60 * 60 * 1000,
            ),
          },
        });

        // Recalcule distinct reporters sur tous les PUBLISHED.
        const reporters = await tx.report.findMany({
          where: {
            contactValueHash: report.contactValueHash,
            channel: report.channel,
            status: 'PUBLISHED',
          },
          select: { userId: true },
          distinct: ['userId'],
        });
        const distinctReporters = reporters.length;
        const totalReports = await tx.report.count({
          where: {
            contactValueHash: report.contactValueHash,
            channel: report.channel,
            status: 'PUBLISHED',
          },
        });
        const riskLevel = nextRiskLevel(distinctReporters);

        await tx.contactAggregate.upsert({
          where: {
            contactValueHash_channel: {
              contactValueHash: report.contactValueHash,
              channel: report.channel,
            },
          },
          create: {
            contactValueHash: report.contactValueHash,
            channel: report.channel,
            contactValueNormalized: report.contactValueNormalized,
            totalReports,
            distinctReporters,
            riskLevel,
            firstReportAt: publishedAt,
            lastReportAt: publishedAt,
          },
          update: {
            totalReports,
            distinctReporters,
            riskLevel,
            lastReportAt: publishedAt,
            // firstReportAt set seulement à la création — on le met
            // si null (cas où l'agrégat existe pour une Alert sans
            // reports).
            firstReportAt: { set: undefined as unknown as Date }, // skip
          },
        });

        await appendAuditInTx(tx, {
          actorType: 'MEMBER',
          actorId: auth.accountId,
          action: 'report.publish',
          targetType: 'report',
          targetId: report.id,
          ipHash,
          userAgentHash,
          payload: { distinctReporters, riskLevel },
        });
      });

      return jsonOk({ status: 'PUBLISHED' });
    }

    if (parsed.data.action === 'reject') {
      await prisma.$transaction(async (tx) => {
        await tx.report.update({
          where: { id: report.id },
          data: {
            status: 'REJECTED',
            moderatorId: auth.accountId,
            reviewedAt: new Date(),
            moderationReason: parsed.data.reason,
          },
        });
        await appendAuditInTx(tx, {
          actorType: 'MEMBER',
          actorId: auth.accountId,
          action: 'report.reject',
          targetType: 'report',
          targetId: report.id,
          ipHash,
          userAgentHash,
          payload: { reason: parsed.data.reason },
        });
      });
      return jsonOk({ status: 'REJECTED' });
    }

    // request_correction
    await prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: report.id },
        data: {
          status: 'NEEDS_CORRECTION',
          moderatorId: auth.accountId,
          reviewedAt: new Date(),
          moderationReason: parsed.data.reason,
        },
      });
      await appendAuditInTx(tx, {
        actorType: 'MEMBER',
        actorId: auth.accountId,
        action: 'report.request_correction',
        targetType: 'report',
        targetId: report.id,
        ipHash,
        userAgentHash,
        payload: { reason: parsed.data.reason },
      });
    });
    return jsonOk({ status: 'NEEDS_CORRECTION' });
  } catch (err) {
    return jsonFromError(err);
  }
}

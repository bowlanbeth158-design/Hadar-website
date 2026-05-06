// ─────────────────────────────────────────────────────────────────────────────
// GET /api/search?channel=WHATSAPP&q=+212612345678
//
// Recherche publique d'un contact. Pas d'auth requise (la recherche
// fait partie de la valeur produit pour les visiteurs non-connectés).
//
// Étapes :
//   1. Rate limit 60/min/user (si auth) ou 300/min/IP (anonyme).
//   2. Validation Zod (channel + q).
//   3. Normalisation de la query.
//   4. Lookup ContactAggregate exact (hash HMAC) — < 200 ms.
//   5. Si miss : fallback recherche partielle via pg_trgm sur
//      contactValueNormalized (résultats "contacts similaires").
//
// On NE révèle JAMAIS le contactValue brut dans la réponse — juste
// le risque agrégé.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { reportChannelSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonFromError,
} from '@/lib/api/response';
import {
  hmacContact,
  hmacIp,
  normalizeContactValue,
} from '@/lib/crypto/hmac';
import { getClientIp } from '@/lib/api/request';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { readAccessToken } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';

const querySchema = z.object({
  channel: reportChannelSchema,
  q: z.string().trim().min(2).max(500),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      channel: url.searchParams.get('channel'),
      q: url.searchParams.get('q'),
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }
    const { channel, q } = parsed.data;

    // Rate limit : auth → par user, anonyme → par IP.
    let rateLimitKey: string;
    let rateLimitConfig: { max: number; windowMs: number };
    const token = readAccessToken(req);
    if (token) {
      try {
        const claims = await verifyAccessToken(token);
        rateLimitKey = `search:user:${claims.sub}`;
        rateLimitConfig = RATE_LIMITS.SEARCH_PER_USER;
      } catch {
        rateLimitKey = `search:ip:${hmacIp(getClientIp(req))}`;
        rateLimitConfig = RATE_LIMITS.SEARCH_PER_IP;
      }
    } else {
      rateLimitKey = `search:ip:${hmacIp(getClientIp(req))}`;
      rateLimitConfig = RATE_LIMITS.SEARCH_PER_IP;
    }
    const rl = await checkRateLimit({ key: rateLimitKey, ...rateLimitConfig });
    if (!rl.ok) {
      return jsonError(
        'RATE_LIMITED',
        'Trop de recherches. Réessaye dans une minute.',
        { headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }

    // ── Lookup exact ──
    const normalized = normalizeContactValue(q);
    const exactHash = hmacContact(normalized, channel);
    const exact = await prisma.contactAggregate.findUnique({
      where: { contactValueHash_channel: { contactValueHash: exactHash, channel } },
      select: {
        contactValueNormalized: true,
        channel: true,
        totalReports: true,
        distinctReporters: true,
        riskLevel: true,
        firstReportAt: true,
        lastReportAt: true,
      },
    });

    if (exact && exact.totalReports > 0) {
      return jsonOk({
        match: 'exact' as const,
        result: serializeAggregate(exact),
        suggestions: [],
      });
    }

    // ── Fallback recherche partielle (pg_trgm) ──
    // Limite 5 résultats. similarity > 0.3 (triable).
    const suggestions = await prisma.$queryRaw<Array<{
      contactValueNormalized: string;
      channel: string;
      totalReports: number;
      distinctReporters: number;
      riskLevel: string;
      firstReportAt: Date | null;
      lastReportAt: Date | null;
      similarity: number;
    }>>(
      Prisma.sql`
        SELECT
          "contactValueNormalized",
          "channel",
          "totalReports",
          "distinctReporters",
          "riskLevel"::text AS "riskLevel",
          "firstReportAt",
          "lastReportAt",
          similarity("contactValueNormalized", ${normalized}) AS similarity
        FROM "ContactAggregate"
        WHERE
          "channel" = ${channel}::"ReportChannel"
          AND "contactValueNormalized" % ${normalized}
        ORDER BY similarity DESC, "totalReports" DESC
        LIMIT 5
      `,
    );

    return jsonOk({
      match: 'none' as const,
      result: null,
      suggestions: suggestions.map((s) => ({
        contactValueMasked: maskContact(s.contactValueNormalized, s.channel),
        channel: s.channel,
        totalReports: s.totalReports,
        riskLevel: s.riskLevel,
        similarity: Number(s.similarity.toFixed(2)),
      })),
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

function serializeAggregate(a: {
  contactValueNormalized: string;
  channel: string;
  totalReports: number;
  distinctReporters: number;
  riskLevel: string;
  firstReportAt: Date | null;
  lastReportAt: Date | null;
}) {
  return {
    contactValueMasked: maskContact(a.contactValueNormalized, a.channel),
    channel: a.channel,
    totalReports: a.totalReports,
    distinctReporters: a.distinctReporters,
    riskLevel: a.riskLevel,
    firstReportAt: a.firstReportAt,
    lastReportAt: a.lastReportAt,
  };
}

function maskContact(normalized: string, channel: string): string {
  if (channel === 'TELEPHONE' || channel === 'WHATSAPP') {
    if (normalized.length < 6) return '•••';
    return `${normalized.slice(0, 4)}••••${normalized.slice(-2)}`;
  }
  if (normalized.length < 4) return '•••';
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/audit-log — lecture du journal d'audit.
// SUPER_ADMIN uniquement (le journal contient des PII chiffrées).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { decryptNullable } from '@/lib/crypto/aes';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().optional(),
  actorType: z.enum(['USER', 'MEMBER', 'SYSTEM', 'ANONYMOUS']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // SUPER_ADMIN uniquement — accès aux logs = accès aux actions
    // sensibles, doit rester très restreint.
    const auth = await requireMember(req, 'SUPER_ADMIN');
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      action: url.searchParams.get('action') ?? undefined,
      actorType: url.searchParams.get('actorType') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    const where = {
      ...(parsed.data.action ? { action: { contains: parsed.data.action } } : {}),
      ...(parsed.data.actorType ? { actorType: parsed.data.actorType } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
      }),
    ]);

    const items = rows.map((r) => ({
      id: r.id,
      actorType: r.actorType,
      actorId: r.actorId,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      payload: tryDecrypt(r.payloadEncrypted),
      hash: r.hash,
      prevHash: r.prevHash,
      createdAt: r.createdAt,
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

function tryDecrypt(s: string | null): unknown {
  try {
    const txt = decryptNullable(s);
    if (!txt) return null;
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

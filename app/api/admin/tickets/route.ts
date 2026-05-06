// GET /api/admin/tickets — liste des tickets de support, file de
// modération SUPPORT+. Tri par SLA deadline (les plus urgents en tête).

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['OPEN', 'ASSIGNED', 'WAITING_USER', 'RESOLVED', 'CLOSED'])
    .optional(),
  assignedToMe: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'SUPPORT');
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      assignedToMe: url.searchParams.get('assignedToMe') ?? undefined,
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    const where = {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.assignedToMe ? { assignedToId: auth.accountId } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        orderBy: { slaDeadline: 'asc' },
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          id: true,
          subject: true,
          priority: true,
          status: true,
          slaDeadline: true,
          createdAt: true,
          resolvedAt: true,
          assignedTo: {
            select: {
              id: true,
              pii: { select: { firstName: true, lastName: true } },
            },
          },
          user: {
            select: {
              id: true,
              pii: { select: { email: true, firstName: true, lastName: true } },
            },
          },
          guestEmail: true,
          _count: { select: { messages: true } },
        },
      }),
    ]);

    return jsonOk({
      items: rows,
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

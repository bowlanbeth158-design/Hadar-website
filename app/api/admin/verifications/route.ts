// GET /api/admin/verifications — file des demandes à examiner.

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { spaces } from '@/lib/storage/spaces';
import { decrypt } from '@/lib/crypto/aes';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
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
    });
    if (!parsed.success) {
      return jsonError('INVALID_INPUT', 'Paramètres invalides.');
    }

    const where = { status: parsed.data.status, filesDeletedAt: null as null };

    const [total, rows] = await Promise.all([
      prisma.identityVerification.count({ where }),
      prisma.identityVerification.findMany({
        where,
        orderBy: { submittedAt: 'asc' }, // FIFO pour modération équitable
        skip: (parsed.data.page - 1) * parsed.data.pageSize,
        take: parsed.data.pageSize,
        select: {
          id: true,
          userId: true,
          status: true,
          cinObjectKeyEncrypted: true,
          selfieObjectKeyEncrypted: true,
          submittedAt: true,
          reviewedAt: true,
          rejectionReason: true,
          autoDeleteAt: true,
          user: {
            select: {
              pii: {
                select: { email: true, firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    // Génère des signed URLs courtes (5 min) — l'admin va consulter
    // les images dans la modale CIN/selfie.
    const items = await Promise.all(
      rows.map(async (v) => {
        let cinUrl: string | null = null;
        let selfieUrl: string | null = null;
        try {
          cinUrl = await spaces.generateDownloadUrl(
            decrypt(v.cinObjectKeyEncrypted),
            300,
          );
          selfieUrl = await spaces.generateDownloadUrl(
            decrypt(v.selfieObjectKeyEncrypted),
            300,
          );
        } catch {
          /* keep nulls */
        }
        return {
          id: v.id,
          userId: v.userId,
          status: v.status,
          cinUrl,
          selfieUrl,
          submittedAt: v.submittedAt,
          reviewedAt: v.reviewedAt,
          rejectionReason: v.rejectionReason,
          autoDeleteAt: v.autoDeleteAt,
          user: {
            email: v.user.pii?.email,
            firstName: v.user.pii?.firstName,
            lastName: v.user.pii?.lastName,
          },
        };
      }),
    );

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

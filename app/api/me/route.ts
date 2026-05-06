// ─────────────────────────────────────────────────────────────────────────────
// GET /api/me
//
// Renvoie le profil de l'utilisateur authentifié — utilisé au boot
// du front pour hydrater l'AuthProvider. Si pas de session, 401.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guard';
import { jsonOk, jsonFromError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    if (auth.kind === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: auth.accountId },
        select: {
          id: true,
          status: true,
          preferredLanguage: true,
          preferredCurrency: true,
          publishedReportsCount: true,
          verifiedIdentityId: true,
          pii: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              emailVerifiedAt: true,
            },
          },
        },
      });
      if (!user) return jsonFromError(new Error('User missing'));

      return jsonOk({
        accountId: user.id,
        kind: 'user' as const,
        email: user.pii?.email ?? null,
        firstName: user.pii?.firstName ?? null,
        lastName: user.pii?.lastName ?? null,
        emailVerifiedAt: user.pii?.emailVerifiedAt?.toISOString() ?? null,
        identityVerified: !!user.verifiedIdentityId,
        preferredLanguage: user.preferredLanguage,
        preferredCurrency: user.preferredCurrency,
        publishedReportsCount: user.publishedReportsCount,
      });
    }

    // Member
    const member = await prisma.member.findUnique({
      where: { id: auth.accountId },
      select: {
        id: true,
        role: true,
        status: true,
        pii: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });
    if (!member) return jsonFromError(new Error('Member missing'));

    return jsonOk({
      accountId: member.id,
      kind: 'member' as const,
      role: member.role,
      email: member.pii?.email ?? null,
      firstName: member.pii?.firstName ?? null,
      lastName: member.pii?.lastName ?? null,
      emailVerifiedAt: null,
      identityVerified: false,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

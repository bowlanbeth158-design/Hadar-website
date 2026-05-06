// ─────────────────────────────────────────────────────────────────────────────
// GET /api/verifications/mine — l'historique des demandes de
// vérification de l'user (latest first).
//
// On NE renvoie PAS les object keys déchiffrés — l'user n'a pas
// besoin de récupérer ses CIN/selfie depuis cette route. Si un jour
// il faut, on génèrera des signed URLs à durée très courte.
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

    const verifications = await prisma.identityVerification.findMany({
      where: { userId: auth.accountId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        autoDeleteAt: true,
        filesDeletedAt: true,
      },
    });

    return jsonOk({ items: verifications });
  } catch (err) {
    return jsonFromError(err);
  }
}

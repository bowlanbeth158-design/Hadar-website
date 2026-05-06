// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reports/[id]
//
// Détail d'un signalement. Visible :
//   - par l'auteur (n'importe quel statut)
//   - par les members (tout)
//   - publiquement uniquement si status=PUBLISHED (avec PII de
//     l'auteur masquée)
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/guard';
import { decrypt, decryptNullable } from '@/lib/crypto/aes';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { cuidSchema } from '@/lib/validation/common';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    const report = await prisma.report.findUnique({
      where: { id: idValid.data },
      select: {
        id: true,
        userId: true,
        channel: true,
        contactValueEncrypted: true,
        contactValueNormalized: true,
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
        moderatorId: true,
      },
    });
    if (!report) return jsonError('NOT_FOUND', 'Signalement introuvable.');

    // Permissions
    const auth = await requireAuth(req);
    const isOwner =
      !(auth instanceof NextResponse) &&
      auth.kind === 'user' &&
      auth.accountId === report.userId;
    const isStaff = !(auth instanceof NextResponse) && auth.kind === 'member';

    if (!isOwner && !isStaff && report.status !== 'PUBLISHED') {
      return jsonError('NOT_FOUND', 'Signalement introuvable.');
    }

    return jsonOk({
      id: report.id,
      channel: report.channel,
      contactValue: isOwner || isStaff ? tryDecrypt(report.contactValueEncrypted) : maskContact(report.contactValueNormalized, report.channel),
      problemType: report.problemType,
      amountCents: report.amountCents,
      currency: report.currency,
      descriptionPublic: report.descriptionPublic,
      // Notes admin visibles uniquement aux Members.
      adminNotes: isStaff ? tryDecryptNullable(report.adminNotesEncrypted) : null,
      status: report.status,
      moderationReason: isStaff || isOwner ? report.moderationReason : null,
      createdAt: report.createdAt,
      publishedAt: report.publishedAt,
      // Identité de l'auteur : visible aux owner + staff. Pour le
      // public, seulement un userId pseudonymisé.
      authorId: isOwner || isStaff ? report.userId : pseudonymize(report.userId),
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

/// Masque un contactValue normalisé pour l'affichage public. Garde
/// le 1er et le dernier caractère, masque le reste.
function maskContact(normalized: string, channel: string): string {
  if (channel === 'TELEPHONE' || channel === 'WHATSAPP') {
    if (normalized.length < 6) return '•••';
    return `${normalized.slice(0, 4)}••••${normalized.slice(-2)}`;
  }
  if (normalized.length < 4) return '•••';
  return `${normalized.slice(0, 2)}••••${normalized.slice(-2)}`;
}

/// Pseudonyme stable mais opaque (premier 8 chars du userId).
function pseudonymize(userId: string): string {
  return `usr_${userId.slice(0, 8)}…`;
}

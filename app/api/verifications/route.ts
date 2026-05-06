// ─────────────────────────────────────────────────────────────────────────────
// POST /api/verifications
//
// Soumission d'une demande de vérification d'identité (CIN + selfie).
// L'user upload d'abord les images via signed URLs (Spaces) puis
// soumet les object keys ici.
//
// Body : { cinObjectKey, selfieObjectKey, selfiePerceptualHash }
//
// Le pHash du selfie est calculé côté client (lib pHash JS) et nous
// permet de détecter qu'un même visage tente de créer plusieurs
// comptes (anti-fraude). Si on trouve un pHash très proche (Hamming
// distance < 8), on REJETTE automatiquement avec motif "duplicate".
//
// Auto-purge : reviewedAt + 30j (APPROVED) ou + 7j (REJECTED).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { requireAuth } from '@/lib/auth/guard';
import { encrypt } from '@/lib/crypto/aes';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

const bodySchema = z.object({
  cinObjectKey: z.string().min(5).max(200),
  selfieObjectKey: z.string().min(5).max(200),
  // pHash en hexa, 16 chars (64 bits). Calculé côté client par
  // exemple via la lib `image-hash` ou équivalent.
  selfiePerceptualHash: z.string().regex(/^[0-9a-f]{16}$/),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user') {
      return jsonError('FORBIDDEN', 'Réservé aux utilisateurs.');
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    // Vérifier qu'aucune vérification n'est déjà PENDING ou APPROVED
    // pour cet user (pas le droit de submitter pendant qu'une est en
    // cours).
    const existing = await prisma.identityVerification.findFirst({
      where: {
        userId: auth.accountId,
        status: { in: ['PENDING', 'APPROVED'] },
        filesDeletedAt: null,
      },
      select: { id: true, status: true },
    });
    if (existing) {
      return jsonError(
        'CONFLICT',
        existing.status === 'APPROVED'
          ? 'Identité déjà vérifiée.'
          : 'Une demande est déjà en cours d\'examen.',
      );
    }

    // Anti-doublon : cherche un pHash très proche déjà en base.
    // Pour la v1 : match exact uniquement. Plus tard, calcul de
    // Hamming distance côté serveur.
    const dup = await prisma.identityVerification.findFirst({
      where: {
        selfiePerceptualHash: parsed.data.selfiePerceptualHash,
        userId: { not: auth.accountId },
      },
      select: { id: true },
    });
    if (dup) {
      // On crée la ligne quand même mais en REJECTED auto, pour
      // garder une trace dans l'audit.
      const verification = await prisma.identityVerification.create({
        data: {
          userId: auth.accountId,
          status: 'REJECTED',
          cinObjectKeyEncrypted: encrypt(parsed.data.cinObjectKey),
          selfieObjectKeyEncrypted: encrypt(parsed.data.selfieObjectKey),
          selfiePerceptualHash: parsed.data.selfiePerceptualHash,
          reviewedAt: new Date(),
          rejectionReason: 'Selfie similaire à un autre compte.',
          autoDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      await appendAudit({
        actorType: 'SYSTEM',
        action: 'verification.auto_reject.duplicate',
        targetType: 'verification',
        targetId: verification.id,
      });
      return jsonError(
        'CONFLICT',
        'Cette photo est déjà utilisée par un autre compte.',
      );
    }

    const verification = await prisma.identityVerification.create({
      data: {
        userId: auth.accountId,
        status: 'PENDING',
        cinObjectKeyEncrypted: encrypt(parsed.data.cinObjectKey),
        selfieObjectKeyEncrypted: encrypt(parsed.data.selfieObjectKey),
        selfiePerceptualHash: parsed.data.selfiePerceptualHash,
      },
    });

    await appendAudit({
      actorType: 'USER',
      actorId: auth.accountId,
      action: 'verification.submit',
      targetType: 'verification',
      targetId: verification.id,
      ipHash: hmacIp(getClientIp(req)),
      userAgentHash: hmacUserAgent(getUserAgent(req)),
    });

    return jsonOk(
      { verificationId: verification.id, status: 'PENDING' },
      { status: 201 },
    );
  } catch (err) {
    return jsonFromError(err);
  }
}

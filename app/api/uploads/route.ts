// ─────────────────────────────────────────────────────────────────────────────
// POST /api/uploads — génère une signed URL pour upload direct vers
// Spaces (PUT depuis le navigateur, sans passer par notre serveur).
//
// Body : { kind: 'cin' | 'selfie' | 'evidence' | 'contestation',
//          contentType, sizeBytes }
//
// Sécurité :
//   - Auth requise
//   - Rate limit (anti-flood : 30 / heure / user)
//   - Content-Type strictement validé (jpg/png/webp/pdf seulement)
//   - Size max 10 MB
//   - Object key = UUID, jamais le filename de l'user
//   - URL expire en 5 min
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { requireAuth } from '@/lib/auth/guard';
import { spaces } from '@/lib/storage/spaces';
import { checkRateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const bodySchema = z.object({
  kind: z.enum(['cin', 'selfie', 'evidence', 'contestation']),
  contentType: z.enum(ALLOWED_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_SIZE_BYTES),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const rl = await checkRateLimit({
      key: `upload:${auth.kind}:${auth.accountId}`,
      max: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return jsonError(
        'RATE_LIMITED',
        'Trop d\'uploads. Réessaye dans une heure.',
        { headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const prefix = `${parsed.data.kind}/${auth.accountId}`;
    const presigned = await spaces.generateUploadUrl({
      prefix,
      contentType: parsed.data.contentType,
      maxSizeBytes: parsed.data.sizeBytes,
    });

    return jsonOk({
      uploadUrl: presigned.uploadUrl,
      objectKey: presigned.objectKey,
      headers: presigned.headers,
      expiresAt: presigned.expiresAt,
    });
  } catch (err) {
    return jsonFromError(err);
  }
}

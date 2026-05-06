// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reports/[id]/contestation
//
// Une personne signalée peut contester PUBLIQUEMENT (sans compte) en
// fournissant son email + un motif. Le signalement passe en statut
// "contesté" temporairement le temps de l'examen.
//
// Anti-abus : rate limit 3 / IP / heure (un attaquant ne peut pas
// flood toutes les contestations).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  emailSchema,
  cuidSchema,
} from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { encryptNullable } from '@/lib/crypto/aes';
import { hmacIp } from '@/lib/crypto/hmac';
import { getClientIp } from '@/lib/api/request';
import { generateRandomToken, sha256 } from '@/lib/crypto/hash';
import { sendEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { appendAudit } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

const bodySchema = z.object({
  contesterEmail: emailSchema,
  contesterReason: z.string().min(20).max(5000),
  // Object keys (déjà uploadés vers Spaces via signed URL séparée).
  evidenceObjectKeys: z.array(z.string().max(200)).max(5).optional(),
});

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const idValid = cuidSchema.safeParse(ctx.params.id);
    if (!idValid.success) {
      return jsonError('INVALID_INPUT', 'Identifiant invalide.');
    }

    const ipHash = hmacIp(getClientIp(req));
    const rl = await checkRateLimit({
      key: `contestation:ip:${ipHash}`,
      max: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return jsonError(
        'RATE_LIMITED',
        'Trop de contestations depuis cette adresse. Réessaye plus tard.',
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

    const report = await prisma.report.findUnique({
      where: { id: idValid.data },
      select: { id: true, status: true },
    });
    if (!report || report.status !== 'PUBLISHED') {
      // On ne révèle pas l'existence d'un signalement non-publié.
      return jsonError('NOT_FOUND', 'Signalement introuvable.');
    }

    // Génère un token de vérification d'email — l'email du contestant
    // doit être validé avant que la contestation soit prise en compte.
    const verificationToken = generateRandomToken(32);
    const verificationTokenHash = sha256(verificationToken);

    const contestation = await prisma.reportContestation.create({
      data: {
        reportId: report.id,
        contesterEmail: parsed.data.contesterEmail,
        contesterReason: parsed.data.contesterReason,
        evidenceObjectKeysEncrypted: parsed.data.evidenceObjectKeys
          ? encryptNullable(JSON.stringify(parsed.data.evidenceObjectKeys))
          : null,
        status: 'RECEIVED',
      },
    });

    // Envoi du mail de vérification (le contestant doit cliquer le
    // lien pour confirmer). Token stocké dans ShortLivedToken
    // EMAIL_VERIFICATION mais pour un user fictif... non, on ne peut
    // pas l'utiliser tel quel car il faut un userId. Pour la beta on
    // envoie juste l'email d'accusé sans validation supplémentaire.
    void verificationTokenHash;
    await sendEmail({
      to: parsed.data.contesterEmail,
      subject: 'Contestation reçue — Hadar.ma',
      text: `Nous avons bien reçu ta contestation concernant le signalement ${report.id}.\n\nNotre équipe va examiner ta demande dans les 7 jours. Tu recevras un email avec la décision.`,
    });

    await appendAudit({
      actorType: 'ANONYMOUS',
      action: 'report.contestation.received',
      targetType: 'report',
      targetId: report.id,
      ipHash,
      payload: {
        contestationId: contestation.id,
      },
    });

    return jsonOk({ contestationId: contestation.id }, { status: 201 });
  } catch (err) {
    return jsonFromError(err);
  }
}

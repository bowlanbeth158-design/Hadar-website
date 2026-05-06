// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/members  — liste les membres staff (ADMIN+).
// POST /api/admin/members  — crée un nouveau membre (SUPER_ADMIN 🔒).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireMember } from '@/lib/auth/guard';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
} from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { hashPassword } from '@/lib/auth/password';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAuditInTx } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember(req, 'ADMIN');
    if (auth instanceof NextResponse) return auth;

    const members = await prisma.member.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        pii: { select: { email: true, firstName: true, lastName: true } },
        credential: { select: { totpEnabledAt: true } },
      },
    });

    const items = members.map((m) => ({
      id: m.id,
      role: m.role,
      status: m.status,
      email: m.pii?.email,
      firstName: m.pii?.firstName,
      lastName: m.pii?.lastName,
      totpEnabled:
        !!m.credential?.totpEnabledAt &&
        m.credential.totpEnabledAt.getTime() > 0,
      lastLoginAt: m.lastLoginAt,
      createdAt: m.createdAt,
    }));

    return jsonOk({ items });
  } catch (err) {
    return jsonFromError(err);
  }
}

const createSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: z.enum(['ADMIN', 'MODERATOR', 'SUPPORT']), // pas SUPER_ADMIN par cette route
});

export async function POST(req: NextRequest) {
  try {
    // 🔒 SUPER_ADMIN uniquement.
    const auth = await requireMember(req, 'SUPER_ADMIN');
    if (auth instanceof NextResponse) return auth;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'JSON invalide.');
    }
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) return jsonZodError(parsed.error);

    const passwordHash = await hashPassword(parsed.data.password);
    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    let memberId: string;
    try {
      memberId = await prisma.$transaction(async (tx) => {
        const member = await tx.member.create({
          data: { role: parsed.data.role, status: 'ACTIVE' },
        });
        await tx.memberPII.create({
          data: {
            memberId: member.id,
            email: parsed.data.email,
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
          },
        });
        await tx.memberCredential.create({
          data: {
            memberId: member.id,
            passwordHash,
            // 2FA en attente — le member devra l'enrôler au 1er login.
            totpSecretEncrypted: 'PENDING_ENROLLMENT',
            totpEnabledAt: new Date(0),
            recoveryCodesEncrypted: 'PENDING_ENROLLMENT',
            passwordChangedAt: new Date(),
          },
        });
        await appendAuditInTx(tx, {
          actorType: 'MEMBER',
          actorId: auth.accountId,
          action: 'member.create',
          targetType: 'member',
          targetId: member.id,
          ipHash,
          userAgentHash,
          payload: { role: parsed.data.role },
        });
        return member.id;
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return jsonError('CONFLICT', 'Un membre avec cet email existe déjà.');
      }
      throw err;
    }

    return jsonOk({ memberId }, { status: 201 });
  } catch (err) {
    return jsonFromError(err);
  }
}

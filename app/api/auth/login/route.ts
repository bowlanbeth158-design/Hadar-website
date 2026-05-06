// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
//
// Connexion d'un utilisateur final OU d'un membre staff.
// Body : { email, password, totpCode? }
//
// Étapes :
//   1. Rate limit par IP (5/15min) ET par email (5/15min) — protège
//      autant contre le credential stuffing que contre l'attaque
//      ciblée sur un compte spécifique.
//   2. Lookup PII par email. Si pas de match : message générique
//      "email ou mot de passe invalide" (anti-énumération).
//   3. Si compte verrouillé (lockedUntil > now) : ACCOUNT_LOCKED 423.
//   4. Vérification password argon2id en temps constant.
//   5. Si échec : incrémente failedAttempts, lockedUntil après 5
//      échecs avec backoff exponentiel.
//   6. Si succès :
//      a) Pour Member : si TOTP activé, exiger totpCode (pas encore
//         implémenté ici — voir batch 2).
//      b) Reset failedAttempts et lockedUntil.
//      c) Update User.lastActivityAt (ou Member.lastLoginAt).
//      d) Créer Session + cookies.
//      e) Audit auth.login.success.
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { emailSchema } from '@/lib/validation/common';
import {
  jsonOk,
  jsonError,
  jsonZodError,
  jsonFromError,
} from '@/lib/api/response';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/auth/password';
import { verifyTotp } from '@/lib/auth/totp';
import { hmacIp, hmacUserAgent, hmacEmail } from '@/lib/crypto/hmac';
import { createSession } from '@/lib/auth/session';
import { setAuthCookies } from '@/lib/auth/cookies';
import { appendAudit } from '@/lib/audit';
import { checkRateLimit, resetRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// On accepte n'importe quelle string en mot de passe à l'entrée de login
// (la politique de complexité ne s'applique qu'à la création / au
// changement). Sinon on bloque les comptes legacy avec un mot de passe
// non conforme.
const bodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256),
  totpCode: z.string().regex(/^\d{6}$/).optional(),
});

const MAX_FAILED_BEFORE_LOCK = 5;

/// Backoff exponentiel : 1ère sanction 15 min, 2ème 1 h, 3ème 4 h,
/// 4ème+ 24 h. Le compteur failedAttempts continue à monter au-delà
/// pour l'audit.
function computeLockUntil(attempts: number): Date | null {
  if (attempts < MAX_FAILED_BEFORE_LOCK) return null;
  const tier = Math.min(attempts - MAX_FAILED_BEFORE_LOCK, 3);
  const minutes = [15, 60, 240, 1440][tier] ?? 1440;
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const ipHash = hmacIp(ip);
    const userAgentHash = hmacUserAgent(userAgent);

    // ── 1. Parse body ──
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return jsonError('INVALID_INPUT', 'Corps de requête JSON invalide.');
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonZodError(parsed.error);
    }
    const { email, password, totpCode } = parsed.data;
    const emailHash = hmacEmail(email);

    // ── 2. Rate limits ──
    const rlIp = await checkRateLimit({
      key: `login:ip:${ipHash}`,
      ...RATE_LIMITS.LOGIN_PER_IP,
    });
    if (!rlIp.ok) {
      return jsonError('RATE_LIMITED', 'Trop de tentatives. Patiente un peu.', {
        headers: { 'Retry-After': String(rlIp.retryAfterSec) },
      });
    }
    const rlAccount = await checkRateLimit({
      key: `login:email:${emailHash}`,
      ...RATE_LIMITS.LOGIN_PER_ACCOUNT,
    });
    if (!rlAccount.ok) {
      return jsonError('RATE_LIMITED', 'Trop de tentatives. Patiente un peu.', {
        headers: { 'Retry-After': String(rlAccount.retryAfterSec) },
      });
    }

    // ── 3. Log la tentative immédiatement (succès ou non — on
    //       complétera ensuite) pour faciliter l'analyse forensique ──
    const recordAttempt = async (
      success: boolean,
      failureKind: string | null,
      userId: string | null,
    ) => {
      await prisma.loginAttempt.create({
        data: {
          emailHash,
          userId,
          ipHash,
          success,
          failureKind,
        },
      });
    };

    // ── 4. Cherche d'abord un User (priorité) puis un Member ──
    const userPii = await prisma.userPII.findUnique({
      where: { email },
      select: { userId: true },
    });
    if (userPii) {
      return await handleUserLogin({
        userId: userPii.userId,
        password,
        totpCode,
        ip,
        ipHash,
        userAgentHash,
        recordAttempt,
      });
    }

    const memberPii = await prisma.memberPII.findUnique({
      where: { email },
      select: { memberId: true },
    });
    if (memberPii) {
      return await handleMemberLogin({
        memberId: memberPii.memberId,
        password,
        totpCode,
        ipHash,
        userAgentHash,
        recordAttempt,
      });
    }

    // ── 5. Aucun compte trouvé : message générique anti-énumération ──
    await recordAttempt(false, 'NO_ACCOUNT', null);
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  } catch (err) {
    return jsonFromError(err);
  }
}

// ── User flow ──────────────────────────────────────────────────────────────

interface UserLoginParams {
  userId: string;
  password: string;
  totpCode?: string;
  ip: string;
  ipHash: string;
  userAgentHash: string;
  recordAttempt: (
    success: boolean,
    failureKind: string | null,
    userId: string | null,
  ) => Promise<void>;
}

async function handleUserLogin(p: UserLoginParams) {
  const cred = await prisma.userCredential.findUnique({
    where: { userId: p.userId },
  });
  if (!cred) {
    // Cas anormal — User existe sans Credential. Sécurité : refuse.
    await p.recordAttempt(false, 'NO_CREDENTIAL', p.userId);
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  }

  // Lockout actif ?
  if (cred.lockedUntil && cred.lockedUntil > new Date()) {
    await p.recordAttempt(false, 'ACCOUNT_LOCKED', p.userId);
    return jsonError(
      'ACCOUNT_LOCKED',
      'Compte temporairement verrouillé après plusieurs échecs.',
      { headers: { 'Retry-After': String(60 * 15) } },
    );
  }

  // Vérification du mot de passe (en temps constant via argon2).
  const ok = await verifyPassword(p.password, cred.passwordHash);
  if (!ok) {
    const newAttempts = cred.failedAttempts + 1;
    const lockedUntil = computeLockUntil(newAttempts);
    await prisma.userCredential.update({
      where: { userId: p.userId },
      data: {
        failedAttempts: newAttempts,
        lockedUntil,
      },
    });
    await p.recordAttempt(false, 'BAD_PASSWORD', p.userId);
    if (lockedUntil) {
      return jsonError(
        'ACCOUNT_LOCKED',
        'Compte verrouillé après plusieurs échecs. Réessaye plus tard.',
      );
    }
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  }

  // Si user a TOTP activé (futur batch), demander le code.
  // Pour l'instant : on n'a pas implémenté le 2FA user, on skip.
  void p.totpCode; // placeholder pour batch 2

  // Vérifier que le compte n'est pas BLOCKED ou DELETED.
  const user = await prisma.user.findUnique({
    where: { id: p.userId },
    select: { status: true, deletedAt: true },
  });
  if (!user || user.deletedAt) {
    await p.recordAttempt(false, 'ACCOUNT_DELETED', p.userId);
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  }
  if (user.status === 'BLOCKED') {
    await p.recordAttempt(false, 'ACCOUNT_BLOCKED', p.userId);
    return jsonError('FORBIDDEN', 'Ce compte a été bloqué.');
  }

  // Succès : reset compteurs + rehash si nécessaire + last activity + session.
  const dataUpdate: { failedAttempts: number; lockedUntil: null; passwordHash?: string } = {
    failedAttempts: 0,
    lockedUntil: null,
  };
  if (needsRehash(cred.passwordHash)) {
    dataUpdate.passwordHash = await hashPassword(p.password);
  }
  await prisma.userCredential.update({
    where: { userId: p.userId },
    data: dataUpdate,
  });
  await prisma.user.update({
    where: { id: p.userId },
    data: { lastActivityAt: new Date() },
  });
  await resetRateLimit(`login:email:${p.ipHash}`);

  const tokens = await createSession({
    accountId: p.userId,
    kind: 'user',
    ipHash: p.ipHash,
    userAgentHash: p.userAgentHash,
  });

  await p.recordAttempt(true, null, p.userId);
  await appendAudit({
    actorType: 'USER',
    actorId: p.userId,
    action: 'auth.login.success',
    targetType: 'user',
    targetId: p.userId,
    ipHash: p.ipHash,
    userAgentHash: p.userAgentHash,
  });

  const res = jsonOk({ userId: p.userId, kind: 'user' as const });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res;
}

// ── Member flow ────────────────────────────────────────────────────────────

interface MemberLoginParams {
  memberId: string;
  password: string;
  totpCode?: string;
  ipHash: string;
  userAgentHash: string;
  recordAttempt: (
    success: boolean,
    failureKind: string | null,
    userId: string | null,
  ) => Promise<void>;
}

async function handleMemberLogin(p: MemberLoginParams) {
  const cred = await prisma.memberCredential.findUnique({
    where: { memberId: p.memberId },
  });
  if (!cred) {
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  }

  if (cred.lockedUntil && cred.lockedUntil > new Date()) {
    return jsonError('ACCOUNT_LOCKED', 'Compte verrouillé.');
  }

  const ok = await verifyPassword(p.password, cred.passwordHash);
  if (!ok) {
    const newAttempts = cred.failedAttempts + 1;
    await prisma.memberCredential.update({
      where: { memberId: p.memberId },
      data: {
        failedAttempts: newAttempts,
        lockedUntil: computeLockUntil(newAttempts),
      },
    });
    return jsonError('UNAUTHORIZED', 'Email ou mot de passe invalide.');
  }

  // Pour les members, le TOTP est OBLIGATOIRE (cf. décision sécu).
  // Cas spécial bootstrap : super-admin créé par le seed n'a pas
  // encore enrôlé son TOTP → on autorise le login pour qu'il fasse
  // l'enrôlement, mais le guard requireMember refusera toute action
  // sensible tant que totpEnabledAt n'est pas dans le futur d'epoch.
  const isPendingEnrollment =
    cred.totpSecretEncrypted === 'PENDING_ENROLLMENT';

  if (!isPendingEnrollment) {
    if (!p.totpCode) {
      return jsonError(
        'MFA_REQUIRED',
        "Code 2FA requis. Entre le code à 6 chiffres de ton authenticator.",
      );
    }
    const totpOk = verifyTotp(p.totpCode, cred.totpSecretEncrypted);
    if (!totpOk) {
      // Compte ce code comme un échec login (rate limiting + lockout).
      const newAttempts = cred.failedAttempts + 1;
      await prisma.memberCredential.update({
        where: { memberId: p.memberId },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: computeLockUntil(newAttempts),
        },
      });
      return jsonError('UNAUTHORIZED', 'Code 2FA invalide.');
    }
  }

  // Reset + session.
  const member = await prisma.member.findUnique({
    where: { id: p.memberId },
    select: { role: true, status: true, deletedAt: true },
  });
  if (!member || member.deletedAt || member.status !== 'ACTIVE') {
    return jsonError('FORBIDDEN', 'Compte staff inactif.');
  }

  const memberDataUpdate: { failedAttempts: number; lockedUntil: null; passwordHash?: string } = {
    failedAttempts: 0,
    lockedUntil: null,
  };
  if (needsRehash(cred.passwordHash)) {
    memberDataUpdate.passwordHash = await hashPassword(p.password);
  }
  await prisma.memberCredential.update({
    where: { memberId: p.memberId },
    data: memberDataUpdate,
  });
  await prisma.member.update({
    where: { id: p.memberId },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await createSession({
    accountId: p.memberId,
    kind: 'member',
    role: member.role,
    ipHash: p.ipHash,
    userAgentHash: p.userAgentHash,
  });

  await appendAudit({
    actorType: 'MEMBER',
    actorId: p.memberId,
    action: 'auth.login.success',
    targetType: 'member',
    targetId: p.memberId,
    ipHash: p.ipHash,
    userAgentHash: p.userAgentHash,
    payload: { role: member.role },
  });

  const res = jsonOk({
    memberId: p.memberId,
    kind: 'member' as const,
    role: member.role,
  });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// Garde d'authentification pour les routes API protégées.
//
// Usage type :
//
//   const auth = await requireAuth(req);
//   if (auth instanceof NextResponse) return auth; // 401 ou 403
//   // auth.userId / auth.memberId / auth.role utilisables ici
//
// Vérifie :
//   - Présence du cookie access token
//   - JWT valide (signature, exp, iss/aud)
//   - Session correspondante en DB non révoquée et non expirée
//   - Compte non bloqué / non supprimé
//
// Le double check JWT + DB Session permet la révocation instantanée
// (ex : un admin force-logout un user → on flippe Session.revokedAt
// → la prochaine requête est rejetée même si le JWT n'est pas encore
// expiré).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '../db';
import { readAccessToken } from './cookies';
import { verifyAccessToken } from './jwt';
import { jsonError } from '../api/response';
import type { AccountKind } from './types';

export interface AuthContext {
  accountId: string;
  kind: AccountKind;
  role?: string;
  sessionId: string;
}

/// Vérifie auth. Retourne soit un AuthContext, soit une NextResponse
/// d'erreur que le caller doit retourner directement.
export async function requireAuth(
  req: NextRequest,
): Promise<AuthContext | NextResponse> {
  const token = readAccessToken(req);
  if (!token) {
    return jsonError('UNAUTHORIZED', 'Authentification requise.');
  }

  let claims;
  try {
    claims = await verifyAccessToken(token);
  } catch {
    return jsonError('UNAUTHORIZED', 'Session invalide.');
  }

  const session = await prisma.session.findUnique({
    where: { id: claims.sid },
    select: {
      id: true,
      revokedAt: true,
      expiresAt: true,
      userId: true,
      memberId: true,
    },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return jsonError('UNAUTHORIZED', 'Session révoquée ou expirée.');
  }

  // Vérifier que le compte associé n'est pas en état "interdit".
  if (claims.type === 'user') {
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { status: true, deletedAt: true },
    });
    if (!user || user.deletedAt) {
      return jsonError('UNAUTHORIZED', 'Compte supprimé.');
    }
    if (user.status === 'BLOCKED') {
      return jsonError('FORBIDDEN', 'Compte bloqué.');
    }
  } else {
    const member = await prisma.member.findUnique({
      where: { id: claims.sub },
      select: { status: true, deletedAt: true, role: true },
    });
    if (!member || member.deletedAt) {
      return jsonError('UNAUTHORIZED', 'Compte staff supprimé.');
    }
    if (member.status !== 'ACTIVE') {
      return jsonError('FORBIDDEN', 'Compte staff inactif.');
    }
  }

  return {
    accountId: claims.sub,
    kind: claims.type,
    role: claims.role,
    sessionId: claims.sid,
  };
}

/// Variante qui exige un Member (staff) avec un rôle minimum.
export async function requireMember(
  req: NextRequest,
  minRole: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT' = 'SUPPORT',
): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (auth.kind !== 'member') {
    return jsonError('FORBIDDEN', 'Accès staff requis.');
  }
  const order: Record<string, number> = {
    SUPER_ADMIN: 4,
    ADMIN: 3,
    MODERATOR: 2,
    SUPPORT: 1,
  };
  const have = order[auth.role ?? ''] ?? 0;
  const need = order[minRole] ?? 0;
  if (have < need) {
    return jsonError('FORBIDDEN', 'Permission insuffisante.');
  }
  return auth;
}

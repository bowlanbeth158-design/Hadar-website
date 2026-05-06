// ─────────────────────────────────────────────────────────────────────────────
// Append-only audit log avec chaîne de hash.
//
// Chaque ligne contient :
//   - prevHash : hash de la ligne précédente (chaîne anti-tampering)
//   - hash     : SHA-256 des champs canoniques de cette ligne + prevHash
//
// Si un attaquant tente d'effacer une ligne historique (UPDATE/DELETE
// est déjà bloqué par un trigger Postgres, mais ceinture + bretelles),
// le chaînage casse à partir de cette ligne et un job d'intégrité
// détecte la rupture.
//
// Le payload (JSON détaillé) est CHIFFRÉ via lib/crypto/aes parce
// qu'il peut contenir de la PII (ex : email d'un user qu'on bloque,
// motif détaillé d'un rejet de signalement).
//
// IMPORTANT : appendAudit() doit être appelé APRÈS le commit de
// l'opération auditée. Sinon on peut auditer une opération qui a en
// fait rollback. Pour les opérations critiques où l'audit est
// indissociable, on peut aussi tout faire dans la même transaction
// — mais c'est plus rare.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import type { AuditActorType, Prisma } from '@prisma/client';
import { prisma } from './db';
import { encryptNullable } from './crypto/aes';

// Hash initial — sentinelle utilisée si aucune ligne n'existe encore
// dans AuditLog. Calculé au premier appel = SHA-256("hadar.audit.genesis")
// en hex, puis mémorisé.
let cachedGenesis: string | null = null;
function genesis(): string {
  if (cachedGenesis) return cachedGenesis;
  cachedGenesis = createHash('sha256')
    .update('hadar.audit.genesis')
    .digest('hex');
  return cachedGenesis;
}

export interface AuditEntry {
  actorType: AuditActorType;
  actorId?: string | null;
  /// Verbe.objet — ex 'report.publish', 'user.block',
  /// 'auth.login.success', 'auth.login.fail.bad-password'.
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  /// Objet libre, sera JSON.stringify puis chiffré. Mets-y tout ce qui
  /// est utile à l'analyse post-incident (avant/après, motif, etc.)
  /// SANS dépasser ~10 KB raisonnablement.
  payload?: Record<string, unknown> | null;
  /// Hashes IP / UA déjà calculés via hmacIp / hmacUserAgent.
  ipHash?: string | null;
  userAgentHash?: string | null;
}

/// Calcule le hash d'une ligne d'audit. Inputs canoniques séparés
/// par "|" pour éviter les ambiguïtés (a|b ≠ ab).
function computeHash(
  entry: AuditEntry,
  prevHash: string,
  createdAt: Date,
): string {
  const h = createHash('sha256');
  h.update(entry.actorType);
  h.update('|');
  h.update(entry.actorId ?? '');
  h.update('|');
  h.update(entry.action);
  h.update('|');
  h.update(entry.targetType ?? '');
  h.update('|');
  h.update(entry.targetId ?? '');
  h.update('|');
  h.update(createdAt.toISOString());
  h.update('|');
  h.update(prevHash);
  return h.digest('hex');
}

/// Insère une ligne d'audit. Lit la dernière ligne pour récupérer son
/// hash, le chaîne, encrypte le payload, insère.
///
/// Race condition possible : si deux appendAudit() s'exécutent en
/// parallèle, ils peuvent lire le même prevHash → seul le premier à
/// commit "voit" l'autre, l'autre se base sur un prevHash maintenant
/// obsolète. Pour un MVP, c'est acceptable (les deux lignes existeront
/// toujours, juste la chaîne aura un fork). Pour une intégrité
/// stricte, on bascule sur SERIALIZABLE ou on prend un advisory lock
/// avant l'insert.
export async function appendAudit(entry: AuditEntry): Promise<void> {
  const last = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });
  const prevHash = last?.hash ?? genesis();
  const createdAt = new Date();
  const hash = computeHash(entry, prevHash, createdAt);

  const payloadEncrypted = entry.payload
    ? encryptNullable(JSON.stringify(entry.payload))
    : null;

  await prisma.auditLog.create({
    data: {
      actorType: entry.actorType,
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      ipHash: entry.ipHash ?? null,
      userAgentHash: entry.userAgentHash ?? null,
      payloadEncrypted,
      prevHash,
      hash,
      createdAt,
    },
  });
}

/// Variante transactionnelle — à utiliser quand on veut que l'audit
/// soit atomique avec une autre mutation (rollback ensemble).
/// Le caller passe le tx, on s'aligne dessus.
export async function appendAuditInTx(
  tx: Prisma.TransactionClient,
  entry: AuditEntry,
): Promise<void> {
  const last = await tx.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });
  const prevHash = last?.hash ?? genesis();
  const createdAt = new Date();
  const hash = computeHash(entry, prevHash, createdAt);

  const payloadEncrypted = entry.payload
    ? encryptNullable(JSON.stringify(entry.payload))
    : null;

  await tx.auditLog.create({
    data: {
      actorType: entry.actorType,
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      ipHash: entry.ipHash ?? null,
      userAgentHash: entry.userAgentHash ?? null,
      payloadEncrypted,
      prevHash,
      hash,
      createdAt,
    },
  });
}

/// Vérifie l'intégrité de la chaîne sur tout le log (job de monitoring).
/// Retourne le nombre de ruptures détectées (0 = chaîne OK).
export async function verifyAuditChain(): Promise<{
  total: number;
  breaks: Array<{ id: string; expectedPrevHash: string; actualPrevHash: string }>;
}> {
  const all = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      actorType: true,
      actorId: true,
      action: true,
      targetType: true,
      targetId: true,
      createdAt: true,
      prevHash: true,
      hash: true,
    },
  });

  const breaks: Array<{
    id: string;
    expectedPrevHash: string;
    actualPrevHash: string;
  }> = [];

  let expectedPrev = genesis();
  for (const row of all) {
    if (row.prevHash !== expectedPrev) {
      breaks.push({
        id: row.id,
        expectedPrevHash: expectedPrev,
        actualPrevHash: row.prevHash,
      });
    }
    // Recalcule le hash de cette ligne et vérifie qu'il match
    const recomputed = computeHash(
      {
        actorType: row.actorType,
        actorId: row.actorId,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
      },
      row.prevHash,
      row.createdAt,
    );
    if (recomputed !== row.hash) {
      breaks.push({
        id: row.id,
        expectedPrevHash: recomputed,
        actualPrevHash: row.hash,
      });
    }
    expectedPrev = row.hash;
  }

  return { total: all.length, breaks };
}

// Utilisé par les tests pour court-circuiter prisma.
export const _internal = { computeHash, genesis };

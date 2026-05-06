// ─────────────────────────────────────────────────────────────────────────────
// Job : retention-purge.ts
//
// Lancement : tous les jours à 03h00 (heure locale Maroc) via cron.
// Exécution :
//   tsx scripts/jobs/retention-purge.ts
//
// Tâches effectuées (dans l'ordre, chacune dans une trace
// DataRetentionJob distincte pour la traçabilité CNDP) :
//
//   1. Évidences signalements (Report.evidenceAutoPurgeAt < now)
//      → suppression Spaces + ReportEvidence.deletedAt + flag
//        Report.evidencesPurgedAt
//
//   2. CIN/selfie vérifications (IdentityVerification.autoDeleteAt
//      < now et filesDeletedAt is null)
//      → suppression Spaces + IdentityVerification.filesDeletedAt
//      → on garde le pHash et la ligne pour anti-doublon
//
//   3. Sessions expirées ou révoquées depuis > 30j
//      → DELETE physique
//
//   4. LoginAttempt > 30j
//      → DELETE physique
//
//   5. ShortLivedToken expirés depuis > 7j
//      → DELETE physique
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { spaces } from '../../lib/storage/spaces';
import { decrypt } from '../../lib/crypto/aes';

const prisma = new PrismaClient();

async function logJob(
  jobKind: string,
  fn: () => Promise<{ scanned: number; purged: number; errored: number; details?: unknown }>,
) {
  const startedAt = new Date();
  const job = await prisma.dataRetentionJob.create({
    data: { jobKind, startedAt },
  });
  console.log(`▶ ${jobKind} démarré (id=${job.id})`);
  try {
    const r = await fn();
    await prisma.dataRetentionJob.update({
      where: { id: job.id },
      data: {
        finishedAt: new Date(),
        itemsScanned: r.scanned,
        itemsPurged: r.purged,
        itemsErrored: r.errored,
        details: (r.details ?? {}) as object,
      },
    });
    console.log(
      `✔ ${jobKind} terminé : ${r.purged}/${r.scanned} purgés, ${r.errored} erreurs`,
    );
  } catch (err) {
    await prisma.dataRetentionJob.update({
      where: { id: job.id },
      data: {
        finishedAt: new Date(),
        details: { error: String(err) },
      },
    });
    console.error(`✗ ${jobKind} crash :`, err);
  }
}

// ── 1. Évidences signalements > 90j ───────────────────────────────────────
async function purgeReportEvidences() {
  const reports = await prisma.report.findMany({
    where: {
      evidenceAutoPurgeAt: { lt: new Date() },
      evidencesPurgedAt: null,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      evidences: { where: { deletedAt: null }, select: { id: true, objectKey: true } },
    },
  });

  let scanned = 0;
  let purged = 0;
  let errored = 0;

  for (const r of reports) {
    for (const ev of r.evidences) {
      scanned++;
      try {
        await spaces.deleteObject(ev.objectKey);
        await prisma.reportEvidence.update({
          where: { id: ev.id },
          data: { deletedAt: new Date() },
        });
        purged++;
      } catch (err) {
        console.error(`  ✗ evidence ${ev.id}:`, err);
        errored++;
      }
    }
    await prisma.report.update({
      where: { id: r.id },
      data: { evidencesPurgedAt: new Date() },
    });
  }
  return { scanned, purged, errored };
}

// ── 2. CIN/selfie vérifications ──────────────────────────────────────────
async function purgeIdentityFiles() {
  const verifs = await prisma.identityVerification.findMany({
    where: {
      autoDeleteAt: { lt: new Date() },
      filesDeletedAt: null,
    },
    select: {
      id: true,
      cinObjectKeyEncrypted: true,
      selfieObjectKeyEncrypted: true,
    },
  });

  let scanned = 0;
  let purged = 0;
  let errored = 0;

  for (const v of verifs) {
    scanned += 2;
    try {
      const cinKey = decrypt(v.cinObjectKeyEncrypted);
      const selfieKey = decrypt(v.selfieObjectKeyEncrypted);
      await spaces.deleteObject(cinKey);
      await spaces.deleteObject(selfieKey);
      purged += 2;
      await prisma.identityVerification.update({
        where: { id: v.id },
        data: { filesDeletedAt: new Date() },
      });
    } catch (err) {
      console.error(`  ✗ verification ${v.id}:`, err);
      errored += 2;
    }
  }
  return { scanned, purged, errored };
}

// ── 3. Sessions ───────────────────────────────────────────────────────────
async function purgeSessions() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { revokedAt: { lt: cutoff } },
      ],
    },
  });
  return { scanned: result.count, purged: result.count, errored: 0 };
}

// ── 4. LoginAttempt > 30j ────────────────────────────────────────────────
async function purgeLoginAttempts() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.loginAttempt.deleteMany({
    where: { attemptedAt: { lt: cutoff } },
  });
  return { scanned: result.count, purged: result.count, errored: 0 };
}

// ── 5. ShortLivedToken expirés > 7j ──────────────────────────────────────
async function purgeExpiredTokens() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.shortLivedToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { usedAt: { lt: cutoff } },
      ],
    },
  });
  return { scanned: result.count, purged: result.count, errored: 0 };
}

async function main() {
  await logJob('report.evidences', purgeReportEvidences);
  await logJob('verification.files', purgeIdentityFiles);
  await logJob('session.expired', purgeSessions);
  await logJob('login_attempt.old', purgeLoginAttempts);
  await logJob('token.expired', purgeExpiredTokens);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

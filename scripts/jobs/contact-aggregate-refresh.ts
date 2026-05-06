// ─────────────────────────────────────────────────────────────────────────────
// Job : contact-aggregate-refresh.ts
//
// Lancement : toutes les heures (le calcul est aussi fait inline à
// chaque publish, ce job est un filet de sécurité au cas où une
// modération aurait raté la mise à jour).
//
// Recompose ContactAggregate à partir des Reports PUBLISHED :
//   - totalReports = COUNT(*)
//   - distinctReporters = COUNT(DISTINCT userId)
//   - riskLevel = mapping(distinctReporters)
//
// Effet bonus : flag les Alert où knownRiskLevel < currentRiskLevel
// pour que le job d'envoi d'emails picke et notifie les abonnés.
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable no-console */
import { PrismaClient, RiskLevel } from '@prisma/client';

const prisma = new PrismaClient();

function nextRiskLevel(distinctReporters: number): RiskLevel {
  if (distinctReporters === 0) return 'FAIBLE';
  if (distinctReporters <= 2) return 'VIGILANCE';
  if (distinctReporters <= 4) return 'MODERE';
  return 'ELEVE';
}

async function refresh() {
  const startedAt = new Date();
  const job = await prisma.dataRetentionJob.create({
    data: { jobKind: 'contact_aggregate.refresh', startedAt },
  });

  // Récupère tous les hashes/canaux qui ont au moins un report PUBLISHED.
  const groups = await prisma.report.groupBy({
    by: ['contactValueHash', 'channel'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
  });

  let scanned = 0;
  let updated = 0;

  for (const g of groups) {
    scanned++;
    // Distinct reporters count.
    const distinctReporters = await prisma.report.findMany({
      where: {
        contactValueHash: g.contactValueHash,
        channel: g.channel,
        status: 'PUBLISHED',
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const distinct = distinctReporters.length;

    // First/last publishedAt.
    const [first, last] = await Promise.all([
      prisma.report.findFirst({
        where: {
          contactValueHash: g.contactValueHash,
          channel: g.channel,
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'asc' },
        select: { publishedAt: true, contactValueNormalized: true },
      }),
      prisma.report.findFirst({
        where: {
          contactValueHash: g.contactValueHash,
          channel: g.channel,
          status: 'PUBLISHED',
        },
        orderBy: { publishedAt: 'desc' },
        select: { publishedAt: true },
      }),
    ]);

    if (!first) continue;

    await prisma.contactAggregate.upsert({
      where: {
        contactValueHash_channel: {
          contactValueHash: g.contactValueHash,
          channel: g.channel,
        },
      },
      create: {
        contactValueHash: g.contactValueHash,
        channel: g.channel,
        contactValueNormalized: first.contactValueNormalized,
        totalReports: g._count._all,
        distinctReporters: distinct,
        riskLevel: nextRiskLevel(distinct),
        firstReportAt: first.publishedAt,
        lastReportAt: last?.publishedAt ?? first.publishedAt,
      },
      update: {
        totalReports: g._count._all,
        distinctReporters: distinct,
        riskLevel: nextRiskLevel(distinct),
        lastReportAt: last?.publishedAt ?? first.publishedAt,
      },
    });
    updated++;
  }

  await prisma.dataRetentionJob.update({
    where: { id: job.id },
    data: {
      finishedAt: new Date(),
      itemsScanned: scanned,
      itemsPurged: 0,
      itemsErrored: 0,
      details: { aggregatesUpdated: updated },
    },
  });
  console.log(`✔ contact_aggregate.refresh : ${updated}/${scanned} mis à jour`);
}

refresh()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

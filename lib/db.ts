// ─────────────────────────────────────────────────────────────────────────────
// Client Prisma singleton.
//
// En dev, Next.js recharge les modules à chaque modification → sans
// singleton, on créerait une nouvelle instance PrismaClient à chaque
// reload, ce qui sature rapidement le pool de connexions Postgres
// ("too many connections"). En attachant l'instance à `globalThis`, on
// garantit qu'une seule existe par process Node.
//
// En prod, le module est chargé une seule fois → la branche
// `globalForPrisma.prisma ?? new PrismaClient()` retombe systématiquement
// sur une nouvelle instance, ce qui est correct.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Logs : en dev on veut voir les warn / error mais pas le flot de
    // queries (configurable via DEBUG=prisma:* si besoin). En prod on
    // ne logue que les errors — les query logs partent dans pino via
    // la couche route, pas ici.
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

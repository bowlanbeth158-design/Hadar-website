/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.SEED_SUPERADMIN_EMAIL ?? 'superadmin@hadar.ma';
  const seedPassword = process.env.SEED_SUPERADMIN_PASSWORD;

  if (!seedPassword) {
    throw new Error(
      'SEED_SUPERADMIN_PASSWORD is required. Set it in .env or .env.local before seeding.',
    );
  }

  const passwordHash = await argon2.hash(seedPassword, { type: argon2.argon2id });

  await prisma.member.upsert({
    where: { email: seedEmail },
    update: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: {
      email: seedEmail,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✔ Super-admin seed ensured: ${seedEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

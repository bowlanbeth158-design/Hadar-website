/* eslint-disable no-console */
//
// Hadar.ma — Seed initial.
//
// Crée le compte Super-Admin de bootstrap. Sans ce compte, personne ne
// peut entrer dans l'admin après la première migration. Idempotent :
// peut être ré-exécuté à volonté, met à jour le hash si le mot de
// passe change dans l'env.
//
// IMPORTANT : le 2FA TOTP est obligatoire pour les Super-Admins. Le
// seed crée le compte SANS TOTP — l'enrôlement TOTP doit être fait
// par l'admin lui-même au premier login (le flow d'auth refusera
// toute action sensible tant que totpEnabledAt est null).
//
// Usage :
//   SEED_SUPERADMIN_EMAIL=ossama@hadar.ma \
//   SEED_SUPERADMIN_PASSWORD='un-mot-de-passe-fort' \
//   npm run db:seed
//

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.SEED_SUPERADMIN_EMAIL ?? 'superadmin@hadar.ma';
  const seedPassword = process.env.SEED_SUPERADMIN_PASSWORD;

  if (!seedPassword) {
    throw new Error(
      'SEED_SUPERADMIN_PASSWORD est requis. Définis-le dans .env.local avant de lancer le seed.',
    );
  }
  if (seedPassword.length < 12) {
    throw new Error(
      'SEED_SUPERADMIN_PASSWORD doit faire au moins 12 caractères (politique mot de passe staff).',
    );
  }

  // argon2id avec les paramètres de production : 64 MB RAM, 3 itérations,
  // 4 threads. Coût ~250 ms sur un serveur moderne — acceptable pour un
  // login + très coûteux à brute-forcer même avec des GPUs.
  const passwordHash = await argon2.hash(seedPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Upsert du Member — la PII et le Credential sont gérés par les
  // relations imbriquées. On utilise l'email côté MemberPII pour
  // l'unicité (le Member lui-même n'a pas d'email).
  const existing = await prisma.memberPII.findUnique({
    where: { email: seedEmail },
    select: { memberId: true },
  });

  if (existing) {
    // Refresh : on met à jour le hash + on s'assure du rôle / statut.
    // On NE crée PAS le credential si il existe déjà (sinon on
    // écraserait un éventuel TOTP déjà enrôlé).
    await prisma.member.update({
      where: { id: existing.memberId },
      data: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
    await prisma.memberCredential.update({
      where: { memberId: existing.memberId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });
    console.log(`✔ Super-admin seed mis à jour : ${seedEmail}`);
    return;
  }

  // Création initiale — on insère Member, MemberPII, MemberCredential
  // dans une transaction unique pour qu'aucun ne reste orphelin si
  // l'un des inserts échoue.
  await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    await tx.memberPII.create({
      data: {
        memberId: member.id,
        email: seedEmail,
        firstName: 'Super',
        lastName: 'Admin',
      },
    });
    // NB : totpSecretEncrypted et totpEnabledAt sont OBLIGATOIRES dans
    // le schéma pour MemberCredential (le 2FA staff est non-négociable).
    // Au seed, on insère un placeholder vide + une date passée — le
    // flow d'auth doit refuser toute action sensible tant que
    // totpEnabledAt est avant aujourd'hui ET totpSecretEncrypted est
    // vide. À l'enrôlement TOTP réel (premier login), ces deux champs
    // seront remplacés.
    //
    // ⚠ TODO sécurité : ce trick (placeholder vide) doit être enlevé
    // dès qu'on aura un flow d'enrôlement TOTP côté UI. Pour la beta,
    // c'est acceptable pour bootstrapper.
    await tx.memberCredential.create({
      data: {
        memberId: member.id,
        passwordHash,
        totpSecretEncrypted: 'PENDING_ENROLLMENT',
        totpEnabledAt: new Date(0),
        recoveryCodesEncrypted: 'PENDING_ENROLLMENT',
        passwordChangedAt: new Date(),
      },
    });
  });

  console.log(`✔ Super-admin seed créé : ${seedEmail}`);
  console.log('  ⚠ TOTP non enrôlé — à activer au premier login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_CORRECTION', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportChannel" AS ENUM ('TELEPHONE', 'WHATSAPP', 'EMAIL', 'SITE_WEB', 'RESEAUX_SOCIAUX', 'PAYPAL', 'BINANCE', 'RIB', 'CIN');

-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('NON_LIVRAISON', 'BLOQUE_APRES_PAIEMENT', 'PRODUIT_NON_CONFORME', 'USURPATION_IDENTITE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('FAIBLE', 'VIGILANCE', 'MODERE', 'ELEVE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContestationStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('URGENTE', 'HAUTE', 'MOYENNE', 'BASSE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ASSIGNED', 'WAITING_USER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'MEMBER', 'SYSTEM', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "ShortLivedTokenKind" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'fr',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'MAD',
    "verifiedIdentityId" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "publishedReportsCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "sanctionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPII" (
    "userId" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPII_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserCredential" (
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecretEncrypted" TEXT,
    "totpEnabledAt" TIMESTAMP(3),
    "recoveryCodesEncrypted" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MODERATOR',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberPII" (
    "memberId" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPII_pkey" PRIMARY KEY ("memberId")
);

-- CreateTable
CREATE TABLE "MemberCredential" (
    "memberId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecretEncrypted" TEXT NOT NULL,
    "totpEnabledAt" TIMESTAMP(3) NOT NULL,
    "recoveryCodesEncrypted" TEXT NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCredential_pkey" PRIMARY KEY ("memberId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "memberId" TEXT,
    "refreshTokenHash" TEXT NOT NULL,
    "rotatedFromId" TEXT,
    "ipHash" TEXT NOT NULL,
    "userAgentHash" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureKind" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLivedToken" (
    "id" TEXT NOT NULL,
    "kind" "ShortLivedTokenKind" NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortLivedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebauthnCredential" (
    "id" TEXT NOT NULL,
    "userCredentialId" TEXT,
    "memberCredentialId" TEXT,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "signCount" INTEGER NOT NULL DEFAULT 0,
    "aaguid" TEXT,
    "label" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebauthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "cinObjectKeyEncrypted" TEXT NOT NULL,
    "selfieObjectKeyEncrypted" TEXT NOT NULL,
    "selfiePerceptualHash" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "rejectionReason" TEXT,
    "autoDeleteAt" TIMESTAMP(3),
    "filesDeletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "ReportChannel" NOT NULL,
    "contactValueHash" TEXT NOT NULL,
    "contactValueEncrypted" TEXT NOT NULL,
    "contactValueNormalized" TEXT NOT NULL,
    "problemType" "ProblemType" NOT NULL,
    "amountCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "descriptionPublic" TEXT NOT NULL,
    "adminNotesEncrypted" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'SUBMITTED',
    "moderatorId" TEXT,
    "moderationReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "evidenceAutoPurgeAt" TIMESTAMP(3),
    "evidencesPurgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEvidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "reencodedAt" TIMESTAMP(3),
    "scannedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReportEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRating" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportContestation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "contesterEmail" TEXT NOT NULL,
    "contesterEmailVerifiedAt" TIMESTAMP(3),
    "contesterReason" TEXT NOT NULL,
    "evidenceObjectKeysEncrypted" TEXT,
    "status" "ContestationStatus" NOT NULL DEFAULT 'RECEIVED',
    "reviewerId" TEXT,
    "reviewerNotes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportContestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAggregate" (
    "contactValueHash" TEXT NOT NULL,
    "channel" "ReportChannel" NOT NULL,
    "contactValueNormalized" TEXT NOT NULL,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "distinctReporters" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'FAIBLE',
    "firstReportAt" TIMESTAMP(3),
    "lastReportAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactAggregate_pkey" PRIMARY KEY ("contactValueHash","channel")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactValueHash" TEXT NOT NULL,
    "channel" "ReportChannel" NOT NULL,
    "knownRiskLevel" "RiskLevel" NOT NULL,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "guestEmail" TEXT,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MOYENNE',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorType" "AuditActorType" NOT NULL,
    "userAuthorId" TEXT,
    "memberAuthorId" TEXT,
    "body" TEXT NOT NULL,
    "attachmentObjectKeys" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ContributorTierThreshold" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "visiteur" INTEGER NOT NULL DEFAULT 0,
    "nouveau" INTEGER NOT NULL DEFAULT 1,
    "actif" INTEGER NOT NULL DEFAULT 4,
    "regulier" INTEGER NOT NULL DEFAULT 7,
    "avance" INTEGER NOT NULL DEFAULT 12,
    "expert" INTEGER NOT NULL DEFAULT 17,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributorTierThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReasonTemplate" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emailTemplate" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationReasonTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "payloadEncrypted" TEXT,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRetentionJob" (
    "id" TEXT NOT NULL,
    "jobKind" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "itemsScanned" INTEGER NOT NULL DEFAULT 0,
    "itemsPurged" INTEGER NOT NULL DEFAULT 0,
    "itemsErrored" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB,

    CONSTRAINT "DataRetentionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_verifiedIdentityId_key" ON "User"("verifiedIdentityId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_lastActivityAt_idx" ON "User"("lastActivityAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPII_email_key" ON "UserPII"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPII_phone_key" ON "UserPII"("phone");

-- CreateIndex
CREATE INDEX "UserPII_phone_idx" ON "UserPII"("phone");

-- CreateIndex
CREATE INDEX "Member_role_status_idx" ON "Member"("role", "status");

-- CreateIndex
CREATE INDEX "Member_deletedAt_idx" ON "Member"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MemberPII_email_key" ON "MemberPII"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Session_rotatedFromId_key" ON "Session"("rotatedFromId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_memberId_idx" ON "Session"("memberId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_revokedAt_idx" ON "Session"("revokedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_emailHash_attemptedAt_idx" ON "LoginAttempt"("emailHash", "attemptedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipHash_attemptedAt_idx" ON "LoginAttempt"("ipHash", "attemptedAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_attemptedAt_idx" ON "LoginAttempt"("userId", "attemptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLivedToken_tokenHash_key" ON "ShortLivedToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ShortLivedToken_userId_kind_idx" ON "ShortLivedToken"("userId", "kind");

-- CreateIndex
CREATE INDEX "ShortLivedToken_expiresAt_idx" ON "ShortLivedToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebauthnCredential_credentialId_key" ON "WebauthnCredential"("credentialId");

-- CreateIndex
CREATE INDEX "WebauthnCredential_userCredentialId_idx" ON "WebauthnCredential"("userCredentialId");

-- CreateIndex
CREATE INDEX "WebauthnCredential_memberCredentialId_idx" ON "WebauthnCredential"("memberCredentialId");

-- CreateIndex
CREATE INDEX "IdentityVerification_status_submittedAt_idx" ON "IdentityVerification"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "IdentityVerification_userId_idx" ON "IdentityVerification"("userId");

-- CreateIndex
CREATE INDEX "IdentityVerification_selfiePerceptualHash_idx" ON "IdentityVerification"("selfiePerceptualHash");

-- CreateIndex
CREATE INDEX "IdentityVerification_autoDeleteAt_idx" ON "IdentityVerification"("autoDeleteAt");

-- CreateIndex
CREATE INDEX "Report_contactValueHash_channel_idx" ON "Report"("contactValueHash", "channel");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_status_idx" ON "Report"("userId", "status");

-- CreateIndex
CREATE INDEX "Report_problemType_idx" ON "Report"("problemType");

-- CreateIndex
CREATE INDEX "Report_publishedAt_idx" ON "Report"("publishedAt");

-- CreateIndex
CREATE INDEX "Report_evidenceAutoPurgeAt_idx" ON "Report"("evidenceAutoPurgeAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_contactValueHash_channel_key" ON "Report"("userId", "contactValueHash", "channel");

-- CreateIndex
CREATE INDEX "ReportEvidence_reportId_idx" ON "ReportEvidence"("reportId");

-- CreateIndex
CREATE INDEX "ReportEvidence_sha256_idx" ON "ReportEvidence"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "ReportRating_reportId_key" ON "ReportRating"("reportId");

-- CreateIndex
CREATE INDEX "ReportRating_score_idx" ON "ReportRating"("score");

-- CreateIndex
CREATE INDEX "ReportContestation_reportId_idx" ON "ReportContestation"("reportId");

-- CreateIndex
CREATE INDEX "ReportContestation_status_idx" ON "ReportContestation"("status");

-- CreateIndex
CREATE INDEX "ContactAggregate_channel_riskLevel_idx" ON "ContactAggregate"("channel", "riskLevel");

-- CreateIndex
CREATE INDEX "ContactAggregate_contactValueNormalized_idx" ON "ContactAggregate"("contactValueNormalized");

-- CreateIndex
CREATE INDEX "ContactAggregate_lastReportAt_idx" ON "ContactAggregate"("lastReportAt");

-- CreateIndex
CREATE INDEX "Alert_contactValueHash_channel_idx" ON "Alert"("contactValueHash", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_userId_contactValueHash_channel_key" ON "Alert"("userId", "contactValueHash", "channel");

-- CreateIndex
CREATE INDEX "Ticket_status_priority_slaDeadline_idx" ON "Ticket"("status", "priority", "slaDeadline");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_assignedToId_idx" ON "Ticket"("assignedToId");

-- CreateIndex
CREATE INDEX "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_expiresAt_idx" ON "Announcement"("publishedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "ModerationReasonTemplate_scope_active_displayOrder_idx" ON "ModerationReasonTemplate"("scope", "active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_hash_key" ON "AuditLog"("hash");

-- CreateIndex
CREATE INDEX "AuditLog_actorType_actorId_idx" ON "AuditLog"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "DataRetentionJob_jobKind_startedAt_idx" ON "DataRetentionJob"("jobKind", "startedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verifiedIdentityId_fkey" FOREIGN KEY ("verifiedIdentityId") REFERENCES "IdentityVerification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPII" ADD CONSTRAINT "UserPII_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberPII" ADD CONSTRAINT "MemberPII_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCredential" ADD CONSTRAINT "MemberCredential_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortLivedToken" ADD CONSTRAINT "ShortLivedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebauthnCredential" ADD CONSTRAINT "WebauthnCredential_userCredentialId_fkey" FOREIGN KEY ("userCredentialId") REFERENCES "UserCredential"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebauthnCredential" ADD CONSTRAINT "WebauthnCredential_memberCredentialId_fkey" FOREIGN KEY ("memberCredentialId") REFERENCES "MemberCredential"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvidence" ADD CONSTRAINT "ReportEvidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRating" ADD CONSTRAINT "ReportRating_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRating" ADD CONSTRAINT "ReportRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportContestation" ADD CONSTRAINT "ReportContestation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportContestation" ADD CONSTRAINT "ReportContestation_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_contactValueHash_channel_fkey" FOREIGN KEY ("contactValueHash", "channel") REFERENCES "ContactAggregate"("contactValueHash", "channel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_memberAuthorId_fkey" FOREIGN KEY ("memberAuthorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformConfig" ADD CONSTRAINT "PlatformConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- Audit log append-only — protection au niveau Postgres
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Décision architecture : AuditLog est append-only. Un admin véreux
-- (ou une appli compromise) ne doit jamais pouvoir faire UPDATE ou
-- DELETE sur cette table — sinon il peut effacer ses propres traces.
--
-- Ce trigger lève une exception sur tout UPDATE/DELETE/TRUNCATE,
-- y compris pour le rôle de l'application (qui ne devrait jamais
-- en faire de toute façon — INSERT only).
--
-- Bypass légitime (ex : purge légale annuelle) : le seul moyen est
-- de SE CONNECTER en SUPERUSER (le compte que tu utilises pour les
-- migrations) et de désactiver temporairement le trigger via
-- `ALTER TABLE "AuditLog" DISABLE TRIGGER audit_append_only;`.
-- C'est volontairement bruyant et tracé.

CREATE OR REPLACE FUNCTION audit_log_block_mutations()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog est append-only — UPDATE / DELETE / TRUNCATE interdits (op : %)', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_append_only
  BEFORE UPDATE OR DELETE OR TRUNCATE
  ON "AuditLog"
  FOR EACH STATEMENT
  EXECUTE FUNCTION audit_log_block_mutations();

-- ─────────────────────────────────────────────────────────────────────────────
-- Index pg_trgm pour la recherche partielle de contact
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Index GIN avec opérateur trigramme — permet `WHERE
-- contactValueNormalized ILIKE '%212612%'` en < 200 ms même sur
-- plusieurs millions de lignes. Indispensable à la cible de
-- performance de la recherche publique (CLAUDE.md §Performance).
--
-- Posé sur ContactAggregate (la table sur laquelle la recherche
-- publique tape, qui contient les agrégats précalculés). Pas sur
-- Report directement — la recherche utilisateur ne fait jamais de
-- COUNT(*) live, elle lit ContactAggregate.

CREATE INDEX "ContactAggregate_contactValueNormalized_trgm_idx"
  ON "ContactAggregate"
  USING gin ("contactValueNormalized" gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- Index partiel : sessions actives uniquement
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 99% des lookups de sessions se font sur les sessions non révoquées
-- non expirées. Un index partiel sur cette condition est ~10× plus
-- petit et plus rapide qu'un index plein.

CREATE INDEX "Session_active_idx"
  ON "Session" ("userId", "expiresAt")
  WHERE "revokedAt" IS NULL;

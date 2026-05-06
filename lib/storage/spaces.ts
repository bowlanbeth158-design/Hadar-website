// ─────────────────────────────────────────────────────────────────────────────
// Stub provider stockage objet (DigitalOcean Spaces).
//
// V1 : on simule avec un object key déterministe. En prod, ce module
// utilisera @aws-sdk/client-s3 (Spaces est S3-compatible) pour :
//   - PUT signed URLs (upload direct depuis le navigateur)
//   - GET signed URLs (5 min TTL, IP-bound idéalement)
//   - DELETE pour les jobs de rétention
//
// Le call-site ne change pas — uniquement l'implémentation interne
// quand on branchera Spaces réellement.
// ─────────────────────────────────────────────────────────────────────────────

import { generateRandomToken } from '../crypto/hash';

const BUCKET = process.env.SPACES_BUCKET ?? 'hadar-uploads';

export interface PresignedUploadUrl {
  /// URL à utiliser côté client pour faire un PUT direct.
  uploadUrl: string;
  /// Object key à stocker en DB (ReportEvidence.objectKey, etc.).
  objectKey: string;
  /// Headers à inclure dans le PUT côté client.
  headers: Record<string, string>;
  /// Date d'expiration de l'URL.
  expiresAt: Date;
}

export interface SpacesProvider {
  generateUploadUrl(opts: {
    prefix: string;
    contentType: string;
    maxSizeBytes: number;
  }): Promise<PresignedUploadUrl>;
  generateDownloadUrl(objectKey: string, ttlSec?: number): Promise<string>;
  deleteObject(objectKey: string): Promise<void>;
}

class StubSpaces implements SpacesProvider {
  async generateUploadUrl(opts: {
    prefix: string;
    contentType: string;
    maxSizeBytes: number;
  }): Promise<PresignedUploadUrl> {
    const filename = generateRandomToken(16);
    const objectKey = `${opts.prefix}/${filename}`;
    return {
      // En dev/stub : URL fictive. Le front recevra une 501 s'il
      // essaie vraiment d'uploader.
      uploadUrl: `https://${BUCKET}.stub-spaces.local/${objectKey}`,
      objectKey,
      headers: { 'Content-Type': opts.contentType },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  async generateDownloadUrl(objectKey: string, ttlSec = 300): Promise<string> {
    void ttlSec;
    return `https://${BUCKET}.stub-spaces.local/${objectKey}?signed=stub`;
  }

  async deleteObject(objectKey: string): Promise<void> {
    // En stub, no-op. En prod : appel S3 DeleteObject.
    void objectKey;
  }
}

export const spaces: SpacesProvider = new StubSpaces();

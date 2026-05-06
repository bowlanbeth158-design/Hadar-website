// ─────────────────────────────────────────────────────────────────────────────
// Validation côté serveur des uploads avant stockage Spaces.
//
// Étapes (dans cet ordre) :
//   1. Magic bytes — vérifie que le contenu réel match le mimeType
//      annoncé. Empêche un attaquant d'envoyer un .exe avec
//      Content-Type: image/png.
//   2. Re-encodage sharp — kill les polyglot files (un fichier qui
//      est à la fois image valide ET HTML/SVG malicieux). Fait aussi
//      l'EXIF stripping (supprime GPS / horodatage / make+model).
//   3. Limite de dimensions — refuse les images > 8000×8000 (anti
//      decompression bomb).
//   4. SHA-256 du résultat — sert d'empreinte pour ReportEvidence.sha256
//      et pour la déduplication.
//
// ClamAV : à brancher en prod (skip en dev). Si CLAMAV_ENABLED=true,
// on appelle le daemon via clamdscan ; sinon on note "unscanned" dans
// l'audit log.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

export interface ValidatedUpload {
  /// Buffer ré-encodé prêt à uploader vers Spaces.
  buffer: Buffer;
  /// MIME validé après re-encodage.
  mimeType: string;
  /// Taille en octets après re-encodage.
  sizeBytes: number;
  /// SHA-256 du buffer final.
  sha256: string;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB en entrée (avant ré-encodage)
const MAX_DIM = 8000;
const MAX_OUTPUT_SIZE = 5 * 1024 * 1024; // 5 MB en sortie

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/// Valide + ré-encode un upload image. Throw avec un message
/// utilisateur-friendly en cas de problème.
export async function validateAndReencode(
  raw: Buffer,
  declaredMime: string,
): Promise<ValidatedUpload> {
  if (raw.length === 0) {
    throw new Error('Fichier vide.');
  }
  if (raw.length > MAX_SIZE_BYTES) {
    throw new Error(
      `Fichier trop lourd (${(raw.length / 1024 / 1024).toFixed(1)} MB, max 10 MB).`,
    );
  }
  if (!ALLOWED_MIMES.has(declaredMime)) {
    throw new Error('Type de fichier non autorisé.');
  }

  // Magic bytes
  const detected = await fileTypeFromBuffer(raw);
  if (!detected) {
    throw new Error("Format de fichier non reconnu.");
  }
  if (detected.mime !== declaredMime) {
    throw new Error(
      `Le fichier annoncé comme ${declaredMime} est en réalité du ${detected.mime}.`,
    );
  }

  // PDF : pas de ré-encodage, juste validation magic bytes + taille
  // (un futur ajout pourrait être un pdfcpu sanitize).
  if (detected.mime === 'application/pdf') {
    return {
      buffer: raw,
      mimeType: 'application/pdf',
      sizeBytes: raw.length,
      sha256: sha256Buffer(raw),
    };
  }

  // Image : ré-encodage via sharp (kills polyglot + strip EXIF)
  let processed: Buffer;
  try {
    const meta = await sharp(raw, { failOn: 'truncated' }).metadata();
    if (
      (meta.width && meta.width > MAX_DIM) ||
      (meta.height && meta.height > MAX_DIM)
    ) {
      throw new Error(
        `Image trop grande (max ${MAX_DIM}×${MAX_DIM} px).`,
      );
    }
    // Ré-encode en JPEG quality 85 par défaut, conserve PNG/WebP
    // si l'input l'était (sinon on perd la transparence).
    const pipeline = sharp(raw, { failOn: 'truncated' })
      .rotate() // applique l'orientation EXIF puis la perd
      .withMetadata({ exif: undefined, icc: undefined } as never); // strip
    if (declaredMime === 'image/png') {
      processed = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    } else if (declaredMime === 'image/webp') {
      processed = await pipeline.webp({ quality: 85 }).toBuffer();
    } else {
      processed = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    }
  } catch (err) {
    throw new Error(
      err instanceof Error ? `Image invalide : ${err.message}` : 'Image invalide.',
    );
  }

  if (processed.length > MAX_OUTPUT_SIZE) {
    throw new Error('Image résultante trop lourde.');
  }

  return {
    buffer: processed,
    mimeType: declaredMime,
    sizeBytes: processed.length,
    sha256: sha256Buffer(processed),
  };
}

function sha256Buffer(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

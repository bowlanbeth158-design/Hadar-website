// ─────────────────────────────────────────────────────────────────────────────
// 2FA TOTP (RFC 6238) — utilise la lib otpauth (RFC 6238 + 4226).
//
// Flow d'enrôlement :
//   1. POST /api/auth/2fa/setup → génère un secret aléatoire de 20
//      octets (160 bits, recommandation RFC 4226), le chiffre via
//      lib/crypto/aes, stocke dans MemberCredential.totpSecretEncrypted
//      EN STATE "PENDING" (totpEnabledAt=null), retourne le secret en
//      clair + URI otpauth:// pour QR code.
//   2. L'user scanne le QR code dans son authenticator (Google
//      Authenticator, Authy, 1Password, etc.).
//   3. POST /api/auth/2fa/verify avec un code TOTP → on déchiffre, on
//      compare. Si OK : on flippe totpEnabledAt = now() et on génère
//      les 8 codes de récupération.
//
// Validation au login :
//   - Déchiffre totpSecretEncrypted, calcule le code attendu pour
//     window=±1 (accepte ±30s autour de l'heure courante pour absorber
//     les drifts d'horloge).
// ─────────────────────────────────────────────────────────────────────────────

import { Secret, TOTP } from 'otpauth';
import { encrypt, decrypt } from '../crypto/aes';

const ISSUER = 'Hadar.ma';
const ALGORITHM = 'SHA1'; // RFC 6238 default ; SHA256 nécessite que les
                          // authenticators récents le supportent — SHA1
                          // est universel et sûr pour TOTP (pas pour
                          // signature, mais TOTP l'utilise comme PRF).
const DIGITS = 6;
const PERIOD_SECONDS = 30;

/// Génère un secret TOTP cryptographiquement aléatoire et son URI
/// otpauth:// utilisable pour fabriquer un QR code côté client.
export function generateTotpEnrollment(label: string): {
  secretBase32: string;
  secretEncrypted: string;
  otpauthUri: string;
} {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD_SECONDS,
    secret,
  });
  return {
    secretBase32: secret.base32,
    secretEncrypted: encrypt(secret.base32),
    otpauthUri: totp.toString(),
  };
}

/// Vérifie un code TOTP contre un secret chiffré. window=1 = accepte
/// ±30s. Retourne true si match (anti drift d'horloge).
export function verifyTotp(
  code: string,
  secretEncrypted: string,
): boolean {
  let secretBase32: string;
  try {
    secretBase32 = decrypt(secretEncrypted);
  } catch {
    return false;
  }
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD_SECONDS,
    secret: Secret.fromBase32(secretBase32),
  });
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

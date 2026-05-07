// API publique du module crypto.
//
// Importer DEPUIS '@/lib/crypto' uniquement, jamais depuis les
// sous-modules — ça permettra de réorganiser sans casser les call-sites
// (ex : migration vers DigitalOcean KMS où encrypt() deviendra async).

export {
  encrypt,
  decrypt,
  encryptNullable,
  decryptNullable,
} from './aes';

export {
  hmacContact,
  hmacEmail,
  hmacIp,
  hmacUserAgent,
  normalizeContactValue,
} from './hmac';

export {
  sha256,
  generateRandomToken,
  generateNumericOTP,
  timingSafeEqualHex,
} from './hash';

export {
  generateRecoveryCode,
  generateRecoveryCodes,
  normalizeRecoveryCode,
} from './codes';

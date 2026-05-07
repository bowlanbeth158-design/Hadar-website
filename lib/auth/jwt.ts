// ─────────────────────────────────────────────────────────────────────────────
// Signature et vérification des access tokens JWT.
//
// Stratégie d'auth :
//   - Access token = JWT signé HS512, durée 15 min, contient sub +
//     type + role + sid. Stocké côté client en cookie HttpOnly.
//   - Refresh token = chaîne aléatoire 256 bits, durée 30 jours,
//     stockée HASHÉE en DB (Session.refreshTokenHash). Le client le
//     reçoit en cookie HttpOnly séparé.
//
// Pourquoi HS512 et pas RS / ES : symétrique = plus rapide et plus
// simple à gérer (1 secret au lieu d'une keypair). On migrera vers
// ES256 si on doit un jour exposer la vérification à un service tiers
// (mobile app native qui valide localement, par exemple).
//
// Rotation : remplacer AUTH_JWT_SECRET déconnecte tous les users.
// Pour rotater sans déconnexion, on peut implémenter une liste de
// "previousSecrets" (vérification multi-clé, signature avec la
// nouvelle). Pas implémenté pour la v1 — on accepte la déconnexion
// massive lors d'une rotation (à faire en heures creuses).
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { generateRandomToken } from '../crypto/hash';
import type {
  AccessTokenPayload,
  FullAccessTokenClaims,
} from './types';

const ISSUER = 'hadar.ma';
const AUDIENCE = 'hadar.ma';
const ACCESS_TOKEN_TTL = '15m';

let cachedSecret: Uint8Array | undefined;

function getJwtSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.AUTH_JWT_SECRET;
  if (!raw) {
    throw new Error(
      'AUTH_JWT_SECRET manquant. Lance : node scripts/generate-secrets.mjs',
    );
  }
  // On accepte n'importe quelle longueur ≥ 32 octets décodés (HS512
  // accepte jusqu'à 128 octets, mais 32 c'est déjà ≥ 256 bits).
  const buf = Buffer.from(raw, 'base64');
  if (buf.length < 32) {
    throw new Error(
      `AUTH_JWT_SECRET trop court (${buf.length} octets, minimum 32).`,
    );
  }
  cachedSecret = new Uint8Array(buf);
  return cachedSecret;
}

/// Signe un access token. La durée est fixe (ACCESS_TOKEN_TTL = 15 min)
/// — pour avoir des durées variables, ouvre une exception explicite
/// par cas, ne paramétrise pas.
export async function signAccessToken(
  payload: AccessTokenPayload,
): Promise<string> {
  const jti = generateRandomToken(16); // 128 bits, suffisant pour un id unique
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS512', typ: 'JWT' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setJti(jti)
    .sign(getJwtSecret());
}

/// Vérifie et décode un access token. Throw si :
///   - signature invalide
///   - expiré
///   - issuer/audience ne matchent pas
///   - claim sub / type / sid manquante
///
/// L'app doit JAMAIS faire confiance à un token sans passer par cette
/// fonction. Pas de "decode-only" — on ne lit jamais un JWT non vérifié.
export async function verifyAccessToken(
  token: string,
): Promise<FullAccessTokenClaims> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['HS512'],
  });
  // Validation stricte des claims custom (jose ne valide que les
  // claims standards par défaut).
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('JWT invalide : claim "sub" manquante.');
  }
  if (payload.type !== 'user' && payload.type !== 'member') {
    throw new Error('JWT invalide : claim "type" attendue "user"|"member".');
  }
  if (typeof payload.sid !== 'string' || !payload.sid) {
    throw new Error('JWT invalide : claim "sid" manquante.');
  }
  if (payload.role !== undefined && typeof payload.role !== 'string') {
    throw new Error('JWT invalide : claim "role" doit être string.');
  }
  return payload as JWTPayload & FullAccessTokenClaims;
}

/// Génère un refresh token CLAIR (256 bits aléatoires, base64url).
/// Le client le reçoit en cookie HttpOnly. La DB ne stocke que son
/// SHA-256 (Session.refreshTokenHash).
export function generateRefreshToken(): string {
  return generateRandomToken(32);
}

/// Constante pour les call-sites qui calculent expiresAt sur Session.
export const REFRESH_TOKEN_TTL_DAYS = 30;

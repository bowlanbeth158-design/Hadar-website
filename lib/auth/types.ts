// ─────────────────────────────────────────────────────────────────────────────
// Types partagés du domaine auth.
// ─────────────────────────────────────────────────────────────────────────────

/// Identifie quelle table d'identité est associée à un token / une
/// session. User = compte utilisateur final, Member = staff Hadar.
export type AccountKind = 'user' | 'member';

/// Payload JWT access token. Tous les champs SONT INCLUS dans le token
/// signé — donc visibles côté client (le JWT n'est pas chiffré, juste
/// signé). Ne JAMAIS y mettre de PII ou de secret.
export interface AccessTokenPayload {
  /// Subject = id du User ou du Member.
  sub: string;
  /// Type de compte (détermine quelle table consulter).
  type: AccountKind;
  /// Pour les members : rôle (SUPER_ADMIN / ADMIN / MODERATOR / SUPPORT).
  /// Pour les users : non défini.
  role?: string;
  /// Session ID — permet de révoquer toutes les sessions d'un user
  /// (logout forcé) en marquant Session.revokedAt.
  sid: string;
}

/// Toutes les claims standard JWT (RFC 7519) que jose ajoute / vérifie.
export interface StandardClaims {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
}

export type FullAccessTokenClaims = AccessTokenPayload & StandardClaims;

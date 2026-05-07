// ─────────────────────────────────────────────────────────────────────────────
// HMAC-SHA256 peppered pour les champs indexables dérivés de PII.
//
// Utilisé pour :
//   - contactValueHash (Report, ContactAggregate, Alert) : HMAC de la
//     valeur normalisée + canal, peppered pour qu'une fuite SQL seule
//     ne permette pas de reconstruire un dictionnaire.
//   - emailHash (LoginAttempt) : HMAC de l'email pour rate limiter
//     sans stocker l'historique des emails tapés en clair.
//   - ipHash, userAgentHash (Session, AuditLog, etc.).
//
// HMAC vs SHA-256 simple : HMAC empêche les attaques par préfixe et
// rend le pepper indispensable pour reproduire un hash. Un attaquant
// avec un dump SQL ne peut pas vérifier "est-ce que +212612345678 est
// dans la base" sans aussi avoir le pepper.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac } from 'node:crypto';
import type { ReportChannel } from '@prisma/client';
import { getContactPepper, getIpPepper } from './keys';

/// Hash d'un (contactValue, channel) pour indexation et déduplication.
/// On normalise toujours AVANT (lowercase, trim, suppression espaces /
/// tirets) pour que "+212 612-345-678" et "+212612345678" produisent
/// le même hash → un même contact ne peut pas être signalé deux fois.
export function hmacContact(
  contactValueNormalized: string,
  channel: ReportChannel,
): string {
  const pepper = getContactPepper();
  const h = createHmac('sha256', pepper);
  // Le canal fait partie de la clé : un même numéro signalé en
  // WhatsApp et en RIB sont DEUX hashes différents. C'est voulu —
  // ce sont sémantiquement deux signalements distincts.
  h.update(channel);
  h.update('|');
  h.update(contactValueNormalized);
  return h.digest('hex');
}

/// Normalise une valeur de contact avant hashing (trim, lowercase,
/// suppression espaces / tirets / parenthèses).
/// IMPORTANT : appliquer cette même normalisation côté front pour
/// la recherche, sinon les lookups ratent.
export function normalizeContactValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s\-()_]/g, '');
}

/// Hash d'un email pour LoginAttempt / rate limiting.
/// On ne stocke pas l'email en clair pour ne pas conserver
/// l'historique des comptes essayés (attaque par énumération
/// "lis le journal des login → liste des emails de la base").
export function hmacEmail(email: string): string {
  const pepper = getContactPepper(); // même pepper que contact, OK
  const h = createHmac('sha256', pepper);
  h.update(email.trim().toLowerCase());
  return h.digest('hex');
}

/// Hash d'une IP. Pepper séparée pour qu'on ne puisse pas chaîner
/// "j'ai le pepper contact, je devine les IPs".
export function hmacIp(ip: string): string {
  const pepper = getIpPepper();
  const h = createHmac('sha256', pepper);
  h.update(ip);
  return h.digest('hex');
}

/// Hash d'un User-Agent. Tronque à 256 chars pour éviter qu'un
/// attaquant force des UAs gigantesques pour saturer la DB.
export function hmacUserAgent(ua: string): string {
  const pepper = getIpPepper();
  const h = createHmac('sha256', pepper);
  h.update(ua.slice(0, 256));
  return h.digest('hex');
}

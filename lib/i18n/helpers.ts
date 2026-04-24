import type { Locale } from './messages';

type T = (key: string, params?: Record<string, string | number>) => string;

const PROBLEM_KEY: Record<string, string> = {
  'Non livraison': 'dashboard.problem.nonDelivery',
  'Bloqué après paiement': 'dashboard.problem.blockedAfterPayment',
  'Produit non conforme': 'dashboard.problem.nonCompliant',
  "Usurpation d'identité": 'dashboard.problem.identityTheft',
  'Usurpation d’identité': 'dashboard.problem.identityTheft',
  'Tentative de phishing': 'problem.phishing',
  Autre: 'problem.other',
};

const CHANNEL_KEY: Record<string, string> = {
  WhatsApp: 'channel.whatsapp',
  RIB: 'channel.rib',
  Email: 'channel.email',
  Téléphone: 'channel.phone',
  'Site web': 'channel.website',
  Crypto: 'channel.crypto',
  Instagram: 'channel.instagram',
  Binance: 'channel.binance',
  PayPal: 'channel.paypal',
  'Réseaux sociaux': 'channel.socialMedia',
};

const STATUS_KEY: Record<string, string> = {
  en_cours: 'status.en_cours',
  publie: 'status.publie',
  non_retenu: 'status.non_retenu',
  a_corriger: 'status.a_corriger',
};

const ROLE_KEY: Record<string, string> = {
  superadmin: 'role.superadmin',
  admin: 'role.admin',
  moderateur: 'role.moderateur',
  support: 'role.support',
};

const MEMBER_STATUS_KEY: Record<string, string> = {
  actif: 'member.status.actif',
  inactif: 'member.status.inactif',
  suspendu: 'member.status.suspendu',
};

export function translateProblem(t: T, frLabel: string): string {
  const key = PROBLEM_KEY[frLabel];
  return key ? t(key) : frLabel;
}

export function translateChannel(t: T, frLabel: string): string {
  const key = CHANNEL_KEY[frLabel];
  return key ? t(key) : frLabel;
}

export function translateStatus(t: T, statusId: string): string {
  const key = STATUS_KEY[statusId];
  return key ? t(key) : statusId;
}

export function translateRole(t: T, roleId: string): string {
  const key = ROLE_KEY[roleId];
  return key ? t(key) : roleId;
}

export function translateMemberStatus(t: T, statusId: string): string {
  const key = MEMBER_STATUS_KEY[statusId];
  return key ? t(key) : statusId;
}

export function formatDateTime(iso: string, locale: Locale): string {
  if (!iso) return '';
  const tag = locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-GB' : 'ar-MA';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(tag, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

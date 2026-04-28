import type { LucideIcon } from 'lucide-react';
import { Phone, Mail, Globe, CreditCard } from 'lucide-react';

export type RiskLevel = 'low' | 'vigilance' | 'moderate' | 'high';
export type AlertStatus = 'active' | 'archived' | 'deleted';
export type Channel = 'phone' | 'email' | 'web' | 'rib';

export type Alert = {
  id: string;
  channel: Channel;
  contact: string;
  /** i18n key — long copy used on the list page card. */
  summaryKey: string;
  /** i18n key — short copy used inside the header popover. */
  messageKey: string;
  /** i18n key — compact relative date used on the list page card. */
  dateKey: string;
  /** i18n key — long relative time used in the popover and the expanded panel. */
  lastReportRelativeKey: string;
  count: number;
  risk: RiskLevel;
  status: AlertStatus;
  byCategory: {
    nonLivraison: number;
    bloqueApresPaiement: number;
    produitNonConforme: number;
    usurpation: number;
  };
};

export const CHANNEL_ICON: Record<Channel, LucideIcon> = {
  phone: Phone,
  email: Mail,
  web: Globe,
  rib: CreditCard,
};

// Shared mock data — used by AlertsPopover (header) and MesAlertesList (page)
// so both views stay in sync. All free-text fields point to i18n keys so the
// content follows the active locale. Replace with /api/alerts when the
// backend lands; in production these strings will come from the API and
// be served already-localised per the user's preferred locale.
export const DEMO_ALERTS: Alert[] = [
  {
    id: '1',
    channel: 'phone',
    contact: '212 600 00 00 00',
    summaryKey: 'mock.alert.a1.summary',
    messageKey: 'mock.alert.a1.message',
    dateKey: 'mock.alert.a1.date',
    lastReportRelativeKey: 'mock.alert.a1.lastReport',
    count: 5,
    risk: 'high',
    status: 'active',
    byCategory: {
      nonLivraison: 1,
      bloqueApresPaiement: 2,
      produitNonConforme: 2,
      usurpation: 0,
    },
  },
  {
    id: '2',
    channel: 'web',
    contact: 'www.mushtarik.com',
    summaryKey: 'mock.alert.a2.summary',
    messageKey: 'mock.alert.a2.message',
    dateKey: 'mock.alert.a2.date',
    lastReportRelativeKey: 'mock.alert.a2.lastReport',
    count: 1,
    risk: 'vigilance',
    status: 'active',
    byCategory: {
      nonLivraison: 0,
      bloqueApresPaiement: 0,
      produitNonConforme: 1,
      usurpation: 0,
    },
  },
  {
    id: '3',
    channel: 'rib',
    contact: '50XX XXXX XXXX XX86',
    summaryKey: 'mock.alert.a3.summary',
    messageKey: 'mock.alert.a3.message',
    dateKey: 'mock.alert.a3.date',
    lastReportRelativeKey: 'mock.alert.a3.lastReport',
    count: 3,
    risk: 'moderate',
    status: 'active',
    byCategory: {
      nonLivraison: 1,
      bloqueApresPaiement: 1,
      produitNonConforme: 1,
      usurpation: 0,
    },
  },
];

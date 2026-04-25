import type { LucideIcon } from 'lucide-react';
import { Phone, Mail, Globe, CreditCard } from 'lucide-react';

export type RiskLevel = 'low' | 'vigilance' | 'moderate' | 'high';
export type AlertStatus = 'active' | 'archived' | 'deleted';
export type Channel = 'phone' | 'email' | 'web' | 'rib';

export type Alert = {
  id: string;
  channel: Channel;
  contact: string;
  /** Long copy used on the list page card. */
  summary: string;
  /** Short copy used inside the header popover. */
  message: string;
  /** Compact relative date used on the list page card (e.g. "il y a 2h"). */
  date: string;
  /** Long relative time used in the popover and the expanded panel. */
  lastReportRelative: string;
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
// so both views stay in sync. Replace with /api/alerts when the backend lands.
export const DEMO_ALERTS: Alert[] = [
  {
    id: '1',
    channel: 'phone',
    contact: '212 600 00 00 00',
    summary: '2 nouveaux signalements sur ce numéro cette semaine.',
    message: 'Un nouveau signalement a été publié.',
    date: 'il y a 2h',
    lastReportRelative: 'il y a 2 heures',
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
    summary: 'Vigilance : 1 nouveau signalement « Produit non conforme ».',
    message: 'Un nouveau signalement a été publié.',
    date: 'il y a 5h',
    lastReportRelative: 'il y a 5 heures',
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
    summary: 'Signalement « Bloqué après paiement » ajouté hier.',
    message: 'Un nouveau signalement a été publié.',
    date: 'hier',
    lastReportRelative: 'hier',
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

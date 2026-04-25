import type { LucideIcon } from 'lucide-react';
import { Phone, Mail, Globe, CreditCard } from 'lucide-react';

export type ReportStatus = 'en_attente' | 'publie' | 'a_corriger' | 'refuse';
export type ReportChannel = 'phone' | 'email' | 'web' | 'rib';

export type Report = {
  id: string;
  channel: ReportChannel;
  contact: string;
  problem: string;
  description: string;
  date: string;
  submittedDate: string;
  reviewedDate?: string;
  finalDate?: string;
  amount?: string;
  status: ReportStatus;
  proofs: string[];
  /** Optional reason returned by moderation when status is 'a_corriger' or 'refuse'. */
  moderationNote?: string;
};

export const REPORT_CHANNEL_ICON: Record<ReportChannel, LucideIcon> = {
  phone: Phone,
  email: Mail,
  web: Globe,
  rib: CreditCard,
};

export const REPORT_CHANNEL_LABEL: Record<ReportChannel, string> = {
  phone: 'Téléphone',
  email: 'Email',
  web: 'Site web',
  rib: 'RIB',
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  en_attente: 'En attente',
  publie: 'Publié',
  a_corriger: 'À corriger',
  refuse: 'Refusé',
};

export const STATUS_BORDER: Record<ReportStatus, string> = {
  en_attente: 'border-l-yellow-500',
  publie: 'border-l-green-500',
  a_corriger: 'border-l-orange-500',
  refuse: 'border-l-red-500',
};

export const STATUS_BADGE: Record<ReportStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  publie: 'bg-green-100 text-green-700',
  a_corriger: 'bg-orange-100 text-orange-700',
  refuse: 'bg-red-100 text-red-700',
};

export const STATUS_DOT: Record<ReportStatus, string> = {
  en_attente: 'bg-yellow-500',
  publie: 'bg-green-500',
  a_corriger: 'bg-orange-500',
  refuse: 'bg-red-500',
};

// Shared mock data — used by /mes-signalements (list) and /mes-signalements/[id]
// (detail) so the displayed status is always consistent across views.
export const USER_REPORTS: Report[] = [
  {
    id: '1',
    channel: 'phone',
    contact: '+212 6 12 34 •• ••',
    problem: 'Non livraison',
    description:
      'Commande effectuée le 1er avril, vendeur n’a jamais livré le produit et ne répond plus à mes messages depuis 3 semaines malgré plusieurs relances.',
    date: 'il y a 3 jours',
    submittedDate: '20 avril 2026',
    reviewedDate: '21 avril 2026',
    finalDate: '22 avril 2026',
    amount: '2 500 MAD',
    status: 'publie',
    proofs: ['screenshot-whatsapp-01.png', 'recu-paiement.pdf', 'conversation-email.png'],
  },
  {
    id: '2',
    channel: 'email',
    contact: 'contact@arnaqu••.com',
    problem: 'Bloqué après paiement',
    description:
      'Contact bloqué dès que le paiement a été reçu. Aucune réponse depuis ce jour-là, plusieurs tentatives de relance restées sans suite.',
    date: 'hier',
    submittedDate: '23 avril 2026',
    amount: '850 MAD',
    status: 'en_attente',
    proofs: ['recu-paypal.pdf', 'screenshot-blocage.png'],
  },
  {
    id: '3',
    channel: 'web',
    contact: 'https://boutique-sus••.ma',
    problem: 'Produit non conforme',
    description:
      'Produit reçu ne correspond pas du tout à la description sur le site. Différence majeure de couleur, taille et matériau.',
    date: 'il y a 5 jours',
    submittedDate: '18 avril 2026',
    reviewedDate: '19 avril 2026',
    amount: '1 200 MAD',
    status: 'a_corriger',
    moderationNote:
      'Merci d’ajouter une preuve d’achat (facture ou reçu) pour finaliser la publication.',
    proofs: ['photo-recue-vs-annonce.png'],
  },
  {
    id: '4',
    channel: 'email',
    contact: 'paypal-us••@gmail.com',
    problem: "Usurpation d'identité",
    description:
      'Se fait passer pour un marchand officiel pour soutirer des informations bancaires.',
    date: 'il y a 2 semaines',
    submittedDate: '11 avril 2026',
    reviewedDate: '12 avril 2026',
    finalDate: '13 avril 2026',
    status: 'refuse',
    moderationNote:
      'Preuves insuffisantes pour confirmer l’usurpation. Merci d’apporter des éléments supplémentaires.',
    proofs: ['email-frauduleux.png'],
  },
];

export type TimelineStep = {
  label: string;
  date: string;
  color: string;
  done: boolean;
};

/**
 * Build the moderation timeline that should be displayed for a given report.
 * Step shape (3 dots) varies with the final status so the UI always matches
 * what the list shows.
 */
export function timelineFor(report: Report): TimelineStep[] {
  const sent: TimelineStep = {
    label: 'Signalement envoyé',
    date: report.submittedDate,
    color: 'bg-yellow-500',
    done: true,
  };

  const reviewing: TimelineStep = {
    label: 'En cours d’examen',
    date: report.reviewedDate ?? 'En attente',
    color: report.reviewedDate ? 'bg-orange-500' : 'bg-gray-200',
    done: !!report.reviewedDate,
  };

  if (report.status === 'en_attente') {
    return [
      sent,
      reviewing,
      { label: 'Décision', date: 'En attente', color: 'bg-gray-200', done: false },
    ];
  }
  if (report.status === 'publie') {
    return [
      sent,
      { ...reviewing, done: true, color: 'bg-orange-500' },
      {
        label: 'Publié',
        date: report.finalDate ?? 'En attente',
        color: 'bg-green-500',
        done: true,
      },
    ];
  }
  if (report.status === 'a_corriger') {
    return [
      sent,
      { ...reviewing, done: true, color: 'bg-orange-500' },
      {
        label: 'À corriger',
        date: report.reviewedDate ?? 'En attente',
        color: 'bg-orange-500',
        done: true,
      },
    ];
  }
  // refuse
  return [
    sent,
    { ...reviewing, done: true, color: 'bg-orange-500' },
    {
      label: 'Refusé',
      date: report.finalDate ?? 'En attente',
      color: 'bg-red-500',
      done: true,
    },
  ];
}

export type Status = 'en_cours' | 'publie' | 'non_retenu' | 'a_corriger';

export type Channel = 'WhatsApp' | 'RIB' | 'Email' | 'Téléphone' | 'Site web' | 'Crypto' | 'Instagram';

export type Proof = { name: string; kind: 'image' | 'pdf' };

export type Report = {
  id: string;
  contact: Channel;
  contactMasked: string;
  problem: string;
  amount: string;
  amountNumeric: number;
  date: string;
  sortKey: number;
  status: Status;
  userId: string;
  description: string[];
  proofs: Proof[];
};

export const REPORTS: Report[] = [
  {
    id: '2454',
    contact: 'WhatsApp',
    contactMasked: '+212 6 12 34 •• ••',
    problem: 'Non livraison',
    amount: '500 MAD',
    amountNumeric: 500,
    date: '13/04/26  23:12:05',
    sortKey: 20260413_2312,
    status: 'en_cours',
    userId: '345651',
    description: [
      'Paiement effectué le 10/04, aucune réponse depuis. Le vendeur ne répond plus à mes messages ni aux appels. Aucune trace d’expédition fournie malgré plusieurs relances.',
      'J’ai tenté de le contacter via un numéro secondaire, sans succès. Le compte semble avoir été supprimé.',
    ],
    proofs: [
      { name: 'screenshot-whatsapp-01.png', kind: 'image' },
      { name: 'recu-paiement.pdf', kind: 'pdf' },
      { name: 'conversation-email.png', kind: 'image' },
    ],
  },
  {
    id: '2453',
    contact: 'RIB',
    contactMasked: 'FR76 •••• •••• 7842',
    problem: 'Bloqué après paiement',
    amount: '1 200 MAD',
    amountNumeric: 1200,
    date: '13/04/26  22:48:17',
    sortKey: 20260413_2248,
    status: 'en_cours',
    userId: '345612',
    description: [
      'Virement effectué, le vendeur m’a bloqué immédiatement après réception. Aucune communication possible depuis.',
    ],
    proofs: [
      { name: 'rib-fourni.pdf', kind: 'pdf' },
      { name: 'preuve-virement.png', kind: 'image' },
    ],
  },
  {
    id: '2452',
    contact: 'Email',
    contactMasked: 'contact•••@mail.ma',
    problem: 'Produit non conforme',
    amount: '340 MAD',
    amountNumeric: 340,
    date: '13/04/26  19:05:44',
    sortKey: 20260413_1905,
    status: 'publie',
    userId: '345580',
    description: [
      'Produit reçu totalement différent de la description. Le vendeur refuse tout remboursement et propose un avoir très inférieur.',
    ],
    proofs: [
      { name: 'photo-produit-recu.png', kind: 'image' },
      { name: 'annonce-originale.png', kind: 'image' },
    ],
  },
  {
    id: '2451',
    contact: 'Téléphone',
    contactMasked: '+212 6 •• •• 45 90',
    problem: "Usurpation d'identité",
    amount: '—',
    amountNumeric: 0,
    date: '13/04/26  15:33:09',
    sortKey: 20260413_1533,
    status: 'non_retenu',
    userId: '345520',
    description: [
      'La personne se faisait passer pour un agent bancaire. Après vérification, le numéro ne correspond à aucun employé.',
    ],
    proofs: [{ name: 'enregistrement-appel.pdf', kind: 'pdf' }],
  },
  {
    id: '2450',
    contact: 'Site web',
    contactMasked: 'supershop-••.ma',
    problem: 'Non livraison',
    amount: '850 MAD',
    amountNumeric: 850,
    date: '13/04/26  12:21:55',
    sortKey: 20260413_1221,
    status: 'a_corriger',
    userId: '345495',
    description: [
      'Commande passée il y a 3 semaines, toujours pas de livraison. Le site ne répond plus aux emails.',
    ],
    proofs: [{ name: 'confirmation-commande.pdf', kind: 'pdf' }],
  },
  {
    id: '2449',
    contact: 'Instagram',
    contactMasked: '@boutique_••_ma',
    problem: 'Produit non conforme',
    amount: '670 MAD',
    amountNumeric: 670,
    date: '12/04/26  20:55:10',
    sortKey: 20260412_2055,
    status: 'en_cours',
    userId: '345470',
    description: ['Article vu en story, reçu cassé sans SAV possible.'],
    proofs: [{ name: 'dm-instagram.png', kind: 'image' }],
  },
  {
    id: '2448',
    contact: 'Crypto',
    contactMasked: '0xA1b2•••c9F2',
    problem: 'Bloqué après paiement',
    amount: '4 500 MAD',
    amountNumeric: 4500,
    date: '12/04/26  17:14:33',
    sortKey: 20260412_1714,
    status: 'en_cours',
    userId: '345452',
    description: ['Transfert USDT, adresse vérifiée à l’avance, mais plus aucune nouvelle.'],
    proofs: [{ name: 'hash-transaction.pdf', kind: 'pdf' }],
  },
  {
    id: '2447',
    contact: 'WhatsApp',
    contactMasked: '+212 7 •• 90 12 ••',
    problem: 'Non livraison',
    amount: '220 MAD',
    amountNumeric: 220,
    date: '12/04/26  11:02:48',
    sortKey: 20260412_1102,
    status: 'publie',
    userId: '345420',
    description: ['Avance versée, aucune livraison malgré la promesse de 48 h.'],
    proofs: [{ name: 'discussion-wa.png', kind: 'image' }],
  },
  {
    id: '2446',
    contact: 'Email',
    contactMasked: 'service•••@co.fr',
    problem: 'Tentative de phishing',
    amount: '—',
    amountNumeric: 0,
    date: '11/04/26  23:47:01',
    sortKey: 20260411_2347,
    status: 'publie',
    userId: '345388',
    description: ['Email usurpant une banque, demande de saisie d’identifiants.'],
    proofs: [
      { name: 'email-original.pdf', kind: 'pdf' },
      { name: 'en-tetes.png', kind: 'image' },
    ],
  },
  {
    id: '2445',
    contact: 'Site web',
    contactMasked: 'offres-••-pro.com',
    problem: 'Produit non conforme',
    amount: '2 100 MAD',
    amountNumeric: 2100,
    date: '11/04/26  16:20:15',
    sortKey: 20260411_1620,
    status: 'non_retenu',
    userId: '345355',
    description: ['Le signalement concerne un litige commercial sans fraude avérée.'],
    proofs: [{ name: 'facture.pdf', kind: 'pdf' }],
  },
  {
    id: '2444',
    contact: 'RIB',
    contactMasked: 'MA64 •••• •••• 0912',
    problem: 'Bloqué après paiement',
    amount: '900 MAD',
    amountNumeric: 900,
    date: '11/04/26  10:09:22',
    sortKey: 20260411_1009,
    status: 'a_corriger',
    userId: '345330',
    description: ['Manque la preuve de virement : à joindre pour valider le dossier.'],
    proofs: [{ name: 'echange-messages.png', kind: 'image' }],
  },
  {
    id: '2443',
    contact: 'Téléphone',
    contactMasked: '+212 5 •• 33 77 ••',
    problem: "Usurpation d'identité",
    amount: '—',
    amountNumeric: 0,
    date: '10/04/26  21:44:05',
    sortKey: 20260410_2144,
    status: 'en_cours',
    userId: '345300',
    description: ['Appel prétendu d’un ministère demandant des données personnelles.'],
    proofs: [{ name: 'notes-appel.pdf', kind: 'pdf' }],
  },
  {
    id: '2442',
    contact: 'Instagram',
    contactMasked: '@luxe_shop_••',
    problem: 'Non livraison',
    amount: '1 600 MAD',
    amountNumeric: 1600,
    date: '10/04/26  13:58:40',
    sortKey: 20260410_1358,
    status: 'publie',
    userId: '345275',
    description: ['Paiement via lien, compte désactivé juste après.'],
    proofs: [
      { name: 'story-promo.png', kind: 'image' },
      { name: 'confirmation-mail.pdf', kind: 'pdf' },
    ],
  },
  {
    id: '2441',
    contact: 'WhatsApp',
    contactMasked: '+212 6 •• •• 22 18',
    problem: 'Produit non conforme',
    amount: '410 MAD',
    amountNumeric: 410,
    date: '09/04/26  19:12:00',
    sortKey: 20260409_1912,
    status: 'a_corriger',
    userId: '345240',
    description: ['Photos reçues floues, impossible de valider le défaut.'],
    proofs: [{ name: 'photo-floue.png', kind: 'image' }],
  },
  {
    id: '2440',
    contact: 'Crypto',
    contactMasked: '0xF9c3•••Ae71',
    problem: 'Tentative de phishing',
    amount: '—',
    amountNumeric: 0,
    date: '09/04/26  08:01:55',
    sortKey: 20260409_0801,
    status: 'publie',
    userId: '345212',
    description: ['Faux site clonant un exchange. Lien diffusé par SMS.'],
    proofs: [
      { name: 'url-capturee.png', kind: 'image' },
      { name: 'sms-recu.pdf', kind: 'pdf' },
    ],
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  en_cours: 'En cours',
  publie: 'Publié',
  non_retenu: 'Non retenu',
  a_corriger: 'À corriger',
};

export function getReport(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

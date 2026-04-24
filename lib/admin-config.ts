export type BannerType = 'topbar' | 'carousel' | 'toast';

export type BannerMessage = {
  id: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type MaintenancePreset = 'short-break' | 'scheduled' | 'new-version';

export const MAINTENANCE_PAGES = [
  // Admin
  'dashboard',
  'signalements',
  'membres',
  'utilisateurs',
  'statistiques',
  'annonces',
  'assistant',
  // Public — main user pages
  'home',
  'signaler',
  'mes-alertes',
  'mes-signalements',
  'mon-profil',
  'public-statistiques',
  'comment-ca-marche',
  'faq',
  // Public — auth
  'connexion',
  'inscription',
  'mot-de-passe-oublie',
  // Public — legal
  'conditions-generales',
  'donnees-personnelles-cookies',
  'politique-confidentialite',
  'qui-sommes-nous',
  'regles-publication',
] as const;

export type MaintenancePageId = (typeof MAINTENANCE_PAGES)[number];

export const MAINTENANCE_GROUPS: {
  labelKey: string;
  ids: readonly MaintenancePageId[];
}[] = [
  {
    labelKey: 'admin.maintenance.group.admin',
    ids: ['dashboard', 'signalements', 'membres', 'utilisateurs', 'statistiques', 'annonces', 'assistant'],
  },
  {
    labelKey: 'admin.maintenance.group.userMain',
    ids: ['home', 'signaler', 'mes-alertes', 'mes-signalements', 'mon-profil', 'public-statistiques', 'comment-ca-marche', 'faq'],
  },
  {
    labelKey: 'admin.maintenance.group.auth',
    ids: ['connexion', 'inscription', 'mot-de-passe-oublie'],
  },
  {
    labelKey: 'admin.maintenance.group.legal',
    ids: ['conditions-generales', 'donnees-personnelles-cookies', 'politique-confidentialite', 'qui-sommes-nous', 'regles-publication'],
  },
];

export const MAINTENANCE_LABEL_KEY: Record<MaintenancePageId, string> = {
  dashboard: 'sidebar.dashboard',
  signalements: 'sidebar.signalements',
  membres: 'sidebar.membres',
  utilisateurs: 'sidebar.utilisateurs',
  statistiques: 'sidebar.statistiques',
  annonces: 'sidebar.annonces',
  assistant: 'sidebar.assistant',
  home: 'admin.maintenance.page.home',
  signaler: 'admin.maintenance.page.signaler',
  'mes-alertes': 'admin.maintenance.page.mesAlertes',
  'mes-signalements': 'admin.maintenance.page.mesSignalements',
  'mon-profil': 'admin.maintenance.page.monProfil',
  'public-statistiques': 'admin.maintenance.page.publicStatistiques',
  'comment-ca-marche': 'admin.maintenance.page.commentCaMarche',
  faq: 'admin.maintenance.page.faq',
  connexion: 'admin.maintenance.page.connexion',
  inscription: 'admin.maintenance.page.inscription',
  'mot-de-passe-oublie': 'admin.maintenance.page.motDePasseOublie',
  'conditions-generales': 'admin.maintenance.page.conditionsGenerales',
  'donnees-personnelles-cookies': 'admin.maintenance.page.donneesCookies',
  'politique-confidentialite': 'admin.maintenance.page.politiqueConfidentialite',
  'qui-sommes-nous': 'admin.maintenance.page.quiSommesNous',
  'regles-publication': 'admin.maintenance.page.reglesPublication',
};

export const MAINTENANCE_PATH_MATCHERS: Record<MaintenancePageId, (p: string) => boolean> = {
  dashboard: (p) => p === '/admin',
  signalements: (p) => p === '/admin/signalements' || p.startsWith('/admin/signalements/'),
  membres: (p) => p === '/admin/membres' || p.startsWith('/admin/membres/'),
  utilisateurs: (p) => p === '/admin/utilisateurs' || p.startsWith('/admin/utilisateurs/'),
  statistiques: (p) => p === '/admin/statistiques' || p.startsWith('/admin/statistiques/'),
  annonces: (p) => p === '/admin/annonces' || p.startsWith('/admin/annonces/'),
  assistant: (p) => p === '/admin/assistant' || p.startsWith('/admin/assistant/'),
  home: (p) => p === '/',
  signaler: (p) => p === '/signaler' || p.startsWith('/signaler/'),
  'mes-alertes': (p) => p === '/mes-alertes' || p.startsWith('/mes-alertes/'),
  'mes-signalements': (p) => p === '/mes-signalements' || p.startsWith('/mes-signalements/'),
  'mon-profil': (p) => p === '/mon-profil' || p.startsWith('/mon-profil/'),
  'public-statistiques': (p) => p === '/statistiques' || p.startsWith('/statistiques/'),
  'comment-ca-marche': (p) => p === '/comment-ca-marche' || p.startsWith('/comment-ca-marche/'),
  faq: (p) => p === '/faq' || p.startsWith('/faq/'),
  connexion: (p) => p === '/connexion',
  inscription: (p) => p === '/inscription',
  'mot-de-passe-oublie': (p) => p === '/mot-de-passe-oublie',
  'conditions-generales': (p) => p === '/conditions-generales',
  'donnees-personnelles-cookies': (p) => p === '/donnees-personnelles-cookies',
  'politique-confidentialite': (p) => p === '/politique-confidentialite',
  'qui-sommes-nous': (p) => p === '/qui-sommes-nous',
  'regles-publication': (p) => p === '/regles-publication',
};

export type PlatformConfig = {
  maintenance: boolean;
  maintenancePages: MaintenancePageId[];
  maintenancePreset: MaintenancePreset;
  maintenanceMessage: string;
  maintenanceImage?: string;
  bannerEnabled: boolean;
  bannerType: BannerType;
  bannerMessages: BannerMessage[];
  bannerIntervalSec: number;
  publicSearch: boolean;
  registrationsOpen: boolean;
  maxUploadMb: number;
  sessionMinutes: number;
};

export const PLATFORM_CONFIG_KEY = 'hadar:admin:platform-config';
export const PLATFORM_CONFIG_EVENT = 'hadar:config-updated';

export const INITIAL_PLATFORM_CONFIG: PlatformConfig = {
  maintenance: false,
  maintenancePages: [],
  maintenancePreset: 'short-break',
  maintenanceMessage: '',
  bannerEnabled: false,
  bannerType: 'topbar',
  bannerMessages: [{ id: 'm1', text: '' }],
  bannerIntervalSec: 5,
  publicSearch: true,
  registrationsOpen: true,
  maxUploadMb: 10,
  sessionMinutes: 15,
};

export const MAX_BANNER_MESSAGES = 3;

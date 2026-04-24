export type BannerType = 'topbar' | 'carousel' | 'toast';

export type BannerMessage = {
  id: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type MaintenancePreset = 'short-break' | 'scheduled' | 'new-version';

export const MAINTENANCE_PAGES = [
  'dashboard',
  'signalements',
  'membres',
  'utilisateurs',
  'statistiques',
  'annonces',
  'assistant',
] as const;

export type MaintenancePageId = (typeof MAINTENANCE_PAGES)[number];

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

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Coffee, Rocket, Wrench } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import type {
  MaintenancePageId,
  MaintenancePreset,
} from '@/lib/admin-config';

const CONFIG_KEY = 'hadar:admin:platform-config';
const CONFIG_EVENT = 'hadar:config-updated';

type MaintenanceCardProps = {
  preset: MaintenancePreset;
  message?: string;
  image?: string;
  onBack?: () => void;
};

type MaintenanceState = {
  maintenance: boolean;
  maintenancePages: MaintenancePageId[];
  maintenancePreset: MaintenancePreset;
  maintenanceMessage: string;
  maintenanceImage?: string;
};

function readConfig(): MaintenanceState | null {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MaintenanceState>;
    return {
      maintenance: !!parsed.maintenance,
      maintenancePages: Array.isArray(parsed.maintenancePages)
        ? (parsed.maintenancePages as MaintenancePageId[])
        : [],
      maintenancePreset: (parsed.maintenancePreset as MaintenancePreset) ?? 'short-break',
      maintenanceMessage: typeof parsed.maintenanceMessage === 'string' ? parsed.maintenanceMessage : '',
      maintenanceImage: typeof parsed.maintenanceImage === 'string' ? parsed.maintenanceImage : undefined,
    };
  } catch {
    return null;
  }
}

const PAGE_MATCHERS: Record<MaintenancePageId, (p: string) => boolean> = {
  dashboard: (p) => p === '/admin',
  signalements: (p) => p === '/admin/signalements' || p.startsWith('/admin/signalements/'),
  membres: (p) => p === '/admin/membres' || p.startsWith('/admin/membres/'),
  utilisateurs: (p) => p === '/admin/utilisateurs' || p.startsWith('/admin/utilisateurs/'),
  statistiques: (p) => p === '/admin/statistiques' || p.startsWith('/admin/statistiques/'),
  annonces: (p) => p === '/admin/annonces' || p.startsWith('/admin/annonces/'),
  assistant: (p) => p === '/admin/assistant' || p.startsWith('/admin/assistant/'),
};

function pathInMaintenance(pathname: string, pages: MaintenancePageId[]): boolean {
  return pages.some((id) => PAGE_MATCHERS[id](pathname));
}

const PRESET_META: Record<
  MaintenancePreset,
  { Icon: typeof Coffee; titleKey: string; descKey: string; accent: string }
> = {
  'short-break': {
    Icon: Coffee,
    titleKey: 'admin.maintenance.preset.short.title',
    descKey: 'admin.maintenance.preset.short.desc',
    accent: 'from-orange-400 to-red-400',
  },
  scheduled: {
    Icon: Wrench,
    titleKey: 'admin.maintenance.preset.scheduled.title',
    descKey: 'admin.maintenance.preset.scheduled.desc',
    accent: 'from-brand-blue to-brand-navy',
  },
  'new-version': {
    Icon: Rocket,
    titleKey: 'admin.maintenance.preset.newVersion.title',
    descKey: 'admin.maintenance.preset.newVersion.desc',
    accent: 'from-violet-500 to-brand-blue',
  },
};

export function MaintenanceCard({ preset, message, image, onBack }: MaintenanceCardProps) {
  const { t } = useI18n();
  const meta = PRESET_META[preset] ?? PRESET_META['short-break'];

  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${meta.accent}`} />
        <div className="p-8 md:p-10 text-center">
          <div className={`inline-flex h-16 w-16 rounded-full bg-gradient-to-br ${meta.accent} items-center justify-center text-white shadow-glow-navy mb-4`}>
            <meta.Icon className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
            {t(meta.titleKey)}
          </h2>
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto whitespace-pre-wrap">
            {message?.trim() ? message : t(meta.descKey)}
          </p>
          {image && (
            <div className="mt-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className="max-h-60 max-w-full rounded-xl border border-gray-200 shadow-glow-soft"
              />
            </div>
          )}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-4 py-2 text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t('common.back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MaintenancePreview({
  preset,
  message,
  image,
}: {
  preset: MaintenancePreset;
  message?: string;
  image?: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2">
      <MaintenanceCard preset={preset} message={message} image={image} />
    </div>
  );
}

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [state, setState] = useState<MaintenanceState | null>(null);

  useEffect(() => {
    setState(readConfig());
    const refresh = () => setState(readConfig());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONFIG_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CONFIG_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CONFIG_EVENT, refresh);
    };
  }, []);

  if (!state) return <>{children}</>;

  // Admin never gets locked out of Administration + Paramètres
  const safePath =
    pathname.startsWith('/admin/administration') || pathname.startsWith('/admin/parametres');
  if (safePath) return <>{children}</>;

  const isGlobal = state.maintenance;
  const isPageMatched = pathInMaintenance(pathname, state.maintenancePages);
  if (!isGlobal && !isPageMatched) return <>{children}</>;

  return (
    <MaintenanceCard
      preset={state.maintenancePreset}
      message={state.maintenanceMessage}
      image={state.maintenanceImage}
      onBack={() => router.push('/admin')}
    />
  );
}

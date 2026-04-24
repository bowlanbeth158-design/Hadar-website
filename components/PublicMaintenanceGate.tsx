'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MaintenanceCard } from '@/components/admin/AdminMaintenanceGate';
import {
  MAINTENANCE_PATH_MATCHERS,
  PLATFORM_CONFIG_EVENT,
  PLATFORM_CONFIG_KEY,
  type MaintenancePageId,
  type MaintenancePreset,
} from '@/lib/admin-config';

type State = {
  maintenance: boolean;
  maintenancePages: MaintenancePageId[];
  maintenancePreset: MaintenancePreset;
  maintenanceMessage: string;
  maintenanceImage?: string;
};

function readConfig(): State | null {
  try {
    const raw = window.localStorage.getItem(PLATFORM_CONFIG_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<State>;
    return {
      maintenance: !!p.maintenance,
      maintenancePages: Array.isArray(p.maintenancePages)
        ? (p.maintenancePages as MaintenancePageId[])
        : [],
      maintenancePreset: (p.maintenancePreset as MaintenancePreset) ?? 'short-break',
      maintenanceMessage: typeof p.maintenanceMessage === 'string' ? p.maintenanceMessage : '',
      maintenanceImage: typeof p.maintenanceImage === 'string' ? p.maintenanceImage : undefined,
    };
  } catch {
    return null;
  }
}

const PRESET_TEXTS_FR: Record<MaintenancePreset, { title: string; desc: string }> = {
  'short-break': {
    title: 'Pause courte',
    desc: 'Nous revenons dans quelques minutes. Merci de votre patience.',
  },
  scheduled: {
    title: 'Maintenance programmée',
    desc: 'Mise à jour en cours. Cette page sera de nouveau disponible très bientôt.',
  },
  'new-version': {
    title: 'Nouvelle version en préparation',
    desc: 'Cette page se modernise. Revenez plus tard pour découvrir la nouveauté.',
  },
};

function pathInMaintenance(pathname: string, pages: MaintenancePageId[]): boolean {
  return pages.some((id) => MAINTENANCE_PATH_MATCHERS[id]?.(pathname));
}

export function PublicMaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    setState(readConfig());
    const refresh = () => setState(readConfig());
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLATFORM_CONFIG_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(PLATFORM_CONFIG_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(PLATFORM_CONFIG_EVENT, refresh);
    };
  }, []);

  // Admin paths are gated by the admin layout's own MaintenanceGate
  if (pathname.startsWith('/admin')) return <>{children}</>;

  if (!state) return <>{children}</>;

  const isGlobal = state.maintenance;
  const isPageMatched = pathInMaintenance(pathname, state.maintenancePages);
  if (!isGlobal && !isPageMatched) return <>{children}</>;

  const preset = state.maintenancePreset;
  const texts = PRESET_TEXTS_FR[preset] ?? PRESET_TEXTS_FR['short-break'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-page-gradient">
      <MaintenanceCard
        preset={preset}
        message={state.maintenanceMessage}
        image={state.maintenanceImage}
        onBack={() => router.push('/')}
        texts={{ title: texts.title, desc: texts.desc, back: 'Retour à l’accueil' }}
      />
    </div>
  );
}

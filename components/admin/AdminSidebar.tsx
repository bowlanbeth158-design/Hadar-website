'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Siren,
  Users,
  UserPlus,
  BarChart3,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../Logo';
import { REPORTS } from '@/lib/mock/signalements';
import { useI18n } from '@/lib/i18n/provider';
import { PLATFORM_CONFIG_EVENT, PLATFORM_CONFIG_KEY } from '@/lib/admin-config';

function SidebarBrand() {
  const [customLogo, setCustomLogo] = useState<string | undefined>(undefined);
  const [siteName, setSiteName] = useState('Hadar');

  useEffect(() => {
    const read = () => {
      try {
        const raw = window.localStorage.getItem(PLATFORM_CONFIG_KEY);
        if (!raw) return;
        const p = JSON.parse(raw) as { brandAdminLogo?: string; siteName?: string };
        setCustomLogo(typeof p.brandAdminLogo === 'string' ? p.brandAdminLogo : undefined);
        if (typeof p.siteName === 'string' && p.siteName.trim()) setSiteName(p.siteName.trim());
      } catch {
        // ignore
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLATFORM_CONFIG_KEY) read();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(PLATFORM_CONFIG_EVENT, read);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(PLATFORM_CONFIG_EVENT, read);
    };
  }, []);

  const dotIndex = siteName.indexOf('.');
  const main = dotIndex > 0 ? siteName.slice(0, dotIndex) : siteName;
  const suffix = dotIndex > 0 ? siteName.slice(dotIndex) : '';
  const imageSrc = customLogo ?? OFFICIAL_LOGO_URL;
  const imgClass = customLogo
    ? 'h-24 w-24 rounded-2xl object-cover bg-white/10'
    : 'h-24 w-24 object-contain brightness-0 invert';

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt="" className={imgClass} />
      <span className="text-3xl font-bold text-white tracking-tight">
        {main}
        {suffix && <span className="opacity-70">{suffix}</span>}
      </span>
    </div>
  );
}

type NavItem = { href: string; labelKey: string; Icon: LucideIcon; badge?: number };

const PENDING_REPORTS = REPORTS.filter((r) => r.status === 'en_cours').length;
const UNREAD_TICKETS = 3;

const MAIN_NAV: NavItem[] = [
  { href: '/admin', labelKey: 'sidebar.dashboard', Icon: LayoutDashboard },
  { href: '/admin/signalements', labelKey: 'sidebar.signalements', Icon: Siren, badge: PENDING_REPORTS },
  { href: '/admin/membres', labelKey: 'sidebar.membres', Icon: Users },
  { href: '/admin/utilisateurs', labelKey: 'sidebar.utilisateurs', Icon: UserPlus },
  { href: '/admin/statistiques', labelKey: 'sidebar.statistiques', Icon: BarChart3 },
  { href: '/admin/annonces', labelKey: 'sidebar.annonces', Icon: Megaphone },
  { href: '/admin/assistant', labelKey: 'sidebar.assistant', Icon: MessageCircle, badge: UNREAD_TICKETS },
];

const FOOTER_NAV: NavItem[] = [
  { href: '/admin/administration', labelKey: 'sidebar.administration', Icon: ShieldCheck },
  { href: '/admin/parametres', labelKey: 'sidebar.parametres', Icon: Settings },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useI18n();
  return (
    <Link
      href={item.href}
      className={
        active
          ? 'flex items-center gap-3 rounded-pill bg-orange-500 text-white px-4 py-2.5 text-sm font-semibold shadow-glow-orange'
          : 'flex items-center gap-3 rounded-pill text-white/80 hover:bg-white/10 hover:text-white px-4 py-2.5 text-sm font-medium transition-colors'
      }
    >
      <item.Icon className="h-4 w-4" aria-hidden />
      <span className="flex-1">{t(item.labelKey)}</span>
      {item.badge && item.badge > 0 && (
        <span
          className={
            active
              ? 'min-w-[20px] h-5 px-1.5 rounded-full bg-white text-orange-600 text-[10px] font-bold inline-flex items-center justify-center'
              : 'min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center'
          }
          aria-label={`${item.badge} ${t('sidebar.pending')}`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 w-64 bg-brand-navy text-white px-4 py-6 z-30">
      <div className="px-3 mb-8">
        <SidebarBrand />
      </div>
      <nav className="flex-1 space-y-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4 space-y-1">
        {FOOTER_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </aside>
  );
}

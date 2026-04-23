'use client';

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
import { Logo } from '../Logo';
import { REPORTS } from '@/lib/mock/signalements';
import { useI18n } from '@/lib/i18n/provider';

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
        <Logo variant="white" size="md" />
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

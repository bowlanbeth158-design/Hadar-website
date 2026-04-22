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

type NavItem = { href: string; label: string; Icon: LucideIcon };

const MAIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/signalements', label: 'Signalements', Icon: Siren },
  { href: '/admin/membres', label: 'Membres', Icon: Users },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', Icon: UserPlus },
  { href: '/admin/statistiques', label: 'Statistiques', Icon: BarChart3 },
  { href: '/admin/annonces', label: 'Annonces', Icon: Megaphone },
  { href: '/admin/assistant', label: 'Assistant', Icon: MessageCircle },
];

const FOOTER_NAV: NavItem[] = [
  { href: '/admin/administration', label: 'Administration', Icon: ShieldCheck },
  { href: '/admin/parametres', label: 'Paramètres', Icon: Settings },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
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
      {item.label}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-brand-navy text-white px-4 py-6 z-30">
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

import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminAnnouncementBanner } from '@/components/admin/AdminAnnouncementBanner';
import { MaintenanceGate } from '@/components/admin/AdminMaintenanceGate';
import { I18nProvider } from '@/lib/i18n/provider';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s · Admin Hadar.ma',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64">
          <AdminAnnouncementBanner mode="live" />
          <AdminTopBar />
          <main className="p-6">
            <MaintenanceGate>{children}</MaintenanceGate>
          </main>
          <footer className="px-6 py-4 text-center text-xs text-gray-400">
            © 2026 HADAR — Tous droits réservés.
          </footer>
        </div>
      </div>
    </I18nProvider>
  );
}

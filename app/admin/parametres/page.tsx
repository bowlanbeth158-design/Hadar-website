import type { Metadata } from 'next';
import { SettingsTabs } from '@/components/admin/SettingsTabs';

export const metadata: Metadata = { title: 'Paramètres' };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-6">Paramètres</h1>
      <SettingsTabs />
    </div>
  );
}

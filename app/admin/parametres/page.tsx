import type { Metadata } from 'next';
import { SettingsTabs } from '@/components/admin/SettingsTabs';

export const metadata: Metadata = { title: 'Paramètres' };

export default function Page() {
  return (
    <div>
      <SettingsTabs />
    </div>
  );
}

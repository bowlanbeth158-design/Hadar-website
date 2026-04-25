import type { Metadata } from 'next';
import { AdminStats } from '@/components/admin/AdminStats';

export const metadata: Metadata = { title: 'Statistiques' };

export default function Page() {
  return <AdminStats />;
}

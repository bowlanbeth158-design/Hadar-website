import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité Hadar — comment nous protégeons et traitons vos informations.',
};

export default async function Page() {
  const md = await loadLegal('04-politique-confidentialite.md');
  return <MarkdownPage title="Politique de confidentialité" markdown={md} />;
}

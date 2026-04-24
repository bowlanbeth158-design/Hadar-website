import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Qui sommes-nous ?',
  description: "L'équipe, la mission et les valeurs de Hadar.",
};

export default async function Page() {
  const md = await loadLegal('05-qui-sommes-nous.md');
  return <MarkdownPage title="Qui sommes-nous ?" markdown={md} />;
}

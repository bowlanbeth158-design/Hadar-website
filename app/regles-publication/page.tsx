import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Règles de publication',
  description:
    'Règles et critères de publication des signalements sur la plateforme Hadar.',
};

export default async function Page() {
  const md = await loadLegal('06-regles-publication.md');
  return <MarkdownPage title="Règles de publication" markdown={md} />;
}

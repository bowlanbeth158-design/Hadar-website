import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Foire aux questions — réponses aux interrogations fréquentes sur Hadar.ma.',
};

export default async function Page() {
  const md = await loadLegal('03-faq.md');
  return <MarkdownPage title="Foire aux questions" markdown={md} />;
}

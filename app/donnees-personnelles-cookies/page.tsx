import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Données personnelles & cookies',
  description:
    "Politique de traitement des données personnelles et gestion des cookies sur Hadar.ma.",
};

export default async function Page() {
  const md = await loadLegal('02-donnees-personnelles-cookies.md');
  return <MarkdownPage title="Données personnelles & cookies" markdown={md} />;
}

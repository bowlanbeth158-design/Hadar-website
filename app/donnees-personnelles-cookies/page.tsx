import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegalLocalised } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Données personnelles & cookies',
  description:
    "Politique de traitement des données personnelles et gestion des cookies sur Hadar.",
};

export default async function Page() {
  const md = await loadLegalLocalised('02-donnees-personnelles-cookies.md');
  return <MarkdownPage titleKey="legalPage.cookies.title" markdownByLocale={md} />;
}

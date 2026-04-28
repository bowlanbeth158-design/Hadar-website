import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegalLocalised } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation de la plateforme Hadar — règles d'usage, droits et obligations.",
};

export default async function Page() {
  const md = await loadLegalLocalised('01-conditions-generales-utilisation.md');
  return <MarkdownPage titleKey="legalPage.cgu.title" markdownByLocale={md} />;
}

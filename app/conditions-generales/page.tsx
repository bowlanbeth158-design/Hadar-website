import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation de la plateforme Hadar.ma — règles d'usage, droits et obligations.",
};

export default async function Page() {
  const md = await loadLegal('01-conditions-generales-utilisation.md');
  return <MarkdownPage title="Conditions générales d'utilisation" markdown={md} />;
}

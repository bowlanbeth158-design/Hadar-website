import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { AboutPageHeading } from '@/components/AboutPageHeading';
import { AboutPageBody } from '@/components/AboutPageBody';
import { loadLegalLocalised } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Qui sommes-nous ?',
  description: "L'équipe, la mission et les valeurs de Hadar.",
};

export default async function Page() {
  const md = await loadLegalLocalised('05-qui-sommes-nous.md');

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <AboutPageHeading />
      <AboutPageBody markdownByLocale={md} />
    </PageLayout>
  );
}

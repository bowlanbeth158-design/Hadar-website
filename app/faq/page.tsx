import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { FaqAccordion } from '@/components/FaqAccordion';
import { loadLegalLocalised } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Foire aux questions — réponses aux interrogations fréquentes sur Hadar.',
};

export default async function Page() {
  const md = await loadLegalLocalised('03-faq.md');

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        titleKey="faqPage.title"
        subtitleKey="faqPage.subtitle"
        accent="gradient"
      />
      <FaqAccordion markdownByLocale={md} />
    </PageLayout>
  );
}

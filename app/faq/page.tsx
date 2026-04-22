import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { FaqAccordion } from '@/components/FaqAccordion';
import { loadLegal } from '@/lib/loadLegal';
import { parseFaq } from '@/lib/parseFaq';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Foire aux questions — réponses aux interrogations fréquentes sur Hadar.ma.',
};

export default async function Page() {
  const md = await loadLegal('03-faq.md');
  const items = parseFaq(md);

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Foire aux questions"
        subtitle="Les réponses aux questions les plus fréquentes sur Hadar.ma."
      />
      <FaqAccordion items={items} />
    </PageLayout>
  );
}

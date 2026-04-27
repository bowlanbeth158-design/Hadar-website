import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { ProcessSteps } from '@/components/ProcessSteps';
import { loadLegal } from '@/lib/loadLegal';

export const metadata: Metadata = {
  title: 'Qui sommes-nous ?',
  description: "L'équipe, la mission et les valeurs de Hadar.",
};

const PROCESS_MARKER = '## Processus de vérification des signalements';

// Split the markdown at the process-steps section so we can render the
// real <ProcessSteps /> component in its place rather than the markdown
// placeholder. Returns the markdown chunks before and after the section.
function splitAtProcess(md: string): { before: string; after: string } {
  const idx = md.indexOf(PROCESS_MARKER);
  if (idx === -1) return { before: md, after: '' };
  // The process section ends at the next H2.
  const nextH2 = md.indexOf('\n## ', idx + PROCESS_MARKER.length);
  return {
    before: md.slice(0, idx).trim(),
    after: nextH2 >= 0 ? md.slice(nextH2).trim() : '',
  };
}

const PROSE_CLASS = `
  prose prose-slate max-w-none
  prose-headings:text-brand-navy prose-headings:font-bold prose-headings:tracking-tight
  prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
  prose-strong:text-brand-navy
  prose-table:text-sm
  prose-th:bg-gray-50
  prose-hr:border-gray-200
`;

export default async function Page() {
  const md = await loadLegal('05-qui-sommes-nous.md');
  const { before, after } = splitAtProcess(md);

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-navy mb-8">
        Qui sommes-nous ?
      </h1>

      {/* Sections before the process steps */}
      <article className={PROSE_CLASS}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{before}</ReactMarkdown>
      </article>

      {/* Live <ProcessSteps /> rendering — replaces the markdown placeholder
          so the page shows the same animated 4-step component as the home. */}
      <div className="my-4">
        <ProcessSteps />
      </div>

      {/* Sections after the process steps */}
      {after && (
        <article className={PROSE_CLASS}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{after}</ReactMarkdown>
        </article>
      )}
    </PageLayout>
  );
}

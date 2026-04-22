import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLayout } from './PageLayout';
import { BackButton } from './BackButton';

type Props = {
  title: string;
  markdown: string;
};

export function MarkdownPage({ title, markdown }: Props) {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-navy mb-8">
        {title}
      </h1>
      <article
        className="
          prose prose-slate max-w-none
          prose-headings:text-brand-navy prose-headings:font-bold prose-headings:tracking-tight
          prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
          prose-strong:text-brand-navy
          prose-table:text-sm
          prose-th:bg-gray-50
          prose-hr:border-gray-200
        "
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </PageLayout>
  );
}

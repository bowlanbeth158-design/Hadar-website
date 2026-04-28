'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useI18n } from '@/lib/i18n/provider';
import { ProcessSteps } from './ProcessSteps';
import type { LocalisedMarkdown } from '@/lib/loadLegal';

const PROCESS_MARKER = '<!-- PROCESS_STEPS -->';

const PROSE_CLASS = `
  prose prose-slate max-w-none
  prose-headings:text-brand-navy prose-headings:font-bold prose-headings:tracking-tight
  prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
  prose-strong:text-brand-navy
  prose-table:text-sm
  prose-th:bg-gray-50
  prose-hr:border-gray-200
`;

function splitAtMarker(md: string): { before: string; after: string } {
  const idx = md.indexOf(PROCESS_MARKER);
  if (idx === -1) return { before: md, after: '' };
  return {
    before: md.slice(0, idx).trim(),
    after: md.slice(idx + PROCESS_MARKER.length).trim(),
  };
}

// Renders the /qui-sommes-nous body in the active locale, splitting
// the markdown at the <!-- PROCESS_STEPS --> marker so the live
// <ProcessSteps /> component takes the middle slot. Stays a client
// component so it can read the active locale at render time without
// requiring the parent page to do so.
export function AboutPageBody({ markdownByLocale }: { markdownByLocale: LocalisedMarkdown }) {
  const { locale, dir } = useI18n();
  const { before, after } = splitAtMarker(markdownByLocale[locale]);

  return (
    <>
      <article dir={dir} className={PROSE_CLASS}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{before}</ReactMarkdown>
      </article>

      <div className="my-4">
        <ProcessSteps />
      </div>

      {after && (
        <article dir={dir} className={PROSE_CLASS}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{after}</ReactMarkdown>
        </article>
      )}
    </>
  );
}

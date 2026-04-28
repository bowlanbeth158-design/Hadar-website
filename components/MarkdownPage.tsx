'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLayout } from './PageLayout';
import { BackButton } from './BackButton';
import { useI18n } from '@/lib/i18n/provider';
import type { LocalisedMarkdown } from '@/lib/loadLegal';

type Props = {
  // i18n key for the page title (resolved at render time).
  titleKey: string;
  // Either:
  //  - markdown: a single string (legacy, FR-only)
  //  - markdownByLocale: { fr, en, ar } loaded server-side via
  //    loadLegalLocalised(); the right one is picked here at
  //    render time based on the active locale.
  markdown?: string;
  markdownByLocale?: LocalisedMarkdown;
};

export function MarkdownPage({ titleKey, markdown, markdownByLocale }: Props) {
  const { t, locale, dir } = useI18n();
  const body = markdownByLocale ? markdownByLocale[locale] : (markdown ?? '');

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-navy mb-8">
        {t(titleKey)}
      </h1>
      <article
        // Force the article direction to match the active locale so
        // Arabic content reads right-to-left even on a page that
        // would otherwise stay LTR.
        dir={dir}
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
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </PageLayout>
  );
}

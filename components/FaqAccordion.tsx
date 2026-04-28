'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown } from 'lucide-react';
import { parseFaq, type FaqItem } from '@/lib/parseFaq';
import { useI18n } from '@/lib/i18n/provider';
import type { LocalisedMarkdown } from '@/lib/loadLegal';

type Props = {
  // Either: parsed FAQ items (legacy, FR-only), OR per-locale
  // markdown that we parse here based on the active locale.
  items?: FaqItem[];
  markdownByLocale?: LocalisedMarkdown;
};

export function FaqAccordion({ items, markdownByLocale }: Props) {
  const { locale, dir } = useI18n();
  const resolvedItems = useMemo<FaqItem[]>(() => {
    if (markdownByLocale) return parseFaq(markdownByLocale[locale]);
    return items ?? [];
  }, [items, markdownByLocale, locale]);

  return (
    <div className="space-y-3" dir={dir}>
      {resolvedItems.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-gray-200 bg-white shadow-glow-soft open:border-brand-blue open:shadow-glow-blue transition-all"
        >
          <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-brand-navy font-semibold list-none [&::-webkit-details-marker]:hidden group-open:text-brand-blue">
            <span className="flex-1">{item.question}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-brand-blue transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="px-5 pb-5 border-t border-brand-sky pt-4 bg-brand-sky/30 rounded-b-2xl">
            <article
              className="
                prose prose-sm prose-slate max-w-none
                prose-p:text-brand-navy prose-li:text-brand-navy
                prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                prose-strong:text-brand-navy
              "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
            </article>
          </div>
        </details>
      ))}
    </div>
  );
}

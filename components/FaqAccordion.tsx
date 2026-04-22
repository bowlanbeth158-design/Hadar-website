import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/parseFaq';

type Props = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const highlight = i === 0;
        return (
          <details
            key={item.question}
            className={
              highlight
                ? 'group rounded-2xl border-2 border-red-500/40 bg-white open:border-red-500 open:shadow-md transition-all'
                : 'group rounded-2xl border border-gray-200 bg-white open:border-brand-blue open:shadow-md transition-all'
            }
          >
            <summary
              className={
                highlight
                  ? 'flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-red-700 font-semibold list-none [&::-webkit-details-marker]:hidden'
                  : 'flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-brand-navy font-semibold list-none [&::-webkit-details-marker]:hidden'
              }
            >
              <span className="flex-1">{item.question}</span>
              <ChevronDown
                className={
                  highlight
                    ? 'h-4 w-4 shrink-0 text-red-500 transition-transform group-open:rotate-180'
                    : 'h-4 w-4 shrink-0 text-brand-blue transition-transform group-open:rotate-180'
                }
                aria-hidden
              />
            </summary>
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <article
                className="
                  prose prose-sm prose-slate max-w-none
                  prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-brand-navy
                "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
              </article>
            </div>
          </details>
        );
      })}
    </div>
  );
}

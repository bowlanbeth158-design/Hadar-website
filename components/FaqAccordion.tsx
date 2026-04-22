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
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-gray-200 bg-white open:border-brand-blue open:shadow-md transition-all"
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

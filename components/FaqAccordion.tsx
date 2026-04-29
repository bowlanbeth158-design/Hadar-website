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
          // open:animate-[pulse-blue_…_1] fires the brand-blue halo
          // ONCE when the question is opened — a quick lighting cue
          // confirming the action without becoming a permanent
          // distraction. The existing open:shadow-glow-blue
          // afterwards keeps the open card softly highlighted.
          className="group relative rounded-2xl border border-gray-200 bg-white shadow-glow-soft open:border-brand-blue open:shadow-glow-blue open:animate-[pulse-blue_1.6s_cubic-bezier(0,0,0.2,1)_1] transition-all overflow-hidden"
        >
          <summary className="relative flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-brand-navy font-semibold list-none [&::-webkit-details-marker]:hidden group-open:text-brand-blue">
            {/* Diagonal shimmer wipe — fires once when the question
                opens and travels across the summary, like a flash of
                light highlighting the active item. Hidden when
                closed; the keyframe runs a single pass on open via
                animation-iteration-count 1 + forwards. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] opacity-0 group-open:opacity-100 group-open:animate-[shimmer_1.4s_linear_1_forwards]"
            />
            <span className="relative flex-1">{item.question}</span>
            <ChevronDown
              className="relative h-4 w-4 shrink-0 text-brand-blue transition-transform duration-300 group-open:rotate-180 group-open:scale-110"
              aria-hidden
            />
          </summary>
          <div className="px-5 pb-5 border-t border-brand-sky pt-4 bg-brand-sky/30 rounded-b-2xl group-open:animate-fade-in-down">
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

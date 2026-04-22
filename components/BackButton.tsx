import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  href?: string;
  label?: string;
};

export function BackButton({ href = '/', label = 'Retour' }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue hover:text-brand-blue transition-colors"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}

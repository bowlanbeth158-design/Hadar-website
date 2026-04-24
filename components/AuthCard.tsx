import Link from 'next/link';
import { Logo } from './Logo';

type Props = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-glow-navy p-8">
        <Link href="/" className="flex justify-center mb-6" aria-label="Accueil Hadar">
          <Logo size="md" />
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy text-center mb-2">{title}</h1>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-center gap-3 text-xs text-gray-400">
          <Link href="/conditions-generales" className="hover:text-brand-navy">
            Conditions
          </Link>
          <span>·</span>
          <Link href="/politique-confidentialite" className="hover:text-brand-navy">
            Confidentialité
          </Link>
          <span>·</span>
          <Link href="/donnees-personnelles-cookies" className="hover:text-brand-navy">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}

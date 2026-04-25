import Link from 'next/link';
import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-xl border border-brand-blue/30 bg-brand-sky/50 px-4 py-3 text-sm text-brand-navy">
      <Info className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden />
      <p>
        <span className="font-semibold">Aperçu</span> — cette page montre la structure de
        l&apos;espace utilisateur. L&apos;authentification sera activée prochainement. En attendant,{' '}
        <Link href="/connexion" className="font-semibold underline hover:text-brand-blue">
          créez votre compte
        </Link>
        .
      </p>
    </div>
  );
}

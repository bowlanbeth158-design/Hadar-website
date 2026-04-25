'use client';

import { useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { BadgesCriteriaModal } from './BadgesCriteriaModal';
import { IdentityVerificationModal } from './IdentityVerificationModal';
import { CountUp } from './CountUp';

const KEY = 'hadar:identity-verified';

type Props = {
  firstName: string;
  lastName: string;
  badge: string;
  badgeKey: string;
  badgeStars: number;
  validationRate: number;
};

export function ProfileIdentity({
  firstName,
  lastName,
  badge,
  badgeKey,
  badgeStars,
  validationRate,
}: Props) {
  const [verified, setVerified] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (raw === '1') setVerified(true);
    setHydrated(true);
  }, []);

  const markVerified = () => {
    setVerified(true);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // ignore quota errors silently in demo mode
    }
  };

  return (
    <div className="min-w-0 flex-1">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy inline-flex items-center gap-2 flex-wrap">
        <span>
          {firstName} {lastName}
        </span>
        {verified && (
          <VerifiedBadge className="h-6 w-6 animate-fade-in" />
        )}
      </h1>

      {/* Badge tier — clickable, opens criteria modal */}
      <BadgesCriteriaModal
        highlightKey={badgeKey}
        trigger={
          <span className="mt-1 group inline-flex items-center gap-1.5 rounded-pill bg-white/60 backdrop-blur-sm border border-yellow-200 px-3 py-1 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:bg-white hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
            <Award className="h-3.5 w-3.5 text-yellow-500" aria-hidden />
            {badge}
            <span className="inline-flex items-center gap-0.5 ml-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < badgeStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  aria-hidden
                />
              ))}
            </span>
            <span className="ml-1 text-[10px] uppercase tracking-wide text-brand-blue group-hover:underline">
              Voir les niveaux
            </span>
          </span>
        }
      />

      <p className="mt-2 text-xs text-gray-500">
        Taux de validation :{' '}
        <span className="font-semibold text-brand-navy">
          <CountUp to={validationRate} />%
        </span>
      </p>

      {/* Identity verification CTA — only when NOT verified.
          Hidden until hydration to avoid showing the wrong state on first paint. */}
      {hydrated && !verified && (
        <IdentityVerificationModal
          onVerified={markVerified}
          trigger={
            <span className="mt-3 inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
              <VerifiedBadge className="h-4 w-4" />
              Activer ma vérification d&apos;identité —{' '}
              <span className="text-green-600">gratuit</span>
            </span>
          }
        />
      )}
    </div>
  );
}

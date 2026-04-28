'use client';

import { useEffect, useState } from 'react';
import { Award, Star, X } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { BadgesCriteriaModal } from './BadgesCriteriaModal';
import { IdentityVerificationModal } from './IdentityVerificationModal';
import { CountUp } from './CountUp';
import { useI18n } from '@/lib/i18n/provider';

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
  const { t } = useI18n();
  const [verified, setVerified] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

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

  const revokeVerification = () => {
    setVerified(false);
    setConfirmRevoke(false);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-w-0 flex-1 space-y-2">
      {/* Line 1 — Name + verified badge */}
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy flex items-center gap-2 flex-wrap">
        <span>
          {firstName} {lastName}
        </span>
        {verified && (
          <span className="inline-flex items-center gap-1">
            <VerifiedBadge className="h-6 w-6 animate-fade-in" />
            <button
              type="button"
              onClick={() => setConfirmRevoke((v) => !v)}
              aria-label={t('profile.identity.cancel.aria')}
              className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 hover:text-red-500 transition-colors"
            >
              {t('profile.identity.cancel')}
            </button>
          </span>
        )}
      </h1>

      {/* Inline confirmation panel for badge revocation */}
      {verified && confirmRevoke && (
        <div
          role="alertdialog"
          aria-label={t('profile.identity.confirmRevoke.aria')}
          className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-3 animate-fade-in-down"
        >
          <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">
              {t('profile.identity.confirmRevoke.title')}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              {t('profile.identity.confirmRevoke.body')}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={revokeVerification}
                className="inline-flex items-center gap-1 rounded-pill bg-red-500 hover:bg-red-700 text-white px-3 py-1 text-xs font-semibold transition-colors"
              >
                {t('profile.identity.confirmRevoke.yes')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmRevoke(false)}
                className="text-xs font-medium text-gray-500 hover:text-brand-navy"
              >
                {t('profile.identity.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Line 2 — Badge tier (Contributeur régulier + stars + voir les niveaux) */}
      <div>
        <BadgesCriteriaModal
          highlightKey={badgeKey}
          trigger={
            <span className="group inline-flex items-center gap-1.5 rounded-pill bg-white/60 backdrop-blur-sm border border-yellow-200 px-3 py-1 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:bg-white hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
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
                {t('profile.identity.viewLevels')}
              </span>
            </span>
          }
        />
      </div>

      {/* Line 3 — Taux de validation */}
      <p className="text-xs text-gray-500">
        {t('profile.identity.validationRate')}{' '}
        <span className="font-semibold text-brand-navy">
          <CountUp to={validationRate} />%
        </span>
      </p>

      {/* Identity verification CTA — only when NOT verified.
          Hidden until hydration to avoid flashing the wrong state on first paint. */}
      {hydrated && !verified && (
        <IdentityVerificationModal
          onVerified={markVerified}
          trigger={
            <span className="mt-1 inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 cursor-pointer">
              <VerifiedBadge className="h-4 w-4" />
              {t('profile.identity.activateCta')}{' '}
              <span className="text-green-600">{t('profile.identity.activateCta.free')}</span>
            </span>
          }
        />
      )}
    </div>
  );
}

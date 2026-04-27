'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellOff, ChevronsDown, Clock3, Settings } from 'lucide-react';
import { CHANNEL_ICON, DEMO_ALERTS, type Alert, type RiskLevel } from '@/lib/mock/alerts';
import { useI18n } from '@/lib/i18n/provider';

// Same brand-themed hover stack used by the other nav links (color shift,
// 1px lift, brand-gradient tile behind letters, gradient underline).
// Kept inline here on purpose so the "Mes alertes" trigger looks identical
// to "Accueil" / "Comment ça marche" even though it's a button, not a Link.
const NAV_LINK_HOVER =
  'isolate relative hover:text-brand-blue transition-all duration-200 ease-out hover:-translate-y-px ' +
  "before:content-[''] before:absolute before:-inset-x-3 before:-inset-y-1.5 " +
  'before:rounded-lg before:-z-10 ' +
  'before:bg-gradient-to-br before:from-brand-sky/40 before:via-brand-blue/8 before:to-brand-navy/0 ' +
  'before:opacity-0 before:scale-95 before:transition-all before:duration-300 before:ease-out ' +
  'hover:before:opacity-100 hover:before:scale-100 ' +
  "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-[-8px] " +
  'after:h-[2px] after:w-0 after:rounded-full ' +
  'after:bg-gradient-to-r after:from-brand-navy after:via-brand-blue after:to-brand-sky ' +
  'after:transition-all after:duration-300 after:ease-out hover:after:w-full';

const RISK_BAR: Record<RiskLevel, string> = {
  low: 'bg-green-500',
  vigilance: 'bg-yellow-300',
  moderate: 'bg-orange-500',
  high: 'bg-red-500',
};

export function AlertsPopover({
  count,
  alerts = DEMO_ALERTS.filter((a) => a.status === 'active'),
}: {
  count: number;
  alerts?: Alert[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const visible = alerts.slice(0, 4);
  const hasAlerts = visible.length > 0;
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('alerts.aria.button')}
        className={`inline-flex items-center gap-1.5 ${NAV_LINK_HOVER}`}
      >
        {t('alerts.label')}
        {count > 0 && (
          <span
            aria-label={t('alerts.aria.count', { n: count })}
            className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('alerts.label')}
          className="absolute right-0 top-full mt-3 w-[380px] rounded-2xl bg-white border border-gray-200 shadow-xl z-50 overflow-hidden animate-fade-in-down"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-brand-navy">{t('alerts.label')}</h3>
            <Link
              href="/mes-alertes?settings=1"
              onClick={close}
              className="text-xs text-brand-blue font-semibold inline-flex items-center gap-1 hover:underline"
            >
              {t('alerts.manage')}
              <Settings className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {/* Body */}
          {hasAlerts ? (
            <ul className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
              {visible.map((alert) => {
                const Icon = CHANNEL_ICON[alert.channel];
                return (
                  <li key={alert.id}>
                    <Link
                      href={`/mes-alertes?alert=${alert.id}`}
                      onClick={close}
                      className="group relative flex items-stretch hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span
                        className={`w-1 shrink-0 ${RISK_BAR[alert.risk]}`}
                        aria-hidden
                      />
                      <div className="flex-1 px-4 py-3 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                          <Icon className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                          <span className="truncate">{alert.contact}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-gray-400 inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" aria-hidden />
                            {alert.lastReportRelative}
                          </span>
                          <span className="text-brand-blue font-semibold group-hover:underline">
                            {t('alerts.viewDetails')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-brand-sky/40 flex items-center justify-center">
                <BellOff className="h-7 w-7 text-brand-blue/60" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-brand-navy mb-1">
                {t('alerts.empty.title')}
              </p>
              <p className="text-xs text-gray-500 max-w-[260px] mx-auto">
                {t('alerts.empty.subtitle')}
              </p>
            </div>
          )}

          {/* Footer */}
          <Link
            href="/mes-alertes"
            onClick={close}
            className="flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-brand-navy border-t border-gray-100 hover:bg-gray-50 hover:text-brand-blue transition-colors group"
          >
            <ChevronsDown
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
              aria-hidden
            />
            {t('alerts.viewAll')}
          </Link>
        </div>
      )}
    </div>
  );
}

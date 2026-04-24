'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Megaphone, Info, Bell, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

export type BannerType = 'topbar' | 'carousel' | 'toast';
export type BannerMessage = {
  id: string;
  text: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type BannerConfig = {
  bannerEnabled: boolean;
  bannerType: BannerType;
  bannerMessages: BannerMessage[];
  bannerIntervalSec: number;
};

type Props =
  | { mode: 'preview'; config: BannerConfig }
  | { mode: 'live'; config?: undefined };

const CONFIG_KEY = 'hadar:admin:platform-config';
const CONFIG_EVENT = 'hadar:config-updated';

function readConfig(): BannerConfig | null {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BannerConfig>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      bannerEnabled: !!parsed.bannerEnabled,
      bannerType: (parsed.bannerType as BannerType) ?? 'topbar',
      bannerMessages: Array.isArray(parsed.bannerMessages) ? parsed.bannerMessages : [],
      bannerIntervalSec: parsed.bannerIntervalSec ?? 5,
    };
  } catch {
    return null;
  }
}

export function AdminAnnouncementBanner(props: Props) {
  const { t } = useI18n();
  const [live, setLive] = useState<BannerConfig | null>(null);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Live mode: read from localStorage + listen to updates (same tab + cross-tab)
  useEffect(() => {
    if (props.mode !== 'live') return;
    setLive(readConfig());
    const refresh = () => {
      setLive(readConfig());
      setIndex(0);
      setDismissed(false);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONFIG_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(CONFIG_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CONFIG_EVENT, refresh);
    };
  }, [props.mode]);

  const config = props.mode === 'preview' ? props.config : live;

  const visibleMessages = useMemo(
    () => (config ? config.bannerMessages.filter((m) => m.text.trim().length > 0) : []),
    [config],
  );

  // Rotation
  useEffect(() => {
    if (!config) return;
    if (config.bannerType === 'topbar') return;
    if (visibleMessages.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % visibleMessages.length);
    }, Math.max(3, config.bannerIntervalSec) * 1000);
    return () => window.clearInterval(id);
  }, [config, visibleMessages.length]);

  if (!config) {
    return props.mode === 'preview' ? (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-xs text-center text-gray-400">
        {t('admin.banner.previewEmpty')}
      </div>
    ) : null;
  }

  if (!config.bannerEnabled || visibleMessages.length === 0 || dismissed) {
    return props.mode === 'preview' ? (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-xs text-center text-gray-400">
        {t('admin.banner.previewEmpty')}
      </div>
    ) : null;
  }

  const safeIndex = index % visibleMessages.length;
  const current = visibleMessages[safeIndex]!;
  const isPreview = props.mode === 'preview';

  const href = current.linkUrl?.trim();
  const linkLabel = current.linkLabel?.trim() || t('admin.banner.readMore');

  if (config.bannerType === 'toast') {
    return (
      <div
        className={
          isPreview
            ? 'relative ms-auto max-w-sm rounded-2xl bg-brand-navy text-white shadow-glow-navy p-4 pr-10'
            : 'fixed bottom-6 end-6 max-w-sm rounded-2xl bg-brand-navy text-white shadow-glow-navy p-4 pr-10 z-40'
        }
        role="status"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-brand-sky" aria-hidden />
          <div className="text-sm">
            <p className="leading-snug">{current.text}</p>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-sky hover:text-white underline"
              >
                {linkLabel}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </div>
        </div>
        {visibleMessages.length > 1 && (
          <div className="mt-3 flex items-center gap-1">
            {visibleMessages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === safeIndex ? 'w-6 bg-brand-sky' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('admin.banner.dismissAria')}
          className="absolute top-2 end-2 h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  // topbar + carousel share the same visual (thin bar), carousel just rotates
  return (
    <div
      className={
        isPreview
          ? 'relative rounded-xl bg-grad-stat-navy text-white shadow-glow-navy px-10 py-2.5 text-center'
          : 'relative bg-grad-stat-navy text-white shadow-glow-navy px-10 py-2 text-center z-40'
      }
      role="status"
    >
      <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
        {config.bannerType === 'carousel' ? (
          <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Bell className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span>{current.text}</span>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline hover:text-brand-sky"
          >
            {linkLabel}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>
      {config.bannerType === 'carousel' && visibleMessages.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0.5 flex items-center gap-1">
          {visibleMessages.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === safeIndex ? 'w-5 bg-white' : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t('admin.banner.dismissAria')}
        className="absolute top-1/2 -translate-y-1/2 end-2 h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function dispatchConfigUpdate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONFIG_EVENT));
}

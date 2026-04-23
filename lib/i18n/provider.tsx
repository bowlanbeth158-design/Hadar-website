'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  MESSAGES,
  interpolate,
  type Locale,
} from './messages';

const LANG_KEY = 'hadar:settings:lang';

type Dir = 'ltr' | 'rtl';

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: Dir;
};

const Ctx = createContext<I18nCtx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => k,
  dir: 'ltr',
});

export function useI18n() {
  return useContext(Ctx);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === 'fr' || stored === 'en' || stored === 'ar') {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = MESSAGES[locale];
      const raw = dict[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
      return interpolate(raw, params);
    },
    [locale],
  );

  const dir: Dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value = useMemo(() => ({ locale, setLocale, t, dir }), [locale, setLocale, t, dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Users, RefreshCw, Apple, Play } from 'lucide-react';
import { Logo } from './Logo';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XIcon,
  TikTokIcon,
} from './SocialIcons';
import { useI18n } from '@/lib/i18n/provider';

const LEGAL_LINKS = [
  { href: '/qui-sommes-nous',     labelKey: 'footer.link.about' },
  { href: '/comment-ca-marche',   labelKey: 'footer.link.howItWorks' },
  { href: '/statistiques',        labelKey: 'footer.link.statistics' },
  { href: '/faq',                 labelKey: 'footer.link.faq' },
];

const POLICY_LINKS = [
  { href: '/conditions-generales',         labelKey: 'footer.link.cgu' },
  { href: '/politique-confidentialite',    labelKey: 'footer.link.privacy' },
  { href: '/donnees-personnelles-cookies', labelKey: 'footer.link.cookies' },
  { href: '/regles-publication',           labelKey: 'footer.link.publishingRules' },
];

// Placeholder URLs — to be updated with the official Hadar accounts when
// they're live. Each handle follows the convention "hadar-ma" / "hadar.ma"
// / "@hadar.ma" / "@hadar_ma" depending on the platform's slug rules.
const SOCIALS = [
  { Icon: LinkedInIcon, label: 'LinkedIn', href: 'https://www.linkedin.com/company/hadar-ma' },
  { Icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com/hadar.ma' },
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/hadar.ma' },
  { Icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@hadar.ma' },
  { Icon: XIcon, label: 'X', href: 'https://twitter.com/hadar_ma' },
  { Icon: YouTubeIcon, label: 'YouTube', href: 'https://www.youtube.com/@hadar-ma' },
];

export function Footer() {
  const { t } = useI18n();
  // Active-page detection — the footer link that points to the current
  // route is highlighted in solid white + a small leading dot, so the
  // user can tell which page they are on at a glance.
  const pathname = usePathname();

  // Helper: a footer link can be marked active if either:
  //   - the pathname matches it exactly, OR
  //   - the pathname starts with it followed by a "/" (covers nested
  //     routes like /mes-signalements/123 highlighting the parent).
  const isActive = (href: string): boolean => {
    if (!pathname) return false;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  };

  // Shared link classes — white/80 at rest, solid white on hover OR
  // when active. Active link gets a subtle left border + bold weight
  // so it doesn't rely on colour alone (a11y).
  const linkClass = (active: boolean): string =>
    active
      ? 'inline-flex items-center gap-1 font-semibold text-white border-l-2 border-brand-sky pl-2 -ml-2'
      : 'text-white/80 hover:text-white transition-colors';

  return (
    <footer className="mt-10 bg-brand-navy text-white">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="white" size="md" />
          <p className="mt-4 text-sm text-white/80 leading-relaxed">{t('footer.tagline')}</p>
          {/* Trust pills — replaces the bullet list with two animated
              status badges. Pulsing green dot on the first; rotating
              refresh icon on the second. Each pill has a shimmer light
              passing across the background every 5s. */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="relative inline-flex items-center gap-2 rounded-pill bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 overflow-hidden transition-colors">
              <span className="relative flex h-2 w-2">
                <span
                  aria-hidden
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-70"
                />
                <span
                  aria-hidden
                  className="relative inline-flex h-2 w-2 rounded-full bg-green-500"
                />
              </span>
              <Users className="h-3.5 w-3.5 text-green-300" aria-hidden />
              <span className="relative z-10">{t('footer.trustPill.contributions')}</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer"
              />
            </span>

            <span className="relative inline-flex items-center gap-2 rounded-pill bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 overflow-hidden transition-colors">
              <RefreshCw className="h-3.5 w-3.5 text-sky-300 animate-spin [animation-duration:6s]" aria-hidden />
              <span className="relative z-10">{t('footer.trustPill.realtime')}</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer"
              />
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{t('footer.section.navigation')}</h3>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass(active)} aria-current={active ? 'page' : undefined}>
                    ▸ {t(l.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{t('footer.section.legal')}</h3>
          <ul className="space-y-2 text-sm">
            {POLICY_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass(active)} aria-current={active ? 'page' : undefined}>
                    ▸ {t(l.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{t('footer.section.contact')}</h3>
          <a
            href="mailto:support@hadar.ma"
            className="group inline-flex items-center gap-2 rounded-pill bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-all"
          >
            <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden />
            support@hadar.ma
          </a>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/60">
            {t('footer.followUs')}
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {SOCIALS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/40 text-white/80 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>

          {/* App download — store badges restyled with the brand
              charter: translucent navy/blue gradient over a glassy
              backdrop blur, brand-blue ring + soft glow on hover.
              Standard two-line layout: small caption on top + bold
              store name underneath, with the platform logo on the
              start side. Hrefs are # placeholders until the apps
              are published. */}
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/60">
            {t('footer.app.title')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="#"
              aria-label={`${t('footer.app.ios.line1')} ${t('footer.app.ios.line2')}`}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-md border border-white/20 hover:border-brand-sky/60 hover:bg-white/15 px-3 py-2 text-white shadow-glow-soft hover:shadow-glow-blue transition-all duration-300 ease-out hover:-translate-y-0.5 overflow-hidden"
            >
              <Apple className="h-6 w-6 fill-white shrink-0 group-hover:scale-110 transition-transform duration-300" aria-hidden />
              <span className="flex flex-col leading-tight text-start">
                <span className="text-[9px] uppercase tracking-wide text-white/70">
                  {t('footer.app.ios.line1')}
                </span>
                <span className="text-sm font-semibold">{t('footer.app.ios.line2')}</span>
              </span>
              {/* Diagonal shimmer wipe on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-xl"
              />
            </a>
            <a
              href="#"
              aria-label={`${t('footer.app.android.line1')} ${t('footer.app.android.line2')}`}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-md border border-white/20 hover:border-brand-sky/60 hover:bg-white/15 px-3 py-2 text-white shadow-glow-soft hover:shadow-glow-blue transition-all duration-300 ease-out hover:-translate-y-0.5 overflow-hidden"
            >
              <Play
                className="h-6 w-6 fill-white shrink-0 rtl:-scale-x-100 group-hover:scale-110 transition-transform duration-300"
                aria-hidden
              />
              <span className="flex flex-col leading-tight text-start">
                <span className="text-[9px] uppercase tracking-wide text-white/70">
                  {t('footer.app.android.line1')}
                </span>
                <span className="text-sm font-semibold">{t('footer.app.android.line2')}</span>
              </span>
              {/* Diagonal shimmer wipe on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-xl"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Mail, Users, RefreshCw } from 'lucide-react';
import { Logo } from './Logo';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XIcon,
  TikTokIcon,
} from './SocialIcons';

const LEGAL_LINKS = [
  { href: '/qui-sommes-nous', label: 'Qui sommes-nous ?' },
  { href: '/comment-ca-marche', label: 'Comment ça marche' },
  { href: '/statistiques', label: 'Statistiques' },
  { href: '/faq', label: 'FAQ' },
];

const POLICY_LINKS = [
  { href: '/conditions-generales', label: "Conditions générales d'utilisation" },
  { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
  { href: '/donnees-personnelles-cookies', label: 'Données personnelles & cookies' },
  { href: '/regles-publication', label: 'Règles de publication' },
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
  return (
    <footer className="mt-10 bg-brand-navy text-white">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="white" size="md" />
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            Plateforme de vérification des contacts. Prenez des décisions éclairées avant toute
            transaction.
          </p>
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
              <span className="relative z-10">Données issues des contributions utilisateurs</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer"
              />
            </span>

            <span className="relative inline-flex items-center gap-2 rounded-pill bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 overflow-hidden transition-colors">
              <RefreshCw className="h-3.5 w-3.5 text-sky-300 animate-spin [animation-duration:6s]" aria-hidden />
              <span className="relative z-10">Mise à jour en temps réel</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer"
              />
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  ▸ {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Informations légales</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {POLICY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  ▸ {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Contactez-nous</h3>
          <a
            href="mailto:support@hadar.ma"
            className="group inline-flex items-center gap-2 rounded-pill bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-all"
          >
            <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden />
            support@hadar.ma
          </a>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/60">
            Suivez-nous
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
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} HADAR — Tous droits réservés.
      </div>
    </footer>
  );
}

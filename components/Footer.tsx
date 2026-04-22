import Link from 'next/link';
import { Mail } from 'lucide-react';
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

const SOCIALS = [
  { Icon: LinkedInIcon, label: 'LinkedIn' },
  { Icon: FacebookIcon, label: 'Facebook' },
  { Icon: InstagramIcon, label: 'Instagram' },
  { Icon: TikTokIcon, label: 'TikTok' },
  { Icon: XIcon, label: 'X' },
  { Icon: YouTubeIcon, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="white" size="md" />
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            Plateforme de vérification des contacts. Prenez des décisions éclairées avant toute
            transaction.
          </p>
          <ul className="mt-4 space-y-1 text-xs text-white/70">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Données issues des contributions utilisateurs
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />
              Mise à jour en temps réel
            </li>
          </ul>
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
            className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden /> support@hadar.ma
          </a>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/60">
            Suivez-nous
          </p>
          <div className="mt-2 flex gap-2">
            {SOCIALS.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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

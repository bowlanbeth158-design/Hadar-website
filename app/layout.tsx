import type { Metadata, Viewport } from 'next';
import { Poppins, Cairo } from 'next/font/google';
import './globals.css';
import { PublicMaintenanceGate } from '@/components/PublicMaintenanceGate';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hadar.ma'),
  title: {
    default: 'Hadar — Restez vigilant avant toute transaction',
    template: '%s · Hadar',
  },
  description:
    "Plateforme marocaine de prévention des fraudes. Vérifiez un numéro, un email, un site web ou un moyen de paiement avant toute transaction.",
  applicationName: 'Hadar',
  authors: [{ name: 'Hadar' }],
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://hadar.ma',
    siteName: 'Hadar',
    title: 'Hadar — Restez vigilant avant toute transaction',
    description:
      "Plateforme marocaine de prévention des fraudes. Vérifiez avant d'acheter ou de payer.",
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#00327D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${poppins.variable} ${cairo.variable} overflow-x-clip scroll-smooth`}>
      <body className="relative min-h-screen antialiased font-sans bg-gradient-to-b from-brand-sky/60 via-white to-white isolate overflow-x-clip">
        {/* Decorative brand blurs — symmetric soft tints anchored to the
            viewport so every page shares the same atmospheric backdrop. */}
        <div
          aria-hidden
          className="pointer-events-none fixed -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl -z-10"
        />

        <PublicMaintenanceGate>{children}</PublicMaintenanceGate>
      </body>
    </html>
  );
}

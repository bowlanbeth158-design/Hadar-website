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
    default: 'Hadar.ma — Restez vigilant avant toute transaction',
    template: '%s · Hadar.ma',
  },
  description:
    "Plateforme marocaine de prévention des fraudes. Vérifiez un numéro, un email, un site web ou un moyen de paiement avant toute transaction.",
  applicationName: 'Hadar.ma',
  authors: [{ name: 'Hadar.ma' }],
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://hadar.ma',
    siteName: 'Hadar.ma',
    title: 'Hadar.ma — Restez vigilant avant toute transaction',
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
    <html lang="fr" dir="ltr" className={`${poppins.variable} ${cairo.variable}`}>
      <body className="min-h-screen antialiased bg-page-gradient font-sans">
        <PublicMaintenanceGate>{children}</PublicMaintenanceGate>
      </body>
    </html>
  );
}

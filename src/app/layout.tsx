import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

export const metadata: Metadata = {
  title: 'Villa Regia — Immobilier d’Exception & Villas de Luxe Sfax',
  description: 'Maison de sélection immobilière et d’hospitalité de prestige basée à Sfax, Tunisie. Vente de villas de maître, résidences de standing, villas avec piscine et espaces événementiels.',
  keywords: ['Immobilier Sfax', 'Villa de luxe Sfax', 'Soukra Sfax', 'Thyna Sfax', 'Vente villa Sfax', 'Location villa Tunisie', 'Villa Regia'],
  openGraph: {
    title: 'Villa Regia — Demeures & Séjours d’Exception',
    description: 'Des lieux qui méritent d’être vécus. Sélection exclusive de villas et résidences à Sfax, Tunisie.',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-brand-navy text-brand-travertine antialiased selection:bg-brand-gold/30">
        <AuthProvider>
          <LanguageProvider>
            <FavoritesProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
            </FavoritesProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

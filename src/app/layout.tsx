import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.villaregiarealestates.com'),
  title: 'Villa Regia — Immobilier d’Exception & Villas de Luxe Sfax',
  description: 'Maison de sélection immobilière et d’hospitalité de prestige basée à Sfax, Tunisie. Vente de villas de maître, résidences de standing, villas avec piscine et espaces événementiels.',
  keywords: ['Immobilier Sfax', 'Villa de luxe Sfax', 'Soukra Sfax', 'Thyna Sfax', 'Vente villa Sfax', 'Location villa Tunisie', 'Villa Regia'],
  openGraph: {
    title: 'Villa Regia — Demeures & Séjours d’Exception',
    description: 'Des lieux qui méritent d’être vécus. Sélection exclusive de villas et résidences à Sfax, Tunisie.',
    url: 'https://www.villaregiarealestates.com',
    siteName: 'Villa Regia Real Estates',
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.villaregiarealestates.com',
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
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="bg-[#FAF8F3] text-[#132339] antialiased selection:bg-[#B15A3C]/20">
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

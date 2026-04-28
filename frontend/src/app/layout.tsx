import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AniStream — Watch Anime Online Free',
  description: 'Stream the latest trending and popular anime for free. Sub & dub available. No ads. Just anime.',
  keywords: 'anime streaming, watch anime online, free anime, sub dub',
  openGraph: {
    title: 'AniStream — Watch Anime Online Free',
    description: 'Stream trending anime online. Sub & dub available.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import AdManager from "@/components/AdManager";
import SpotlightEffect from "@/components/SpotlightEffect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://filmhub-three.vercel.app'),
  title: {
    default: "FilmHub | Discover Movies & Curate Your Watchlist",
    template: "%s | FilmHub",
  },
  description: "Discover the latest movies, trending releases, Korean dramas, and curate your personal watchlist with FilmHub. The premium platform for film enthusiasts.",
  applicationName: 'FilmHub', // මෙය එකතු කරන්න
  appleWebApp: {
    title: 'FilmHub', // iPhone වලට පෙනෙන නම
  },
  keywords: ["movies", "streaming", "Trending Movies","Movie Database","films", "watchlist", "cinema", "trailers", "korean dramas", "tv shows", "entertainment", "sri lanka movie site", "sinhala subtitles", "english subtitles", "4k movies","FilmHub"],
  authors: [{ name: "FilmHub Team" }],
  creator: "FilmHub Team",
  publisher: "FilmHub",
  verification: {
    google: 'yDcvVieLMruCu2Lkyzb_ljFQFFzbMs86oh0h8GhwRzw',
  },
  openGraph: {
    title: "FilmHub | Watch Movies & TV Shows",
    description: "Your ultimate destination for movies, TV shows, and entertainment. Create your watchlist today.",
    url: 'https://filmhub-three.vercel.app',
    siteName: 'FilmHub',
    images: [
      {
        url: '/og-image.jpg', // Ensure you have this image in public folder or remove
        width: 1200,
        height: 630,
        alt: 'FilmHub Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmHub | Your Ultimate Cinematic Experience',
    description: 'Discover the latest movies and TV shows on FilmHub.',
    creator: '@filmhub', // Replace with actual handle if available
    images: ['/twitter-image.jpg'], // Ensure you have this image in public folder or remove
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} antialiased`}
        suppressHydrationWarning
      >
        <AdManager />
        <SpotlightEffect />
        <NextTopLoader 
          color="#E50914"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #E50914,0 0 5px #E50914"
          zIndex={9999}
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

import { Geist, Geist_Mono, Inter, Outfit, Noto_Sans_Sinhala } from "next/font/google"; // Updated imports
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import AdManager from "@/components/AdManager";
import SpotlightEffect from "@/components/SpotlightEffect";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

// Added Noto Sans Sinhala configuration
const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://filmhub-three.vercel.app'),
  title: {
    default: "FilmHub | Watch Movies with Sinhala Subtitles",
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
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${notoSinhala.variable} antialiased`}
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
        <GoogleAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

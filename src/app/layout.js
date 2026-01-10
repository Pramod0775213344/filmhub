import { Geist, Geist_Mono, Inter, Outfit, Noto_Sans_Sinhala } from "next/font/google"; // Updated imports
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";
import AdManager from "@/components/AdManager";
import SpotlightEffect from "@/components/SpotlightEffect";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PremiumBackground from "@/components/PremiumBackground";


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
    default: "SubHub SL - Sinhala Subtitles for Movies & TV Series",
    template: "%s | SubHub SL",
  },
  description: "Download the latest Sinhala subtitles for movies and TV series from SubHub SL. The best place for Sinhala sub fans.",
  applicationName: 'SubHub SL', // මෙය එකතු කරන්න
  appleWebApp: {
    title: 'SubHub SL', // iPhone වලට පෙනෙන නම
  },
  keywords: ["movies", "streaming", "Trending Movies","Movie Database","films", "watchlist", "cinema", "trailers", "korean dramas", "tv shows", "entertainment", "sri lanka movie site", "sinhala subtitles", "english subtitles", "4k movies","SubHub SL"],
  authors: [{ name: "SubHub SL Team" }],
  creator: "SubHub SL Team",
  publisher: "SubHub SL",
  verification: {
    google: 'yDcvVieLMruCu2Lkyzb_ljFQFFzbMs86oh0h8GhwRzw',
  },
  openGraph: {
    title: "SubHub SL | Watch Movies & TV Shows",
    description: "Your ultimate destination for movies, TV shows, and entertainment. Create your watchlist today.",
    url: 'https://filmhub-three.vercel.app',
    siteName: 'SubHub SL',
    images: [
      {
        url: '/og-image.jpg', // Ensure you have this image in public folder or remove
        width: 1200,
        height: 630,
        alt: 'SubHub SL Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubHub SL | Your Ultimate Cinematic Experience',
    description: 'Discover the latest movies and TV shows on SubHub SL.',
    creator: '@subhubsl', // Replace with actual handle if available
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
        style={{ backgroundColor: '#050505' }}
      >
        <AdManager />
        <PremiumBackground />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SubHub SL",
              "url": "https://filmhub-three.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://filmhub-three.vercel.app/movies?s={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
               "@context": "https://schema.org",
               "@type": "Organization",
               "name": "SubHub SL",
               "url": "https://filmhub-three.vercel.app",
               "logo": "https://filmhub-three.vercel.app/logo.png",
               "sameAs": [
                 "https://facebook.com/subhubsl",
                 "https://twitter.com/subhubsl"
               ]
             })
          }}
        />
      </body>
    </html>
  );
}

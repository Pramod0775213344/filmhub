import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";

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
  title: "FilmHub | Your Ultimate Cinematic Experience",
  description: "Discover the latest movies, trending releases, and curate your personal watchlist with FilmHub. The premium platform for film enthusiasts.",
  keywords: ["movies", "streaming", "films", "watchlist", "cinema", "trailers"],
  authors: [{ name: "FilmHub Team" }],
  verification: {
    google: 'yDcvVieLMruCu2Lkyzb_ljFQFFzbMs86oh0h8GhwRzw',
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
        <Script
        id="adsterra-social-bar"
          strategy="afterInteractive"
          src="https://pl28402819.effectivegatecpm.com/36/34/3c/36343c27af3a082c6657e27a6566cde1.js" 
          />
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

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FilmHub | Your Ultimate Cinematic Experience",
  description: "Discover the latest movies, trending releases, and curate your personal watchlist with FilmHub. The premium platform for film enthusiasts.",
  keywords: ["movies", "streaming", "films", "watchlist", "cinema", "trailers"],
  authors: [{ name: "FilmHub Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader 
          color="#E50914"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #E50914,0 0 5px #E50914"
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

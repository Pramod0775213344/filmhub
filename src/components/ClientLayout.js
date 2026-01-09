"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import dynamic from 'next/dynamic';
const Chatbot = dynamic(() => import("./Chatbot"), { ssr: false });
const ScrollToTop = dynamic(() => import("./ScrollToTop"), { ssr: false });

import MiniHero from "@/components/MiniHero";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Routes where Navbar and Footer should NOT be shown
  const hideLayout = pathname === "/login" || 
                     pathname === "/register" || 
                     pathname.startsWith("/admin");

  return (
    <>

      {!pathname.startsWith("/admin") && <SmoothScroll />}
      {!hideLayout && <Navbar />}
      <Suspense fallback={null}>
        <MiniHero />
      </Suspense>
      {children}
      {!hideLayout && <ScrollToTop />}
      {!hideLayout && <Chatbot />}
      {!hideLayout && <Footer />}
    </>
  );
}

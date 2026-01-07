"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Chatbot from "@/components/Chatbot";
import ScrollToTop from "@/components/ScrollToTop";
import NavigationLoading from "@/components/NavigationLoading";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Routes where Navbar and Footer should NOT be shown
  const hideLayout = pathname === "/login" || 
                     pathname === "/register" || 
                     pathname.startsWith("/admin");

  return (
    <>
      <Suspense fallback={null}>
        <NavigationLoading />
      </Suspense>
      {!pathname.startsWith("/admin") && <SmoothScroll />}
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <ScrollToTop />}
      {!hideLayout && <Chatbot />}
      {!hideLayout && <Footer />}
    </>
  );
}

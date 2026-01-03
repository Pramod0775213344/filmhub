"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Chatbot from "@/components/Chatbot";

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
      {children}
      {!hideLayout && <Chatbot />}
      {!hideLayout && <Footer />}
    </>
  );
}

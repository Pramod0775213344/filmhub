"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Routes where Navbar and Footer should NOT be shown
  const hideLayout = pathname === "/login" || 
                     pathname === "/register" || 
                     pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}

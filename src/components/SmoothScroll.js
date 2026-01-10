"use client";

import { useEffect } from "react";
// import Lenis from "lenis"; 
import { useAdaptive } from "@/context/AdaptiveContext";

export default function SmoothScroll() {
  const { isMobile, isHydrated } = useAdaptive();

  useEffect(() => {
    // Lenis Disabled: Causing critical flickering issues on user's device (Windows).
    // Reverting to native CSS smooth scrolling for stability.
    return;
  }, []);

  return null;
}

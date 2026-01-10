"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useAdaptive } from "@/context/AdaptiveContext";

export default function SmoothScroll() {
  const { isMobile, isHydrated } = useAdaptive();

  useEffect(() => {
    // Check for hydration and mobile status
    if (!isHydrated || isMobile) {
      return;
    }

    // Double check for touch devices or low performance/save data
    if (window.matchMedia("(pointer: coarse)").matches) {
       return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', () => {
      document.body.classList.add('is-scrolling');
    });

    lenis.on('scrollEnd', () => {
      document.body.classList.remove('is-scrolling');
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isMobile, isHydrated]);

  return null;
}

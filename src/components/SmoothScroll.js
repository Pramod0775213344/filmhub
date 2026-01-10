"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useAdaptive } from "@/context/AdaptiveContext";

export default function SmoothScroll() {
  const { isMobile, isHydrated } = useAdaptive();

  useEffect(() => {
    // Mobile/Touch/Native Scroll Handling
    if (!isHydrated || isMobile || window.matchMedia("(pointer: coarse)").matches) {
      let scrollTimer;
      const handleNativeScroll = () => {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          document.body.classList.remove('is-scrolling');
        }, 150); // Debounce remove
      };

      window.addEventListener('scroll', handleNativeScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleNativeScroll);
        clearTimeout(scrollTimer);
      };
    }

    // Lenis Smooth Scroll (Desktop)
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
      document.body.classList.remove('is-scrolling');
    };
  }, [isMobile, isHydrated]);

  return null;
}

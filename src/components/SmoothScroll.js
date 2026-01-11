"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useAdaptive } from "@/context/AdaptiveContext";

/**
 * Premium Smooth Scroll using Lenis
 * Optimized settings to prevent flickering on Windows/Chrome
 * Similar smoothness to w3campus.lk
 */
export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const { isMobile } = useAdaptive();

  useEffect(() => {
    // Don't use smooth scroll on mobile for better performance
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 1.2, // Smooth duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8, // Reduced for smoother feel
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // Animation loop with RAF
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    // Handle anchor links smoothly
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -100 });
        }
      });
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isMobile]);

  return null;
}

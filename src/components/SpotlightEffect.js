"use client";

import { useEffect, useRef } from "react";

export default function SpotlightEffect() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    // Performance optimization: Disable completely on mobile/touch devices
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) return;

    let frameId;

    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        // Use standard properties for better performance
        spotlightRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        spotlightRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    const onMove = (e) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => handleMouseMove(e));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      ref={spotlightRef}
      className="fixed inset-0 pointer-events-none z-0 hidden md:block"
      style={{
        background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(229, 9, 20, 0.08), transparent 40%)`,
        willChange: "background" // Hint for browser optimization
      }}
    />
  );
}


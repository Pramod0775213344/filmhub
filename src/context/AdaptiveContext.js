"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AdaptiveContext = createContext({
  isMobile: false,
  isTablet: false,
  isLowPower: false,
  isHydrated: false
});

export function AdaptiveProvider({ children }) {
  const [state, setState] = useState({
    isMobile: false,
    isTablet: false,
    isLowPower: false,
    isHydrated: false
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      
      const isLowPower = 'connection' in navigator && 
        (navigator.connection.saveData || navigator.connection.effectiveType === '2g');

      setState({ isMobile, isTablet, isLowPower, isHydrated: true });
    };

    // Use setTimeout to ensure hydration completes before state updates
    const timer = setTimeout(update, 0);
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AdaptiveContext.Provider value={state}>
      {children}
    </AdaptiveContext.Provider>
  );
}

export const useAdaptive = () => useContext(AdaptiveContext);

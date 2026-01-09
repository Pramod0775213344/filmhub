"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AdaptiveContext = createContext({
  isMobile: false,
  isTablet: false,
  isLowPower: false
});

export function AdaptiveProvider({ children }) {
  const [state, setState] = useState({
    isMobile: false,
    isTablet: false,
    isLowPower: false
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      
      // Basic low power detection (optional)
      const isLowPower = 'connection' in navigator && 
        (navigator.connection.saveData || navigator.connection.effectiveType === '2g');

      setState({ isMobile, isTablet, isLowPower });
    };

    update();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AdaptiveContext.Provider value={state}>
      {children}
    </AdaptiveContext.Provider>
  );
}

export const useAdaptive = () => useContext(AdaptiveContext);

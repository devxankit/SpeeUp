import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const activeRequests = useRef(0);
  const MINIMUM_LOADING_TIME = 1000; // 1 second

  const safetyTimer = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    activeRequests.current += 1;
    console.log(`[LoadingContext] startLoading: activeRequests = ${activeRequests.current}`);

    if (activeRequests.current === 1) {
      loadingStartTime.current = Date.now();
      setIsLoading(true);

      // Set safety timer to prevent stuck loader
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => {
        if (activeRequests.current > 0) {
          console.warn('[LoadingContext] Safety timeout reached. Forcing loader to hide.');
          activeRequests.current = 0;
          setIsLoading(false);
          loadingStartTime.current = null;
        }
      }, 15000); // 15 seconds safety timeout
    }
  }, []);

  const stopLoading = useCallback(() => {
    const prevCount = activeRequests.current;
    activeRequests.current = Math.max(0, activeRequests.current - 1);
    console.log(`[LoadingContext] stopLoading: activeRequests ${prevCount} -> ${activeRequests.current}`);

    if (activeRequests.current === 0) {
      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }

      const now = Date.now();
      const startTime = loadingStartTime.current || now;
      const elapsed = now - startTime;
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsed);

      console.log(`[LoadingContext] All requests finished. Elapsed: ${elapsed}ms. Remaining: ${remainingTime}ms.`);

      setTimeout(() => {
        if (activeRequests.current === 0) {
          console.log(`[LoadingContext] Setting isLoading to false`);
          setIsLoading(false);
          loadingStartTime.current = null;
        } else {
          console.log(`[LoadingContext] Not setting isLoading to false because new requests started: ${activeRequests.current}`);
        }
      }, remainingTime);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

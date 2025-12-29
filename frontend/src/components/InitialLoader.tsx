import { useEffect, useState, useRef } from 'react';

/**
 * Initial loader screen that prevents page blinking/flash
 * Always shows for minimum 300ms even if content loads earlier
 */
export default function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const minDisplayTime = 300; // Minimum 300ms display time

  useEffect(() => {
    // Record when component mounted
    startTimeRef.current = Date.now();

    // Wait for DOM to be ready and React to mount
    const hideLoader = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      // Wait for remaining minimum time, then fade out
      setTimeout(() => {
        setIsFading(true);
        // Wait for fade animation, then remove from DOM
        setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, remainingTime);
    };

    // Check if app has mounted
    if (document.readyState === 'complete') {
      // DOM is already loaded, but still wait minimum time
      setTimeout(hideLoader, 0);
    } else {
      // Wait for DOM to load, then ensure minimum display time
      window.addEventListener('load', () => {
        setTimeout(hideLoader, 0);
      });
    }

    // Fallback: hide after max 2 seconds (but still respect minimum)
    const fallback = setTimeout(hideLoader, 2000);

    return () => {
      clearTimeout(fallback);
      window.removeEventListener('load', hideLoader);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-300 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        pointerEvents: isVisible && !isFading ? 'auto' : 'none',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo or Brand Name */}
        <div className="text-2xl font-bold text-green-600 mb-2">
          SpeeUP
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-neutral-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}


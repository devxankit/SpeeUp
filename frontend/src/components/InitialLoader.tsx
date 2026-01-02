import { useEffect, useState, useRef } from 'react';

/**
 * Initial loader screen that prevents page blinking/flash during initial mount.
 *
 * Timing Specifications:
 * 1. Minimum duration: 1000ms (1 second) to ensure brand visibility and smooth transition.
 * 2. Maximum duration: 2000ms (2 seconds) as a fallback to prevent blocking the user.
 * 3. Smooth fade-out transition: 300ms.
 */
export default function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Timing constants
  const MIN_DISPLAY_TIME = 1000; // 1 second minimum
  const MAX_DISPLAY_TIME = 2000; // 2 seconds maximum fallback
  const FADE_DURATION = 300;     // 300ms fade animation

  useEffect(() => {
    // Record the exact time when the loader was mounted
    startTimeRef.current = Date.now();
    let hasHidden = false;

    /**
     * Precisely controls the disappearance of the loader.
     * Ensures it stays within the [MIN_DISPLAY_TIME, MAX_DISPLAY_TIME] range.
     */
    const hideLoader = () => {
      if (hasHidden) return;
      hasHidden = true;

      const elapsed = Date.now() - startTimeRef.current;
      // Ensure we stay at least MIN_DISPLAY_TIME but don't exceed MAX_DISPLAY_TIME
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);

      // Stage 1: Wait for the remaining minimum time
      setTimeout(() => {
        // Stage 2: Start fade-out transition
        setIsFading(true);

        // Stage 3: Wait for fade animation to complete, then remove from DOM
        setTimeout(() => {
          setIsVisible(false);
        }, FADE_DURATION);
      }, remainingTime);
    };

    // Scenario 2: Fallback / Error Handling
    // Guarantees loader disappears after MAX_DISPLAY_TIME even if load event fails
    const fallbackTimeout = setTimeout(() => {
      if (!hasHidden) {
        console.log('[InitialLoader] Maximum display time reached (fallback).');
        hideLoader();
      }
    }, MAX_DISPLAY_TIME);

    // Scenario 1: Page finishes loading normally
    const handleLoad = () => hideLoader();

    if (document.readyState === 'complete') {
      // If already complete, still initiate hideLoader to respect MIN_DISPLAY_TIME
      hideLoader();
    } else {
      // Wait for the window load event
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(fallbackTimeout);
      window.removeEventListener('load', handleLoad);
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


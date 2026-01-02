import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const useRouteLoader = () => {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip loader on initial mount as it's handled by InitialLoader
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Start loader on route change
    startLoading();

    // Stop loader after route has "changed"
    // The stopLoading function handles the 1s minimum logic
    stopLoading();
  }, [location.pathname, startLoading, stopLoading]);
};

export default useRouteLoader;

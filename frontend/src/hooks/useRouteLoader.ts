import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const useRouteLoader = () => {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    // Start loader on route change
    startLoading();
    
    // Stop loader after route has "changed"
    // The stopLoading function handles the 1s minimum logic
    stopLoading();
  }, [location.pathname, startLoading, stopLoading]);
};

export default useRouteLoader;

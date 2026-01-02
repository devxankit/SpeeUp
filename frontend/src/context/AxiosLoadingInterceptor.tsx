import React, { useEffect } from 'react';
import api from '../services/api/config';
import { useLoading } from './LoadingContext';

export const AxiosLoadingInterceptor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Skip loader for specific requests if needed
        if (!(config as any).skipLoader) {
          startLoading();
        }
        return config;
      },
      (error) => {
        stopLoading();
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        stopLoading();
        return response;
      },
      (error) => {
        stopLoading();
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [startLoading, stopLoading]);

  return <>{children}</>;
};

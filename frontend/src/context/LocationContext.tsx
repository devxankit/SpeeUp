import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api/config';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface LocationContextType {
  location: Location | null;
  isLocationEnabled: boolean;
  isLocationLoading: boolean;
  locationError: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  requestLocation: () => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  clearLocation: () => void;
  checkPermissionStatus: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Geocoding result interface
interface GeocodeResult {
  formatted_address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Cache for geocoding results to avoid redundant API calls
const geocodeCache = new Map<string, { data: GeocodeResult; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate cache key from coordinates
const getCacheKey = (lat: number, lng: number, precision: number = 4): string => {
  return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
};

// Clean address by removing Plus Codes and unwanted identifiers
const cleanAddress = (address: string): string => {
  if (!address) return address;
  
  // Remove Plus Codes more comprehensively:
  // 1. Match Plus Code at start (with optional trailing delimiters)
  // 2. Match Plus Code at end (with optional leading delimiters)
  // 3. Match Plus Code in middle (with surrounding delimiters)
  // 4. Match standalone Plus Code (with optional surrounding spaces)
  
  const cleaned = address
    // Remove Plus Code at start (with or without trailing delimiters)
    .replace(/^[A-Z0-9]{2,4}\+[A-Z0-9]{2,4}([,\s]+)?/i, '')
    // Remove Plus Code at end (with or without leading delimiters)
    .replace(/([,\s]+)?[A-Z0-9]{2,4}\+[A-Z0-9]{2,4}$/i, '')
    // Remove Plus Code in middle (with surrounding delimiters - most common case)
    .replace(/([,\s]+)[A-Z0-9]{2,4}\+[A-Z0-9]{2,4}([,\s]+)/gi, (_match, before, after) => {
      // Preserve one delimiter (prefer comma if available)
      return before.includes(',') || after.includes(',') ? ', ' : ' ';
    })
    // Remove standalone Plus Code with spaces (fallback for any remaining)
    .replace(/\s+[A-Z0-9]{2,4}\+[A-Z0-9]{2,4}\s+/gi, ' ')
    // Remove any remaining Plus Codes that might be attached to words (no spaces)
    .replace(/\b[A-Z0-9]{2,4}\+[A-Z0-9]{2,4}\b/gi, '')
    // Clean up multiple commas/spaces
    .replace(/,\s*,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '') // Remove leading/trailing commas and spaces
    .trim();
  
  return cleaned;
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  
  // Refs for request cancellation and preventing race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef(false);
  const requestLocationRef = useRef<(() => Promise<void>) | null>(null);

  // Check permission and load location on mount - Always check permission first
  useEffect(() => {
    const initializeLocation = async () => {
      setIsLocationLoading(true);
      
      // STEP 1: Check permission status first
      let currentPermissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported' = 'prompt';
      
      if (!navigator.geolocation) {
        currentPermissionStatus = 'unsupported';
        setPermissionStatus('unsupported');
        setLocation(null);
        setIsLocationEnabled(false);
        setIsLocationLoading(false);
        return;
      }

      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          currentPermissionStatus = permissionStatus.state;
          setPermissionStatus(permissionStatus.state);
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            const newStatus = permissionStatus.state;
            setPermissionStatus(newStatus);
            // If permission is now granted, get fresh location
            if (newStatus === 'granted' && requestLocationRef.current) {
              requestLocationRef.current().catch(() => {
                // Error handled by requestLocation
              });
            } else if (newStatus === 'denied') {
              // Clear location if permission denied
              setLocation(null);
              setIsLocationEnabled(false);
              localStorage.removeItem('userLocation');
            }
          };
        } catch (error) {
          // Permission API not supported, assume prompt
          currentPermissionStatus = 'prompt';
          setPermissionStatus('prompt');
        }
      } else {
        // Fallback for browsers without Permissions API
        currentPermissionStatus = 'prompt';
        setPermissionStatus('prompt');
      }

      // STEP 2: Handle based on permission status
      if (currentPermissionStatus === 'granted') {
        // Permission granted - Always get fresh location (don't use cache)
        // Wait for requestLocation to be available
        if (requestLocationRef.current) {
          try {
            await requestLocationRef.current();
            // requestLocation will set location and isLocationEnabled
          } catch (error) {
            // If fresh location fails, don't use cache - let user retry
            setLocation(null);
            setIsLocationEnabled(false);
            setIsLocationLoading(false);
          }
        } else {
          // requestLocation not ready yet, wait a bit
          setTimeout(() => {
            if (requestLocationRef.current) {
              requestLocationRef.current().catch(() => {
                setLocation(null);
                setIsLocationEnabled(false);
                setIsLocationLoading(false);
              });
            } else {
              setLocation(null);
              setIsLocationEnabled(false);
              setIsLocationLoading(false);
            }
          }, 100);
        }
      } else if (currentPermissionStatus === 'denied') {
        // Permission denied - Don't use cache, show modal
        setLocation(null);
        setIsLocationEnabled(false);
        localStorage.removeItem('userLocation'); // Clear cache when denied
        setIsLocationLoading(false);
      } else {
        // Permission prompt or unsupported - Check cache as fallback, but still request fresh
        const saved = localStorage.getItem('userLocation');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.latitude && parsed.longitude) {
              // Temporarily show cached location while requesting fresh
              setLocation(parsed);
              setIsLocationEnabled(true);
              setIsLocationLoading(false);
              
              // Try to get fresh location in background when requestLocation is ready
              setTimeout(() => {
                if (requestLocationRef.current) {
                  requestLocationRef.current().catch(() => {
                    // If fresh location fails, keep cached location
                  });
                }
              }, 100);
              return;
            }
          } catch (e) {
            localStorage.removeItem('userLocation');
          }
        }
        
        // No cache available
        setLocation(null);
        setIsLocationEnabled(false);
        setIsLocationLoading(false);
      }
    };

    initializeLocation();
  }, [isAuthenticated, user]);

  // Request user's current location - OPTIMIZED with retry logic and fallback strategies
  // Always gets fresh location when GPS is enabled, never uses cache when GPS is off
  const requestLocation = useCallback(async (retryCount = 0): Promise<void> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocationLoading(false);
      return;
    }

    // Prevent concurrent requests
    if (isRequestingRef.current && retryCount === 0) {
      return;
    }

    // Cancel any previous request only on first attempt
    if (retryCount === 0 && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this attempt
    if (retryCount === 0) {
      abortControllerRef.current = new AbortController();
      isRequestingRef.current = true;
      setIsLocationLoading(true);
      setLocationError(null);
    } else {
      // Update error message for retry
      setLocationError(`Getting your location... (Attempt ${retryCount + 1}/3)`);
    }

    return new Promise((resolve, reject) => {
      // Strategy: Try high accuracy first, then fallback to lower accuracy
      const useHighAccuracy = retryCount < 2; // First 2 attempts use high accuracy
      const timeoutDuration = useHighAccuracy ? 20000 : 30000; // 20s for high accuracy, 30s for low accuracy
      
      const geoOptions = {
        enableHighAccuracy: useHighAccuracy,
        timeout: timeoutDuration,
        maximumAge: 0, // Always get fresh location, never use cached position
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Check if request was cancelled
          if (abortControllerRef.current?.signal.aborted) {
            isRequestingRef.current = false;
            return;
          }

          try {
            const { latitude, longitude, accuracy } = position.coords;

            // Validate coordinates
            if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
              throw new Error('Invalid coordinates received');
            }

            // Check accuracy (warn if accuracy is poor but don't fail)
            if (accuracy > 1000) {
              console.warn(`Location accuracy is ${accuracy}m - may not be precise`);
            }

            // Set coordinates immediately for instant UI update
            const tempLocation: Location = {
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, // Temporary
              city: undefined,
              state: undefined,
              pincode: undefined,
            };
            setLocation(tempLocation);
            setIsLocationEnabled(true);
            setIsLocationLoading(false); // Set loading false early
            setLocationError(null); // Clear any retry messages

            // Reverse geocode in background (non-blocking)
            try {
              const address = await reverseGeocode(latitude, longitude, abortControllerRef.current?.signal);
              
              // Check if request was cancelled during geocoding
              if (abortControllerRef.current?.signal.aborted) {
                isRequestingRef.current = false;
                return;
              }

              // Address is already cleaned from reverseGeocode function
              const cleanedAddress = address.formatted_address || `${latitude}, ${longitude}`;

              const newLocation: Location = {
                latitude,
                longitude,
                address: cleanedAddress,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
              };

              setLocation(newLocation);
              localStorage.setItem('userLocation', JSON.stringify(newLocation));

              // Save to backend in background (non-blocking, don't wait)
              if (isAuthenticated && user) {
                saveLocationToBackend(newLocation).catch(err => {
                  console.error('Background location save failed:', err);
                  // Don't fail the request - location is already saved locally
                });
              }

              isRequestingRef.current = false;
              resolve();
            } catch (geocodeError: unknown) {
              // Geocoding failed but we have coordinates - still success
              console.warn('Geocoding failed, using coordinates:', geocodeError);
              const fallbackLocation: Location = {
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              };
              setLocation(fallbackLocation);
              localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
              
              // Try to save to backend anyway
              if (isAuthenticated && user) {
                saveLocationToBackend(fallbackLocation).catch(() => {});
              }

              isRequestingRef.current = false;
              resolve(); // Still resolve - we have coordinates
            }
          } catch (error: unknown) {
            if (!abortControllerRef.current?.signal.aborted) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to get location address';
              setLocationError(errorMessage);
            }
            setIsLocationLoading(false);
            isRequestingRef.current = false;
            reject(error);
          }
        },
        (error) => {
          if (abortControllerRef.current?.signal.aborted) {
            isRequestingRef.current = false;
            return;
          }

          let errorMessage = 'Failed to get your location';
          let shouldRetry = false;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setPermissionStatus('denied');
              errorMessage = 'Location permission denied. Please enable location access in your device settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              // Retry if GPS is unavailable (might be temporary)
              if (retryCount < 2) {
                shouldRetry = true;
                errorMessage = `GPS signal unavailable. Retrying... (${retryCount + 1}/3)`;
              } else {
                errorMessage = 'Location information unavailable. Please check your GPS settings and ensure you are outdoors or near a window.';
              }
              break;
            case error.TIMEOUT:
              // Always retry timeout errors
              if (retryCount < 2) {
                shouldRetry = true;
                errorMessage = `Location request taking longer than expected. Retrying with ${retryCount === 1 ? 'lower accuracy' : 'extended timeout'}... (${retryCount + 1}/3)`;
              } else {
                // On final attempt, only use cache if permission is granted (GPS might just be slow)
                // If permission was denied, don't use cache - user needs to enable GPS
                if (permissionStatus === 'granted') {
                  const cachedLocation = localStorage.getItem('userLocation');
                  if (cachedLocation) {
                    try {
                      const parsed = JSON.parse(cachedLocation);
                      if (parsed.latitude && parsed.longitude) {
                        console.warn('Using cached location due to timeout (permission granted)');
                        setLocation(parsed);
                        setIsLocationEnabled(true);
                        setIsLocationLoading(false);
                        setLocationError('Using previously saved location (GPS timeout)');
                        isRequestingRef.current = false;
                        resolve();
                        return;
                      }
                    } catch (e) {
                      // Ignore cache parse errors
                    }
                  }
                }
                errorMessage = 'Location request timed out. Please ensure GPS is enabled and you have a clear view of the sky, or try again.';
              }
              break;
          }

          if (shouldRetry) {
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * (retryCount + 1), 3000); // 1s, 2s, max 3s
            setTimeout(() => {
              // Retry with updated count
              requestLocation(retryCount + 1)
                .then(() => resolve())
                .catch((retryError) => reject(retryError));
            }, delay);
            return; // Exit early, retry will handle resolve/reject
          }

          setLocationError(errorMessage);
          setIsLocationLoading(false);
          isRequestingRef.current = false;
          reject(new Error(errorMessage));
        },
        geoOptions
      );
    });
  }, [isAuthenticated, user, permissionStatus]);

  // Store requestLocation in ref for use in checkPermissionStatus
  useEffect(() => {
    requestLocationRef.current = requestLocation;
  }, [requestLocation]);

  // Check permission status (called manually or when permission changes)
  const checkPermissionStatus = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      return;
    }

    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        const currentStatus = permissionStatus.state;
        setPermissionStatus(currentStatus);
        
        // Listen for permission changes (when user returns from settings)
        permissionStatus.onchange = () => {
          const newStatus = permissionStatus.state;
          setPermissionStatus(newStatus);
          
          // If permission is now granted, get fresh location (don't use cache)
          if (newStatus === 'granted' && requestLocationRef.current) {
            // Clear any cached location and get fresh
            localStorage.removeItem('userLocation');
            requestLocationRef.current().catch(() => {
              // Error handled by requestLocation
            });
          } else if (newStatus === 'denied') {
            // Clear location if permission denied
            setLocation(null);
            setIsLocationEnabled(false);
            localStorage.removeItem('userLocation');
          }
        };
        
        // If permission is granted but we don't have location, get fresh location
        if (currentStatus === 'granted' && !isLocationEnabled && requestLocationRef.current) {
          // Don't use cache - get fresh location
          localStorage.removeItem('userLocation');
          requestLocationRef.current().catch(() => {
            // Error handled by requestLocation
          });
        }
      } catch (error) {
        // Permission API not supported, fallback to checking via geolocation
        setPermissionStatus('prompt');
      }
    } else {
      // Fallback for browsers without Permissions API
      setPermissionStatus('prompt');
    }
  }, [isLocationEnabled]);

  // Helper function to save location to backend (non-blocking)
  const saveLocationToBackend = async (locationData: Location): Promise<void> => {
    await api.post('/customer/location', {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      pincode: locationData.pincode,
    });
  };

  // Reverse geocode coordinates to address - OPTIMIZED with caching and retry logic
  const reverseGeocode = async (lat: number, lng: number, signal?: AbortSignal): Promise<GeocodeResult> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { formatted_address: `${lat}, ${lng}` };
    }

    // Check cache first (fast path)
    const cacheKey = getCacheKey(lat, lng);
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Retry logic for robustness
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Check if request was cancelled
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      try {
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|route|locality|administrative_area_level_1|postal_code`,
          {
            signal: signal || controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle API errors
        if (data.status === 'ZERO_RESULTS') {
          return { formatted_address: `${lat}, ${lng}` };
        }

        if (data.status !== 'OK') {
          throw new Error(`Geocoding API error: ${data.status}`);
        }

        if (data.results.length === 0) {
          return { formatted_address: `${lat}, ${lng}` };
        }

        const result = data.results[0];
        const addressComponents = result.address_components || [];

        let city = '';
        let state = '';
        let pincode = '';

        // Improved address component parsing
        addressComponents.forEach((component: { types?: string[]; long_name?: string }) => {
          const types = component.types || [];
          if (!city && (types.includes('locality') || types.includes('administrative_area_level_2') || types.includes('sublocality'))) {
            city = component.long_name || '';
          }
          if (!state && types.includes('administrative_area_level_1')) {
            state = component.long_name || '';
          }
          if (!pincode && types.includes('postal_code')) {
            pincode = component.long_name || '';
          }
        });

        // Clean the formatted address to remove Plus Codes
        const rawAddress = result.formatted_address || `${lat}, ${lng}`;
        const cleanedAddress = cleanAddress(rawAddress);

        const geocodeResult = {
          formatted_address: cleanedAddress,
          city,
          state,
          pincode,
        };

        // Cache the result
        geocodeCache.set(cacheKey, {
          data: geocodeResult,
          timestamp: Date.now(),
        });

        // Limit cache size (keep last 100 entries)
        if (geocodeCache.size > 100) {
          const firstKey = geocodeCache.keys().next().value;
          if (firstKey) {
            geocodeCache.delete(firstKey);
          }
        }

        return geocodeResult;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        
        // Don't retry on abort
        if (signal?.aborted || err.name === 'AbortError') {
          throw err;
        }

        // Don't retry on last attempt
        if (attempt < maxRetries) {
          // Exponential backoff: wait 200ms, 400ms
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
          continue;
        }
      }
    }

    // All retries failed
    console.error('Reverse geocoding failed after retries:', lastError);
    return { formatted_address: `${lat}, ${lng}` };
  };

  // Update location manually - OPTIMIZED for instant UI update
  const updateLocation = useCallback(async (newLocation: Location): Promise<void> => {
    // Validate location data
    if (!newLocation.latitude || !newLocation.longitude || 
        isNaN(newLocation.latitude) || isNaN(newLocation.longitude)) {
      throw new Error('Invalid location coordinates');
    }

    // Update UI immediately (instant feedback)
    setLocation(newLocation);
    setIsLocationEnabled(true);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));

    // Cache geocoding result if we have full address
    if (newLocation.address && newLocation.latitude && newLocation.longitude) {
      const cacheKey = getCacheKey(newLocation.latitude, newLocation.longitude);
      geocodeCache.set(cacheKey, {
        data: {
          formatted_address: newLocation.address,
          city: newLocation.city,
          state: newLocation.state,
          pincode: newLocation.pincode,
        },
        timestamp: Date.now(),
      });
    }

    // Save to backend in background (non-blocking)
    if (isAuthenticated && user) {
      saveLocationToBackend(newLocation).catch(err => {
        console.error('Failed to save location to backend:', err);
        // Don't fail - location is already saved locally
      });
    }
  }, [isAuthenticated, user]);

  // Clear location
  const clearLocation = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isRequestingRef.current = false;
    
    setLocation(null);
    setIsLocationEnabled(false);
    localStorage.removeItem('userLocation');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocationEnabled,
        isLocationLoading,
        locationError,
        permissionStatus,
        requestLocation,
        updateLocation,
        clearLocation,
        checkPermissionStatus,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook - Fast Refresh warning is acceptable here as hooks are meant to be exported with providers
// eslint-disable-next-line react-refresh/only-export-components
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}


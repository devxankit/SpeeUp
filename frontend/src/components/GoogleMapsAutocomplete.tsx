import { useCallback, useEffect, useRef, useState } from 'react';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (address: string, lat: number, lng: number, placeName: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

// Google Maps types
interface GoogleMaps {
  maps: {
    places: {
      Autocomplete: new (input: HTMLInputElement, options?: {
        types?: string[];
        componentRestrictions?: { country?: string };
        fields?: string[];
      }) => {
        getPlace: () => {
          formatted_address?: string;
          name?: string;
          geometry?: {
            location?: {
              lat: () => number;
              lng: () => number;
            };
          };
        };
        addListener: (event: string, callback: () => void) => void;
      };
    };
    event?: {
      clearInstanceListeners?: (instance: unknown) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleMaps;
    initGoogleMaps?: () => void;
  }
}

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

export default function GoogleMapsAutocomplete({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
  disabled = false,
  required = false,
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Use ref to store current value to avoid stale closure in event listener
  const valueRef = useRef(value);
  
  // Update ref whenever value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Initialize autocomplete function
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    // Clean up previous instance before creating new one
    if (autocompleteRef.current) {
      window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
    }

    try {
      const Autocomplete = window.google.maps.places.Autocomplete;
      const autocomplete = new Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          setError('No location details found for this place');
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        // Use ref to get current value instead of captured closure value
        const rawAddress = place.formatted_address || place.name || valueRef.current;
        // Clean address to remove Plus Codes
        const address = cleanAddress(rawAddress);
        const placeName = place.name || address;

        onChange(address, lat, lng, placeName);
        setError('');
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to initialize autocomplete: ${errorMessage}`);
    }
  }, [onChange]);

  // Load Google Maps API script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Cleanup function - always register it first to ensure it runs on unmount/dependency change
    const cleanup = () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
    
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return cleanup; // Return cleanup even on early return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      initializeAutocomplete();
      return cleanup; // Return cleanup even on early return
    }

    // Check if script is already being loaded
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkInterval);
          setIsLoaded(true);
          initializeAutocomplete();
        }
      }, 100);
      return () => {
        clearInterval(checkInterval);
        cleanup(); // Call cleanup when interval is cleared
      };
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initializeAutocomplete();
    };
    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return cleanup; // Return cleanup function
  }, [initializeAutocomplete]);

  // Re-initialize when input ref is ready and Google Maps is loaded
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      initializeAutocomplete();
    }
  }, [isLoaded, value, initializeAutocomplete]);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          // Allow manual typing
          onChange(e.target.value, 0, 0, e.target.value);
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-neutral-300 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 bg-white ${className}`}
        disabled={disabled || !isLoaded}
        required={required}
        autoComplete="off"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
      {!isLoaded && !error && (
        <p className="mt-1 text-xs text-neutral-500">Loading location services...</p>
      )}
    </div>
  );
}


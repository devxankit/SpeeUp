import { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

interface LocationPermissionRequestProps {
  onLocationGranted: () => void;
  skipable?: boolean;
  title?: string;
  description?: string;
}

export default function LocationPermissionRequest({
  onLocationGranted,
  skipable = false,
  title = 'Location Access Required',
  description = 'We need your location to show you products available near you and enable delivery services.',
}: LocationPermissionRequestProps) {
  const { requestLocation, updateLocation, isLocationEnabled, isLocationLoading, locationError } = useLocation();
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState(0);
  const [manualLng, setManualLng] = useState(0);

  useEffect(() => {
    if (isLocationEnabled) {
      onLocationGranted();
    }
  }, [isLocationEnabled, onLocationGranted]);

  const handleAllowLocation = async () => {
    try {
      await requestLocation();
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleManualLocationSelect = (address: string, lat: number, lng: number, _placeName: string) => {
    setManualAddress(address);
    setManualLat(lat);
    setManualLng(lng);
    // placeName is available but not stored separately as we use address
  };

  const handleSaveManualLocation = async () => {
    if (!manualAddress || manualLat === 0 || manualLng === 0) {
      return;
    }

    try {
      await updateLocation({
        latitude: manualLat,
        longitude: manualLng,
        address: manualAddress,
      });
      onLocationGranted();
    } catch (error) {
      console.error('Failed to save manual location:', error);
    }
  };

  if (isLocationEnabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">{title}</h2>
          <p className="text-sm text-neutral-600">
            {description}
          </p>
        </div>

        {!showManualInput ? (
          <>
            {locationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{locationError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleAllowLocation}
                disabled={isLocationLoading}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocationLoading ? 'Getting your location...' : 'Allow Location Access'}
              </button>

              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
              >
                Enter Location Manually
              </button>

              {skipable && (
                <button
                  onClick={onLocationGranted}
                  className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Skip for now
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search and select your location
              </label>
              <GoogleMapsAutocomplete
                value={manualAddress}
                onChange={handleManualLocationSelect}
                placeholder="Type your address or location..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowManualInput(false)}
                className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSaveManualLocation}
                disabled={!manualAddress || manualLat === 0}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

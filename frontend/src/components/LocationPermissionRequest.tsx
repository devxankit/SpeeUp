import { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import GoogleMapsAutocomplete from './GoogleMapsAutocomplete';

interface LocationPermissionRequestProps {
  onLocationGranted: () => void;
  skipable?: boolean;
  title?: string;
  description?: string;
}

// Detect if running on mobile device
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
};

// Open device settings (works on mobile browsers)
const openDeviceSettings = (): void => {
  // For iOS Safari
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    alert('Please enable Location Services:\nSettings > Privacy > Location Services > Safari');
    // Try to open settings (iOS 15.4+)
    if (window.location) {
      window.location.href = 'app-settings:';
    }
  }
  // For Android Chrome
  else if (/Android/i.test(navigator.userAgent)) {
    // Android Chrome allows opening location settings via intent
    const intent = 'intent://settings/location#Intent;scheme=android.settings;end';
    window.location.href = intent;
  }
  // Fallback: Show instructions
  else {
    alert('Please enable Location Services in your browser settings:\n\nChrome: Settings > Privacy > Site Settings > Location\nFirefox: Settings > Privacy > Permissions > Location');
  }
};

export default function LocationPermissionRequest({
  onLocationGranted,
  skipable = false,
  title = 'Location Access Required',
  description = 'We need your location to show you products available near you and enable delivery services.',
}: LocationPermissionRequestProps) {
  const { requestLocation, updateLocation, isLocationEnabled, isLocationLoading, locationError, permissionStatus, checkPermissionStatus } = useLocation();
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState(0);
  const [manualLng, setManualLng] = useState(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);
  
  // Re-check permission when component becomes visible (user might have returned from settings)
  useEffect(() => {
    if (!isLocationEnabled && permissionStatus === 'denied') {
      const interval = setInterval(() => {
        checkPermissionStatus();
      }, 1000); // Check every second when permission is denied
      
      return () => clearInterval(interval);
    }
  }, [isLocationEnabled, permissionStatus, checkPermissionStatus]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                <p className="text-sm text-red-600 font-medium">{locationError}</p>
                {permissionStatus === 'denied' && isMobileDevice && (
                  <p className="text-xs text-red-500 mt-2">
                    Turn on Location Services in your device settings to continue.
                  </p>
                )}
              </div>
            )}

            {/* Show different UI based on permission status */}
            {permissionStatus === 'denied' ? (
              <div className="space-y-3">
                {/* Force user to enable location - no skip option */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Enable Location to Continue</p>
                      <p className="text-xs">
                        {isMobileDevice 
                          ? 'Please enable Location Services in your device settings. Tap the button below to open settings.'
                          : 'Please enable Location Services in your browser settings to continue.'}
                      </p>
                    </div>
                  </div>
                </div>

                {isMobileDevice ? (
                  <>
                    <button
                      onClick={openDeviceSettings}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open Device Settings
                    </button>
                    <button
                      onClick={checkPermissionStatus}
                      className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      I've enabled location, check again
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-600 text-center mb-3">
                      To enable location in your browser:
                    </p>
                    <div className="text-xs text-neutral-600 space-y-1 mb-3">
                      <p><strong>Chrome:</strong> Click the lock icon → Site settings → Location → Allow</p>
                      <p><strong>Firefox:</strong> Click the lock icon → More information → Permissions → Location → Allow</p>
                      <p><strong>Safari:</strong> Safari → Preferences → Websites → Location → Allow</p>
                    </div>
                    <button
                      onClick={handleAllowLocation}
                      disabled={isLocationLoading}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLocationLoading ? 'Checking...' : 'Try Again'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleAllowLocation}
                  disabled={isLocationLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLocationLoading ? 'Getting your location...' : 'Allow Location Access'}
                </button>

                {!skipable && (
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="w-full py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Enter Location Manually
                  </button>
                )}

                {skipable && (
                  <>
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="w-full py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      Enter Location Manually
                    </button>
                    <button
                      onClick={onLocationGranted}
                      className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Skip for now
                    </button>
                  </>
                )}
              </div>
            )}
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


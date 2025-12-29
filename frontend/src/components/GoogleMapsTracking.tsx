import { useCallback, useRef, useEffect } from 'react'
// @ts-ignore - @react-google-maps/api types may not be available
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { motion } from 'framer-motion'

interface Location {
    lat: number
    lng: number
}

interface GoogleMapsTrackingProps {
    storeLocation: Location
    customerLocation: Location
    deliveryLocation?: Location
    isTracking: boolean
}

const mapContainerStyle = {
    width: '100%',
    height: '16rem'
}

export default function GoogleMapsTracking({
    storeLocation,
    customerLocation,
    deliveryLocation,
    isTracking
}: GoogleMapsTrackingProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const mapRef = useRef<any>(null)
    const hasInitialBoundsFitted = useRef<boolean>(false)
    const userHasInteracted = useRef<boolean>(false)

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || ''
    })

    const center = {
        lat: (storeLocation.lat + customerLocation.lat) / 2,
        lng: (storeLocation.lng + customerLocation.lng) / 2
    }

    const path = [
        storeLocation,
        ...(deliveryLocation ? [deliveryLocation] : []),
        customerLocation
    ]

    const onLoad = useCallback((map: any) => {
        mapRef.current = map

        // Only fit bounds on initial load, not on subsequent updates
        if (!hasInitialBoundsFitted.current && !userHasInteracted.current) {
            if (window.google && window.google.maps) {
                const bounds = new window.google.maps.LatLngBounds()
                bounds.extend(storeLocation)
                bounds.extend(customerLocation)
                if (deliveryLocation) bounds.extend(deliveryLocation)
                map.fitBounds(bounds)
                hasInitialBoundsFitted.current = true
            }
        }

        // Track user interaction with the map
        const trackInteraction = () => {
            userHasInteracted.current = true
        }

        // Add event listeners to track user interaction (pan, zoom, drag)
        map.addListener('dragstart', trackInteraction)
        map.addListener('zoom_changed', () => {
            // Use a small delay to distinguish user zoom from programmatic zoom
            setTimeout(() => {
                if (!userHasInteracted.current) {
                    trackInteraction()
                }
            }, 100)
        })
    }, [storeLocation, customerLocation])

    // Handle initial bounds fitting when deliveryLocation first appears
    useEffect(() => {
        if (mapRef.current && !hasInitialBoundsFitted.current && !userHasInteracted.current && deliveryLocation) {
            if (window.google && window.google.maps) {
                const bounds = new window.google.maps.LatLngBounds()
                bounds.extend(storeLocation)
                bounds.extend(customerLocation)
                bounds.extend(deliveryLocation)
                mapRef.current.fitBounds(bounds)
                hasInitialBoundsFitted.current = true
            }
        }
        // Note: When deliveryLocation updates after initial load, we don't reset viewport
        // The Marker component will automatically update its position
    }, [deliveryLocation, storeLocation, customerLocation])

    if (loadError) {
        return (
            <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-800 text-sm">❌ Failed to load Google Maps</p>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className="mx-4 mt-4 bg-gray-100 rounded-lg p-8 text-center">
                <div className="animate-spin">🗺️</div>
                <p className="text-gray-600 text-sm mt-2">Loading map...</p>
            </div>
        )
    }

    if (!apiKey) {
        return (
            <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">⚠️ Google Maps API key not configured</p>
            </div>
        )
    }

    return (
        <div className="relative mx-4 mt-4 rounded-lg overflow-hidden shadow-sm">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
            >
                {/* Store Marker */}
                <Marker
                    position={storeLocation}
                    icon={{
                        url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="8" y="32" font-size="32">🏪</text></svg>')}`,
                        scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined
                    } as any}
                    title="Store Location"
                />

                {/* Customer Marker */}
                <Marker
                    position={customerLocation}
                    icon={{
                        url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="8" y="32" font-size="32">📍</text></svg>')}`,
                        scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined
                    } as any}
                    title="Delivery Address"
                />

                {/* Delivery Partner Marker */}
                {deliveryLocation && (
                    <Marker
                        position={deliveryLocation}
                        icon={{
                            url: '/assets/deliveryboy/deliveryIcon.png',
                            scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(60, 60) : undefined,
                            anchor: window.google?.maps?.Point ? new window.google.maps.Point(30, 30) : undefined
                        } as any}
                        title="Delivery Partner"
                    />
                )}

                {/* Route Polyline */}
                <Polyline
                    path={path}
                    options={{
                        strokeColor: '#16a34a',
                        strokeOpacity: 0.7,
                        strokeWeight: 4,
                        geodesic: true,
                    }}
                />
            </GoogleMap>

            {/* Live Tracking Indicator */}
            {isTracking && (
                <div className="absolute bottom-3 left-3 z-10 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-gray-900">Live Tracking</span>
                </div>
            )}
        </div>
    )
}

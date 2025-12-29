import { useCallback, useRef, useEffect, useState } from 'react'
// @ts-ignore - @react-google-maps/api types may not be available
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { motion } from 'framer-motion'
import deliveryIcon from '@assets/deliveryboy/deliveryIcon.png'

// Helper to get delivery icon URL (works in both dev and production)
const getDeliveryIconUrl = () => {
    // Try imported path first (Vite will process this in production)
    if (deliveryIcon && typeof deliveryIcon === 'string') {
        return deliveryIcon;
    }
    // Fallback to public path
    return '/assets/deliveryboy/deliveryIcon.png';
};

interface Location {
    lat: number
    lng: number
}

interface GoogleMapsTrackingProps {
    storeLocation: Location
    customerLocation: Location
    deliveryLocation?: Location
    isTracking: boolean
    showRoute?: boolean // Whether to show actual route using Directions API
    routeOrigin?: Location // Origin for route (delivery partner location)
    routeDestination?: Location // Destination for route (seller shop or customer)
}

const mapContainerStyle = {
    width: '100%',
    height: '16rem'
}

export default function GoogleMapsTracking({
    storeLocation,
    customerLocation,
    deliveryLocation,
    isTracking,
    showRoute = false,
    routeOrigin,
    routeDestination
}: GoogleMapsTrackingProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const mapRef = useRef<any>(null)
    const directionsServiceRef = useRef<any>(null)
    const directionsRendererRef = useRef<any>(null)
    const hasInitialBoundsFitted = useRef<boolean>(false)
    const userHasInteracted = useRef<boolean>(false)
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || ''
    })

    // Center will be updated dynamically based on deliveryLocation
    const center = deliveryLocation || {
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
        // This should only run once when map first loads
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
        // Only add listeners once, not on every callback recreation
        if (!map._interactionListenersAdded) {
            map.addListener('dragstart', trackInteraction)
            map.addListener('zoom_changed', () => {
                // Use a small delay to distinguish user zoom from programmatic zoom
                setTimeout(() => {
                    if (!userHasInteracted.current) {
                        trackInteraction()
                    }
                }, 100)
            })
            map._interactionListenersAdded = true
        }
    }, []) // Empty deps - this should only run once when map loads

    // Calculate and display route using Google Directions Service
    const calculateAndDisplayRoute = useCallback((origin: Location, destination: Location) => {
        if (!isLoaded || !mapRef.current || !window.google?.maps) {
            console.log('⚠️ Cannot calculate route: map not loaded or not ready')
            return
        }

        // Validate origin and destination
        if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
            console.log('⚠️ Cannot calculate route: invalid origin or destination', { origin, destination })
            return
        }

        // Initialize DirectionsService if not already initialized
        if (!directionsServiceRef.current) {
            directionsServiceRef.current = new window.google.maps.DirectionsService()
        }

        // Initialize or reuse DirectionsRenderer
        if (!directionsRendererRef.current) {
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                map: mapRef.current,
                suppressMarkers: true, // We'll use custom markers
                preserveViewport: true, // Preserve viewport - we'll center manually
                polylineOptions: {
                    strokeColor: '#2563eb',
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                },
            })
        } else {
            // Ensure preserveViewport is true so route updates don't change viewport
            directionsRendererRef.current.setOptions({ preserveViewport: true })
        }

        // Calculate route
        directionsServiceRef.current.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
                if (status === 'OK' && result.routes && result.routes[0]) {
                    // Always preserve viewport - we center on delivery boy separately
                    directionsRendererRef.current.setOptions({ preserveViewport: true })
                    directionsRendererRef.current.setDirections(result)

                    // Extract route information
                    const route = result.routes[0]
                    const leg = route.legs[0]
                    if (leg) {
                        setRouteInfo({
                            distance: leg.distance?.text || '0 km',
                            duration: leg.duration?.text || '0 mins',
                        })
                    }
                } else {
                    console.error('❌ Directions request failed:', status, { origin, destination })
                    setRouteInfo(null)
                }
            }
        )
    }, [isLoaded])

    // Handle route calculation when routeOrigin and routeDestination are provided
    useEffect(() => {
        if (showRoute && routeOrigin && routeDestination && isLoaded && mapRef.current) {
            // Recalculate route when origin or destination changes
            calculateAndDisplayRoute(routeOrigin, routeDestination)
        } else if (!showRoute && directionsRendererRef.current) {
            // Clear route if showRoute is false
            directionsRendererRef.current.setMap(null)
            directionsRendererRef.current = null
            setRouteInfo(null)
        }
    }, [showRoute, routeOrigin, routeDestination, isLoaded, calculateAndDisplayRoute])

    // Center map on delivery boy location whenever it updates
    useEffect(() => {
        if (mapRef.current && deliveryLocation && isLoaded && window.google?.maps) {
            // Center map on delivery boy's location with smooth pan
            mapRef.current.panTo({
                lat: deliveryLocation.lat,
                lng: deliveryLocation.lng
            })
        }
    }, [deliveryLocation, isLoaded])

    // Handle initial bounds fitting when map first loads
    useEffect(() => {
        if (mapRef.current && !hasInitialBoundsFitted.current && deliveryLocation && isLoaded && window.google?.maps) {
            // On initial load, fit bounds to show all important locations
            const bounds = new window.google.maps.LatLngBounds()
            bounds.extend(storeLocation)
            bounds.extend(customerLocation)
            bounds.extend(deliveryLocation)
            mapRef.current.fitBounds(bounds)
            hasInitialBoundsFitted.current = true
        }
    }, [deliveryLocation, storeLocation, customerLocation, isLoaded])

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
                            url: getDeliveryIconUrl(),
                            scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(60, 60) : undefined,
                            anchor: window.google?.maps?.Point ? new window.google.maps.Point(30, 30) : undefined
                        } as any}
                        title="Delivery Partner"
                    />
                )}

                {/* Route using Directions API (rendered programmatically) or simple polyline */}
                {!showRoute && (
                    <Polyline
                        path={path}
                        options={{
                            strokeColor: '#16a34a',
                            strokeOpacity: 0.7,
                            strokeWeight: 4,
                            geodesic: true,
                        }}
                    />
                )}
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

            {/* Route Info Display */}
            {routeInfo && showRoute && (
                <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 text-xs">
                        <div>
                            <p className="text-gray-500 font-medium">Distance</p>
                            <p className="text-gray-900 font-bold">{routeInfo.distance}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <div>
                            <p className="text-gray-500 font-medium">ETA</p>
                            <p className="text-gray-900 font-bold">{routeInfo.duration}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


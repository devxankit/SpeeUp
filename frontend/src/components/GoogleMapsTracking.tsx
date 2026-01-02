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
    name?: string
}

interface GoogleMapsTrackingProps {
    storeLocation?: Location
    sellerLocations?: Location[]
    customerLocation: Location
    deliveryLocation?: Location
    isTracking: boolean
    showRoute?: boolean // Whether to show actual route using Directions API
    routeOrigin?: Location // Origin for route (delivery partner location)
    routeDestination?: Location // Destination for route (seller shop or customer)
    routeWaypoints?: Location[] // Intermediate waypoints for the route
    destinationName?: string // Name of the destination for the overlay
    onRouteInfoUpdate?: (info: { distance: string; duration: string } | null) => void
    lastUpdate?: Date | null // Last location update timestamp
}

const mapContainerStyle = {
    width: '100%',
    height: '16rem'
}

export default function GoogleMapsTracking({
    storeLocation,
    sellerLocations = [],
    customerLocation,
    deliveryLocation,
    isTracking,
    showRoute = false,
    routeOrigin,
    routeDestination,
    routeWaypoints = [],
    destinationName,
    onRouteInfoUpdate,
    lastUpdate
}: GoogleMapsTrackingProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const mapRef = useRef<any>(null)
    const directionsServiceRef = useRef<any>(null)
    const directionsRendererRef = useRef<any>(null)
    const lastRouteCalcRef = useRef<{ time: number, origin: Location }>({ time: 0, origin: { lat: 0, lng: 0 } })
    const hasInitialBoundsFitted = useRef<boolean>(false)
    const userHasInteracted = useRef<boolean>(false)
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)
    const [routeError, setRouteError] = useState<string | null>(null)
    const [isGPSWeak, setIsGPSWeak] = useState<boolean>(false)

    // Check for weak GPS signal (no updates for > 45 seconds)
    useEffect(() => {
        if (!lastUpdate) return;

        const checkGPS = () => {
            const now = new Date().getTime();
            const lastTime = new Date(lastUpdate).getTime();
            setIsGPSWeak(now - lastTime > 45000); // 45 seconds threshold
        };

        const interval = setInterval(checkGPS, 10000); // Check every 10 seconds
        checkGPS(); // Initial check

        return () => clearInterval(interval);
    }, [lastUpdate]);

    // Sync routeInfo with parent
    useEffect(() => {
        if (onRouteInfoUpdate) {
            onRouteInfoUpdate(routeInfo);
        }
    }, [routeInfo, onRouteInfoUpdate]);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || ''
    })

    // Combine storeLocation with sellerLocations
    const allSellers = storeLocation ? [storeLocation, ...sellerLocations] : sellerLocations;

    // Center will be updated dynamically based on deliveryLocation
    const center = deliveryLocation || (allSellers.length > 0 ? {
        lat: (allSellers[0].lat + customerLocation.lat) / 2,
        lng: (allSellers[0].lng + customerLocation.lng) / 2
    } : customerLocation)

    const path = [
        ...allSellers,
        ...(deliveryLocation ? [deliveryLocation] : []),
        customerLocation
    ]

    const onLoad = useCallback((map: any) => {
        mapRef.current = map

        // Track user interaction with the map (pan, zoom, drag)
        let isProgrammaticChange = false;

        const trackInteraction = () => {
            if (!isProgrammaticChange) {
                userHasInteracted.current = true;
            }
        };

        // Add event listeners to track user interaction
        map.addListener('dragstart', trackInteraction);
        map.addListener('zoom_changed', () => {
            if (!isProgrammaticChange) {
                setTimeout(() => {
                    if (!isProgrammaticChange) {
                        trackInteraction();
                    }
                }, 100);
            }
        });

        // Store the flag setter for use in route calculation
        map._setProgrammaticChange = (value: boolean) => {
            isProgrammaticChange = value;
        };

        // Only fit bounds on initial load
        if (!hasInitialBoundsFitted.current && !userHasInteracted.current) {
            if (window.google && window.google.maps) {
                const bounds = new window.google.maps.LatLngBounds()
                if (storeLocation) bounds.extend(storeLocation)
                bounds.extend(customerLocation)
                if (deliveryLocation) bounds.extend(deliveryLocation)

                map._setProgrammaticChange(true);
                map.fitBounds(bounds)
                setTimeout(() => map._setProgrammaticChange(false), 500);

                hasInitialBoundsFitted.current = true
            }
        }
    }, [storeLocation, customerLocation, deliveryLocation])

    // Calculate and display route using Google Directions Service
    const calculateAndDisplayRoute = useCallback((origin: Location, destination: Location, waypoints: Location[] = []) => {
        if (!isLoaded || !mapRef.current || !window.google?.maps) {
            console.log('⚠️ Cannot calculate route: map not loaded or not ready')
            return
        }

        // Validate origin and destination
        if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
            console.log('⚠️ Cannot calculate route: invalid origin or destination', { origin, destination })
            return
        }

        // Optimization: Throttle route calculation (min 5 seconds between calls)
        // unless origin has moved significantly (> 50m)
        const now = Date.now()
        const lastCalc = lastRouteCalcRef.current
        const timeDiff = now - lastCalc.time

        if (timeDiff < 5000) {
            // Check if origin moved significantly
            const latDiff = Math.abs(origin.lat - lastCalc.origin.lat)
            const lngDiff = Math.abs(origin.lng - lastCalc.origin.lng)
            // Rough approximation: 0.0005 degrees is ~50m
            if (latDiff < 0.0005 && lngDiff < 0.0005) {
                return // Skip calculation
            }
        }

        lastRouteCalcRef.current = { time: now, origin: { ...origin } }

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
                    strokeColor: '#3b82f6',
                    strokeWeight: 6,
                    strokeOpacity: 0.9,
                },
            })
        } else {
            // Ensure preserveViewport is true so route updates don't change viewport
            directionsRendererRef.current.setOptions({ preserveViewport: true })
        }

        // Prepare waypoints
        const googleWaypoints = waypoints.map(wp => ({
            location: new window.google.maps.LatLng(wp.lat, wp.lng),
            stopover: true
        }));

        // Calculate route
        directionsServiceRef.current.route(
            {
                origin: origin,
                destination: destination,
                waypoints: googleWaypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: 'bestguess'
                },
                optimizeWaypoints: true,
            },
            (result: any, status: any) => {
                if (status === 'OK' && result.routes && result.routes[0]) {
                    setRouteError(null)
                    // Extract route information
                    const route = result.routes[0]
                    const leg = route.legs[0]
                    if (leg) {
                        setRouteInfo({
                            distance: leg.distance?.text || '0 km',
                            duration: leg.duration?.text || '0 mins',
                        })
                    }

                    // Handle viewport fitting - match DeliveryOrderDetail logic
                    if (!hasInitialBoundsFitted.current && !userHasInteracted.current) {
                        if (mapRef.current && mapRef.current._setProgrammaticChange) {
                            mapRef.current._setProgrammaticChange(true);
                        }
                        directionsRendererRef.current.setOptions({ preserveViewport: false });
                        directionsRendererRef.current.setDirections(result);
                        directionsRendererRef.current.setOptions({ preserveViewport: true });

                        hasInitialBoundsFitted.current = true;

                        setTimeout(() => {
                            if (mapRef.current && mapRef.current._setProgrammaticChange) {
                                mapRef.current._setProgrammaticChange(false);
                            }
                        }, 500);
                    } else {
                        directionsRendererRef.current.setOptions({ preserveViewport: true })
                        directionsRendererRef.current.setDirections(result)
                    }
                } else {
                    console.error('❌ Directions request failed:', status, { origin, destination })
                    setRouteInfo(null)

                    // Fallback to straight line if route fails
                    if (status === 'ZERO_RESULTS') {
                        setRouteError('No road route found. Showing straight line.')
                    } else if (status === 'OVER_QUERY_LIMIT') {
                        setRouteError('Map service busy. Showing straight line.')
                    } else {
                        setRouteError('Navigation error. Showing straight line.')
                    }
                }
            }
        )
    }, [isLoaded])

    // Handle route calculation when routeOrigin and routeDestination are provided
    useEffect(() => {
        if (showRoute && routeOrigin && routeDestination && isLoaded && mapRef.current) {
            // Recalculate route when origin, destination or waypoints change
            calculateAndDisplayRoute(routeOrigin, routeDestination, routeWaypoints)
        } else if (!showRoute && directionsRendererRef.current) {
            // Clear route if showRoute is false
            directionsRendererRef.current.setMap(null)
            directionsRendererRef.current = null
            setRouteInfo(null)
        }
    }, [showRoute, routeOrigin, routeDestination, routeWaypoints, isLoaded, calculateAndDisplayRoute])

    // Interpolation State
    const [animatedDeliveryLocation, setAnimatedDeliveryLocation] = useState<Location | undefined>(deliveryLocation);
    const animationRef = useRef<number>();
    const lastDeliveryLocationRef = useRef<Location | undefined>(deliveryLocation);

    // Animation Logic
    useEffect(() => {
        if (!deliveryLocation) return;

        // If no previous location, snap to current (initial load)
        if (!lastDeliveryLocationRef.current) {
            setAnimatedDeliveryLocation(deliveryLocation);
            lastDeliveryLocationRef.current = deliveryLocation;
            return;
        }

        // If location hasn't changed (deep check), do nothing
        if (deliveryLocation.lat === lastDeliveryLocationRef.current.lat &&
            deliveryLocation.lng === lastDeliveryLocationRef.current.lng) {
            return;
        }

        const startLocation = animatedDeliveryLocation || lastDeliveryLocationRef.current;
        const targetLocation = deliveryLocation;
        const startTime = performance.now();
        const duration = 3800; // Slightly less than 4s interval to ensure completion

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out slightly for more natural movement (optional, linear is fine for tracking)
            // const ease = 1 - Math.pow(1 - progress, 3);
            const ease = progress; // Linear for constant speed prediction

            const lat = startLocation.lat + (targetLocation.lat - startLocation.lat) * ease;
            const lng = startLocation.lng + (targetLocation.lng - startLocation.lng) * ease;

            setAnimatedDeliveryLocation({ lat, lng });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                lastDeliveryLocationRef.current = targetLocation;
            }
        };

        cancelAnimationFrame(animationRef.current!);
        animationRef.current = requestAnimationFrame(animate);

        // Update ref for next comparison
        lastDeliveryLocationRef.current = deliveryLocation;

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [deliveryLocation]);


    // Handle initial bounds fitting when map first loads
    useEffect(() => {
        if (mapRef.current && !hasInitialBoundsFitted.current && deliveryLocation && isLoaded && window.google?.maps) {
            // On initial load, fit bounds to show all important locations
            const bounds = new window.google.maps.LatLngBounds()
            allSellers.forEach(seller => bounds.extend(seller))
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
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    disableDefaultUI: true,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                }}
            >
                {/* Customer Marker */}
                <Marker
                    position={customerLocation}
                    icon={showRoute && routeDestination?.lat === customerLocation.lat ? {
                        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                        scale: 10,
                        fillColor: '#3b82f6',
                        fillOpacity: 1,
                        strokeWeight: 3,
                        strokeColor: '#ffffff',
                    } : {
                        url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="8" y="32" font-size="32">📍</text></svg>')}`,
                        scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined
                    } as any}
                    title="Delivery Address"
                />

                {/* Seller Markers */}
                {allSellers.map((seller, index) => (
                    <Marker
                        key={`seller-${index}`}
                        position={seller}
                        icon={showRoute && routeDestination?.lat === seller.lat ? {
                            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                            scale: 10,
                            fillColor: '#ef4444',
                            fillOpacity: 1,
                            strokeWeight: 3,
                            strokeColor: '#ffffff',
                        } : {
                            url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="8" y="32" font-size="32">🏪</text></svg>')}`,
                            scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(40, 40) : undefined
                        } as any}
                        title={seller.name || "Seller Shop"}
                    />
                ))}

                {/* Delivery Partner Marker (Animated) */}
                {animatedDeliveryLocation && (
                    <Marker
                        position={animatedDeliveryLocation}
                        icon={{
                            url: getDeliveryIconUrl(),
                            scaledSize: window.google?.maps?.Size ? new window.google.maps.Size(60, 60) : undefined,
                            anchor: window.google?.maps?.Point ? new window.google.maps.Point(30, 30) : undefined
                        } as any}
                        title="Delivery Partner"
                    />
                )}
                {( !showRoute || routeError ) && (
                    <Polyline
                        path={path}
                        options={{
                            strokeColor: routeError ? '#ef4444' : '#16a34a',
                            strokeOpacity: 0.7,
                            strokeWeight: 4,
                            geodesic: true,
                        }}
                    />
                )}
            </GoogleMap>

            {/* Error Overlay */}
            {routeError && (
                <div className="absolute top-16 left-4 right-4 bg-red-50/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-red-100 z-10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{routeError}</span>
                    </div>
                    <button
                        onClick={() => setRouteError(null)}
                        className="text-red-400 hover:text-red-600 font-bold px-1 text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* GPS Signal Warning Overlay */}
            {isGPSWeak && isTracking && (
                <div className="absolute bottom-16 left-4 right-4 bg-yellow-50/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-yellow-100 z-10 flex items-center gap-2 animate-pulse">
                    <span className="flex-shrink-0 text-sm">🛰️</span>
                    <div>
                        <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">GPS Signal Weak</p>
                        <p className="text-[10px] text-yellow-700">Waiting for real-time location updates...</p>
                    </div>
                </div>
            )}

            {/* Live Tracking Indicator */}
            {isTracking && (
                <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-neutral-100 flex items-center gap-2">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Live</span>
                </div>
            )}

            {/* Destination Overlay - Matches Delivery Interface */}
            {destinationName && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-neutral-100 z-10">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Destination</p>
                    <p className="text-xs font-bold text-neutral-800 truncate max-w-[200px]">{destinationName}</p>
                </div>
            )}

            {/* Route Info Display - Matches Delivery Interface Styling */}
            {routeInfo && showRoute && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-neutral-100 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Distance</p>
                                <p className="text-sm font-bold text-neutral-900">{routeInfo.distance}</p>
                            </div>
                            <div className="w-px h-8 bg-neutral-200"></div>
                            <div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">ETA</p>
                                <p className="text-sm font-bold text-neutral-900">{routeInfo.duration}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white rotate-45">
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


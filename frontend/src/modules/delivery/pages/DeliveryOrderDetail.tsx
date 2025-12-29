import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails, updateOrderStatus, getSellerLocationsForOrder, sendDeliveryOtp, verifyDeliveryOtp, updateDeliveryLocation } from '../../../services/api/delivery/deliveryService';
import deliveryIcon from '@assets/deliveryboy/deliveryIcon.png';

// Helper to get delivery icon URL (works in both dev and production)
const getDeliveryIconUrl = () => {
    // Try imported path first (Vite will process this in production)
    if (deliveryIcon && typeof deliveryIcon === 'string') {
        return deliveryIcon;
    }
    // Fallback to public path
    return '/assets/deliveryboy/deliveryIcon.png';
};

// Icons components to avoid external dependency issues
const Icons = {
    ChevronLeft: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 18l-6-6 6-6" />
        </svg>
    ),
    MapPin: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    User: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Phone: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    Clock: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    CheckCircle: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    Truck: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
    ShoppingBag: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    Navigation: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    ),
    Store: ({ size = 24, className = "" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
};

type DeliveryOrderStatus = 'Pending' | 'Ready for pickup' | 'Picked up' | 'Delivered' | 'Cancelled' | 'Returned';

export default function DeliveryOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const [sellerLocations, setSellerLocations] = useState<any[]>([]);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<{ lat: number; lng: number } | null>(null);
    const directionsServiceRef = useRef<any>(null);
    const directionsRendererRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const originMarkerRef = useRef<any>(null);
    const destMarkerRef = useRef<any>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const hasInitialRouteFitted = useRef<boolean>(false);
    const userHasInteracted = useRef<boolean>(false);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getOrderDetails(id);
            setOrder(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    // Fetch seller locations when order is assigned
    useEffect(() => {
        const fetchSellerLocations = async () => {
            if (!id || !order) return;
            // Only fetch if order has delivery boy assigned and status is before "Picked up"
            if (order.status && order.status !== 'Picked up' && order.status !== 'Delivered') {
                try {
                    const locations = await getSellerLocationsForOrder(id);
                    setSellerLocations(locations || []);
                } catch (err) {
                    console.error('Failed to fetch seller locations:', err);
                }
            }
        };
        fetchSellerLocations();
    }, [id, order?.status]);

    // Load Google Maps Script
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API Key missing');
            return;
        }

        if ((window as any).google?.maps) {
            setIsMapLoaded(true);
            return;
        }

        if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsMapLoaded(true);
            document.head.appendChild(script);
        } else {
            const checkInterval = setInterval(() => {
                if ((window as any).google?.maps) {
                    clearInterval(checkInterval);
                    setIsMapLoaded(true);
                }
            }, 500);
            return () => clearInterval(checkInterval);
        }
    }, []);

    // Initialize Map
    useEffect(() => {
        if (isMapLoaded && mapRef.current && !googleMapRef.current) {
            const defaultCenter = deliveryBoyLocation || { lat: 22.7196, lng: 75.8577 };

            googleMapRef.current = new (window as any).google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 13,
                disableDefaultUI: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // Track user interaction with the map (pan, zoom, drag)
            let isProgrammaticChange = false;

            const trackInteraction = () => {
                if (!isProgrammaticChange) {
                    userHasInteracted.current = true;
                }
            };

            // Add event listeners to track user interaction
            googleMapRef.current.addListener('dragstart', trackInteraction);
            googleMapRef.current.addListener('zoom_changed', () => {
                // Track zoom changes that are likely user-initiated
                if (!isProgrammaticChange) {
                    // Use a small delay to allow programmatic changes to set the flag
                    setTimeout(() => {
                        if (!isProgrammaticChange) {
                            trackInteraction();
                        }
                    }, 100);
                }
            });

            // Store the flag setter for use in route calculation
            (googleMapRef.current as any)._setProgrammaticChange = (value: boolean) => {
                isProgrammaticChange = value;
            };
        }
    }, [isMapLoaded, deliveryBoyLocation]);

    // Clean up when component unmounts
    useEffect(() => {
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
            markersRef.current.forEach(marker => marker.setMap(null));
            originMarkerRef.current = null;
            destMarkerRef.current = null;
            if (googleMapRef.current) {
                googleMapRef.current = null;
            }
        };
    }, []);


    const handleSendOtp = async () => {
        if (!id) return;
        try {
            setOtpSending(true);
            await sendDeliveryOtp(id);
            setShowOtpInput(true);
            alert('OTP sent to customer successfully');
        } catch (err: any) {
            alert(err.message || 'Failed to send OTP');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!id || !otpValue) {
            alert('Please enter OTP');
            return;
        }
        try {
            setOtpVerifying(true);
            const result = await verifyDeliveryOtp(id, otpValue);
            alert(result.message || 'OTP verified successfully. Order marked as delivered.');
            await fetchOrder(); // Refresh order data
            setShowOtpInput(false);
            setOtpValue('');
        } catch (err: any) {
            alert(err.message || 'Failed to verify OTP');
        } finally {
            setOtpVerifying(false);
        }
    };

    // Track if location permission was denied
    const locationPermissionDeniedRef = useRef<boolean>(false);

    // Get delivery boy's current location
    useEffect(() => {
        const getCurrentLocation = () => {
            if (!navigator.geolocation) {
                console.warn('Geolocation is not supported by this browser');
                return;
            }

            if (locationPermissionDeniedRef.current) {
                // Don't retry if permission was denied
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDeliveryBoyLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    locationPermissionDeniedRef.current = false; // Reset on success
                },
                (error: GeolocationPositionError) => {
                    // Handle different error types
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            locationPermissionDeniedRef.current = true;
                            console.warn('Location permission denied. Please enable location access in your browser settings.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.warn('Location information unavailable. Please check your device settings.');
                            break;
                        case error.TIMEOUT:
                            console.warn('Location request timed out. Please try again.');
                            break;
                        default:
                            console.warn('Error getting location:', error.message);
                            break;
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        getCurrentLocation();
    }, []);

    // Calculate and display route using Google Maps Directions Service
    const calculateAndDisplayRoute = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
        if (!isMapLoaded || !googleMapRef.current || !(window as any).google?.maps) return;

        // Initialize DirectionsService if not already initialized
        if (!directionsServiceRef.current) {
            directionsServiceRef.current = new (window as any).google.maps.DirectionsService();
        }

        // Clear previous directions renderer
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }

        // Initialize DirectionsRenderer (suppress default markers, we'll add custom ones)
        // preserveViewport: true prevents automatic zoom/bounds adjustment when route is updated
        directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
            map: googleMapRef.current,
            suppressMarkers: true,
            preserveViewport: true, // Prevent automatic zoom/bounds adjustment
            polylineOptions: {
                strokeColor: '#2563eb',
                strokeWeight: 5,
                strokeOpacity: 0.8,
            },
        });

        // Calculate route
        directionsServiceRef.current.route(
            {
                origin: origin,
                destination: destination,
                travelMode: (window as any).google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
                if (status === 'OK' && directionsRendererRef.current && result.routes && result.routes[0]) {
                    // Only fit bounds on initial route calculation, preserve zoom for subsequent updates
                    if (!hasInitialRouteFitted.current && !userHasInteracted.current) {
                        // For initial load, allow DirectionsRenderer to fit bounds only if user hasn't interacted
                        // Mark this as a programmatic change to avoid tracking it as user interaction
                        if (googleMapRef.current && (googleMapRef.current as any)._setProgrammaticChange) {
                            (googleMapRef.current as any)._setProgrammaticChange(true);
                        }
                        directionsRendererRef.current.setOptions({ preserveViewport: false });
                        directionsRendererRef.current.setDirections(result);
                        directionsRendererRef.current.setOptions({ preserveViewport: true });
                        console.log('fit bounds');
                        hasInitialRouteFitted.current = true;
                        // Reset the flag after a delay to allow for the change to complete
                        setTimeout(() => {
                            if (googleMapRef.current && (googleMapRef.current as any)._setProgrammaticChange) {
                                (googleMapRef.current as any)._setProgrammaticChange(false);
                            }
                        }, 500);
                    } else {
                        // For subsequent updates or if user has interacted, always preserve the current viewport/zoom
                        directionsRendererRef.current.setOptions({ preserveViewport: true });
                        directionsRendererRef.current.setDirections(result);
                    }

                    // Extract route information
                    const route = result.routes[0];
                    const leg = route.legs[0];
                    if (leg) {
                        setRouteInfo({
                            distance: leg.distance?.text || '0 km',
                            duration: leg.duration?.text || '0 mins',
                        });
                    }

                    // Update or create origin marker (delivery boy location)
                    if (originMarkerRef.current) {
                        // Update existing marker position
                        originMarkerRef.current.setPosition(origin);
                    } else {
                        // Create new marker if it doesn't exist
                        originMarkerRef.current = new (window as any).google.maps.Marker({
                            position: origin,
                            map: googleMapRef.current,
                            icon: {
                                url: getDeliveryIconUrl(),
                                scaledSize: new (window as any).google.maps.Size(60, 60),
                                anchor: new (window as any).google.maps.Point(40, 40),
                            },
                            title: 'Your Location',
                        });
                        markersRef.current.push(originMarkerRef.current);
                    }

                    // Update or create destination marker
                    if (destMarkerRef.current) {
                        // Update existing marker position
                        destMarkerRef.current.setPosition(destination);
                    } else {
                        // Create new marker if it doesn't exist
                        destMarkerRef.current = new (window as any).google.maps.Marker({
                            position: destination,
                            map: googleMapRef.current,
                            icon: {
                                path: (window as any).google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: '#3b82f6', // Blue for destination
                                fillOpacity: 1,
                                strokeWeight: 3,
                                strokeColor: '#ffffff',
                            },
                            title: 'Destination',
                        });
                        markersRef.current.push(destMarkerRef.current);
                    }
                } else {
                    console.error('Directions request failed:', status);
                    setRouteInfo(null);
                }
            }
        );
    }, [isMapLoaded]);

    // Clear route and markers
    const clearRoute = useCallback(() => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        originMarkerRef.current = null;
        destMarkerRef.current = null;
        setRouteInfo(null);
        hasInitialRouteFitted.current = false; // Reset flag when route is cleared
    }, []);

    // Calculate route when location or order status changes
    useEffect(() => {
        if (!deliveryBoyLocation || !order || !googleMapRef.current || !isMapLoaded) return;

        // Calculate route immediately when dependencies change (location updates happen every 10 seconds)
        if (order.status === 'Picked up' || order.status === 'Out for Delivery') {
                // Show route to customer
                if (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude) {
                    calculateAndDisplayRoute(
                        deliveryBoyLocation,
                        { lat: order.deliveryAddress.latitude, lng: order.deliveryAddress.longitude }
                    );
                } else if (order.address) {
                    // Geocode address if coordinates not available
                    const geocoder = new (window as any).google.maps.Geocoder();
                    geocoder.geocode({ address: order.address }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                            const location = results[0].geometry.location;
                            calculateAndDisplayRoute(
                                deliveryBoyLocation,
                                { lat: location.lat(), lng: location.lng() }
                            );
                        }
                    });
                }
            } else if (sellerLocations.length > 0 && order.status !== 'Delivered') {
                // Show route to first/nearest seller
                const firstSeller = sellerLocations[0];
                if (firstSeller.latitude && firstSeller.longitude) {
                    calculateAndDisplayRoute(
                        deliveryBoyLocation,
                        { lat: firstSeller.latitude, lng: firstSeller.longitude }
                    );
                }
            } else {
                // Clear route if no destination available
                clearRoute();
            }

    }, [deliveryBoyLocation, order?.status, sellerLocations, order?.deliveryAddress, order?.address, isMapLoaded, calculateAndDisplayRoute, clearRoute]);

    // Update delivery boy location from geolocation updates
    useEffect(() => {
        if (!id || !order) return;

        const shouldTrack = order.status && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Returned';

        if (shouldTrack) {
            const updateLocation = async () => {
                if (!navigator.geolocation) {
                    return;
                }

                if (locationPermissionDeniedRef.current) {
                    // Don't retry if permission was denied
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const newLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        // Update state for route recalculation
                        setDeliveryBoyLocation(newLocation);
                        // Update backend
                        try {
                            await updateDeliveryLocation(id, position.coords.latitude, position.coords.longitude);
                        } catch (err) {
                            console.error('Failed to update location:', err);
                        }
                        locationPermissionDeniedRef.current = false; // Reset on success
                    },
                    (error: GeolocationPositionError) => {
                        // Handle different error types silently to avoid console spam
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                if (!locationPermissionDeniedRef.current) {
                                    locationPermissionDeniedRef.current = true;
                                    console.warn('Location permission denied. Location tracking disabled.');
                                }
                                break;
                            case error.POSITION_UNAVAILABLE:
                                // Silent - position might be temporarily unavailable
                                break;
                            case error.TIMEOUT:
                                // Silent - timeout is expected sometimes
                                break;
                            default:
                                // Only log unexpected errors
                                console.warn('Location update error:', error.message);
                                break;
                        }
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            };

            // Send initial location update
            updateLocation();

            // Set up interval for continuous updates (every 10 seconds)
            locationIntervalRef.current = setInterval(updateLocation, 10000);

            return () => {
                if (locationIntervalRef.current) {
                    clearInterval(locationIntervalRef.current);
                    locationIntervalRef.current = null;
                }
            };
        } else {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
        }
    }, [id, order?.status]);


    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
                <p className="text-neutral-500">Loading order...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center flex-col">
                <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-neutral-200 rounded-lg text-neutral-700 font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const statusFlow: DeliveryOrderStatus[] = ['Pending', 'Ready for pickup', 'Picked up', 'Delivered'];

    let currentStatusIndex = statusFlow.indexOf(order.status as DeliveryOrderStatus);
    // Handle cases where status might not be in the flow (e.g. Cancelled)
    if (currentStatusIndex === -1 && (order.status === 'Cancelled' || order.status === 'Returned')) {
        // Maybe show a different UI for cancelled/returned orders
        currentStatusIndex = -1;
    }

    const handleStatusChange = async (newStatus: DeliveryOrderStatus) => {
        if (!id) return;
        try {
            setLoading(true); // Or use a separate loading state for the action
            const updatedOrder = await updateOrderStatus(id, newStatus);
            // Verify the update was successful and update local state
            if (updatedOrder && updatedOrder.data) {
                setOrder(updatedOrder.data);
            } else {
                // Fallback - re-fetch everything
                await fetchOrder();
            }
        } catch (err: any) {
            alert(err.message || "Failed to update status");
            setLoading(false);
        }
    };

    const getNextStatus = () => {
        if (currentStatusIndex !== -1 && currentStatusIndex < statusFlow.length - 1) {
            return statusFlow[currentStatusIndex + 1];
        }
        return null;
    };

    const nextStatus = getNextStatus();
    const isMapVisible = order.status === 'Picked up' || (sellerLocations.length > 0 && order.status !== 'Delivered');
    const showSellerLocations = sellerLocations.length > 0 && order.status !== 'Picked up' && order.status !== 'Delivered';
    const showCustomerLocation = order.status === 'Picked up';

    return (
        <div className="min-h-screen bg-neutral-50 pb-32 relative">

            {/* Top Bar with Back Button */}
            <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 py-3 flex items-center shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                >
                    <Icons.ChevronLeft size={24} />
                </button>
                <span className="ml-2 font-semibold text-lg text-neutral-800">Order Details</span>

                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Picked up' ? 'bg-indigo-100 text-indigo-700' :
                            order.status === 'Ready for pickup' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                        }`}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Google Maps View - Seller Locations (before picked up) or Customer Location (after picked up) */}
            {isMapVisible && (
                <div className="w-full h-80 bg-neutral-100 relative border-b border-neutral-200">
                    {/* Map Container */}
                    <div ref={mapRef} className="w-full h-full" />

                    {!isMapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm">
                            Loading Map...
                        </div>
                    )}


                    {showCustomerLocation && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-neutral-100 z-10">
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Destination</p>
                            <p className="text-xs font-bold text-neutral-800 truncate max-w-[200px]">{order.address?.split(',')[0]}</p>
                        </div>
                    )}

                    {showSellerLocations && sellerLocations.length > 0 && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-neutral-100 z-10">
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Seller Locations</p>
                            <p className="text-xs font-bold text-neutral-800">{sellerLocations.length} Shop(s)</p>
                        </div>
                    )}

                    {/* Route Info Display */}
                    {routeInfo && (
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
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <Icons.Navigation size={20} className="text-white rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Seller Locations Card (before picked up) */}
            {showSellerLocations && sellerLocations.length > 0 && (
                <div className="p-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                        <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                            <Icons.Store size={18} className="text-neutral-500" />
                            Seller Shop Locations
                        </h3>
                        <div className="space-y-3">
                            {sellerLocations.map((seller: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-neutral-900">{seller.storeName}</p>
                                        <p className="text-sm text-neutral-500">{seller.address}, {seller.city}</p>
                                    </div>
                                    {seller.latitude && seller.longitude && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Icons.MapPin size={16} className="text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 space-y-4 max-w-lg mx-auto">

                {/* Status Stepper Card */}
                {currentStatusIndex !== -1 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-1">Process</p>
                                <h2 className="text-lg font-bold text-neutral-900">Order Progress</h2>
                            </div>
                        </div>

                        {/* Status Progress Bar */}
                        <div className="relative">
                            <div className="flex justify-between mb-2 relative z-10">
                                {statusFlow.map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${idx <= currentStatusIndex
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-neutral-200 text-neutral-300'
                                            }`}>
                                            {idx <= currentStatusIndex ? <Icons.CheckCircle size={14} /> : idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Connecting Line */}
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-neutral-100 -z-0">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-neutral-500 font-medium mt-2">
                                {statusFlow.map((step, idx) => (
                                    <span key={idx} className={`text-center flex-1 transition-colors ${idx === currentStatusIndex ? 'text-blue-600 font-bold' : ''}`}>
                                        {step === 'Ready for pickup' ? 'Ready' : step}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                {/* Customer Details */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Icons.User size={18} className="text-neutral-500" />
                        Customer Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                                <Icons.User size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900">{order.customerName}</p>
                                <p className="text-sm text-neutral-500">Customer</p>
                            </div>
                            <a href={`tel:${order.customerPhone}`} className="ml-auto p-3 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md transition-transform hover:scale-105 active:scale-95">
                                <Icons.Phone size={20} />
                            </a>
                        </div>
                        <div className="flex items-start gap-3 pt-3 border-t border-neutral-50">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                                <Icons.MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600 leading-relaxed font-medium">{order.address}</p>
                                {order.distance && (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                                        {order.distance} away
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                            <Icons.ShoppingBag size={18} className="text-neutral-500" />
                            Order Summary
                        </h3>
                        <span className="text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-100 rounded-md">
                            {order.items?.length || 0} Items
                        </span>
                    </div>

                    <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-neutral-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">{item.quantity}x</span>
                                    <span className="text-sm text-neutral-700 font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-neutral-200 flex justify-between items-center">
                        <span className="font-semibold text-neutral-700">Total Amount</span>
                        <span className="text-xl font-bold text-neutral-900">₹{order.totalAmount}</span>
                    </div>
                </div>

                {/* Order Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-20">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-neutral-50 rounded-lg">
                            <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                            <p className="text-sm font-bold text-neutral-900">{order.orderId}</p>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg">
                            <p className="text-xs text-neutral-500 mb-1">Order Date</p>
                            <p className="text-sm font-bold text-neutral-900">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* OTP Section (when order is Picked up) */}
            {order.status === 'Picked up' && !showOtpInput && (
                <div className="fixed bottom-24 left-6 right-6 z-30">
                    <button
                        onClick={handleSendOtp}
                        className="w-full py-4 rounded-2xl bg-green-600 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white font-bold text-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group"
                        disabled={otpSending}
                    >
                        <span className="relative z-10">{otpSending ? 'Sending OTP...' : 'Send Delivery OTP'}</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                    </button>
                </div>
            )}

            {/* OTP Input Section */}
            {showOtpInput && (
                <div className="fixed bottom-24 left-6 right-6 z-30 bg-white rounded-2xl p-4 shadow-2xl border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-900 mb-3">Enter Delivery OTP</p>
                    <input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-lg font-semibold text-center mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={6}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowOtpInput(false);
                                setOtpValue('');
                            }}
                            className="flex-1 py-3 rounded-xl bg-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerifyOtp}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                            disabled={otpVerifying || otpValue.length !== 6}
                        >
                            {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Glassmorphic Action Button Dock - Order Taken button or status update */}
            {nextStatus && order.status !== 'Picked up' && !showOtpInput && (
                <div className="fixed bottom-24 left-6 right-6 z-30">
                    <button
                        onClick={() => handleStatusChange(nextStatus)}
                        className="w-full py-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-white font-bold text-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group"
                        disabled={loading}
                    >
                        <span className="relative z-10">
                            {loading ? 'Updating...' : nextStatus === 'Picked up' ? 'Order Taken' : `Mark as ${nextStatus}`}
                        </span>
                        {!loading && <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10 group-hover:bg-white/30 transition-colors">
                            <Icons.ChevronLeft className="rotate-180" size={18} />
                        </div>}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                    </button>
                </div>
            )}
        </div>
    );
}

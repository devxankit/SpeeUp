import { useState, useEffect, useCallback, useRef } from 'react'
// @ts-ignore - socket.io-client types may not be available
import { io, Socket } from 'socket.io-client'

interface LocationUpdate {
    orderId: string
    location: {
        latitude: number
        longitude: number
        timestamp: Date
    }
    eta: number
    distance: number
    status: string
    timestamp: Date
}

interface TrackingData {
    deliveryLocation: { lat: number; lng: number } | null
    eta: number
    distance: number
    status: string
    isConnected: boolean
    lastUpdate: Date | null
    error: string | null
    reconnectAttempts: number
}

const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 2000 // 2 seconds

export const useDeliveryTracking = (orderId: string | undefined) => {
    const [trackingData, setTrackingData] = useState<TrackingData>({
        deliveryLocation: null,
        eta: 30,
        distance: 0,
        status: 'idle',
        isConnected: false,
        lastUpdate: null,
        error: null,
        reconnectAttempts: 0,
    })

    const socketRef = useRef<Socket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttemptsRef = useRef(0)

    const connectSocket = useCallback(() => {
        if (!orderId) return

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        const token = localStorage.getItem('token')
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: INITIAL_RECONNECT_DELAY,
            reconnectionDelayMax: 10000,
            timeout: 20000,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            console.log('🔌 Socket connected')
            reconnectAttemptsRef.current = 0
            setTrackingData(prev => ({
                ...prev,
                isConnected: true,
                error: null,
                reconnectAttempts: 0
            }))

            // Subscribe to order tracking
            socket.emit('track-order', orderId)
        })

        socket.on('tracking-started', (data: any) => {
            console.log('📡 Tracking started:', data)
        })

        socket.on('location-update', (update: LocationUpdate) => {
            console.log('📍 Location update received:', update)

            setTrackingData(prev => ({
                ...prev,
                deliveryLocation: {
                    lat: update.location.latitude,
                    lng: update.location.longitude,
                },
                eta: update.eta,
                distance: update.distance,
                status: update.status,
                lastUpdate: new Date(update.timestamp),
                error: null,
            }))
        })

        socket.on('disconnect', (reason: any) => {
            console.log('❌ Socket disconnected:', reason)
            setTrackingData(prev => ({ ...prev, isConnected: false }))

            // Attempt reconnection with exponential backoff
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                return // Don't auto-reconnect if intentionally disconnected
            }

            attemptReconnect()
        })

        socket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error)
            setTrackingData(prev => ({
                ...prev,
                isConnected: false,
                error: 'Failed to connect to tracking server'
            }))

            attemptReconnect()
        })

        socket.on('error', (error: any) => {
            console.error('Socket error:', error)
            setTrackingData(prev => ({
                ...prev,
                error: 'Tracking service error'
            }))
        })

        return socket
    }, [orderId])

    const attemptReconnect = useCallback(() => {
        reconnectAttemptsRef.current += 1

        if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
            console.log('❌ Max reconnection attempts reached')
            setTrackingData(prev => ({
                ...prev,
                error: 'Unable to connect. Please refresh the page.',
                reconnectAttempts: reconnectAttemptsRef.current
            }))
            return
        }

        const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1)
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)

        setTrackingData(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current
        }))

        reconnectTimeoutRef.current = setTimeout(() => {
            disconnectSocket()
            connectSocket()
        }, delay)
    }, [connectSocket])

    const disconnectSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        if (socketRef.current) {
            if (orderId) {
                socketRef.current.emit('stop-tracking', orderId)
            }
            socketRef.current.disconnect()
            socketRef.current = null
        }
    }, [orderId])

    const manualReconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0
        disconnectSocket()
        connectSocket()
    }, [connectSocket, disconnectSocket])

    useEffect(() => {
        if (!orderId) return

        const socket = connectSocket()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            disconnectSocket()
        }
    }, [orderId, connectSocket, disconnectSocket])

    return {
        ...trackingData,
        reconnect: manualReconnect,
        disconnect: disconnectSocket,
    }
}

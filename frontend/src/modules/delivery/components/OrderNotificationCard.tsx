import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderNotificationData } from '../../../services/api/delivery/deliveryOrderNotificationService';

interface OrderNotificationCardProps {
    notification: OrderNotificationData;
    onAccept: (orderId: string) => Promise<{ success: boolean; message: string }>;
    onReject: (orderId: string) => Promise<{ success: boolean; message: string; allRejected: boolean }>;
}

export default function OrderNotificationCard({
    notification,
    onAccept,
    onReject,
}: OrderNotificationCardProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // Initialize audio
    useEffect(() => {
        const audio = new Audio('/assets/sound/delivery-alert.mp3');
        audio.loop = true;
        audio.volume = 0.8;
        audioRef.current = audio;

        // Try to play audio (may be blocked by browser autoplay policy)
        const playAudio = async () => {
            try {
                await audio.play();
                setHasUserInteracted(true);
            } catch (error) {
                console.log('Audio autoplay blocked, will play on user interaction');
                // Audio will play when user interacts with the card
            }
        };

        playAudio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Play audio on user interaction if it was blocked
    const handleUserInteraction = async () => {
        if (!hasUserInteracted && audioRef.current) {
            try {
                await audioRef.current.play();
                setHasUserInteracted(true);
            } catch (error) {
                console.error('Failed to play audio:', error);
            }
        }
    };

    // Stop audio when component unmounts or notification is dismissed
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const handleAccept = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        try {
            const result = await onAccept(notification.orderId);
            if (!result.success) {
                alert(result.message || 'Failed to accept order');
                setIsProcessing(false);
                // Resume audio if accept failed
                if (audioRef.current && hasUserInteracted) {
                    audioRef.current.play().catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Failed to accept order');
            setIsProcessing(false);
            // Resume audio if accept failed
            if (audioRef.current && hasUserInteracted) {
                audioRef.current.play().catch(console.error);
            }
        }
    };

    const handleReject = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        try {
            const result = await onReject(notification.orderId);
            if (!result.success) {
                alert(result.message || 'Failed to reject order');
                setIsProcessing(false);
                // Resume audio if reject failed
                if (audioRef.current && hasUserInteracted) {
                    audioRef.current.play().catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error rejecting order:', error);
            alert('Failed to reject order');
            setIsProcessing(false);
            // Resume audio if reject failed
            if (audioRef.current && hasUserInteracted) {
                audioRef.current.play().catch(console.error);
            }
        }
    };

    const formatAddress = () => {
        const { address, city, state, pincode } = notification.deliveryAddress;
        return `${address}, ${city}${state ? `, ${state}` : ''} - ${pincode}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed top-4 right-4 z-50 w-full max-w-md"
                onClick={handleUserInteraction}
                onMouseEnter={handleUserInteraction}
                onTouchStart={handleUserInteraction}
            >
                <div className="bg-white rounded-xl shadow-2xl border-2 border-teal-500 p-6 mx-4">
                    {/* Header with pulsing indicator */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">New Order!</h3>
                        </div>
                        {!hasUserInteracted && (
                            <div className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                                Tap to enable sound
                            </div>
                        )}
                    </div>

                    {/* Order Information */}
                    <div className="space-y-3 mb-4">
                        <div>
                            <p className="text-sm text-neutral-600">Order Number</p>
                            <p className="text-lg font-semibold text-neutral-900">{notification.orderNumber}</p>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-600">Customer</p>
                            <p className="font-medium text-neutral-900">{notification.customerName}</p>
                            <p className="text-sm text-neutral-500">{notification.customerPhone}</p>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-600">Delivery Address</p>
                            <p className="text-sm text-neutral-900">{formatAddress()}</p>
                        </div>

                        <div>
                            <p className="text-sm text-neutral-600">Order Amount</p>
                            <p className="text-xl font-bold text-teal-600">₹{notification.total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Reject'}
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Accept'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}


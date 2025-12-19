import { useParams, Link, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Button from "../../components/ui/button"
import { useOrders } from "../../context/OrdersContext"
import { OrderStatus } from "../../types/order"

// Icon Components
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const Share2Icon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.48L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const HomeIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
)

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ChefHatIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 13h12M6 13c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2M6 13v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5" />
    <path d="M9 9V7a3 3 0 0 1 6 0v2" />
  </svg>
)

const ReceiptIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
)

const CircleSlashIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

// Delivery partner marker component
const DeliveryPartnerMarker = ({ isVisible }: { isVisible: boolean }) => {
  const [deliveryPos, setDeliveryPos] = useState({ left: 330, top: 190 });
  const [storePos, setStorePos] = useState({ left: 60, top: 70 });

  useEffect(() => {
    if (isVisible) {
      // Calculate delivery location position
      // Delivery marker is at right: 50px, bottom: 40px, width: 40px (w-10)
      // Partner marker is width: 32px (w-8)
      // We need to calculate the center position
      const timer = setTimeout(() => {
        const mapContainer = document.querySelector('[data-map-container]') as HTMLElement;
        const deliveryMarker = document.querySelector('[data-delivery-marker]') as HTMLElement;
        const storeMarker = document.querySelector('[data-store-marker]') as HTMLElement;
        if (mapContainer && deliveryMarker) {
          const containerRect = mapContainer.getBoundingClientRect();
          const markerRect = deliveryMarker.getBoundingClientRect();
          // Calculate center position of delivery marker relative to container
          const left = markerRect.left - containerRect.left + markerRect.width / 2 - 16; // 16px = half of partner marker (w-8)
          const top = markerRect.top - containerRect.top + markerRect.height / 2 - 16;
          setDeliveryPos({ left, top });
        }
        if (mapContainer && storeMarker) {
          const containerRect = mapContainer.getBoundingClientRect();
          const markerRect = storeMarker.getBoundingClientRect();
          // Calculate center position of store marker relative to container
          const left = markerRect.left - containerRect.left + markerRect.width / 2 - 16;
          const top = markerRect.top - containerRect.top + markerRect.height / 2 - 16;
          setStorePos({ left, top });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <motion.div
      className="absolute z-10"
      initial={{ x: storePos.left, y: storePos.top }}
      animate={{
        x: [
          storePos.left,
          storePos.left + (deliveryPos.left - storePos.left) * 0.3,
          storePos.left + (deliveryPos.left - storePos.left) * 0.7,
          deliveryPos.left,
          deliveryPos.left,
          storePos.left + (deliveryPos.left - storePos.left) * 0.7,
          storePos.left + (deliveryPos.left - storePos.left) * 0.3,
          storePos.left
        ],
        y: [
          storePos.top,
          storePos.top + (deliveryPos.top - storePos.top) * 0.3,
          storePos.top + (deliveryPos.top - storePos.top) * 0.7,
          deliveryPos.top,
          deliveryPos.top,
          storePos.top + (deliveryPos.top - storePos.top) * 0.7,
          storePos.top + (deliveryPos.top - storePos.top) * 0.3,
          storePos.top
        ]
      }}
      transition={{
        duration: 16, // Total duration for round trip
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.25, 0.5, 0.5, 0.625, 0.75, 0.875, 1] // Pause at delivery location
      }}
    >
      <div className="w-8 h-8 bg-green-700 rounded-full shadow-lg flex items-center justify-center">
        <span className="text-white text-xs">🛵</span>
      </div>
    </motion.div>
  );
};

// Animated checkmark component
const AnimatedCheckmark = ({ delay = 0 }) => (
  <motion.svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    initial="hidden"
    animate="visible"
    className="mx-auto"
  >
    <motion.circle
      cx="40"
      cy="40"
      r="36"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    />
    <motion.path
      d="M24 40 L35 51 L56 30"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: delay + 0.4, ease: "easeOut" }}
    />
  </motion.svg>
)

// Map placeholder component with animated route
const DeliveryMap = ({ isVisible }: { isVisible: boolean }) => (
  <motion.div
    data-map-container
    className="relative h-64 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: isVisible ? 1 : 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Stylized map background */}
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px'
    }} />

    {/* Roads */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256">
      {/* Main roads */}
      <path d="M0 128 L400 128" stroke="#e5e7eb" strokeWidth="12" fill="none" />
      <path d="M200 0 L200 256" stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <path d="M0 64 L400 200" stroke="#e5e7eb" strokeWidth="6" fill="none" />

      {/* Animated delivery route */}
      <motion.path
        d="M60 70 Q 120 90, 160 120 T 280 160 T 340 200"
        stroke="#166534"
        strokeWidth="3"
        strokeDasharray="8 4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isVisible ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
      />
    </svg>
    {/* Store marker */}
    <motion.div
      data-store-marker
      className="absolute flex items-center justify-center"
      style={{ left: '50px', top: '50px' }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: isVisible ? 1 : 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
    >
      <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-700">
        <HomeIcon className="w-5 h-5 text-green-700" />
      </div>
    </motion.div>
    {/* Delivery location marker */}
    <motion.div
      data-delivery-marker
      className="absolute flex flex-col items-center"
      style={{ right: '50px', bottom: '40px' }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: isVisible ? 1 : 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
    >
      <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-700">
        <MapPinIcon className="w-5 h-5 text-green-700" />
      </div>
    </motion.div>
    {/* Delivery partner marker (animated along route) */}
    {isVisible && (
      <DeliveryPartnerMarker isVisible={isVisible} />
    )}
    {/* Expand button */}
    <motion.button
      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </motion.button>
    {/* Current location button */}
    <motion.button
      className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-6 h-6 rounded-full border-2 border-green-600 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-green-600" />
      </div>
    </motion.button>
    {/* Google attribution */}
    <div className="absolute bottom-3 left-3 text-xs text-gray-500 font-medium">
      Google
    </div>
  </motion.div>
)

// Promotional banner carousel
const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const promos = [
    {
      bank: "HDFC BANK",
      offer: "10% cashback on all orders",
      subtext: "Extraordinary Rewards | Zero Joining Fee | T&C apply",
      color: "from-blue-50 to-indigo-50"
    },
    {
      bank: "ICICI BANK",
      offer: "15% instant discount",
      subtext: "Valid on orders above ₹299 | Use code ICICI15",
      color: "from-orange-50 to-red-50"
    },
    {
      bank: "SBI CARD",
      offer: "Flat ₹75 off",
      subtext: "On all orders | No minimum order value",
      color: "from-purple-50 to-pink-50"
    },
    {
      bank: "AXIS BANK",
      offer: "20% cashback up to ₹100",
      subtext: "Valid on first order | T&C apply",
      color: "from-teal-50 to-cyan-50"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r ${promos[currentSlide].color}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
                  {promos[currentSlide].bank}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{promos[currentSlide].offer}</p>
              <p className="text-xs text-gray-600 mt-1">{promos[currentSlide].subtext}</p>
              <button className="text-green-700 font-medium text-sm mt-2 flex items-center gap-1">
                Apply now <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-3">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-green-600 w-4' : 'bg-gray-300'
              }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Tip selection component
const TipSection = () => {
  const [selectedTip, setSelectedTip] = useState<number | 'other' | null>(null)
  const [customTip, setCustomTip] = useState('')
  const tips = [20, 30, 50]

  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <p className="text-gray-700 text-sm mb-3">
        Make their day by leaving a tip. 100% of the amount will go to them after delivery
      </p>
      <div className="flex gap-3">
        {tips.map((tip) => (
          <motion.button
            key={tip}
            onClick={() => {
              setSelectedTip(tip)
              setCustomTip('')
            }}
            className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedTip === tip
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            ₹{tip}
          </motion.button>
        ))}
        <motion.button
          onClick={() => {
            setSelectedTip('other')
          }}
          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedTip === 'other'
            ? 'border-green-600 bg-green-50 text-green-700'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          whileTap={{ scale: 0.95 }}
        >
          Other
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedTip === 'other' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="mt-3 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Section item component
const SectionItem = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  showArrow = true,
  rightContent
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  showArrow?: boolean;
  rightContent?: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-dashed border-gray-200 last:border-0"
    whileTap={{ scale: 0.99 }}
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
    </div>
    {rightContent || (showArrow && <ChevronRightIcon className="w-5 h-5 text-gray-400" />)}
  </motion.button>
)

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const confirmed = searchParams.get("confirmed") === "true"
  const { getOrderById, loading } = useOrders()
  const order = id ? getOrderById(id) : undefined

  const [showConfirmation, setShowConfirmation] = useState(confirmed)
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order?.status || 'Placed')
  const [estimatedTime, setEstimatedTime] = useState(29)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update orderStatus when order changes
  useEffect(() => {
    if (order) {
      setOrderStatus(order.status)
    }
  }, [order])

  // Simulate order status progression
  useEffect(() => {
    if (confirmed && order) {
      const timer1 = setTimeout(() => {
        setShowConfirmation(false)
        setOrderStatus('Accepted')
      }, 3000)
      return () => clearTimeout(timer1)
    }
  }, [confirmed, order])

  // Countdown timer
  useEffect(() => {
    if (orderStatus === 'Accepted' || orderStatus === 'On the way') {
      const timer = setInterval(() => {
        setEstimatedTime((prev) => Math.max(0, prev - 1))
      }, 60000)
      return () => clearInterval(timer)
    }
  }, [orderStatus])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-sm text-neutral-500">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig: Record<OrderStatus, { title: string; subtitle: string; color: string }> = {
    'Placed': {
      title: "Order placed",
      subtitle: "Order will reach you shortly",
      color: "bg-green-700"
    },
    'Accepted': {
      title: "Preparing your order",
      subtitle: `Arriving in ${estimatedTime} mins`,
      color: "bg-green-700"
    },
    'On the way': {
      title: "Order picked up",
      subtitle: `Arriving in ${estimatedTime} mins`,
      color: "bg-green-700"
    },
    'Delivered': {
      title: "Order delivered",
      subtitle: "Enjoy your meal!",
      color: "bg-green-600"
    }
  }

  const currentStatus = statusConfig[orderStatus]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Order Confirmed Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center px-8"
            >
              <AnimatedCheckmark delay={0.3} />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-2xl font-bold text-gray-900 mt-6"
              >
                Order Confirmed!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-gray-600 mt-2"
              >
                Your order has been placed successfully
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8"
              >
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-3">Loading order details...</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Green Header */}
      <motion.div
        className={`${currentStatus.color} text-white sticky top-0 z-40`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Navigation bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/orders">
            <motion.button
              className="w-10 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </motion.button>
          </Link>
          <h2 className="font-semibold text-lg">SpeeUp</h2>
          <motion.button
            className="w-10 h-10 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Share2Icon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Status section */}
        <div className="px-4 pb-4 text-center">
          <motion.h1
            className="text-2xl font-bold mb-3"
            key={currentStatus.title}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentStatus.title}
          </motion.h1>

          {/* Status pill */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm">{currentStatus.subtitle}</span>
            {(orderStatus === 'Accepted' || orderStatus === 'On the way') && (
              <>
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="text-sm text-green-200">On time</span>
              </>
            )}
            <motion.button
              onClick={handleRefresh}
              className="ml-1"
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCwIcon className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Map Section */}
      <DeliveryMap isVisible={!showConfirmation} />

      {/* Scrollable Content */}
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Payment Pending */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                Payment of ₹{order.totalAmount?.toFixed(0) || '0'} pending
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pay now, or pay to the delivery partner using Cash/UPI
              </p>
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
              Pay now <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Delivery Partner Assignment */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <p className="font-semibold text-gray-900">Assigning delivery partner shortly</p>
          </div>
        </motion.div>

        {/* Tip Section */}
        <TipSection />

        {/* Delivery Partner Safety */}
        <motion.button
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.99 }}
        >
          <ShieldIcon className="w-6 h-6 text-gray-600" />
          <span className="flex-1 text-left font-medium text-gray-900">
            Learn about delivery partner safety
          </span>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </motion.button>

        {/* Delivery Details Banner */}
        <motion.div
          className="bg-yellow-50 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <p className="text-yellow-800 font-medium">
            All your delivery details in one place 👇
          </p>
        </motion.div>

        {/* Contact & Address Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SectionItem
            icon={PhoneIcon}
            title={`${order.address?.name || 'Customer'}, ${order.address?.phone || '9XXXXXXXX'}`}
            subtitle="Delivery partner may call this number"
            rightContent={
              <span className="text-green-600 font-medium text-sm">Edit</span>
            }
          />
          <SectionItem
            icon={HomeIcon}
            title="Delivery at Home"
            subtitle={order.address ?
              `${order.address.street}, ${order.address.city}` :
              'Add delivery address'
            }
            rightContent={
              <span className="text-green-600 font-medium text-sm">Edit</span>
            }
          />
          <SectionItem
            icon={MessageSquareIcon}
            title="Add delivery instructions"
            subtitle=""
          />
        </motion.div>

        {/* Store Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <div className="flex items-center gap-3 p-4 border-b border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">SpeeUp Store</p>
              <p className="text-sm text-gray-500">{order.address?.city || 'Local Area'}</p>
            </div>
            <motion.button
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <PhoneIcon className="w-5 h-5 text-green-700" />
            </motion.button>
          </div>

          {/* Order Items */}
          <div className="p-4 border-b border-dashed border-gray-200">
            <div className="flex items-start gap-3">
              <ReceiptIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Order #{order.id.split('-').slice(-1)[0]}</p>
                <div className="mt-2 space-y-1">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded border border-green-600 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-600" />
                      </span>
                      <span>{item.quantity} x {item.product.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <SectionItem
            icon={ChefHatIcon}
            title="Add special requests"
            subtitle=""
          />
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 p-4 border-b border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <HelpCircleIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Need help with your order?</p>
              <p className="text-sm text-gray-500">Get help & support</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <SectionItem
            icon={CircleSlashIcon}
            title="Cancel order"
            subtitle=""
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Link to={`/orders/${id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              View Invoice
            </Button>
          </Link>
          <Link to="/orders" className="flex-1">
            <Button variant="outline" className="w-full border-gray-300">
              All Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

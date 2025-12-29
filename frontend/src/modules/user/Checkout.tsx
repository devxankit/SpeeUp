import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../hooks/useOrders';
import { useLocation as useLocationContext } from '../../hooks/useLocation';
// import { products } from '../../data/products'; // Removed
import { OrderAddress, Order } from '../../types/order';
import Toast from '../../components/Toast';
import PartyPopper from './components/PartyPopper';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '../../components/ui/sheet';
import WishlistButton from '../../components/WishlistButton';

import { getCoupons, validateCoupon, Coupon as ApiCoupon } from '../../services/api/customerCouponService';
import { appConfig } from '../../services/configService';
import { getAddresses } from '../../services/api/customerAddressService';
import { getProducts } from '../../services/api/customerProductService';

// const STORAGE_KEY = 'saved_address'; // Removed

// Similar products helper removed - using API


export default function Checkout() {
  const { cart, updateQuantity, clearCart, addToCart, loading: cartLoading } = useCart();
  const { addOrder } = useOrders();
  const { location: userLocation } = useLocationContext();
  const navigate = useNavigate();
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(5);
  const [showDonationInput, setShowDonationInput] = useState(false);
  const [savedAddress, setSavedAddress] = useState<OrderAddress | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ApiCoupon | null>(null);
  const [showPartyPopper, setShowPartyPopper] = useState(false);
  const [hasAppliedCouponBefore, setHasAppliedCouponBefore] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<ApiCoupon[]>([]);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatedDiscount, setValidatedDiscount] = useState<number>(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  // Redirect if empty
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0 && !showToast && !showOrderSuccess) {
      navigate('/');
    }
  }, [cart.items.length, cartLoading, showToast, navigate, showOrderSuccess]);

  // Load addresses and coupons
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [addressResponse, couponResponse] = await Promise.all([
          getAddresses(),
          getCoupons()
        ]);

        if (addressResponse.success && Array.isArray(addressResponse.data) && addressResponse.data.length > 0) {
          const defaultAddr = addressResponse.data.find((a: any) => a.isDefault) || addressResponse.data[0];
          const mappedAddress: OrderAddress = {
            name: defaultAddr.fullName,
            phone: defaultAddr.phone,
            flat: '',
            street: defaultAddr.address,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            landmark: defaultAddr.landmark || '',
            latitude: defaultAddr.latitude,
            longitude: defaultAddr.longitude,
            id: defaultAddr._id,
            _id: defaultAddr._id
          };
          setSavedAddress(mappedAddress);
          setSelectedAddress(mappedAddress);
        }

        if (couponResponse.success) {
          setAvailableCoupons(couponResponse.data);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch similar products dynamically
  useEffect(() => {
    const fetchSimilar = async () => {
      const items = (cart?.items || []).filter(item => item && item.product);
      if (items.length === 0) return;

      const cartItem = items[0];
      try {
        let response;
        if (cartItem && cartItem.product) {
          // Try to fetch by category of the first item
          let catId = '';
          const product = cartItem.product;

          if (product.categoryId) {
            catId = typeof product.categoryId === 'string'
              ? product.categoryId
              : (product.categoryId as any)._id || (product.categoryId as any).id;
          }

          if (catId) {
            response = await getProducts({ category: catId, limit: 10 });
          } else {
            response = await getProducts({ limit: 10, sort: 'popular' });
          }
        } else {
          response = await getProducts({ limit: 10, sort: 'popular' });
        }

        if (response && response.data) {
          // Filter out items already in cart
          const itemsInCartIds = new Set((cart?.items || []).map(i => i.product?.id).filter(Boolean));
          const filtered = response.data.filter((p: any) => !itemsInCartIds.has(p.id || p._id)).slice(0, 6);
          setSimilarProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch similar products", err);
      }
    };
    fetchSimilar();
  }, [cart?.items?.length]);

  if (cartLoading || ((cart?.items?.length || 0) === 0 && !showOrderSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-neutral-600">
            {cartLoading ? 'Loading checkout...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  const displayItems = (cart?.items || []).filter(item => item && item.product);
  const displayCart = {
    ...cart,
    items: displayItems,
    itemCount: displayItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    total: displayItems.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0)
  };

  const amountNeededForFreeDelivery = Math.max(0, appConfig.freeDeliveryThreshold - (displayCart.total || 0));
  const cartItem = displayItems[0];

  const itemsTotal = displayItems.reduce((sum, item) => {
    if (!item?.product) return sum;
    const itemPrice = item.product.mrp && item.product.mrp > item.product.price
      ? item.product.mrp
      : item.product.price || 0;
    return sum + (itemPrice * (item.quantity || 0));
  }, 0);

  const discountedTotal = displayCart.total;
  const savedAmount = itemsTotal - discountedTotal;
  const handlingCharge = appConfig.platformFee;
  const deliveryCharge = displayCart.total >= appConfig.freeDeliveryThreshold ? 0 : appConfig.deliveryFee;

  // Recalculate or use validated discount
  // If we have a selected coupon, we should re-validate if cart total changes,
  // but for simplicity, we'll re-calculate locally if possible or trust the previous validation if acceptable (better to re-validate)
  const subtotalBeforeCoupon = discountedTotal + handlingCharge + deliveryCharge;

  // Local calculation for immediate feedback, relying on backend validation on Apply
  let currentCouponDiscount = 0;
  if (selectedCoupon) {
    // Logic mirrors backend for UI update purposes
    if (selectedCoupon.minOrderValue && subtotalBeforeCoupon < selectedCoupon.minOrderValue) {
      // Invalid now
    } else {
      if (selectedCoupon.discountType === 'percentage') {
        currentCouponDiscount = Math.round((subtotalBeforeCoupon * selectedCoupon.discountValue) / 100);
        if (selectedCoupon.maxDiscountAmount && currentCouponDiscount > selectedCoupon.maxDiscountAmount) {
          currentCouponDiscount = selectedCoupon.maxDiscountAmount;
        }
      } else {
        currentCouponDiscount = selectedCoupon.discountValue;
      }
    }
  }

  const grandTotal = Math.max(0, discountedTotal + handlingCharge + deliveryCharge + (tipAmount || 0) + (showDonationInput ? donationAmount : 0) - currentCouponDiscount);

  const handleApplyCoupon = async (coupon: ApiCoupon) => {
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(coupon.code, subtotalBeforeCoupon);
      if (result.success && result.data?.isValid) {
        const isFirstTime = !hasAppliedCouponBefore;
        setSelectedCoupon(coupon);
        setValidatedDiscount(result.data.discountAmount);
        setShowCouponSheet(false);
        if (isFirstTime) {
          setHasAppliedCouponBefore(true);
          setShowPartyPopper(true);
        }
      } else {
        setCouponError(result.message || 'Invalid coupon');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setValidatedDiscount(0);
    setCouponError(null);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || cart.items.length === 0) {
      return;
    }

    // Validate required address fields
    if (!selectedAddress.city || !selectedAddress.pincode) {
      console.error("Address is missing required fields (city or pincode)");
      alert("Please ensure your address has city and pincode.");
      return;
    }

    // Use user's current location as fallback if address doesn't have coordinates
    const finalLatitude = selectedAddress.latitude ?? userLocation?.latitude;
    const finalLongitude = selectedAddress.longitude ?? userLocation?.longitude;

    // Validate that we have location data (either from address or user's current location)
    if (!finalLatitude || !finalLongitude) {
      console.error("Address is missing location data (latitude/longitude) and user location is not available");
      alert("Location is required for delivery. Please ensure your address has location data or enable location access.");
      return;
    }

    // Create address object with location data (use fallback if needed)
    const addressWithLocation: OrderAddress = {
      ...selectedAddress,
      latitude: finalLatitude,
      longitude: finalLongitude,
    };

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const order: Order = {
      id: orderId,
      items: cart.items,
      totalItems: cart.itemCount,
      subtotal: discountedTotal,
      fees: {
        platformFee: handlingCharge,
        deliveryFee: deliveryCharge,
      },
      totalAmount: grandTotal,
      address: addressWithLocation,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      // In a real app, send coupon code to backend to re-validate and apply
    };

    try {
      const placedId = await addOrder(order);
      if (placedId) {
        setPlacedOrderId(placedId);
        clearCart();
        setShowOrderSuccess(true);
      }
    } catch (error: any) {
      console.error("Order placement failed", error);
      // Show user-friendly error message
      const errorMessage = error.message || error.response?.data?.message || "Failed to place order. Please try again.";
      alert(errorMessage);
    }
  };

  const handleGoToOrders = () => {
    if (placedOrderId) {
      navigate(`/orders/${placedOrderId}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div
      className="pb-24 bg-white min-h-screen flex flex-col opacity-100"
      style={{ opacity: 1 }}
    >
      {/* Toast Notification */}
      <Toast
        message="Order placed"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      {/* Party Popper Animation */}
      <PartyPopper
        show={showPartyPopper}
        onComplete={() => setShowPartyPopper(false)}
      />

      {/* Order Success Celebration Page */}
      {showOrderSuccess && (
        <div
          className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center h-screen w-screen overflow-hidden"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated confetti pieces */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                  animation: `confettiFall ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Success Content */}
          <div className="relative z-10 flex flex-col items-center px-6">
            {/* Success Tick Circle */}
            <div
              className="relative mb-8"
              style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}
            >
              {/* Outer ring animation */}
              <div
                className="absolute inset-0 w-32 h-32 rounded-full border-4 border-green-500"
                style={{
                  animation: 'ringPulse 1.5s ease-out infinite',
                  opacity: 0.3
                }}
              />
              {/* Main circle */}
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="w-16 h-16 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'checkDraw 0.5s ease-out 0.5s both' }}
                >
                  <path d="M5 12l5 5L19 7" className="check-path" />
                </svg>
              </div>
              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    animation: `sparkle 0.6s ease-out ${0.3 + i * 0.1}s both`,
                    transform: `rotate(${i * 60}deg) translateY(-80px)`,
                  }}
                />
              ))}
            </div>

            {/* Location Info */}
            <div
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out 0.6s both' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-5 h-5 text-red-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAddress?.city || "Your Location"}
                </h2>
              </div>
              <p className="text-gray-500 text-base">
                {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : "Delivery Address"}
              </p>
            </div>

            {/* Order Placed Message */}
            <div
              className="mt-12 text-center"
              style={{ animation: 'slideUp 0.5s ease-out 0.8s both' }}
            >
              <h3 className="text-3xl font-bold text-green-600 mb-2">Order Placed!</h3>
              <p className="text-gray-600">Your order is on the way</p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGoToOrders}
              className="mt-10 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
              style={{ animation: 'slideUp 0.5s ease-out 1s both' }}
            >
              Track Your Order
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between">
          {/* Back Arrow */}
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Title */}
          <h1 className="text-base font-bold text-neutral-900">Checkout</h1>

          {/* Share Icon */}
          <button
            className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ordering for someone else */}
      <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-700">Ordering for someone else?</span>
          <button
            onClick={() => navigate('/checkout/address')}
            className="text-xs text-green-600 font-medium hover:text-green-700 transition-colors"
          >
            Add details
          </button>
        </div>
      </div>

      {/* Saved Address Section */}
      {savedAddress && (
        <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 border-b border-neutral-200">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-neutral-900 mb-0.5">Delivery Address</h3>
            <p className="text-[10px] text-neutral-600">Select or edit your saved address</p>
          </div>

          <div
            className={`border rounded-lg p-2.5 cursor-pointer transition-all ${selectedAddress ? 'border-green-600 bg-green-50' : 'border-neutral-300 bg-white'
              }`}
            onClick={() => setSelectedAddress(savedAddress)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress ? 'border-green-600 bg-green-600' : 'border-neutral-400'
                    }`}>
                    {selectedAddress && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">{savedAddress.name}</span>
                </div>
                <p className="text-[10px] text-neutral-600 mb-0.5">{savedAddress.phone}</p>
                <p className="text-[10px] text-neutral-600">
                  {savedAddress.flat}, {savedAddress.street}, {savedAddress.city} - {savedAddress.pincode}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/checkout/address');
                }}
                className="text-xs text-green-600 font-medium ml-2"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Card */}
      <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 bg-white border-b border-neutral-200">
        <div className="bg-white rounded-lg border border-neutral-200 p-2.5">
          {/* Delivery info */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-neutral-900">Delivery in {appConfig.estimatedDeliveryTime}</span>
          </div>

          <p className="text-[10px] text-neutral-600 mb-2.5">Shipment of {displayCart.itemCount || 0} {(displayCart.itemCount || 0) === 1 ? 'item' : 'items'}</p>

          {/* Cart Items */}
          <div className="space-y-2.5">
            {displayItems.filter(item => item.product).map((item) => (
              <div key={item.product?.id || Math.random()} className="flex gap-2">
                {/* Product Image */}
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      {(item.product?.name || '').charAt(0)}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-neutral-900 mb-0.5 line-clamp-2">
                    {item.product?.name}
                  </h3>
                  <p className="text-[10px] text-neutral-600 mb-0.5">{item.quantity} × {item.product?.pack}</p>
                  <button className="text-[10px] text-green-600 font-medium mb-1.5">Move to wishlist</button>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 bg-white border-2 border-green-600 rounded-full px-1.5 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.product?.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-green-600 font-bold hover:bg-green-50 rounded-full transition-colors text-xs"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-green-600 min-w-[1.25rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product?.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-green-600 font-bold hover:bg-green-50 rounded-full transition-colors text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1.5">
                      {item.product?.mrp && item.product?.mrp > item.product?.price && (
                        <span className="text-[10px] text-neutral-500 line-through">
                          ₹{item.product?.mrp}
                        </span>
                      )}
                      <span className="text-sm font-bold text-neutral-900">
                        ₹{item.product?.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* You might also like */}
      <div className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 border-b border-neutral-200">
        <h2 className="text-sm font-semibold text-neutral-900 mb-2">You might also like</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3" style={{ scrollSnapType: 'x mandatory' }}>
          {similarProducts.map((product) => {
            // Calculate discount
            const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

            // Get quantity in cart
            const inCartItem = (cart?.items || []).find(item =>
              (item.product.id && item.product.id === product.id) ||
              (item.product._id && item.product._id === product._id) ||
              (item.product._id && item.product._id === product.id) ||
              (item.product.id && item.product.id === product._id)
            );
            const inCartQty = inCartItem?.quantity || 0;

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[140px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-white rounded-lg overflow-hidden flex flex-col relative h-full" style={{ boxShadow: '0 1px 1px rgba(0, 0, 0, 0.03)' }}>
                  {/* Product Image Area */}
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="relative block cursor-pointer"
                  >
                    <div className="w-full h-28 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-4xl">
                          {(product.name || '').charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Red Discount Badge - Top Left */}
                      {discount > 0 && (
                        <div className="absolute top-1 left-1 z-10 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                          {discount}% OFF
                        </div>
                      )}

                      {/* Heart Icon - Top Right */}
                      <WishlistButton
                        productId={product.id}
                        size="sm"
                        className="top-1 right-1 shadow-sm"
                      />

                      {/* ADD Button or Quantity Stepper - Overlaid on bottom right of image */}
                      <div className="absolute bottom-1.5 right-1.5 z-10">
                        <AnimatePresence mode="wait">
                          {inCartQty === 0 ? (
                            <motion.button
                              key="add-button"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product, e.currentTarget);
                              }}
                              className="bg-white/95 backdrop-blur-sm text-green-600 border-2 border-green-600 text-[10px] font-semibold px-2 py-1 rounded shadow-md hover:bg-white transition-colors"
                            >
                              ADD
                            </motion.button>
                          ) : (
                            <motion.div
                              key="stepper"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-1 bg-green-600 rounded px-1.5 py-1 shadow-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateQuantity(product.id, inCartQty - 1);
                                }}
                                className="w-4 h-4 flex items-center justify-center text-white font-bold hover:bg-green-700 rounded transition-colors p-0 leading-none"
                                style={{ lineHeight: 1, fontSize: '14px' }}
                              >
                                <span className="relative top-[-1px]">−</span>
                              </motion.button>
                              <motion.span
                                key={inCartQty}
                                initial={{ scale: 1.2, y: -2 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                className="text-white font-bold min-w-[0.75rem] text-center"
                                style={{ fontSize: '12px' }}
                              >
                                {inCartQty}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateQuantity(product.id, inCartQty + 1);
                                }}
                                className="w-4 h-4 flex items-center justify-center text-white font-bold hover:bg-green-700 rounded transition-colors p-0 leading-none"
                                style={{ lineHeight: 1, fontSize: '14px' }}
                              >
                                <span className="relative top-[-1px]">+</span>
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-1.5 flex-1 flex flex-col bg-white">
                    {/* Light Grey Tags */}
                    <div className="flex gap-0.5 mb-0.5">
                      <div className="bg-neutral-200 text-neutral-700 text-[8px] font-medium px-1 py-0.5 rounded">
                        {product.pack || '1 unit'}
                      </div>
                      {product.pack && (product.pack.includes('g') || product.pack.includes('kg')) && (
                        <div className="bg-neutral-200 text-neutral-700 text-[8px] font-medium px-1 py-0.5 rounded">
                          {product.pack.replace(/[gk]/gi, '').trim()} GSM
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="mb-0.5 cursor-pointer"
                    >
                      <h3 className="text-[10px] font-bold text-neutral-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill={i < 4 ? '#fbbf24' : '#e5e7eb'}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[8px] text-neutral-500">(85)</span>
                    </div>

                    {/* Delivery Time */}
                    <div className="text-[9px] text-neutral-600 mb-0.5">
                      20 MINS
                    </div>

                    {/* Discount - Blue Text */}
                    {discount > 0 && (
                      <div className="text-[9px] text-blue-600 font-semibold mb-0.5">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[13px] font-bold text-neutral-900">
                          ₹{(product.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-neutral-400 line-through">
                          ₹{(product.mrp || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Link */}
                    <div
                      onClick={() => navigate(`/category/${product.categoryId || 'all'}`)}
                      className="w-full bg-green-100 text-green-700 text-[8px] font-medium py-0.5 rounded-lg flex items-center justify-between px-1 hover:bg-green-200 transition-colors mt-auto cursor-pointer"
                    >
                      <span>See more like this</span>
                      <div className="flex items-center gap-0.5">
                        <div className="w-px h-2 bg-green-300"></div>
                        <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0L8 4L0 8Z" fill="#16a34a" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Get FREE delivery banner */}
      {deliveryCharge > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13h14M5 13l4-4m-4 4l4 4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="5" r="2" fill="#3b82f6" />
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">Get FREE delivery</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[10px] text-blue-600 mt-0.5">Add products worth ₹{amountNeededForFreeDelivery} more</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(100, ((199 - amountNeededForFreeDelivery) / 199) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Coupon Section */}
      {selectedCoupon ? (
        <div className="px-4 py-1.5 border-b border-neutral-200">
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-2 border border-green-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-700 truncate">{selectedCoupon.code}</p>
                <p className="text-[10px] text-green-600 truncate">{selectedCoupon.title}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-green-600 font-medium ml-2 flex-shrink-0"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-1.5 flex justify-end border-b border-neutral-200">
          <button
            onClick={() => setShowCouponSheet(true)}
            className="text-xs text-neutral-600 flex items-center gap-1"
          >
            See all coupons
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Bill details */}
      <div className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 border-b border-neutral-200">
        <h2 className="text-base font-bold text-neutral-900 mb-2.5">Bill details</h2>

        <div className="space-y-2">
          {/* Items total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-700">Items total</span>
              {savedAmount > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                  Saved ₹{savedAmount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {itemsTotal > discountedTotal && (
                <span className="text-xs text-neutral-500 line-through">₹{itemsTotal}</span>
              )}
              <span className="text-xs font-medium text-neutral-900">₹{discountedTotal}</span>
            </div>
          </div>

          {/* Handling charge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <span className="text-xs text-neutral-700">Handling charge</span>
            </div>
            <span className="text-xs font-medium text-neutral-900">₹{handlingCharge}</span>
          </div>

          {/* Delivery charge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="5.5" cy="18.5" r="1.5" fill="currentColor" />
                <circle cx="18.5" cy="18.5" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-xs text-neutral-700">Delivery charge</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs font-medium ${deliveryCharge === 0 ? 'text-green-600' : 'text-neutral-900'}`}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
              {deliveryCharge > 0 && (
                <span className="text-[10px] text-orange-600 mt-0.5">
                  Shop for ₹{Math.max(0, appConfig.freeDeliveryThreshold - displayCart.total)} more to get FREE delivery
                </span>
              )}
            </div>
          </div>

          {/* Coupon discount */}
          {selectedCoupon && currentCouponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs text-neutral-700">Coupon discount</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                  {selectedCoupon.code}
                </span>
              </div>
              <span className="text-xs font-medium text-green-600">-₹{currentCouponDiscount}</span>
            </div>
          )}

          {/* Grand total */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-sm font-bold text-neutral-900">Grand total</span>
            <span className="text-sm font-bold text-neutral-900">₹{Math.max(0, grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Add GSTIN */}
      <div className="px-4 py-2 border-b border-neutral-200">
        <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">%</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Add GSTIN</p>
              <p className="text-[10px] text-neutral-600">Claim GST input credit up to 18% on your order</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Donate to Feeding India */}
      <div className="px-4 py-2 border-b border-neutral-200">
        <div className="bg-pink-50 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900">Donate to Feeding India</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs text-neutral-600 mb-2">Your continued support will help us serve daily meals to children</p>

          <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-white rounded-lg p-1.5 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-lg">👦</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-700">Donation amount</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0) {
                    setDonationAmount(val);
                  }
                }}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < 1) {
                    setDonationAmount(1);
                  }
                }}
                className="w-16 px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs text-center text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"
                min="1"
                step="1"
                placeholder="5"
              />
              <button
                onClick={() => setShowDonationInput(!showDonationInput)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showDonationInput
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                {showDonationInput ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tip your delivery partner */}
      <div className="px-4 py-2 border-b border-neutral-200">
        <h3 className="text-sm font-bold text-neutral-900 mb-0.5">Tip your delivery partner</h3>
        <p className="text-xs text-neutral-600 mb-2">Your kindness means a lot! 100% of your tip will go directly to your delivery partner.</p>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1.5">
          <button
            onClick={() => setTipAmount(20)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border-2 font-medium text-xs ${tipAmount === 20
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-neutral-300 bg-white text-neutral-700'
              }`}
          >
            😊 ₹20
          </button>
          <button
            onClick={() => setTipAmount(30)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border-2 font-medium text-xs ${tipAmount === 30
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-neutral-300 bg-white text-neutral-700'
              }`}
          >
            🤩 ₹30
          </button>
          <button
            onClick={() => setTipAmount(50)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border-2 font-medium text-xs ${tipAmount === 50
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-neutral-300 bg-white text-neutral-700'
              }`}
          >
            😍 ₹50
          </button>
          <button
            onClick={() => setTipAmount(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border-2 font-medium text-xs ${tipAmount === null
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-neutral-300 bg-white text-neutral-700'
              }`}
          >
            🎁 Custom
          </button>
        </div>
      </div>

      {/* Gift Packaging */}
      <div className="px-4 py-2 border-b border-neutral-200">
        <div className="flex items-center justify-between bg-neutral-50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Gift Packaging</p>
              <p className="text-[10px] text-neutral-600">All items in your cart are ineligible for gifting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="px-4 py-2">
        <button className="text-xs text-neutral-700">Cancellation Policy</button>
      </div>

      {/* Made with love by SpeeUp - Expanded to fill bottom */}
      <div className="px-4 flex-1 flex items-end pb-4">
        <div className="w-full flex flex-col items-center justify-center py-6">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="text-[10px] font-medium">Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              className="text-red-500 text-sm"
            >
              ❤️
            </motion.span>
            <span className="text-[10px] font-medium">by</span>
            <span className="text-[10px] font-semibold text-green-600">SpeeUp</span>
          </div>
        </div>
      </div>

      {/* Coupon Sheet Modal */}
      <Sheet open={showCouponSheet} onOpenChange={setShowCouponSheet}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader className="text-left">
            <div className="flex items-center justify-between mb-2">
              <SheetTitle className="text-base font-bold text-neutral-900">Available Coupons</SheetTitle>
              <SheetClose onClick={() => setShowCouponSheet(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="space-y-2.5 mt-2">
              {availableCoupons.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No coupons available at the moment.</p>
                </div>
              ) : (
                availableCoupons.map((coupon) => {
                  const subtotalBeforeCoupon = discountedTotal + handlingCharge + deliveryCharge;
                  const meetsMinOrder = !coupon.minOrderValue || subtotalBeforeCoupon >= coupon.minOrderValue;
                  const isSelected = selectedCoupon?._id === coupon._id;

                  return (
                    <div
                      key={coupon._id}
                      className={`border-2 rounded-lg p-2.5 transition-all ${isSelected
                        ? 'border-green-600 bg-green-50'
                        : meetsMinOrder
                          ? 'border-neutral-200 bg-white'
                          : 'border-neutral-200 bg-neutral-50 opacity-60'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-green-600">{coupon.code}</span>
                            <span className="text-xs font-semibold text-neutral-900">{coupon.title}</span>
                          </div>
                          <p className="text-[10px] text-neutral-600 mb-1">{coupon.description}</p>
                          {coupon.minOrderValue && (
                            <p className="text-[10px] text-neutral-500">
                              Min. order: ₹{coupon.minOrderValue}
                            </p>
                          )}
                        </div>
                        {isSelected ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-medium">Applied</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => meetsMinOrder && handleApplyCoupon(coupon)}
                            disabled={!meetsMinOrder || isValidatingCoupon}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${meetsMinOrder
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                              }`}
                          >
                            {isValidatingCoupon ? '...' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-[60] shadow-lg">
        {selectedAddress ? (
          <button
            onClick={handlePlaceOrder}
            disabled={cart.items.length === 0}
            className={`w-full py-3 px-4 font-bold text-sm uppercase tracking-wide transition-colors ${cart.items.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
          >
            Place Order
          </button>
        ) : (
          <button
            onClick={() => navigate('/checkout/address')}
            className="w-full bg-green-600 text-white py-3 px-4 font-bold text-sm uppercase tracking-wide hover:bg-green-700 transition-colors"
          >
            Choose address at next step
          </button>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkDraw {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(1);
            opacity: 0;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .check-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
        }
      `}</style>
    </div>
  );
}

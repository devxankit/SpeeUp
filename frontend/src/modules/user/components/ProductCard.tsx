import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { Product } from '../../../types/domain';
import { useCart } from '../../../context/CartContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../../../services/api/customerWishlistService';
import Button from '../../../components/ui/button';
import Badge from '../../../components/ui/badge';

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
  badgeText?: string;
  showPackBadge?: boolean;
  showStockInfo?: boolean;
  showHeartIcon?: boolean;
  showRating?: boolean;
  showVegetarianIcon?: boolean;
  showOptionsText?: boolean;
  optionsCount?: number;
  compact?: boolean;
  categoryStyle?: boolean;
}

export default function ProductCard({
  product,
  showBadge = false,
  badgeText,
  showPackBadge = false,
  showStockInfo = false,
  showHeartIcon = false,
  showRating = false,
  showVegetarianIcon = false,
  showOptionsText = false,
  optionsCount = 2,
  compact = false,
  categoryStyle = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();
  const imageRef = useRef<HTMLImageElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await getWishlist();
        if (res.success && res.data) {
          const exists = res.data.products.some(p => p._id === (product.id || product._id) || (p as any).id === (product.id || product._id));
          setIsWishlisted(exists);
        }
      } catch (e) {
        // Silently fail if not logged in
      }
    };
    checkWishlist();
  }, [product.id, product._id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isWishlisted) {
        await removeFromWishlist(((product as any).id || product._id) as string);
        setIsWishlisted(false);
      } else {
        await addToWishlist(((product as any).id || product._id) as string);
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
    }
  };

  const cartItem = cart.items.find((item) => item?.product && (item.product.id === (product as any).id || item.product._id === (product as any).id || item.product.id === product._id));
  const inCartQty = cartItem?.quantity || 0;

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleCardClick = () => {
    navigate(`/product/${((product as any).id || product._id) as string}`);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, addButtonRef.current);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartQty > 0) {
      updateQuantity(((product as any).id || product._id) as string, inCartQty - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartQty > 0) {
      updateQuantity(((product as any).id || product._id) as string, inCartQty + 1);
    } else {
      addToCart(product, addButtonRef.current);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`${categoryStyle ? 'bg-green-50' : 'bg-white'} rounded-lg shadow-sm overflow-hidden flex flex-col relative`}
    >
      <div
        onClick={handleCardClick}
        className="cursor-pointer flex-1 flex flex-col"
      >
        <div className={`w-full ${compact ? 'h-32 md:h-40' : categoryStyle ? 'h-28 md:h-36' : 'h-40 md:h-48'} bg-neutral-100 flex items-center justify-center overflow-hidden relative`}>
          {product.imageUrl || product.mainImage ? (
            <img
              ref={imageRef}
              src={product.imageUrl || product.mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-4xl">
              {(product.name || '?').charAt(0).toUpperCase()}
            </div>
          )}

          {categoryStyle && showBadge && discount > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              {discount}% off
            </div>
          )}

          {!categoryStyle && showBadge && (badgeText || discount > 0) && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 z-10 text-xs px-2 py-1"
            >
              {badgeText || `${discount}% OFF`}
            </Badge>
          )}

          {showPackBadge && (
            <Badge
              variant="outline"
              className="absolute top-2 right-2 z-10 text-xs px-2 py-1 font-medium"
            >
              {product.pack}
            </Badge>
          )}

          {showHeartIcon && (
            <button
              onClick={toggleWishlist}
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md group/heart"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "#ef4444" : "none"}
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-colors ${isWishlisted ? "text-red-500" : "text-neutral-400 group-hover/heart:text-red-400"}`}
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {categoryStyle && (
          <div className="px-2.5 pt-1.5 pb-0">
            <AnimatePresence mode="wait">
              {inCartQty === 0 ? (
                <motion.div
                  key="add-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center w-full"
                >
                  <Button
                    ref={addButtonRef}
                    variant="outline"
                    size="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(e);
                    }}
                    className="w-full border-2 border-green-600 text-green-600 bg-transparent hover:bg-green-50 rounded-full font-semibold text-sm h-9 px-3 flex items-center justify-center"
                  >
                    ADD
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-green-600 rounded-full px-2 py-1.5"
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecrease(e);
                      }}
                      className="w-7 h-7 p-0"
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                  </motion.div>
                  <motion.span
                    key={inCartQty}
                    initial={{ scale: 1.2, y: -4 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="text-sm font-bold text-green-600 min-w-[1.5rem] text-center"
                  >
                    {inCartQty}
                  </motion.span>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncrease(e);
                      }}
                      className="w-7 h-7 p-0"
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className={`${compact ? 'p-3 md:p-4' : categoryStyle ? 'px-2.5 md:px-3 pt-1.5 md:pt-2 pb-2 md:pb-3' : 'p-4 md:p-5'} flex-1 flex flex-col`}>
          {!showPackBadge && (
            <p className={`${compact ? 'text-[10px] md:text-xs' : categoryStyle ? 'text-[10px] md:text-xs text-neutral-600 mb-0.5' : 'text-xs md:text-sm'} text-neutral-500 ${categoryStyle ? '' : 'mb-1'}`}>{product.pack}</p>
          )}

          <h3 className={`${compact ? 'text-xs md:text-sm' : categoryStyle ? 'text-xs md:text-sm font-bold' : 'text-sm md:text-base'} font-semibold text-neutral-900 ${compact ? 'mb-1' : categoryStyle ? 'mb-0.5' : 'mb-2'} line-clamp-2 ${compact ? 'min-h-[2rem]' : categoryStyle ? 'min-h-[2rem]' : 'min-h-[2.5rem]'}`}>
            {product.name}
          </h3>

          {categoryStyle && showStockInfo && (
            <p className="text-[10px] text-green-600 mb-1 font-medium flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              14 MINS
            </p>
          )}

          {showRating && (
            <div className={`flex items-center gap-1.5 ${compact ? 'mb-1' : 'mb-2'}`}>
              <div className="flex items-center gap-0.5">
                <span className={`text-yellow-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>★★★★★</span>
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-neutral-600 font-medium ml-1`}>4.5</span>
              </div>
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-neutral-500`}>(1.17 lac)</span>
            </div>
          )}

          {showStockInfo && !categoryStyle && (
            <p className="text-xs text-green-600 mb-2 font-medium">
              Fast delivery
            </p>
          )}

          {showVegetarianIcon && (
            <div className="flex items-center gap-1 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-xs text-neutral-600">Vegetarian</span>
            </div>
          )}

          <div className={`${categoryStyle ? 'mt-0.5' : 'mt-auto mb-2'}`}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`${categoryStyle ? 'text-sm' : 'text-base'} font-bold text-neutral-900`}>
                {categoryStyle ? `₹${product.price.toFixed(0)}` : `₹${product.price}`}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className={`${categoryStyle ? 'text-[10px]' : 'text-xs'} text-neutral-500 line-through`}>
                    {categoryStyle ? `MRP ₹${product.mrp.toFixed(0)}` : `₹${product.mrp}`}
                  </span>
                  {categoryStyle && discount > 0 && (
                    <span className={`${categoryStyle ? 'text-[10px]' : 'text-xs'} font-semibold text-green-600`}>
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!categoryStyle && (
        <div className={`${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          <motion.div
            layout
            className="mt-auto"
          >
            <AnimatePresence mode="wait">
              {inCartQty === 0 ? (
                <motion.div
                  key="add-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <Button
                      ref={addButtonRef}
                      variant="outline"
                      size="default"
                      onClick={handleAdd}
                      className="w-full"
                    >
                      Add
                    </Button>
                    <div className="h-4 mt-1">
                      {showOptionsText && (
                        <p className="text-xs text-neutral-500 text-center">
                          {optionsCount} options
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-green-600 rounded-full px-2 py-1.5"
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleDecrease}
                      className="w-7 h-7 p-0"
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                  </motion.div>
                  <motion.span
                    key={inCartQty}
                    initial={{ scale: 1.2, y: -4 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="text-sm font-bold text-green-600 min-w-[1.5rem] text-center"
                  >
                    {inCartQty}
                  </motion.span>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleIncrease}
                      className="w-7 h-7 p-0"
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

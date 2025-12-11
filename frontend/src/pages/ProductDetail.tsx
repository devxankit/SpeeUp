import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [isProductDetailsExpanded, setIsProductDetailsExpanded] = useState(false);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const product = products.find((p) => p.id === id);
  
  // Get quantity in cart
  const cartItem = product ? cart.items.find(item => item.product.id === product.id) : null;
  const inCartQty = cartItem?.quantity || 0;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-lg md:text-xl font-semibold text-neutral-900 mb-4">Product not found</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  // Get category info
  const category = categories.find((c) => c.id === product.categoryId);

  // Get similar products from same category
  const similarProducts = products.filter((p) => 
    p.categoryId === product.categoryId && p.id !== product.id
  ).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, addButtonRef.current);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with back button and action icons */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4">
          {/* Back button - top left */}
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Action icons - top right */}
          <div className="flex items-center gap-2">
            {/* Heart icon */}
            <button
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
              aria-label="Add to favorites"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>

            {/* Search icon */}
            <button
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
              aria-label="Search"
              onClick={() => navigate('/search')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Share icon - upward arrow */}
            <button
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
              aria-label="Share"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="pt-16">
        {/* Product Image */}
        <div className="relative w-full bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
          {/* Product Image */}
          <div className="w-full aspect-square flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-6xl">
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
          </div>
        </div>

        {/* Product Details Card - White section */}
        <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 md:px-6 lg:px-8 pt-2.5 md:pt-4 pb-2 md:pb-4">
          {/* Delivery time */}
          <div className="flex items-center gap-0.5 mb-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-neutral-700 font-medium">17 MINS</span>
          </div>

          {/* Product name */}
          <h2 className="text-sm md:text-xl font-bold text-neutral-900 mb-0 leading-tight">{product.name}</h2>

          {/* Quantity */}
          <p className="text-[10px] md:text-sm text-neutral-600 mb-1">{product.pack}</p>

            {/* Price section */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-base font-bold text-neutral-900">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                <span className="text-[11px] text-neutral-500 line-through">₹{product.mrp}</span>
                  {discount > 0 && (
                  <Badge className="!bg-blue-500 !text-white !border-blue-500 text-[8px] px-1.5 py-0.5 rounded-full font-semibold">
                      {discount}% OFF
                    </Badge>
                  )}
                </>
              )}
            </div>

          {/* Divider line */}
          <div className="border-t border-neutral-200 mb-1.5"></div>

          {/* View product details link */}
          <button 
            onClick={() => setIsProductDetailsExpanded(!isProductDetailsExpanded)}
            className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium"
          >
            View product details
            <svg 
              width="9" 
              height="9" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${isProductDetailsExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
              </div>

        {/* Expanded Product Details Section */}
        {isProductDetailsExpanded && (
          <div className="mt-1.5">
            {/* Service Guarantees Card */}
            <div className="bg-white rounded-lg p-3 mb-2">
              <div className="grid grid-cols-3 gap-2">
                {/* Replacement */}
                <div className="flex flex-col items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3M20.49 15a9 9 0 0 1-14.85 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-bold text-neutral-900">48 hours</span>
                  <span className="text-[10px] text-neutral-600">Replacement</span>
                </div>

                {/* Support */}
                <div className="flex flex-col items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 8H7M17 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs font-bold text-neutral-900">24/7</span>
                  <span className="text-[10px] text-neutral-600">Support</span>
                </div>
                
                {/* Delivery */}
                <div className="flex flex-col items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                    <path d="M5 17H2l1-7h18l1 7h-3M5 17l-1-5h20l-1 5M5 17v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-bold text-neutral-900">Fast</span>
                  <span className="text-[10px] text-neutral-600">Delivery</span>
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="bg-neutral-100 rounded-lg mb-2 overflow-hidden">
              <button
                onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
                className="w-full px-2 py-2 flex items-center justify-between bg-neutral-100"
              >
                <span className="text-xs font-semibold text-neutral-700">Highlights</span>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${isHighlightsExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isHighlightsExpanded && (
                <div className="bg-white px-2 py-2">
                  <div className="space-y-1">
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex items-start">
                        <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Key Features:</span>
                        <span className="text-[10px] text-neutral-600">
                          {product.tags.map((tag, index) => (
                            <span key={tag}>
                              {tag.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              {index < product.tags!.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Source:</span>
                      <span className="text-[10px] text-neutral-600">From India</span>
                    </div>
                {category && (
                      <div className="flex items-start">
                        <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Category:</span>
                        <span className="text-[10px] text-neutral-600">{category.name}</span>
                      </div>
                    )}
                  </div>
                  </div>
                )}
                </div>
                
            {/* Info Section */}
            <div className="bg-neutral-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                className="w-full px-2 py-2 flex items-center justify-between bg-neutral-100"
              >
                <span className="text-xs font-semibold text-neutral-700">Info</span>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform ${isInfoExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isInfoExpanded && (
                <div className="bg-white px-2 py-2">
                  <div className="space-y-1">
                    {product.description && (
                      <div className="flex items-start">
                        <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Description:</span>
                        <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">{product.description}</span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Unit:</span>
                      <span className="text-[10px] text-neutral-600">{product.pack}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">FSSAI License:</span>
                      <span className="text-[10px] text-neutral-600">10824999000344</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Shelf Life:</span>
                      <span className="text-[10px] text-neutral-600">4 days</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Disclaimer:</span>
                      <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">
                        Every effort is made to maintain accuracy of all Information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Customer Care Details:</span>
                      <span className="text-[10px] text-neutral-600">Email: info@blinkit.com</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Country of Origin:</span>
                      <span className="text-[10px] text-neutral-600">India</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Manufacturer's Name and Address:</span>
                      <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">
                        Hands On Trades Pvt. Ltd., 301-B, Hemkunt Chambers 89, Nehru Place New Delhi South Delhi Delhi - 110019
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Marketer's Name and Address:</span>
                      <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">
                        Hands On Trades Pvt. Ltd., 301-B, Hemkunt Chambers 89, Nehru Place New Delhi South Delhi Delhi - 110019
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Return Policy:</span>
                      <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">
                        The product is non-returnable. For a damaged, rotten or incorrect item, you can request a replacement within 48 hours of delivery. In case of an incorrect item, you may raise a replacement or return request only if the item is sealed/ unopened/unused and in original condition.
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Seller:</span>
                      <span className="text-[10px] text-neutral-600 leading-relaxed flex-1">
                        Zomato Hyperpure Private Limited 82/11, Tolstoy Ln, Atul Grove Road, Janpath, Connaught Place, New Delhi, Delhi 110001
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-[10px] font-semibold text-neutral-800 w-[180px] flex-shrink-0">Seller FSSAI:</span>
                      <span className="text-[10px] text-neutral-600">10020064002537</span>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* Top products in this category */}
        {similarProducts.length > 0 && (
          <div className="mt-6 mb-24">
            <div className="bg-neutral-100/50 border-t border-b border-neutral-200/50 py-4 px-3">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 px-1">Top products in this category</h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1">
              {similarProducts.map((similarProduct) => {
                const similarCartItem = cart.items.find((item) => item.product.id === similarProduct.id);
                const similarInCartQty = similarCartItem?.quantity || 0;
                
                return (
                  <div
                    key={similarProduct.id}
                    className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative"
                  >
                    {/* Heart icon - top right */}
                    <button
                      className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      aria-label="Add to favorites"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>

                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${similarProduct.id}`)}
                      className="w-full h-32 bg-neutral-100 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {similarProduct.imageUrl ? (
                        <img
                          src={similarProduct.imageUrl}
                          alt={similarProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-2xl">
                          {similarProduct.name.charAt(0).toUpperCase()}
              </div>
            )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {similarProduct.name}
                      </h4>
                      
                      {/* ADD button or Quantity stepper */}
                      <AnimatePresence mode="wait">
                        {similarInCartQty === 0 ? (
                          <motion.div
                            key="add-button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center w-full"
                          >
                            <Button
                              variant="outline"
                              size="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(similarProduct);
                              }}
                              className="w-full border-2 border-green-600 text-green-600 bg-transparent hover:bg-green-50 rounded-full font-semibold text-sm h-9"
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
                            className="flex items-center justify-center gap-2 bg-white border-2 border-green-600 rounded-full px-2 py-1.5 w-full"
                          >
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="default"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(similarProduct.id, similarInCartQty - 1);
                                }}
                                className="w-7 h-7 p-0"
                                aria-label="Decrease quantity"
                              >
                                −
                              </Button>
                            </motion.div>
                            <motion.span
                              key={similarInCartQty}
                              initial={{ scale: 1.2, y: -4 }}
                              animate={{ scale: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                              className="text-sm font-bold text-green-600 min-w-[1.5rem] text-center"
                            >
                              {similarInCartQty}
                            </motion.span>
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="default"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(similarProduct.id, similarInCartQty + 1);
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
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
        <div className="px-4 py-2.5 flex items-center justify-between">
          {/* Left side - Product details */}
          <div className="flex-1">
            {/* First line - Pack size */}
            <div>
              <span className="text-[11px] text-neutral-900 font-medium">{product.pack}</span>
                </div>
            {/* Second line - Price, MRP, and OFF */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-neutral-900">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-[10px] text-neutral-500 line-through">MRP ₹{product.mrp}</span>
                  {discount > 0 && (
                    <Badge className="!bg-blue-500 !text-white !border-blue-500 text-[8px] px-1.5 py-0.5 rounded-full font-semibold">
                      {discount}% OFF
                    </Badge>
                  )}
                </>
              )}
            </div>
            {/* Third line - Inclusive of all taxes */}
            <p className="text-[9px] text-neutral-500 leading-none">Inclusive of all taxes</p>
            </div>

          {/* Right side - Add to cart button or Quantity Stepper */}
          <div className="ml-3 flex items-center">
            <AnimatePresence mode="wait">
              {inCartQty === 0 ? (
                <motion.div
                  key="add-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Button
                    ref={addButtonRef}
                    variant="default"
                    size="default"
                    onClick={handleAddToCart}
                    className="px-6 py-2 text-sm font-semibold h-[36px]"
                  >
                    Add to cart
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 bg-white border-2 border-green-600 rounded-full px-2 py-1 h-[36px]"
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(product.id, inCartQty - 1)}
                    className="w-6 h-6 flex items-center justify-center text-green-600 font-bold hover:bg-green-50 rounded-full transition-colors border border-green-600 p-0 leading-none text-base"
                    style={{ lineHeight: 1 }}
                  >
                    <span className="relative top-[-1px]">−</span>
                  </motion.button>
                  <motion.span
                    key={inCartQty}
                    initial={{ scale: 1.2, y: -2 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="text-sm font-bold text-green-600 min-w-[1.5rem] text-center"
                  >
                    {inCartQty}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(product.id, inCartQty + 1)}
                    className="w-6 h-6 flex items-center justify-center text-green-600 font-bold hover:bg-green-50 rounded-full transition-colors border border-green-600 p-0 leading-none text-base"
                    style={{ lineHeight: 1 }}
                  >
                    <span className="relative top-[-1px]">+</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

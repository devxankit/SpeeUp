import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingCartPill from './FloatingCartPill';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mainRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoriesRotation, setCategoriesRotation] = useState(0);
  const [prevCategoriesActive, setPrevCategoriesActive] = useState(false);
  const [displayKey, setDisplayKey] = useState(location.pathname);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathnameRef = useRef(location.pathname);

  const isActive = (path: string) => location.pathname === path;

  // Update search query when URL params change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (location.pathname === '/search') {
      // Update URL params when on search page
      if (value.trim()) {
        setSearchParams({ q: value });
      } else {
        setSearchParams({});
      }
    } else {
      // Navigate to search page with query
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value)}`);
      }
    }
  };


  // Track route changes - store new children but don't update display yet
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      // displayKey stays the same to trigger exit animation with old children
      // displayChildren stays the same (old page) until exit completes
    }
  }, [location.pathname, children]);

  // Reset scroll position when navigating to any page
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    // Also reset window scroll
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track categories active state for rotation
  const isCategoriesActive = isActive('/categories') || location.pathname.startsWith('/category/');
  
  useEffect(() => {
    if (isCategoriesActive && !prevCategoriesActive) {
      // Rotate clockwise when clicked (becoming active)
      setCategoriesRotation(prev => prev + 360);
      setPrevCategoriesActive(true);
    } else if (!isCategoriesActive && prevCategoriesActive) {
      // Rotate counter-clockwise when unclicked (becoming inactive)
      setCategoriesRotation(prev => prev - 360);
      setPrevCategoriesActive(false);
    }
  }, [isCategoriesActive, prevCategoriesActive]);

  const isProductDetailPage = location.pathname.startsWith('/product/');
  const isSearchPage = location.pathname === '/search';
  const isCheckoutPage = location.pathname === '/checkout' || location.pathname.startsWith('/checkout/');
  const isCartPage = location.pathname === '/cart';
  const showHeader = isSearchPage && !isCheckoutPage && !isCartPage;
  const showSearchBar = isSearchPage && !isCheckoutPage && !isCartPage;
  const showFooter = !isCheckoutPage && !isProductDetailPage;

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Desktop Container Wrapper */}
      <div className="md:w-full md:bg-white md:min-h-screen">
        <div className="md:w-full md:min-h-screen md:flex md:flex-col">
          {/* Top Navigation Bar - Desktop Only */}
          {showFooter && (
            <nav className="hidden md:flex items-center justify-center gap-8 px-6 lg:px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 border-b border-green-600 shadow-sm">
              {/* Home */}
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-white text-green-600 shadow-md font-semibold' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isActive('/') ? (
                    <>
                      <path d="M2 12L12 4L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                      <rect x="4" y="12" width="16" height="8" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </>
                  ) : (
                    <>
                      <path d="M2 12L12 4L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <rect x="4" y="12" width="16" height="8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    </>
                  )}
                </svg>
                <span className="font-medium text-sm">Home</span>
              </Link>
              
              {/* Order Again */}
              <Link
                to="/order-again"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/order-again') 
                    ? 'bg-white text-green-600 shadow-md font-semibold' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isActive('/order-again') ? (
                    <path d="M5 8V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V8H21C21.5523 8 22 8.44772 22 9V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V9C2 8.44772 2.44772 8 3 8H5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  ) : (
                    <path d="M5 8V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V8H21C21.5523 8 22 8.44772 22 9V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V9C2 8.44772 2.44772 8 3 8H5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                  )}
                </svg>
                <span className="font-medium text-sm">Order Again</span>
              </Link>
              
              {/* Categories */}
              <Link
                to="/categories"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  (isActive('/categories') || location.pathname.startsWith('/category/')) 
                    ? 'bg-white text-green-600 shadow-md font-semibold' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {(isActive('/categories') || location.pathname.startsWith('/category/')) ? (
                    <>
                      <circle cx="7" cy="7" r="2.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="7" r="2.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="7" cy="17" r="2.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="17" cy="17" r="2.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                    </>
                  ) : (
                    <>
                      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="7" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </>
                  )}
                </svg>
                <span className="font-medium text-sm">Categories</span>
              </Link>
              
              {/* Profile */}
              <Link
                to="/account"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/account') 
                    ? 'bg-white text-green-600 shadow-md font-semibold' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isActive('/account') ? (
                    <>
                      <circle cx="12" cy="8" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="currentColor"/>
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </>
                  )}
                </svg>
                <span className="font-medium text-sm">Profile</span>
              </Link>
            </nav>
          )}

      {/* Sticky Header - Show on search page and other non-home pages, excluding account page */}
      {(showHeader || isSearchPage) && (
            <header className="sticky top-0 z-50 bg-white shadow-sm md:shadow-md md:top-[60px]">
          {/* Delivery info line */}
              <div className="px-4 md:px-6 lg:px-8 py-1.5 bg-green-50 text-xs text-green-700 text-center">
            Delivering in 10–15 mins
          </div>
          
          {/* Location line */}
              <div className="px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between text-sm">
            <span className="text-neutral-700">Silicon City, Indore</span>
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Change</button>
          </div>
          
          {/* Search bar - Hidden on Order Again page */}
          {showSearchBar && (
                <div className="px-4 md:px-6 lg:px-8 pb-3">
                  <div className="relative max-w-2xl md:mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for products..."
                      className="w-full px-4 py-2.5 pl-10 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base md:py-3"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Scrollable Main Content */}
          <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-hide pb-24 md:pb-8">
        <AnimatePresence 
          mode="wait" 
          initial={false}
          onExitComplete={() => {
            // Update both displayKey and displayChildren only after exit completes
            setDisplayKey(location.pathname);
            setDisplayChildren(children);
          }}
        >
          <motion.div
            key={displayKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut"
            }}
            style={{ width: '100%', minHeight: '100%' }}
          >
            {displayChildren}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Cart Pill */}
      <FloatingCartPill />

          {/* Fixed Bottom Navigation - Mobile Only, Hidden on checkout pages */}
      {showFooter && (
      <nav 
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200/10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-50 md:hidden"
      >
        <div className="flex justify-around items-center h-16">
          {/* Home */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex-1 h-full"
          >
            <Link
              to="/"
              className="flex flex-col items-center justify-center h-full relative"
            >
            <div className="flex flex-col items-center justify-center relative z-10">
              <motion.svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={isActive('/') ? {
                  scale: [1, 1.1, 1],
                  y: [0, -2, 0]
                } : {}}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                  repeat: isActive('/') ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                {isActive('/') ? (
                  <>
                    {/* Roof */}
                    <path d="M2 12L12 4L22 12" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#22c55e"/>
                    {/* House body */}
                    <rect x="4" y="12" width="16" height="8" fill="#22c55e" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                    {/* Chimney */}
                    <rect x="15" y="5" width="4" height="5" fill="#1f2937" stroke="#1f2937" strokeWidth="2"/>
                    {/* Door */}
                    <rect x="8" y="15" width="4" height="5" fill="#1f2937"/>
                  </>
                ) : (
                  <>
                    {/* Roof */}
                    <path d="M2 12L12 4L22 12" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    {/* House body */}
                    <rect x="4" y="12" width="16" height="8" stroke="#6b7280" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    {/* Chimney */}
                    <rect x="15" y="5" width="4" height="5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    {/* Door */}
                    <rect x="8" y="15" width="4" height="5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                  </>
                )}
              </motion.svg>
            </div>
            <span className={`text-xs mt-0.5 relative z-10 ${isActive('/') ? 'font-medium text-neutral-700' : 'font-medium text-neutral-500'}`}>
              Home
            </span>
            </Link>
          </motion.div>
          
          {/* Order Again */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex-1 h-full"
          >
            <Link
              to="/order-again"
              className="flex flex-col items-center justify-center h-full relative"
            >
            <div className="flex flex-col items-center justify-center relative z-10">
              <motion.svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={isActive('/order-again') ? {
                  scale: [1, 1.1, 1],
                  y: [0, -2, 0]
                } : {}}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                  repeat: isActive('/order-again') ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                {isActive('/order-again') ? (
                  <>
                    {/* Shopping bag body */}
                    <path d="M5 8V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V8H21C21.5523 8 22 8.44772 22 9V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V9C2 8.44772 2.44772 8 3 8H5Z" fill="#22c55e" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round"/>
                    {/* Handles */}
                    <path d="M7 8V6C7 5.44772 7.44772 5 8 5H16C16.5523 5 17 5.44772 17 6V8" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </>
                ) : (
                  <>
                    {/* Shopping bag body */}
                    <path d="M5 8V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V8H21C21.5523 8 22 8.44772 22 9V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V9C2 8.44772 2.44772 8 3 8H5Z" stroke="#6b7280" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    {/* Handles */}
                    <path d="M7 8V6C7 5.44772 7.44772 5 8 5H16C16.5523 5 17 5.44772 17 6V8" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </>
                )}
                {/* Heart inside basket - grows when active, shrinks when inactive */}
                <AnimatePresence>
                  {isActive('/order-again') && (
                    <motion.path
                      key="heart"
                      d="M12 17C11.5 16.5 8 13.5 8 11.5C8 10 9 9 10.5 9C11.2 9 11.8 9.3 12 9.7C12.2 9.3 12.8 9 13.5 9C15 9 16 10 16 11.5C16 13.5 12.5 16.5 12 17Z"
                      fill="#1f2937"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </motion.svg>
            </div>
            <span className={`text-xs mt-0.5 relative z-10 ${isActive('/order-again') ? 'font-medium text-neutral-700' : 'font-medium text-neutral-500'}`}>
              Order Again
            </span>
            </Link>
          </motion.div>
          
          {/* Categories */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex-1 h-full"
          >
            <Link
              to="/categories"
              className="flex flex-col items-center justify-center h-full relative"
            >
            <div className="flex flex-col items-center justify-center relative z-10">
              <motion.svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={{ 
                  rotate: categoriesRotation
                }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: 'center' }}
              >
                {(isActive('/categories') || location.pathname.startsWith('/category/')) ? (
                  <>
                    {/* Top-left and bottom-right are black when active */}
                    <circle cx="7" cy="7" r="2.5" fill="#1f2937" stroke="#1f2937" strokeWidth="2"/>
                    <circle cx="17" cy="7" r="2.5" fill="#22c55e" stroke="#1f2937" strokeWidth="2"/>
                    <circle cx="7" cy="17" r="2.5" fill="#22c55e" stroke="#1f2937" strokeWidth="2"/>
                    <circle cx="17" cy="17" r="2.5" fill="#1f2937" stroke="#1f2937" strokeWidth="2"/>
                  </>
                ) : (
                  <>
                    <circle cx="7" cy="7" r="2.5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    <circle cx="17" cy="7" r="2.5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    <circle cx="7" cy="17" r="2.5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    <circle cx="17" cy="17" r="2.5" stroke="#6b7280" strokeWidth="2" fill="none"/>
                  </>
                )}
              </motion.svg>
            </div>
            <span className={`text-xs mt-0.5 relative z-10 ${(isActive('/categories') || location.pathname.startsWith('/category/')) ? 'font-medium text-neutral-700' : 'font-medium text-neutral-500'}`}>
              Categories
            </span>
            </Link>
          </motion.div>
          
          {/* Profile */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="flex-1 h-full"
          >
            <Link
              to="/account"
              className="flex flex-col items-center justify-center h-full relative"
            >
            <div className="flex flex-col items-center justify-center relative z-10">
              <motion.svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={isActive('/account') ? {
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  repeat: isActive('/account') ? Infinity : 0,
                  repeatDelay: 1.5
                }}
              >
                {isActive('/account') ? (
                  <>
                    {/* Profile head */}
                    <motion.circle 
                      cx="12" 
                      cy="8" 
                      r="4" 
                      fill="#22c55e" 
                      stroke="#1f2937" 
                      strokeWidth="2"
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.2
                      }}
                    />
                    {/* Profile body */}
                    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="#22c55e"/>
                  </>
                ) : (
                  <>
                    {/* Profile head */}
                    <circle cx="12" cy="8" r="4" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    {/* Profile body */}
                    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </>
                )}
              </motion.svg>
            </div>
            <span className={`text-xs mt-0.5 relative z-10 ${isActive('/account') ? 'font-medium text-neutral-700' : 'font-medium text-neutral-500'}`}>
              Profile
            </span>
            </Link>
          </motion.div>
        </div>
      </nav>
      )}
        </div>
      </div>
    </div>
  );
}


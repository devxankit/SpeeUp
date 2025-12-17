import { useNavigate } from 'react-router-dom';
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTheme } from '../../../utils/themes';

gsap.registerPlugin(ScrollTrigger);

interface HomeHeroProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'all',
    label: 'All',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'wedding',
    label: 'Wedding',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10C8 9.44772 8.44772 9 9 9H15C15.5523 9 16 9.44772 16 10V14C16 14.5523 15.5523 15 15 15H9C8.44772 15 8 14.5523 8 14V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 6V4M15 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'beauty',
    label: 'Beauty',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4L6 8V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V8L16 4H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 4H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 12L12 14L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'grocery',
    label: 'Grocery',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1046 17.8954 19 19 19C20.1046 19 21 18.1046 21 17V13M9 19.5C9.82843 19.5 10.5 20.1716 10.5 21C10.5 21.8284 9.82843 22.5 9 22.5C8.17157 22.5 7.5 21.8284 7.5 21C7.5 20.1716 8.17157 19.5 9 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'fashion',
    label: 'Fashion',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 9.5C4 8.39543 4.89543 7.5 6 7.5H9C10.1046 7.5 11 8.39543 11 9.5V14.5C11 15.6046 10.1046 16.5 9 16.5H6C4.89543 16.5 4 15.6046 4 14.5V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 9.5C13 8.39543 13.8954 7.5 15 7.5H18C19.1046 7.5 20 8.39543 20 9.5V14.5C20 15.6046 19.1046 16.5 18 16.5H15C13.8954 16.5 13 15.6046 13 14.5V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 12L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12L2 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 12L22 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8.5L9 8.5M15 8.5L18 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomeHero({ activeTab = 'all', onTabChange }: HomeHeroProps) {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [, setIsSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Search suggestions based on active tab
  const searchSuggestions = useMemo(() => {
    switch (activeTab) {
      case 'wedding':
        return ['gift packs', 'dry fruits', 'sweets', 'decorative items', 'wedding cards', 'return gifts'];
      case 'winter':
        return ['woolen clothes', 'caps', 'gloves', 'blankets', 'heater', 'winter wear'];
      case 'electronics':
        return ['chargers', 'cables', 'power banks', 'earphones', 'phone cases', 'screen guards'];
      case 'beauty':
        return ['lipstick', 'makeup', 'skincare', 'kajal', 'face wash', 'moisturizer'];
      case 'grocery':
        return ['atta', 'milk', 'dal', 'rice', 'oil', 'vegetables'];
      case 'fashion':
        return ['clothing', 'shoes', 'accessories', 'watches', 'bags', 'jewelry'];
      case 'sports':
        return ['cricket bat', 'football', 'badminton', 'fitness equipment', 'sports shoes', 'gym wear'];
      default: // 'all'
        return ['atta', 'milk', 'dal', 'coke', 'bread', 'eggs', 'rice', 'oil'];
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        hero,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }, hero);

    return () => ctx.revert();
  }, []);

  // Animate search suggestions
  useEffect(() => {
    setCurrentSearchIndex(0);
    const interval = setInterval(() => {
      setCurrentSearchIndex((prev) => (prev + 1) % searchSuggestions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [searchSuggestions.length, activeTab]);

  // Handle scroll to detect when "LOWEST PRICES EVER" section is out of view
  useEffect(() => {
    const handleScroll = () => {
      if (topSectionRef.current && stickyRef.current) {
        // Find the "LOWEST PRICES EVER" section
        const lowestPricesSection = document.querySelector('[data-section="lowest-prices"]');

        if (lowestPricesSection) {
          const sectionBottom = lowestPricesSection.getBoundingClientRect().bottom;
          // When the section has scrolled up past the viewport, transition to white
          const progress = Math.min(Math.max(1 - (sectionBottom / 200), 0), 1);
          setScrollProgress(progress);
          setIsSticky(sectionBottom <= 100);
        } else {
          // Fallback to original logic if section not found
          const topSectionBottom = topSectionRef.current.getBoundingClientRect().bottom;
          const topSectionHeight = topSectionRef.current.offsetHeight;
          const progress = Math.min(Math.max(1 - (topSectionBottom / topSectionHeight), 0), 1);
          setScrollProgress(progress);
          setIsSticky(topSectionBottom <= 0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update sliding indicator position when activeTab changes and scroll to active tab
  useEffect(() => {
    const updateIndicator = (shouldScroll = true) => {
      const activeTabButton = tabRefs.current.get(activeTab);
      const container = tabsContainerRef.current;

      if (activeTabButton && container) {
        try {
          // Use offsetLeft for position relative to container (not affected by scroll)
          // This ensures the indicator stays aligned even when container scrolls
          const left = activeTabButton.offsetLeft;
          const width = activeTabButton.offsetWidth;

          // Ensure valid values
          if (width > 0) {
            setIndicatorStyle({ left, width });
          }

          // Scroll the container to bring the active tab into view (only when tab changes)
          if (shouldScroll) {
            const containerScrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const buttonLeft = left;
            const buttonWidth = width;
            const buttonRight = buttonLeft + buttonWidth;

            // Calculate scroll position to center the button or keep it visible
            const scrollPadding = 20; // Padding from edges
            let targetScrollLeft = containerScrollLeft;

            // If button is on the left side and partially or fully hidden
            if (buttonLeft < containerScrollLeft + scrollPadding) {
              targetScrollLeft = buttonLeft - scrollPadding;
            }
            // If button is on the right side and partially or fully hidden
            else if (buttonRight > containerScrollLeft + containerWidth - scrollPadding) {
              targetScrollLeft = buttonRight - containerWidth + scrollPadding;
            }

            // Smooth scroll to the target position
            if (targetScrollLeft !== containerScrollLeft) {
              container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth'
              });
            }
          }
        } catch (error) {
          console.warn('Error updating indicator:', error);
        }
      }
    };

    // Update immediately with scroll
    updateIndicator(true);

    // Also update after delays to handle any layout shifts and ensure smooth animation
    const timeout1 = setTimeout(() => updateIndicator(true), 50);
    const timeout2 = setTimeout(() => updateIndicator(true), 150);
    const timeout3 = setTimeout(() => updateIndicator(false), 300); // Last update without scroll to avoid conflicts

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId);
    // Don't scroll - keep page at current position
  };

  const theme = getTheme(activeTab || 'all');
  const heroGradient = `linear-gradient(to bottom right, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]})`;

  // Helper to convert RGB to RGBA
  const rgbToRgba = (rgb: string, alpha: number) => {
    return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  };

  return (
    <div
      ref={heroRef}
      style={{
        background: heroGradient,
        paddingBottom: 0,
        marginBottom: 0,
      }}
    >
      {/* Top section with delivery info and buttons - NOT sticky */}
      <div>
        <div ref={topSectionRef} className="px-4 md:px-6 lg:px-8 pt-2 md:pt-3 pb-0">
          <div className="flex items-start justify-between mb-2 md:mb-2">
            {/* Left: Text content */}
            <div className="flex-1 pr-2">
              {/* Service name - small, dark */}
              <div className="text-neutral-800 font-medium text-[10px] md:text-xs mb-0 leading-tight">SpeeUp Quick Commerce</div>
              {/* Delivery time - large, bold, dark grey/black */}
              <div className="text-neutral-900 font-extrabold text-2xl md:text-xl mb-0 md:mb-0.5 leading-tight">14 minutes</div>
              {/* Location with dropdown indicator */}
              <div className="text-neutral-700 text-[10px] md:text-xs flex items-center gap-0.5 leading-tight">
                <span className="line-clamp-1">SpeeUp, Princess Center, New Palasia, Indore, Madhya Pradesh</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* Right: Wallet Icon */}
            <div className="flex items-center">
              <button
                className="w-8 h-8 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-colors shadow-sm border"
                style={{
                  backgroundColor: theme.primary[3] || theme.primary[2],
                  borderColor: theme.primary[2] || theme.primary[1],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary[2] || theme.primary[1];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary[3] || theme.primary[2];
                }}
                aria-label="Wallet"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Wallet body */}
                  <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7Z" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Wallet flap */}
                  <path d="M3 10H21" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Card slot */}
                  <rect x="6" y="12" width="8" height="5" rx="1" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                  {/* Card lines */}
                  <line x1="8" y1="14" x2="12" y2="14" stroke="#1f2937" strokeWidth="1" strokeLinecap="round" />
                  <line x1="8" y1="15.5" x2="10" y2="15.5" stroke="#1f2937" strokeWidth="1" strokeLinecap="round" />
                  {/* Money symbol */}
                  <circle cx="17" cy="14.5" r="2" fill="#10b981" stroke="#10b981" strokeWidth="0.5" />
                  <text x="17" y="16" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">₹</text>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky section: Search Bar and Category Tabs - Always sticky */}
      <div
        ref={stickyRef}
        className="sticky top-0 z-50"
        style={{
          ...(scrollProgress >= 0.1 && {
            background: `linear-gradient(to bottom right, 
              ${rgbToRgba(theme.primary[0], 1 - scrollProgress)}, 
              ${rgbToRgba(theme.primary[1], 1 - scrollProgress)}, 
              ${rgbToRgba(theme.primary[2], 1 - scrollProgress)}), 
              rgba(255, 255, 255, ${scrollProgress})`,
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, ${scrollProgress * 0.1})`,
            transition: 'background 0.1s ease-out, box-shadow 0.1s ease-out',
          }),
        }}
      >
        <div className="px-4 md:px-6 lg:px-8 pt-2 md:pt-2 pb-2 md:pb-2">
          {/* Search Bar */}
          <div
            onClick={() => navigate('/search')}
            className="w-full md:w-auto md:max-w-xl md:mx-auto rounded-xl shadow-lg px-3 py-2 md:px-3 md:py-1.5 flex items-center gap-2 cursor-pointer hover:shadow-xl transition-all duration-300 mb-2 md:mb-1.5 bg-white"
            style={{
              backgroundColor: scrollProgress > 0.1 ? `rgba(249, 250, 251, ${scrollProgress})` : 'white',
              border: scrollProgress > 0.1 ? `1px solid rgba(229, 231, 235, ${scrollProgress})` : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 md:w-4 md:h-4">
              <circle cx="11" cy="11" r="8" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="flex-1 relative h-4 md:h-4 overflow-hidden">
              {searchSuggestions.map((suggestion, index) => {
                const isActive = index === currentSearchIndex;
                const prevIndex = (currentSearchIndex - 1 + searchSuggestions.length) % searchSuggestions.length;
                const isPrev = index === prevIndex;

                return (
                  <div
                    key={suggestion}
                    className={`absolute inset-0 flex items-center transition-all duration-500 ${isActive
                        ? 'translate-y-0 opacity-100'
                        : isPrev
                          ? '-translate-y-full opacity-0'
                          : 'translate-y-full opacity-0'
                      }`}
                  >
                    <span className={`text-xs md:text-xs`} style={{ color: scrollProgress > 0.5 ? '#9ca3af' : '#6b7280' }}>
                      Search &apos;{suggestion}&apos;
                    </span>
                  </div>
                );
              })}
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 md:w-4 md:h-4">
              <path d="M12 1C13.1 1 14 1.9 14 3C14 4.1 13.1 5 12 5C10.9 5 10 4.1 10 3C10 1.9 10.9 1 12 1Z" fill={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} />
              <path d="M19 10V17C19 18.1 18.1 19 17 19H7C5.9 19 5 18.1 5 17V10" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11V17" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" strokeLinecap="round" />
              <path d="M8 11V17" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" strokeLinecap="round" />
              <path d="M16 11V17" stroke={scrollProgress > 0.5 ? "#9ca3af" : "#6b7280"} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-neutral-400/40 w-full" style={{ paddingBottom: 0 }}>
          <div
            ref={tabsContainerRef}
            className="relative flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-6 lg:px-8 md:justify-center scroll-smooth"
            style={{ paddingBottom: '12px' }}
            data-padding-bottom="md:8px"
          >
            {/* Sliding Indicator */}
            {indicatorStyle.width > 0 && (
              <div
                className="absolute bottom-0 h-1 bg-neutral-900 rounded-t-md transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 0,
                }}
              />
            )}

            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabColor = isActive
                ? 'text-neutral-900'
                : scrollProgress > 0.5
                  ? 'text-neutral-600'
                  : 'text-neutral-800';

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) {
                      tabRefs.current.set(tab.id, el);
                    } else {
                      tabRefs.current.delete(tab.id);
                    }
                  }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-shrink-0 flex flex-col md:flex-row items-center justify-center min-w-[50px] md:min-w-fit md:px-3 py-1 md:py-1.5 relative ${tabColor} z-10`}
                  style={{
                    transition: 'color 0.3s ease-out',
                  }}
                  type="button"
                >
                  <div className={`mb-0.5 md:hidden w-5 h-5 flex items-center justify-center ${tabColor}`} style={{
                    transition: 'color 0.3s ease-out, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {tab.icon}
                  </div>
                  <span
                    className={`text-[10px] md:text-xs md:whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}
                    style={{
                      transition: 'font-weight 0.3s ease-out',
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
// import { products } from '../../../data/products';
const products = [
  { id: 'lays-magic-masala', name: 'Lays Magic Masala', imageUrl: '/assets/product-lays-magic-masala.jpg' },
  { id: 'amul-butter', name: 'Amul Butter', imageUrl: '/assets/product-amul-butter.jpg' },
  { id: 'britannia-bread', name: 'Britannia Bread', imageUrl: '/assets/product-britannia-bread.jpg' },
  { id: 'amul-curd', name: 'Amul Curd', imageUrl: '/assets/product-amul-curd.jpg' },
  { id: 'mother-dairy-curd', name: 'Mother Dairy Curd', imageUrl: '/assets/product-mother-dairy-curd.jpg' },
];

import { getTheme } from '../../../utils/themes';

interface PromoCard {
  id: string;
  badge: string;
  title: string;
  imageUrl?: string;
  categoryId?: string;
  bgColor?: string;
}

const promoCards: PromoCard[] = [
  {
    id: 'self-care',
    badge: 'Up to 55% OFF',
    title: 'Self Care & Wellness',
    categoryId: 'personal-care',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'hot-meals',
    badge: 'Up to 55% OFF',
    title: 'Hot Meals & Drinks',
    categoryId: 'breakfast-instant',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'kitchen-essentials',
    badge: 'Up to 55% OFF',
    title: 'Kitchen Essentials',
    categoryId: 'atta-rice',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'cleaning-home',
    badge: 'Up to 75% OFF',
    title: 'Cleaning & Home Needs',
    categoryId: 'household',
    bgColor: 'bg-yellow-50',
  },
];

// Icon mappings for each category
const getCategoryIcons = (categoryId: string) => {
  const iconMap: Record<string, string[]> = {
    'personal-care': ['🧴', '💧', '🧼', '💄'],
    'breakfast-instant': ['🍜', '☕', '🥛', '🍞'],
    'atta-rice': ['🌾', '🍚', '🫘', '🫒'],
    'household': ['🧹', '🧽', '🧼', '🧴'],
    'home-office': ['🏠', '💼', '📦', '🎁'],
    'fashion': ['👕', '👗', '👠', '👜'],
    'electronics': ['📱', '💻', '⌚', '🎧'],
    'fruits-veg': ['🥬', '🥕', '🍅', '🥒'],
    'dairy-breakfast': ['🥛', '🧀', '🍞', '🥚'],
    'snacks': ['🍿', '🍪', '🥨', '🍫'],
    'sports': ['⚽', '🏀', '🏋️', '🎾'],
  };
  return iconMap[categoryId] || ['📦', '📦', '📦', '📦'];
};

// Get featured products based on active tab
const getFeaturedProducts = (activeTab: string) => {
  const allProducts: Record<string, Array<{ id: string; name: string; originalPrice: number; discountedPrice: number }>> = {
    all: [
      { id: 'lays-magic-masala', name: 'Biscuit', originalPrice: 198, discountedPrice: 129 },
      { id: 'amul-butter', name: 'Body Lotion', originalPrice: 750, discountedPrice: 339 },
      { id: 'britannia-bread', name: 'French Fries', originalPrice: 299, discountedPrice: 174 },
      { id: 'amul-curd', name: 'Shampoo', originalPrice: 450, discountedPrice: 249 },
    ],
    wedding: [
      { id: 'amul-butter', name: 'Decor Set', originalPrice: 1200, discountedPrice: 599 },
      { id: 'britannia-bread', name: 'Gift Box', originalPrice: 899, discountedPrice: 449 },
      { id: 'lays-magic-masala', name: 'Essentials', originalPrice: 699, discountedPrice: 349 },
      { id: 'amul-curd', name: 'Accessories', originalPrice: 599, discountedPrice: 299 },
    ],
    winter: [
      { id: 'amul-butter', name: 'Winter Wear', originalPrice: 1999, discountedPrice: 999 },
      { id: 'britannia-bread', name: 'Warmers', originalPrice: 799, discountedPrice: 399 },
      { id: 'lays-magic-masala', name: 'Care Kit', originalPrice: 599, discountedPrice: 299 },
      { id: 'amul-curd', name: 'Accessories', originalPrice: 499, discountedPrice: 249 },
    ],
    electronics: [
      { id: 'amul-butter', name: 'Smartphone', originalPrice: 19999, discountedPrice: 14999 },
      { id: 'britannia-bread', name: 'Laptop', originalPrice: 49999, discountedPrice: 39999 },
      { id: 'lays-magic-masala', name: 'Accessories', originalPrice: 1999, discountedPrice: 999 },
      { id: 'amul-curd', name: 'Gadgets', originalPrice: 2999, discountedPrice: 1499 },
    ],
    beauty: [
      { id: 'amul-butter', name: 'Makeup Kit', originalPrice: 1999, discountedPrice: 999 },
      { id: 'britannia-bread', name: 'Skincare', originalPrice: 1499, discountedPrice: 749 },
      { id: 'lays-magic-masala', name: 'Haircare', originalPrice: 899, discountedPrice: 449 },
      { id: 'amul-curd', name: 'Fragrance', originalPrice: 1299, discountedPrice: 649 },
    ],
    grocery: [
      { id: 'lays-magic-masala', name: 'Biscuit', originalPrice: 198, discountedPrice: 129 },
      { id: 'amul-butter', name: 'Butter', originalPrice: 299, discountedPrice: 199 },
      { id: 'britannia-bread', name: 'Bread', originalPrice: 45, discountedPrice: 35 },
      { id: 'amul-curd', name: 'Curd', originalPrice: 89, discountedPrice: 69 },
    ],
    fashion: [
      { id: 'amul-butter', name: 'Clothing', originalPrice: 1999, discountedPrice: 999 },
      { id: 'britannia-bread', name: 'Footwear', originalPrice: 2999, discountedPrice: 1499 },
      { id: 'lays-magic-masala', name: 'Accessories', originalPrice: 799, discountedPrice: 399 },
      { id: 'amul-curd', name: 'Jewelry', originalPrice: 4999, discountedPrice: 2499 },
    ],
    sports: [
      { id: 'amul-butter', name: 'Fitness Kit', originalPrice: 2999, discountedPrice: 1499 },
      { id: 'britannia-bread', name: 'Sports Wear', originalPrice: 1999, discountedPrice: 999 },
      { id: 'lays-magic-masala', name: 'Equipment', originalPrice: 4999, discountedPrice: 2499 },
      { id: 'amul-curd', name: 'Accessories', originalPrice: 899, discountedPrice: 449 },
    ],
  };

  return allProducts[activeTab] || allProducts.all;
};

interface PromoStripProps {
  activeTab?: string;
}

// Get category cards based on active tab
const getCategoryCards = (activeTab: string): PromoCard[] => {
  const allCards: Record<string, PromoCard[]> = {
    all: promoCards,
    wedding: [
      { id: 'wedding-decor', badge: 'Up to 60% OFF', title: 'Wedding Decor', categoryId: 'home-office', bgColor: 'bg-pink-50' },
      { id: 'wedding-gifts', badge: 'Up to 50% OFF', title: 'Wedding Gifts', categoryId: 'home-office', bgColor: 'bg-pink-50' },
      { id: 'wedding-essentials', badge: 'Up to 55% OFF', title: 'Wedding Essentials', categoryId: 'home-office', bgColor: 'bg-pink-50' },
      { id: 'wedding-accessories', badge: 'Up to 45% OFF', title: 'Wedding Accessories', categoryId: 'home-office', bgColor: 'bg-pink-50' },
    ],
    winter: [
      { id: 'winter-wear', badge: 'Up to 70% OFF', title: 'Winter Wear', categoryId: 'fashion', bgColor: 'bg-blue-50' },
      { id: 'winter-essentials', badge: 'Up to 60% OFF', title: 'Winter Essentials', categoryId: 'home-office', bgColor: 'bg-blue-50' },
      { id: 'winter-care', badge: 'Up to 55% OFF', title: 'Winter Care', categoryId: 'personal-care', bgColor: 'bg-blue-50' },
      { id: 'winter-accessories', badge: 'Up to 50% OFF', title: 'Winter Accessories', categoryId: 'fashion', bgColor: 'bg-blue-50' },
    ],
    electronics: [
      { id: 'mobile-phones', badge: 'Up to 40% OFF', title: 'Mobile Phones', categoryId: 'electronics', bgColor: 'bg-yellow-50' },
      { id: 'laptops', badge: 'Up to 35% OFF', title: 'Laptops', categoryId: 'electronics', bgColor: 'bg-yellow-50' },
      { id: 'accessories', badge: 'Up to 50% OFF', title: 'Accessories', categoryId: 'electronics', bgColor: 'bg-yellow-50' },
      { id: 'gadgets', badge: 'Up to 45% OFF', title: 'Gadgets', categoryId: 'electronics', bgColor: 'bg-yellow-50' },
    ],
    beauty: [
      { id: 'makeup', badge: 'Up to 60% OFF', title: 'Makeup', categoryId: 'personal-care', bgColor: 'bg-pink-50' },
      { id: 'skincare', badge: 'Up to 55% OFF', title: 'Skincare', categoryId: 'personal-care', bgColor: 'bg-pink-50' },
      { id: 'haircare', badge: 'Up to 50% OFF', title: 'Haircare', categoryId: 'personal-care', bgColor: 'bg-pink-50' },
      { id: 'fragrances', badge: 'Up to 45% OFF', title: 'Fragrances', categoryId: 'personal-care', bgColor: 'bg-pink-50' },
    ],
    grocery: [
      { id: 'fresh-vegetables', badge: 'Up to 30% OFF', title: 'Fresh Vegetables', categoryId: 'fruits-veg', bgColor: 'bg-green-50' },
      { id: 'dairy-products', badge: 'Up to 25% OFF', title: 'Dairy Products', categoryId: 'dairy-breakfast', bgColor: 'bg-green-50' },
      { id: 'staples', badge: 'Up to 20% OFF', title: 'Staples', categoryId: 'atta-rice', bgColor: 'bg-green-50' },
      { id: 'snacks', badge: 'Up to 35% OFF', title: 'Snacks', categoryId: 'snacks', bgColor: 'bg-green-50' },
    ],
    fashion: [
      { id: 'clothing', badge: 'Up to 60% OFF', title: 'Clothing', categoryId: 'fashion', bgColor: 'bg-purple-50' },
      { id: 'footwear', badge: 'Up to 55% OFF', title: 'Footwear', categoryId: 'fashion', bgColor: 'bg-purple-50' },
      { id: 'accessories', badge: 'Up to 50% OFF', title: 'Accessories', categoryId: 'fashion', bgColor: 'bg-purple-50' },
      { id: 'jewelry', badge: 'Up to 45% OFF', title: 'Jewelry', categoryId: 'fashion', bgColor: 'bg-purple-50' },
    ],
    sports: [
      { id: 'fitness', badge: 'Up to 50% OFF', title: 'Fitness', categoryId: 'sports', bgColor: 'bg-blue-50' },
      { id: 'sports-wear', badge: 'Up to 45% OFF', title: 'Sports Wear', categoryId: 'sports', bgColor: 'bg-blue-50' },
      { id: 'equipment', badge: 'Up to 40% OFF', title: 'Equipment', categoryId: 'sports', bgColor: 'bg-blue-50' },
      { id: 'accessories', badge: 'Up to 35% OFF', title: 'Accessories', categoryId: 'sports', bgColor: 'bg-blue-50' },
    ],
  };

  return allCards[activeTab] || promoCards;
};

import { getHomeContent } from '../../../services/api/customerHomeService';

export default function PromoStrip({ activeTab = 'all' }: PromoStripProps) {
  const theme = getTheme(activeTab);
  const [categoryCards, setCategoryCards] = useState<PromoCard[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const snowflakesRef = useRef<HTMLDivElement>(null);
  const housefullRef = useRef<HTMLDivElement>(null);
  const saleRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const productNameRef = useRef<HTMLDivElement>(null);
  const productImageRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHomeContent();
        if (response.success && response.data) {
          // Map backend promoBanners or other data to categoryCards if needed
          // For now, let's keep the getCategoryCards(activeTab) logic but maybe filter by real categories
          const dynamicCards = getCategoryCards(activeTab);
          setCategoryCards(dynamicCards);

          // Use bestsellers for featuredProducts
          if (response.data.bestsellers && response.data.bestsellers.length > 0) {
            setFeaturedProducts(response.data.bestsellers.map((p: any) => ({
              id: p._id,
              name: p.productName,
              originalPrice: p.mrp || Math.round(p.price * 1.2),
              discountedPrice: p.price,
              imageUrl: p.mainImage
            })));
          } else {
            setFeaturedProducts(getFeaturedProducts(activeTab));
          }
        }
      } catch (error) {
        console.error("Error fetching home content for PromoStrip:", error);
        setCategoryCards(getCategoryCards(activeTab));
        setFeaturedProducts(getFeaturedProducts(activeTab));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Reset product index when activeTab changes or featuredProducts change
  useEffect(() => {
    setCurrentProductIndex(0);
  }, [activeTab, featuredProducts.length]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const cards = container.querySelectorAll('.promo-card');
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  // Snowflake animation
  useLayoutEffect(() => {
    const snowflakesContainer = snowflakesRef.current;
    if (!snowflakesContainer) return;

    const snowflakes = snowflakesContainer.querySelectorAll('.snowflake');

    snowflakes.forEach((snowflake, index) => {
      const delay = index * 0.3;
      const duration = 3 + Math.random() * 2; // 3-5 seconds
      const xOffset = (Math.random() - 0.5) * 40; // Random horizontal drift

      gsap.set(snowflake, {
        y: -20,
        x: xOffset,
        opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0 opacity for better visibility
        scale: 0.6 + Math.random() * 0.4, // 0.6-1.0 scale for better visibility
      });

      gsap.to(snowflake, {
        y: '+=200',
        x: `+=${xOffset}`,
        duration: duration,
        delay: delay,
        ease: 'none',
        repeat: -1,
      });
    });

    return () => {
      snowflakes.forEach(snowflake => {
        gsap.killTweensOf(snowflake);
      });
    };
  }, []);

  // HOUSEFULL SALE animation: shrink down, pop out, then letter-by-letter pop - repeats every few seconds
  useLayoutEffect(() => {
    const housefullContainer = housefullRef.current;
    const saleText = saleRef.current;
    const dateText = dateRef.current;
    if (!housefullContainer) return;

    const letters = housefullContainer.querySelectorAll('.housefull-letter');

    const animate = () => {
      // Animation timeline
      const tl = gsap.timeline();

      // Set initial state - start at normal size
      gsap.set([housefullContainer, saleText, dateText], { scale: 1, opacity: 1 });

      // Step 1: Shrink down (going into a hole) - all elements together
      tl.to([housefullContainer, saleText, dateText], {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
      })
        // Step 2: Pop out with bounce - all elements together
        .to([housefullContainer, saleText, dateText], {
          scale: 1.2,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
        })
        // Step 3: Pop back to normal size - all elements together
        .to([housefullContainer, saleText, dateText], {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        })
        // Step 4: Wait a bit before letter animation
        .to({}, { duration: 0.4 })
        // Step 5: Letter-by-letter pop up animation (first to last)
        .to(letters, {
          y: -15,
          duration: 0.2,
          stagger: 0.06,
          ease: 'power2.out',
        })
        // Step 6: Letters go back to place
        .to(letters, {
          y: 0,
          duration: 0.2,
          stagger: 0.06,
          ease: 'power2.in',
        })
        // Step 7: Wait before repeating
        .to({}, {
          duration: 2,
          onComplete: () => {
            // Repeat animation after delay
            setTimeout(animate, 1000);
          }
        });
    };

    // Start initial animation
    animate();

    return () => {
      gsap.killTweensOf([housefullContainer, saleText, dateText, letters]);
    };
  }, []);

  // Product rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 3000); // Change product every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Animate product change with left swipe
  useEffect(() => {
    const elements = [priceContainerRef.current, productNameRef.current, productImageRef.current];
    // Check if all elements exist
    if (elements.some(el => !el)) return;

    // Swipe left (out)
    const tween = gsap.to(elements, {
      opacity: 0,
      x: -30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Re-check if elements exist in case component unmounted
        const currentElements = [priceContainerRef.current, productNameRef.current, productImageRef.current];
        if (currentElements.some(el => !el)) return;

        // Reset position and update content
        gsap.set(currentElements, {
          x: 30,
          opacity: 0,
        });

        // Swipe in from right
        gsap.to(currentElements, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      },
    });

    return () => {
      tween.kill();
    };
  }, [currentProductIndex]);

  const currentProduct = featuredProducts[currentProductIndex];
  const product = currentProduct ? products.find(p => p.id === currentProduct.id) : null;

  if (loading || !currentProduct) {
    return <div className="h-[200px] w-full bg-neutral-100 animate-pulse rounded-lg mx-0 mt-4" />;
  }

  return (
    <div
      className="relative"
      style={{
        background: `linear-gradient(to bottom, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]}, ${theme.primary[3]}, ${theme.primary[3]})`,
        paddingTop: '12px',
        paddingBottom: '0px',
        marginTop: 0,
      }}
    >
      {/* HOUSEFULL SALE Banner */}
      <div className="px-4 mb-3 text-center relative" style={{ minHeight: '80px' }}>
        {/* Snowflakes Container */}
        <div
          ref={snowflakesRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ top: 0, bottom: 'auto', height: '100px' }}
        >
          {/* Left side snowflakes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`left-${i}`}
              className="snowflake absolute"
              style={{
                left: `${5 + (i % 4) * 12}%`,
                top: `${(Math.floor(i / 4)) * 30}px`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))' }}>
                {/* Longer, thinner stems */}
                <path d="M12 1V5M12 19V23M3 12H1M23 12H21M20.5 20.5L18.5 18.5M20.5 3.5L18.5 5.5M3.5 20.5L5.5 18.5M3.5 3.5L5.5 5.5M18.5 18.5L16.5 16.5M18.5 5.5L16.5 7.5M5.5 18.5L7.5 16.5M5.5 5.5L7.5 7.5" stroke="rgba(255, 255, 255, 1)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.8" fill="rgba(255, 255, 255, 1)" />
              </svg>
            </div>
          ))}
          {/* Right side snowflakes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`right-${i}`}
              className="snowflake absolute"
              style={{
                right: `${5 + (i % 4) * 12}%`,
                top: `${(Math.floor(i / 4)) * 30}px`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))' }}>
                {/* Longer, thinner stems */}
                <path d="M12 1V5M12 19V23M3 12H1M23 12H21M20.5 20.5L18.5 18.5M20.5 3.5L18.5 5.5M3.5 20.5L5.5 18.5M3.5 3.5L5.5 5.5M18.5 18.5L16.5 16.5M18.5 5.5L16.5 7.5M5.5 18.5L7.5 16.5M5.5 5.5L7.5 7.5" stroke="rgba(255, 255, 255, 1)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.8" fill="rgba(255, 255, 255, 1)" />
              </svg>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-0">
            {/* Left Lightning Bolt */}
            <svg width="28" height="36" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="0.5"
              />
            </svg>

            {/* HOUSEFULL Text */}
            <h1
              ref={housefullRef}
              className="text-3xl font-black text-white"
              style={{
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                lineHeight: '1.1',
                textShadow:
                  `-2px -2px 0 ${theme.accentColor}, 2px -2px 0 ${theme.accentColor}, -2px 2px 0 ${theme.accentColor}, 2px 2px 0 ${theme.accentColor}, ` +
                  `-2px 0px 0 ${theme.accentColor}, 2px 0px 0 ${theme.accentColor}, 0px -2px 0 ${theme.accentColor}, 0px 2px 0 ${theme.accentColor}, ` +
                  `-1px -1px 0 ${theme.accentColor}, 1px -1px 0 ${theme.accentColor}, -1px 1px 0 ${theme.accentColor}, 1px 1px 0 ${theme.accentColor}, ` +
                  '0px 2px 0px rgba(0, 0, 0, 0.8), 0px 4px 0px rgba(0, 0, 0, 0.6), ' +
                  '0px 6px 0px rgba(0, 0, 0, 0.4), 0px 8px 8px rgba(0, 0, 0, 0.3), ' +
                  '2px 2px 2px rgba(0, 0, 0, 0.5)',
              } as React.CSSProperties}
            >
              {theme.bannerText.split('').map((letter, index) => (
                <span
                  key={index}
                  className="housefull-letter inline-block"
                >
                  {letter}
                </span>
              ))}
            </h1>

            {/* Right Lightning Bolt */}
            <svg width="28" height="36" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0" style={{ transform: 'scaleX(-1)' }}>
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* SALE Text */}
          <div className="flex justify-center mb-0.5" style={{ marginTop: '-3px' }}>
            <h2
              ref={saleRef}
              className="text-xl font-black text-white"
              style={{
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                textShadow:
                  `-1.5px -1.5px 0 ${theme.accentColor}, 1.5px -1.5px 0 ${theme.accentColor}, -1.5px 1.5px 0 ${theme.accentColor}, 1.5px 1.5px 0 ${theme.accentColor}, ` +
                  `-1.5px 0px 0 ${theme.accentColor}, 1.5px 0px 0 ${theme.accentColor}, 0px -1.5px 0 ${theme.accentColor}, 0px 1.5px 0 ${theme.accentColor}, ` +
                  `-1px -1px 0 ${theme.accentColor}, 1px -1px 0 ${theme.accentColor}, -1px 1px 0 ${theme.accentColor}, 1px 1px 0 ${theme.accentColor}, ` +
                  '0px 2px 0px rgba(0, 0, 0, 0.8), 0px 4px 0px rgba(0, 0, 0, 0.6), ' +
                  '0px 6px 0px rgba(0, 0, 0, 0.4), 0px 8px 8px rgba(0, 0, 0, 0.3), ' +
                  '2px 2px 2px rgba(0, 0, 0, 0.5)',
              } as React.CSSProperties}
            >
              {theme.saleText}
            </h2>
          </div>

          {/* Dates */}
          <div ref={dateRef} className="font-bold text-xs text-center mt-1" style={{ color: theme.textColor }}>
            30TH NOV, 2025 - 7TH DEC, 2025
          </div>
        </div>
      </div>

      {/* Main Content: Crazy Deals + Category Cards */}
      <div className="px-4 mt-2">
        <div ref={containerRef} className="flex gap-2">
          {/* Crazy Deals Section - Left */}
          <div className="flex-shrink-0 w-[100px] promo-card">
            <div
              className="h-full rounded-lg p-1 flex flex-col items-center justify-between relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 60%), linear-gradient(to bottom, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]})`,
                minHeight: '110px',
              }}
            >
              {/* CRAZY DEALS - Two lines, bigger */}
              <div className="text-center mb-1.5" style={{ marginTop: '4px' }}>
                <div
                  className="text-white font-black leading-tight"
                  style={{
                    fontSize: '13px',
                    fontFamily: 'sans-serif',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.9)',
                    letterSpacing: '0.5px',
                  }}
                >
                  <div>CRAZY</div>
                  <div>DEALS</div>
                </div>
              </div>

              {/* Price Banners - Compact */}
              <div ref={priceContainerRef} className="flex flex-col items-center mb-0.5 relative">
                {/* Original Price - Darker Gray, Smaller Banner */}
                <div className="bg-neutral-600 rounded px-1.5 inline-block relative z-10" style={{ height: 'fit-content', lineHeight: '1', paddingTop: '2px', paddingBottom: '2px' }}>
                  <span className="text-white text-[8px] font-medium line-through leading-none">₹{currentProduct.originalPrice}</span>
                </div>
                {/* Discounted Price - Bright Green Banner */}
                <div className="bg-green-500 rounded px-2 inline-block relative -mt-0.5 z-20" style={{ height: 'fit-content', lineHeight: '1', paddingTop: '2px', paddingBottom: '2px' }}>
                  <span className="text-white text-[9px] font-bold leading-none">₹{currentProduct.discountedPrice}</span>
                </div>
              </div>

              {/* Product Name - Compact */}
              <div ref={productNameRef} className="text-neutral-900 font-black text-[9px] text-center mb-0.5">
                {currentProduct.name}
              </div>

              {/* Product Thumbnail - Bottom Center, sized to container */}
              <div ref={productImageRef} className="flex-1 flex items-end justify-center w-full" style={{ minHeight: '50px', maxHeight: '65px' }}>
                <div className="w-12 h-16 rounded flex items-center justify-center overflow-visible" style={{ background: 'transparent' }}>
                  {(product?.imageUrl || currentProduct.imageUrl) ? (
                    <img
                      src={product?.imageUrl || currentProduct.imageUrl}
                      alt={currentProduct.name}
                      className="w-full h-full object-contain"
                      style={{
                        mixBlendMode: 'normal',
                        backgroundColor: 'transparent',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-yellow-100 to-yellow-50 flex items-center justify-center">
                      <div className="w-7 h-9 bg-yellow-200 rounded-sm relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/80"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Category Cards Grid - Right */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {categoryCards.map((card) => {
              const categoryIcons = getCategoryIcons(card.categoryId || '');
              return (
                <div
                  key={card.id}
                  className="promo-card"
                >
                  <Link
                    to={card.categoryId ? `/category/${card.categoryId}` : '#'}
                    className="group block rounded-lg transition-all duration-300 hover:shadow-md active:scale-[0.98] h-full flex flex-col overflow-hidden relative"
                    style={{
                      minHeight: '90px',
                      background: 'rgba(255, 247, 237, 0.9)', // Very light orange
                    }}
                  >
                    {/* Green Discount Banner - Only around text, centered at top */}
                    <div className="w-full flex justify-center" style={{ paddingTop: '0', paddingBottom: '2px' }}>
                      <div className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tight text-center inline-block">
                        {card.badge}
                      </div>
                    </div>

                    <div className="px-1 pb-1 flex flex-col flex-1 justify-between" style={{ paddingTop: '2px' }}>
                      {/* Category Title */}
                      <div className="text-neutral-900 font-bold text-center" style={{ fontSize: '13px', lineHeight: '1.2', marginBottom: '6px' }}>
                        {card.title}
                      </div>

                      {/* Product Icons - Horizontal Layout */}
                      <div className="flex items-center justify-center gap-1 overflow-hidden" style={{ marginTop: 'auto' }}>
                        {categoryIcons.slice(0, 4).map((icon, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 bg-transparent rounded flex items-center justify-center overflow-hidden"
                            style={{ width: '24px', height: '24px', fontSize: '18px' }}
                          >
                            {icon}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHero from './components/HomeHero';
import PromoStrip from './components/PromoStrip';
import LowestPricesEver from './components/LowestPricesEver';
import CategoryTileSection from './components/CategoryTileSection';
import FeaturedThisWeek from './components/FeaturedThisWeek';
import ProductCard from './components/ProductCard';
import { getHomeContent } from '../../services/api/customerHomeService';

// Fallback data if API fails or for initial render
import {
  bestsellerTiles as fallbackBestsellers,
  groceryKitchenTiles as fallbackGrocery,
  snacksDrinksTiles as fallbackSnacks,
  beautyPersonalCareTiles as fallbackBeauty,
  householdEssentialsTiles as fallbackHousehold,
  shopByStoreTiles as fallbackShops,
} from '../../data/homeTiles';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const contentRef = useRef<HTMLDivElement>(null);

  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>({
    bestsellers: fallbackBestsellers,
    categories: [],
    shops: fallbackShops,
    promoBanners: [],
    trending: [],
    cookingIdeas: []
  });

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getHomeContent();
        if (response.success && response.data) {
          setHomeData({
            ...response.data,
            // If backend returns empty lists, fall back to hardcoded for demo feel if needed, 
            // but ideally we default to backend. For now, let's mix.
            shops: response.data.shops?.length ? response.data.shops : fallbackShops
          });

          // Flatten products from bestsellers or other lists for the "Filtered Products" view
          // In a real app, this "filter" logic usually triggers a fresh API call.
          // For now, we will assume the initial load might bring some "all" products 
          // or we just use the bestsellers as the "all" list.
          if (response.data.bestsellers) {
            setProducts(response.data.bestsellers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch home content", error);
        // Keep fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map tab IDs to category IDs or filter logic
  // Since we are now dynamic, this client-side filtering might be limited to what we fetched.
  // Ideally, selecting a tab should fetch products for that category.
  // Converting this to an async fetch or navigating to a category page would be better.
  // For hybrid approach:
  const getFilteredProducts = (tabId: string) => {
    if (tabId === 'all') {
      return products; // Return loaded products (e.g. bestsellers)
    }
    // Client-side filter on loaded products (likely insufficient if full catalog isn't loaded)
    return products.filter((p) => p.categoryId === tabId || (p.category && p.category._id === tabId));
  };

  const filteredProducts = useMemo(() => getFilteredProducts(activeTab), [activeTab, products]);


  if (loading && !products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-4 md:pb-8">
      {/* Hero Header with Gradient and Tabs */}
      <HomeHero activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Promo Strip - Show for all tabs */}
      <PromoStrip activeTab={activeTab} />

      {/* LOWEST PRICES EVER Section - Show for all tabs */}
      <LowestPricesEver activeTab={activeTab} />

      {/* Main content with neutral background */}
      <div ref={contentRef} className="bg-neutral-50 -mt-2 pt-1 space-y-5 md:space-y-8 md:pt-4">
        {/* Filtered Products Section - Show when tab is not "All" */}
        {activeTab !== 'all' && (
          <div data-products-section className="mt-6 mb-6 md:mt-8 md:mb-8">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6 px-4 md:px-6 lg:px-8 tracking-tight capitalize">
              {activeTab === 'grocery' ? 'Grocery Items' : activeTab}
            </h2>
            <div className="px-4 md:px-6 lg:px-8">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryStyle={true}
                      showBadge={true}
                      showPackBadge={false}
                      showStockInfo={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 text-neutral-500">
                  <p className="text-lg md:text-xl mb-2">No products found</p>
                  <p className="text-sm md:text-base">Try selecting a different category</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bestsellers Section - Only show when "All" tab is selected */}
        {activeTab === 'all' && (
          <>
            <div className="mt-2 md:mt-4">
              <CategoryTileSection
                title="Bestsellers"
                tiles={homeData.bestsellers && homeData.bestsellers.length > 0
                  ? homeData.bestsellers.map((p: any) => ({
                    id: p._id || p.id,
                    name: p.productName || p.name,
                    image: p.mainImage || p.image,
                    price: p.price,
                    discount: p.discount
                  }))
                  : fallbackBestsellers
                }
                columns={3}
                showProductCount={true}
              />
            </div>

            {/* Featured this week Section */}
            <FeaturedThisWeek />

            {/* Grocery & Kitchen Section */}
            <CategoryTileSection
              title="Grocery & Kitchen"
              tiles={homeData.categories?.length ? homeData.categories : fallbackGrocery}
              columns={4}
              showProductCount={false}
            />

            {/* Snacks & Drinks Section */}
            <CategoryTileSection
              title="Snacks & Drinks"
              tiles={fallbackSnacks}
              columns={4}
              showProductCount={false}
            />

            {/* Beauty & Personal Care Section */}
            <CategoryTileSection
              title="Beauty & Personal Care"
              tiles={fallbackBeauty}
              columns={4}
              showProductCount={false}
            />

            {/* Household Essentials Section */}
            <CategoryTileSection
              title="Household Essentials"
              tiles={fallbackHousehold}
              columns={4}
              showProductCount={false}
            />

            {/* Shop by Store Section */}
            <div className="mb-6 mt-6 md:mb-8 md:mt-8">
              <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6 px-4 md:px-6 lg:px-8 tracking-tight">Shop by Store</h2>
              <div className="px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
                  {(homeData.shops && homeData.shops.length > 0 ? homeData.shops : fallbackShops).map((tile: any) => {
                    const hasImages = tile.image || (tile.productImages && tile.productImages.filter(Boolean).length > 0);

                    return (
                      <div key={tile.id} className="flex flex-col">
                        <div
                          onClick={() => {
                            if (tile.id === 'spiritual-store') navigate('/store/spiritual');
                            else if (tile.id === 'pharma-store') navigate('/store/pharma');
                            else if (tile.id === 'e-gifts-store') navigate('/store/e-gifts');
                            else if (tile.id === 'pet-store') navigate('/store/pet');
                            else if (tile.id === 'sports-store') navigate('/store/sports');
                            else if (tile.id === 'fashion-basics-store') navigate('/store/fashion-basics');
                            else if (tile.id === 'toy-store') navigate('/store/toy');
                            else if (tile.id === 'hobby-store') navigate('/store/hobby');
                            else console.log('Clicked store:', tile.id);
                          }}
                          className="block bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        >
                          {hasImages ? (
                            <img
                              src={tile.image || (tile.productImages ? tile.productImages[0] : '')}
                              alt={tile.name}
                              className="w-full h-16 object-cover"
                            />
                          ) : (
                            <div className={`w-full h-16 flex items-center justify-center text-3xl text-neutral-300 ${tile.bgColor || 'bg-neutral-50'
                              }`}>
                              {tile.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Tile name - outside card */}
                        <div className="mt-1.5 text-center">
                          <span className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-tight">
                            {tile.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeHero from "./components/HomeHero";
import PromoStrip from "./components/PromoStrip";
import LowestPricesEver from "./components/LowestPricesEver";
import CategoryTileSection from "./components/CategoryTileSection";
import FeaturedThisWeek from "./components/FeaturedThisWeek";
import ProductCard from "./components/ProductCard";
import { getHomeContent } from "../../services/api/customerHomeService";

import { useThemeContext } from "../../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { activeCategory, setActiveCategory } = useThemeContext();
  const activeTab = activeCategory; // mapping for existing code compatibility
  const setActiveTab = setActiveCategory;
  const contentRef = useRef<HTMLDivElement>(null);

  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>({
    bestsellers: [],
    categories: [],
    groceryKitchenProducts: [],
    personalCareProducts: [],
    shops: [],
    promoBanners: [],
    trending: [],
    cookingIdeas: [],
  });

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getHomeContent();
        if (response.success && response.data) {
          setHomeData(response.data);

          if (response.data.bestsellers) {
            setProducts(response.data.bestsellers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch home content", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredProducts = (tabId: string) => {
    if (tabId === "all") {
      return products;
    }
    return products.filter(
      (p) =>
        p.categoryId === tabId ||
        (p.category && (p.category._id === tabId || p.category.slug === tabId))
    );
  };

  const filteredProducts = useMemo(
    () => getFilteredProducts(activeTab),
    [activeTab, products]
  );

  // Derived categories for sections
  const snacksCats =
    homeData.categories?.filter((c: any) =>
      ["snacks", "cold-drinks", "biscuits-bakery", "tea-coffee"].includes(
        c.slug
      )
    ) || [];
  const beautyCats =
    homeData.categories?.filter((c: any) =>
      ["beauty", "personal-care", "oral-care", "baby-care"].includes(c.slug)
    ) || [];
  const householdCats =
    homeData.categories?.filter((c: any) =>
      ["cleaning", "kitchenware"].includes(c.slug)
    ) || [];

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

      {/* Promo Strip */}
      <PromoStrip activeTab={activeTab} />

      {/* LOWEST PRICES EVER Section */}
      <LowestPricesEver activeTab={activeTab} />

      {/* Main content */}
      <div
        ref={contentRef}
        className="bg-neutral-50 -mt-2 pt-1 space-y-5 md:space-y-8 md:pt-4">
        {/* Filtered Products Section */}
        {activeTab !== "all" && (
          <div data-products-section className="mt-6 mb-6 md:mt-8 md:mb-8">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6 px-4 md:px-6 lg:px-8 tracking-tight capitalize">
              {activeTab === "grocery" ? "Grocery Items" : activeTab}
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
                  <p className="text-sm md:text-base">
                    Try selecting a different category
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bestsellers Section */}
        {activeTab === "all" && (
          <>
            <div className="mt-2 md:mt-4">
              <CategoryTileSection
                title="Bestsellers"
                tiles={
                  homeData.bestsellers && homeData.bestsellers.length > 0
                    ? homeData.bestsellers
                        .slice(0, 6)
                        .map((sellerCard: any) => {
                          // Seller cards already have productImages array from backend
                          return {
                            id: sellerCard.id || sellerCard.sellerId,
                            sellerId: sellerCard.sellerId || sellerCard.id,
                            name:
                              sellerCard.name ||
                              sellerCard.storeName ||
                              "Seller",
                            image: sellerCard.logo,
                            productImages: sellerCard.productImages || [],
                            productCount: sellerCard.productCount || 0,
                          };
                        })
                    : []
                }
                columns={3}
                showProductCount={true}
              />
            </div>

            {/* Featured this week Section */}
            <FeaturedThisWeek />

            {/* Grocery & Kitchen Section - Show subcategories or products */}
            <CategoryTileSection
              title="Grocery & Kitchen"
              tiles={
                homeData.groceryKitchenProducts &&
                homeData.groceryKitchenProducts.length > 0
                  ? homeData.groceryKitchenProducts.map((item: any) => {
                      // Handle subcategories
                      if (item.type === "subcategory" || item.subcategoryId) {
                        return {
                          id: item.id || item.subcategoryId,
                          categoryId: item.categoryId || item.id,
                          subcategoryId: item.subcategoryId || item.id,
                          name: item.name,
                          image: item.image,
                          slug: item.slug,
                          type: "subcategory",
                        };
                      }
                      // Handle products (fallback)
                      return {
                        id: item.id || item.productId,
                        productId: item.productId || item.id,
                        name: item.name || item.productName,
                        image: item.image || item.mainImage,
                        productImages:
                          item.productImages ||
                          (item.image ? [item.image] : []),
                        price: item.price,
                        discount: item.discount,
                        type: "product",
                      };
                    })
                  : []
              }
              columns={4}
              showProductCount={false}
            />

            {/* Personal Care Section - Show subcategories or products */}
            <CategoryTileSection
              title="Personal Care"
              tiles={
                homeData.personalCareProducts &&
                homeData.personalCareProducts.length > 0
                  ? homeData.personalCareProducts.map((item: any) => {
                      // Handle subcategories
                      if (item.type === "subcategory" || item.subcategoryId) {
                        return {
                          id: item.id || item.subcategoryId,
                          categoryId: item.categoryId || item.id,
                          subcategoryId: item.subcategoryId || item.id,
                          name: item.name,
                          image: item.image,
                          slug: item.slug,
                          type: "subcategory",
                        };
                      }
                      // Handle products (fallback)
                      return {
                        id: item.id || item.productId,
                        productId: item.productId || item.id,
                        name: item.name || item.productName,
                        image: item.image || item.mainImage,
                        productImages:
                          item.productImages ||
                          (item.image ? [item.image] : []),
                        price: item.price,
                        discount: item.discount,
                        type: "product",
                      };
                    })
                  : []
              }
              columns={4}
              showProductCount={false}
            />

            {/* Snacks & Drinks Section */}
            {snacksCats.length > 0 && (
              <CategoryTileSection
                title="Snacks & Drinks"
                tiles={snacksCats.map((c: any) => ({
                  ...c,
                  id: c._id || c.id,
                  categoryId: c.slug || c._id,
                }))}
                columns={4}
                showProductCount={false}
              />
            )}

            {/* Beauty & Personal Care Section */}
            {beautyCats.length > 0 && (
              <CategoryTileSection
                title="Beauty & Personal Care"
                tiles={beautyCats.map((c: any) => ({
                  ...c,
                  id: c._id || c.id,
                  categoryId: c.slug || c._id,
                }))}
                columns={4}
                showProductCount={false}
              />
            )}

            {/* Household Essentials Section */}
            {householdCats.length > 0 && (
              <CategoryTileSection
                title="Household Essentials"
                tiles={householdCats.map((c: any) => ({
                  ...c,
                  id: c._id || c.id,
                  categoryId: c.slug || c._id,
                }))}
                columns={4}
                showProductCount={false}
              />
            )}

            {/* Shop by Store Section */}
            <div className="mb-6 mt-6 md:mb-8 md:mt-8">
              <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6 px-4 md:px-6 lg:px-8 tracking-tight">
                Shop by Store
              </h2>
              <div className="px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4">
                  {(homeData.shops || []).map((tile: any) => {
                    const hasImages =
                      tile.image ||
                      (tile.productImages &&
                        tile.productImages.filter(Boolean).length > 0);

                    return (
                      <div key={tile.id} className="flex flex-col">
                        <div
                          onClick={() => {
                            const storeSlug =
                              tile.slug || tile.id.replace("-store", "");
                            navigate(`/store/${storeSlug}`);
                          }}
                          className="block bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                          {hasImages ? (
                            <img
                              src={
                                tile.image ||
                                (tile.productImages
                                  ? tile.productImages[0]
                                  : "")
                              }
                              alt={tile.name}
                              className="w-full h-16 object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-16 flex items-center justify-center text-3xl text-neutral-300 ${
                                tile.bgColor || "bg-neutral-50"
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

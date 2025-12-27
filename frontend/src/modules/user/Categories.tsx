import { useEffect, useState } from "react";
import { getHomeContent } from "../../services/api/customerHomeService";
import CategoryTileSection from "./components/CategoryTileSection";
import ProductCard from "./components/ProductCard";

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>({
    homeSections: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getHomeContent();
        if (response.success && response.data) {
          setHomeData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch home content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="pb-4 md:pb-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="px-4 py-4 md:px-6 md:py-6 bg-white border-b border-neutral-200 mb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Categories</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="bg-neutral-50 -mt-2 pt-1 space-y-5 md:space-y-8 md:pt-4">
          {/* Render all admin-created home sections */}
          {homeData.homeSections && homeData.homeSections.length > 0 ? (
            <>
              {homeData.homeSections.map((section: any) => {
                const columnCount = Number(section.columns) || 4;

                if (section.displayType === "products" && section.data && section.data.length > 0) {
                  // Products display - same as home page
                  const gridClass = {
                    2: "grid-cols-2",
                    3: "grid-cols-3",
                    4: "grid-cols-4",
                    6: "grid-cols-6",
                    8: "grid-cols-8"
                  }[columnCount] || "grid-cols-4";

                  const isCompact = columnCount >= 4;
                  const gapClass = columnCount >= 4 ? "gap-2" : "gap-3 md:gap-4";

                  return (
                    <div key={section.id} className="mt-6 mb-6 md:mt-8 md:mb-8">
                      {section.title && (
                        <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6 px-4 md:px-6 lg:px-8 tracking-tight capitalize">
                          {section.title}
                        </h2>
                      )}
                      <div className="px-4 md:px-6 lg:px-8">
                        <div className={`grid ${gridClass} ${gapClass}`}>
                          {section.data.map((product: any) => (
                            <ProductCard
                              key={product.id || product._id}
                              product={product}
                              categoryStyle={true}
                              showBadge={true}
                              showPackBadge={false}
                              showStockInfo={false}
                              compact={isCompact}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Categories/Subcategories display - same as home page
                return (
                  <CategoryTileSection
                    key={section.id}
                    title={section.title}
                    tiles={section.data || []}
                    columns={columnCount as 2 | 3 | 4 | 6 | 8}
                    showProductCount={false}
                  />
                );
              })}
            </>
          ) : (
            <div className="text-center py-12 md:py-16 text-neutral-500 px-4">
              <p className="text-lg md:text-xl mb-2">No categories found</p>
              <p className="text-sm md:text-base">
                Please create home sections from the admin panel
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


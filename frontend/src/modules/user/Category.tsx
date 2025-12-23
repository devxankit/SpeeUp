import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProducts,
  getCategoryById,
  Category as ApiCategory,
} from "../../services/api/customerProductService";
import { useLocation as useLocationContext } from "../../hooks/useLocation";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { location: userLocation } = useLocationContext();

  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [subcategories, setSubcategories] = useState<ApiCategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("Type");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Category Details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const response = await getCategoryById(id!);
        if (response.success && response.data) {
          const {
            category: cat,
            subcategories: subs,
            currentSubcategory,
          } = response.data;

          setCategory(cat);
          setSubcategories([
            {
              _id: "all",
              id: "all",
              name: "All",
              icon: "📦",
              isActive: true,
            } as any,
            ...(subs || []),
          ]);

          // Check URL query params first, then API response
          const subcategoryFromUrl = searchParams.get("subcategory");
          if (subcategoryFromUrl) {
            setSelectedSubcategory(subcategoryFromUrl);
          } else if (currentSubcategory) {
            setSelectedSubcategory(
              currentSubcategory._id || currentSubcategory.id
            );
          }
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    };

    if (id) {
      fetchCategoryDetails();
    }
  }, [id, searchParams]);

  // Fetch Products when category or subcategory changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // If the ID in the URL is actually for a subcategory, we should use the parent category ID
        // which we fetch in the other useEffect and store in 'category'.
        // However, for fetching products, the backend getProducts handles 'category' (parent)
        // and 'subcategory' separately.

        const params: any = { category: category?._id || id };
        if (selectedSubcategory !== "all") {
          params.subcategory = selectedSubcategory;
        }
        // Include user location for seller service radius filtering
        if (userLocation?.latitude && userLocation?.longitude) {
          params.latitude = userLocation.latitude;
          params.longitude = userLocation.longitude;
        }

        const response = await getProducts(params);
        if (response.success) {
          // Ensure products have default tags/name array for filtering logic if missing
          const safeProducts = response.data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            tags: p.tags || [],
            name: p.productName || p.name,
            imageUrl: p.mainImage || p.imageUrl,
          }));
          setProducts(safeProducts);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id, selectedSubcategory, category?._id, userLocation]);

  // Client-side filtering removed in favor of backend subcategory filtering
  const categoryProducts = products;

  if (!category) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Category not found
        </h1>
        <p className="text-neutral-600 md:text-lg">
          The category you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  // Extract filter options from products
  const getFilterOptions = () => {
    const categoryProducts = products.filter((p) => p.categoryId === id);
    const filterMap = new Map<string, number>();

    categoryProducts.forEach((product) => {
      // Extract main ingredient/type from product name
      const name = product.name.toLowerCase();
      // Remove common prefixes like "fresh", "organic", etc.
      const cleanName = name
        .replace(/^(fresh|organic|premium|best|new)\s+/i, "")
        .trim();

      const commonTypes = [
        { keywords: ["tomato", "tomatoes"], display: "Tomato" },
        { keywords: ["potato", "potatoes"], display: "Potato" },
        { keywords: ["chilli", "chili", "chilies"], display: "Chilli" },
        { keywords: ["spinach"], display: "Spinach" },
        { keywords: ["brinjal", "eggplant"], display: "Brinjal" },
        { keywords: ["onion", "onions"], display: "Onion" },
        { keywords: ["peanut", "peanuts"], display: "Peanuts" },
        { keywords: ["lemon", "lemons"], display: "Lemon" },
        { keywords: ["mushroom", "mushrooms"], display: "Mushroom" },
        {
          keywords: ["capsicum", "bell pepper", "pepper"],
          display: "Capsicum",
        },
        { keywords: ["ginger"], display: "Ginger" },
        { keywords: ["carrot", "carrots"], display: "Carrot" },
        { keywords: ["fenugreek", "methi"], display: "Fenugreek" },
        { keywords: ["broccoli"], display: "Broccoli" },
        { keywords: ["cucumber", "cucumbers"], display: "Cucumber" },
        { keywords: ["cabbage"], display: "Cabbage" },
        { keywords: ["cauliflower"], display: "Cauliflower" },
        { keywords: ["ladyfinger", "okra"], display: "Ladyfinger" },
        { keywords: ["beans"], display: "Beans" },
        { keywords: ["peas"], display: "Peas" },
        { keywords: ["garlic"], display: "Garlic" },
        { keywords: ["apple", "apples"], display: "Apple" },
        { keywords: ["banana", "bananas"], display: "Banana" },
        { keywords: ["orange", "oranges"], display: "Orange" },
        { keywords: ["mango", "mangoes"], display: "Mango" },
      ];

      for (const type of commonTypes) {
        if (type.keywords.some((keyword) => cleanName.includes(keyword))) {
          filterMap.set(type.display, (filterMap.get(type.display) || 0) + 1);
          break;
        }
      }
    });

    return Array.from(filterMap.entries())
      .map(([name, count]) => ({ name, count, icon: getIconForFilter(name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getIconForFilter = (name: string): string => {
    const iconMap: Record<string, string> = {
      Tomato: "🍅",
      Potato: "🥔",
      Chilli: "🌶️",
      Spinach: "🥬",
      Brinjal: "🍆",
      Onion: "🧅",
      Peanuts: "🥜",
      Lemon: "🍋",
      Mushroom: "🍄",
      Capsicum: "🫑",
      Ginger: "🫚",
      Carrot: "🥕",
      Fenugreek: "🌿",
      Broccoli: "🥦",
      Cucumber: "🥒",
      Cabbage: "🥬",
      Cauliflower: "🥦",
      Apple: "🍎",
      Banana: "🍌",
      Orange: "🍊",
      Mango: "🥭",
    };
    return iconMap[name] || "🥬";
  };

  const filterOptions = getFilterOptions();
  const filteredOptions = filterOptions.filter((option) =>
    option.name.toLowerCase().includes(filterSearchQuery.toLowerCase())
  );

  const handleFilterToggle = (filterName: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    setIsFiltersOpen(false);
  };

  return (
    <div className="flex bg-white h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-20 bg-neutral-100 border-r border-neutral-200 overflow-y-auto scrollbar-hide flex-shrink-0">
        <div className="py-2">
          {subcategories.map((subcat) => {
            const isSelected =
              selectedSubcategory === (subcat.id || subcat._id);
            return (
              <button
                key={subcat.id || subcat._id}
                type="button"
                onClick={() => {
                  console.log("Clicked subcategory:", subcat.id || subcat._id);
                  setSelectedSubcategory(subcat.id || subcat._id);
                }}
                className="w-full flex flex-col items-center justify-center py-2 relative hover:bg-neutral-50 transition-colors cursor-pointer"
                style={{
                  minHeight: "70px",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  pointerEvents: "auto",
                  zIndex: 10,
                }}>
                {/* Green vertical line indicator for active */}
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-600"
                    style={{ zIndex: 0, pointerEvents: "none" }}></div>
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 flex-shrink-0 pointer-events-none overflow-hidden ${
                    isSelected
                      ? "bg-white border-2 border-green-600"
                      : "bg-white border border-neutral-300"
                  }`}>
                  {subcat.image ? (
                    <img
                      src={subcat.image}
                      alt={subcat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken image and show fallback icon
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.textContent =
                            subcat.icon || subcat.name?.charAt(0) || "📦";
                          parent.style.fontSize = "16px";
                        }
                      }}
                    />
                  ) : (
                    subcat.icon || "📦"
                  )}
                </div>
                <span
                  className={`text-[9px] text-center leading-tight break-words pointer-events-none ${
                    isSelected
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-600"
                  }`}
                  style={{
                    wordBreak: "break-word",
                    hyphens: "auto",
                    lineHeight: "1.1",
                    width: "100%",
                    paddingLeft: "2px",
                    paddingRight: "2px",
                  }}>
                  {subcat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Go back">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <h1 className="text-base md:text-xl font-bold text-neutral-900">
                  {category.name}
                </h1>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Menu">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 12h18M3 6h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter/Sort Bar - Updated layout */}
        <div className="px-4 md:px-6 lg:px-8 py-1.5 md:py-2 bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 scroll-smooth">
            {/* Filters Button */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors flex-shrink-0 whitespace-nowrap">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0">
                <circle cx="6" cy="8" r="1.5" fill="currentColor" />
                <circle cx="6" cy="16" r="1.5" fill="currentColor" />
                <path
                  d="M3 8h6M3 16h6M10 8h11M10 16h11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Filters</span>
              <span className="text-neutral-500 text-[10px] ml-0.5">▾</span>
            </button>

            {/* Sort Button */}
            <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors flex-shrink-0 whitespace-nowrap">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0">
                <path
                  d="M7 8l5-5 5 5M7 16l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Sort</span>
              <span className="text-neutral-500 text-[10px] ml-0.5">▾</span>
            </button>

            {/* Category Buttons */}
            {subcategories
              .filter((subcat) => (subcat.id || subcat._id) !== "all")
              .map((subcat) => {
                const subId = subcat.id || subcat._id;
                const isSelected = selectedSubcategory === subId;
                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubcategory(subId)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors flex-shrink-0 whitespace-nowrap ${
                      isSelected
                        ? "bg-white border border-neutral-300 text-neutral-900"
                        : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}>
                    <span className="text-sm flex-shrink-0">
                      {subcat.image ? (
                        <img
                          src={subcat.image}
                          alt=""
                          className="w-4 h-4 object-cover rounded-full"
                        />
                      ) : (
                        subcat.icon || "📦"
                      )}
                    </span>
                    <span>{subcat.name}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showHeartIcon={false}
                    showStockInfo={false}
                    showBadge={true}
                    showOptionsText={true}
                    categoryStyle={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12 text-center">
              <p className="text-neutral-500 md:text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters Modal */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            {/* Hide footer when modal is open */}
            <style>{`
              nav[class*="fixed bottom-0"] {
                display: none !important;
              }
            `}</style>
            <div className="fixed inset-0 z-[100]">
              {/* Backdrop - Semi-transparent overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsFiltersOpen(false)}
              />

              {/* Modal - Slides up from bottom, compact size matching image */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-neutral-200">
                  <h2 className="text-base font-bold text-neutral-900">
                    Filters
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-3 border-b border-neutral-200">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search across filters..."
                      value={filterSearchQuery}
                      onChange={(e) => setFilterSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-neutral-700 placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden min-h-0">
                  {/* Left Column - Filter Categories */}
                  <div className="w-24 border-r border-neutral-200 flex-shrink-0 bg-neutral-50">
                    <button
                      onClick={() => setSelectedFilterCategory("Type")}
                      className={`w-full px-3 py-3 text-left text-sm font-medium transition-colors ${
                        selectedFilterCategory === "Type"
                          ? "bg-green-50 text-green-700"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}>
                      Type
                    </button>
                    <button
                      onClick={() => setSelectedFilterCategory("Properties")}
                      className={`w-full px-3 py-3 text-left text-sm font-medium transition-colors ${
                        selectedFilterCategory === "Properties"
                          ? "bg-green-50 text-green-700"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}>
                      Properties
                    </button>
                  </div>

                  {/* Right Column - Filter Options */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      {filteredOptions.map((option) => {
                        const isChecked = selectedFilters.includes(option.name);
                        return (
                          <button
                            key={option.name}
                            onClick={() => handleFilterToggle(option.name)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                            <span className="text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center">
                              {option.icon}
                            </span>
                            <span className="flex-1 text-left text-sm font-medium text-neutral-700">
                              {option.name}
                            </span>
                            <span className="text-sm text-neutral-500">
                              ({option.count})
                            </span>
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                              {isChecked ? (
                                <div className="w-5 h-5 border-2 border-green-600 bg-green-600 rounded-sm flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-neutral-300 rounded-sm bg-white"></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-5 py-4 border-t border-neutral-200 flex gap-3 bg-white">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 px-4 py-2.5 border border-green-600 text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors bg-white">
                    Clear Filter
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      selectedFilters.length > 0
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    }`}
                    disabled={selectedFilters.length === 0}>
                    Apply
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

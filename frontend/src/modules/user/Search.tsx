import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import { productImages } from '../../utils/imagePaths';
import { getProducts } from '../../services/api/customerProductService';
import { Product } from '../../types/domain';

// Trending categories data
const trendingCategories = [
  {
    id: 'hair-spray',
    name: 'Hair Spray',
    productImages: [productImages['amul-butter'], productImages['britannia-bread']],
  },
  {
    id: 'maybelline-lipstick',
    name: 'Maybelline New York Lipstick',
    productImages: [productImages['amul-curd'], productImages['mother-dairy-curd']],
  },
  {
    id: 'shagun-envelope',
    name: 'Shagun Envelope',
    productImages: [productImages['lays-magic-masala'], productImages['kurkure-masti']],
  },
  {
    id: 'peanut-chikki',
    name: 'Peanut Chikki',
    productImages: [productImages['haldiram-sev'], productImages['balaji-sev']],
  },
  {
    id: 'hair-straightener',
    name: 'Hair Straightener',
    productImages: [productImages['doritos-cheese'], productImages['parle-rusk']],
  },
  {
    id: 'aroma-magic-kit',
    name: 'Aroma Magic Facial Kit',
    productImages: [productImages['act2-popcorn'], productImages['lays-cream-onion']],
  },
];

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch products based on search query
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getProducts({ search: searchQuery });
        // Map API response to Component Product Type if needed, or use directly if compatible.
        // Explicitly cast or map if types slightly differ between services
        setSearchResults(response.data as unknown as Product[]);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  return (
    <div className="pb-24 md:pb-8 bg-white min-h-screen">

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {searchResults.map((product) => (
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
              <p className="text-sm md:text-base">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* Trending in your city */}
      {!searchQuery.trim() && (
        <>
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6">Trending in your city</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {trendingCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg border-2 border-green-600 p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/category/${category.id}`)}
                >
                  <div className="w-full h-24 rounded-lg mb-2 overflow-hidden bg-neutral-50">
                    <div className="w-full h-full grid grid-cols-2 gap-1 p-1">
                      {category.productImages.slice(0, 2).map((img, idx) =>
                        img ? (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-full h-full object-contain bg-white rounded-sm"
                          />
                        ) : (
                          <div
                            key={idx}
                            className="w-full h-full bg-neutral-200 rounded-sm flex items-center justify-center text-xs text-neutral-400"
                          >
                            {idx + 1}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 text-center line-clamp-2">
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* See all products */}
          <div className="px-4 md:px-6 lg:px-8 py-2 md:py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-2 md:gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={productImages['amul-butter']}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm md:text-base text-neutral-700 font-medium whitespace-nowrap">See all products ▸</span>
            </div>
          </div>

          {/* Cooking ideas */}
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6">Cooking ideas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative rounded-lg overflow-hidden aspect-[4/3] bg-neutral-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

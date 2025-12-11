import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { productImages } from '../utils/imagePaths';

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

// Appliances products
const appliancesProducts = [
  {
    id: 'nea-hot-water-bag',
    name: 'NEA Electric Hot Water Bag (Multicolour)',
    pack: '1 piece',
    price: 239,
    mrp: 599,
    imageUrl: productImages['amul-butter'],
    categoryId: 'electronics',
    tags: ['trending'],
    rating: 3.5,
    reviews: 878,
    deliveryTime: 21,
  },
  {
    id: 'warmfinity-hot-water-bag',
    name: 'Warmfinity Electric Hot Water Bag (Multicolour)',
    pack: '1 piece',
    price: 250,
    mrp: 399,
    imageUrl: productImages['britannia-bread'],
    categoryId: 'electronics',
    tags: [],
    rating: 3.5,
    reviews: 3487,
    deliveryTime: 21,
  },
  {
    id: 'havells-immersion-rod',
    name: 'Havells Zeta Immersion Rod (1500 W)',
    pack: '1 piece',
    price: 599,
    mrp: 1090,
    imageUrl: productImages['amul-curd'],
    categoryId: 'electronics',
    tags: ['trending'],
    rating: 3.5,
    reviews: 350,
    deliveryTime: 22,
    power: '1500 W, 16 A',
  },
];

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Filter products based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    
    const query = searchQuery.toLowerCase().trim();
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const packMatch = product.pack?.toLowerCase().includes(query);
      const categoryMatch = product.categoryId?.toLowerCase().includes(query);
      const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return nameMatch || packMatch || categoryMatch || tagMatch;
    });
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

          {/* Appliances Section */}
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900 mb-3 md:mb-6">Appliances</h2>
            <div className="overflow-x-auto scrollbar-hide pb-4 md:pb-6">
              <div className="flex gap-3 md:gap-4" style={{ width: 'max-content' }}>
                {appliancesProducts.map((product) => {
                  const discount = product.mrp && product.mrp > product.price
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : 0;

                  return (
                    <div key={product.id} className="flex-shrink-0 w-40 bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
                      {/* Product Image */}
                      <div className="relative w-full h-32 bg-neutral-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        {product.tags?.includes('trending') && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            Trending
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                            {discount}% OFF
                          </div>
                        )}
                        {/* Heart Icon */}
                        <button className="absolute bottom-2 right-2 w-6 h-6 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                      </div>

                      {/* Product Info */}
                      <div className="p-2.5">
                        <h3 className="text-xs font-semibold text-neutral-900 mb-1 line-clamp-2 min-h-[2rem]">
                          {product.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-[10px]">★★★★★</span>
                            <span className="text-[10px] text-neutral-600 font-medium ml-1">{product.rating}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500">({product.reviews})</span>
                        </div>

                        {/* Delivery Time */}
                        <p className="text-[10px] text-green-600 mb-1.5 font-medium flex items-center gap-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {product.deliveryTime} MINS
                        </p>

                        {/* Price */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className="text-sm font-bold text-neutral-900">₹{product.price}</span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] text-neutral-500 line-through">MRP ₹{product.mrp}</span>
                          )}
                        </div>

                        {/* Power info if available */}
                        {product.power && (
                          <p className="text-[10px] text-neutral-500 mb-2">{product.power}</p>
                        )}

                        {/* ADD Button */}
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="w-full border-2 border-green-600 text-green-600 bg-transparent hover:bg-green-50 rounded-full font-semibold text-sm h-9 px-3 flex items-center justify-center"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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

import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { getProductsByCategory, householdEssentialsTiles, shopByStoreTiles } from '../../data/homeTiles';
import { productImages } from '../../utils/imagePaths';

// Organize categories into sections
const categorySections = [
  {
    title: 'Grocery & Kitchen',
    categories: [
      { id: 'fruits-veg', name: 'Vegetables & Fruits', icon: '🥬', categoryId: 'fruits-veg' },
      { id: 'atta-rice', name: 'Atta, Rice & Dal', icon: '🌾', categoryId: 'atta-rice' },
      { id: 'masala-oil', name: 'Oil, Ghee & Masala', icon: '🧂', categoryId: 'masala-oil' },
      { id: 'dairy-breakfast', name: 'Dairy, Bread & Eggs', icon: '🥛', categoryId: 'dairy-breakfast' },
      { id: 'biscuits-bakery', name: 'Bakery & Biscuits', icon: '🍪', categoryId: 'biscuits-bakery' },
      { id: 'dry-fruits', name: 'Dry Fruits & Cereals', icon: '🥜', categoryId: 'dry-fruits', productImages: [productImages['rajdhani-besan'], productImages['tata-besan'], productImages['daawat-rice'], productImages['india-gate-rice']] },
      { id: 'chicken-meat', name: 'Chicken, Meat & Fish', icon: '🍗', categoryId: 'chicken-meat', productImages: [productImages['amul-butter'], productImages['britannia-bread'], productImages['amul-curd'], productImages['mother-dairy-curd']] },
      { id: 'kitchenware', name: 'Kitchenware & Appliances', icon: '🍳', categoryId: 'kitchenware', productImages: [productImages['aashirvaad-atta'], productImages['fortune-atta'], productImages['tata-moong'], productImages['fortune-poha']] },
    ],
  },
  {
    title: 'Snacks & Drinks',
    categories: [
      { id: 'snacks', name: 'Chips & Namkeen', icon: '🍿', categoryId: 'snacks' },
      { id: 'sweets-chocolates', name: 'Sweets & Chocolates', icon: '🍬', categoryId: 'snacks', productImages: [productImages['parle-rusk'], productImages['act2-popcorn'], productImages['haldiram-sev'], productImages['balaji-sev']] },
      { id: 'cold-drinks', name: 'Drinks & Juices', icon: '🥤', categoryId: 'cold-drinks' },
      { id: 'tea-coffee', name: 'Tea, Coffee & Milk Drinks', icon: '☕', categoryId: 'tea-coffee', productImages: [productImages['amul-butter'], productImages['britannia-bread'], productImages['amul-curd'], productImages['mother-dairy-curd']] },
      { id: 'breakfast-instant', name: 'Instant Food', icon: '🍜', categoryId: 'breakfast-instant' },
      { id: 'sauces-spreads', name: 'Sauces & Spreads', icon: '🍯', categoryId: 'sauces-spreads', productImages: [productImages['lays-magic-masala'], productImages['kurkure-masti'], productImages['doritos-cheese'], productImages['parle-rusk']] },
      { id: 'paan-corner', name: 'Paan Corner', icon: '🌿', categoryId: 'paan-corner', productImages: [productImages['haldiram-sev'], productImages['balaji-sev'], productImages['act2-popcorn'], productImages['parle-rusk']] },
      { id: 'ice-cream', name: 'Ice Creams & More', icon: '🍦', categoryId: 'ice-cream', productImages: [productImages['amul-butter'], productImages['britannia-bread'], productImages['amul-curd'], productImages['mother-dairy-curd']] },
    ],
  },
  {
    title: 'Beauty & Personal Care',
    categories: [
      { id: 'personal-care', name: 'Personal Care', icon: '🧴', categoryId: 'personal-care' },
      { id: 'beauty', name: 'Beauty', icon: '💄', categoryId: 'beauty' },
      { id: 'health-pharma', name: 'Health & Pharma', icon: '💊', categoryId: 'health-pharma', productImages: [productImages['amul-butter'], productImages['britannia-bread'], productImages['amul-curd'], productImages['mother-dairy-curd']] },
      { id: 'baby-care', name: 'Baby Care', icon: '👶', categoryId: 'baby-care', productImages: [productImages['lays-magic-masala'], productImages['kurkure-masti'], productImages['haldiram-sev'], productImages['balaji-sev']] },
      { id: 'fashion', name: 'Fashion', icon: '👕', categoryId: 'fashion' },
      { id: 'electronics', name: 'Electronics', icon: '📱', categoryId: 'electronics' },
      { id: 'sports', name: 'Sports', icon: '⚽', categoryId: 'sports' },
      { id: 'oral-care', name: 'Oral Care', icon: '🦷', categoryId: 'oral-care', productImages: [productImages['amul-butter'], productImages['britannia-bread'], productImages['amul-curd'], productImages['mother-dairy-curd']] },
    ],
  },
  {
    title: 'Household Essentials',
    categories: householdEssentialsTiles.map((tile) => ({
      id: tile.id,
      name: tile.name,
      icon: '🧹',
      categoryId: tile.categoryId || null,
      productImages: tile.productImages,
    })),
  },
  {
    title: 'Shop by Store',
    categories: shopByStoreTiles.map((tile) => ({
      id: tile.id,
      name: tile.name,
      icon: '🏪',
      categoryId: null,
      productImages: tile.productImages,
    })),
  },
];

export default function Categories() {
  return (
    <div className="pb-4 bg-white">
      <div className="px-4 py-4 bg-white border-b border-neutral-200 mb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-neutral-900">Categories</h1>
      </div>

      <div className="space-y-6">
        {categorySections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3 px-4 tracking-tight">
              {section.title}
            </h2>
            <div className="px-4">
              <div className="grid grid-cols-4 gap-2">
                {section.categories.map((category) => {
                  const categoryData = categories.find((c) => c.id === category.categoryId);
                  const productImages = category.productImages || (category.categoryId ? getProductsByCategory(category.categoryId, 1) : []);

                  return (
                    <div key={category.id} className="flex flex-col">
                      <Link
                        to={category.categoryId ? `/category/${category.categoryId}` : '#'}
                        className="bg-white rounded-xl border border-neutral-200 p-2.5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col items-center justify-center text-center w-full">
                          {productImages.length > 0 ? (
                            <div className="w-full h-20 rounded-lg mb-2 overflow-hidden bg-cyan-50">
                              <img
                                src={productImages[0]}
                                alt={category.name}
                                className="w-full h-full object-contain bg-white rounded-lg"
                              />
                            </div>
                          ) : categoryData?.imageUrl ? (
                            <div className="w-full h-20 rounded-lg mb-2 overflow-hidden bg-cyan-50">
                              <img
                                src={categoryData.imageUrl}
                                alt={category.name}
                                className="w-full h-full rounded-lg object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-20 rounded-lg bg-cyan-50 flex items-center justify-center text-3xl">
                              {category.icon}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Category name - outside the card */}
                      <div className="mt-1.5 text-center">
                        <span className="text-[11px] font-semibold text-neutral-900 line-clamp-2 leading-tight">
                          {category.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


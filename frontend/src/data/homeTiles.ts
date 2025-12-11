import { products } from './products';
import { productImages } from '../utils/imagePaths';

// Helper to get product images by category or tags
export const getProductsByCategory = (categoryId: string, limit = 4): (string | undefined)[] => {
  return products
    .filter((p) => p.categoryId === categoryId && p.imageUrl)
    .slice(0, limit)
    .map((p) => p.imageUrl);
};

export const bestsellerTiles = [
  {
    id: 'vegetables-fruits',
    name: 'Vegetables & Fruits',
    productImages: getProductsByCategory('fruits-veg', 4),
    productCount: 172,
    categoryId: 'fruits-veg',
  },
  {
    id: 'oil-ghee-masala',
    name: 'Oil, Ghee & Masala',
    productImages: getProductsByCategory('masala-oil', 4),
    productCount: 239,
    categoryId: 'masala-oil',
  },
  {
    id: 'dairy-bread-eggs',
    name: 'Dairy, Bread & Eggs',
    productImages: getProductsByCategory('dairy-breakfast', 4),
    productCount: 32,
    categoryId: 'dairy-breakfast',
  },
  {
    id: 'chips-namkeen',
    name: 'Chips & Namkeen',
    productImages: getProductsByCategory('snacks', 4),
    productCount: 382,
    categoryId: 'snacks',
  },
  {
    id: 'bakery-biscuits',
    name: 'Bakery & Biscuits',
    productImages: getProductsByCategory('biscuits-bakery', 4),
    productCount: 214,
    categoryId: 'biscuits-bakery',
  },
  {
    id: 'atta-rice-dal',
    name: 'Atta, Rice & Dal',
    productImages: getProductsByCategory('atta-rice', 4),
    productCount: 109,
    categoryId: 'atta-rice',
  },
];

export const groceryKitchenTiles = [
  {
    id: 'vegetables-fruits-gk',
    name: 'Vegetables & Fruits',
    productImages: getProductsByCategory('fruits-veg', 1),
    productCount: 156,
    categoryId: 'fruits-veg',
  },
  {
    id: 'atta-rice-dal-gk',
    name: 'Atta, Rice & Dal',
    productImages: getProductsByCategory('atta-rice', 1),
    productCount: 124,
    categoryId: 'atta-rice',
  },
  {
    id: 'oil-ghee-masala-gk',
    name: 'Oil, Ghee & Masala',
    productImages: getProductsByCategory('masala-oil', 1),
    productCount: 98,
    categoryId: 'masala-oil',
  },
  {
    id: 'dairy-bread-eggs-gk',
    name: 'Dairy, Bread & Eggs',
    productImages: getProductsByCategory('dairy-breakfast', 1),
    productCount: 112,
    categoryId: 'dairy-breakfast',
  },
  {
    id: 'bakery-biscuits-gk',
    name: 'Bakery & Biscuits',
    productImages: getProductsByCategory('biscuits-bakery', 1),
    productCount: 92,
    categoryId: 'biscuits-bakery',
  },
  {
    id: 'dry-fruits-cereals-gk',
    name: 'Dry Fruits & Cereals',
    productImages: [productImages['rajdhani-besan']],
    productCount: 45,
  },
  {
    id: 'chicken-meat-fish-gk',
    name: 'Chicken, Meat & Fish',
    productImages: [productImages['amul-butter']],
    productCount: 67,
  },
  {
    id: 'kitchenware-appliances-gk',
    name: 'Kitchenware & Appliances',
    productImages: [productImages['aashirvaad-atta']],
    productCount: 89,
  },
];

export const snacksDrinksTiles = [
  {
    id: 'chips-namkeen-sd',
    name: 'Chips & Namkeen',
    productImages: getProductsByCategory('snacks', 1),
    productCount: 105,
    categoryId: 'snacks',
  },
  {
    id: 'sweets-chocolates-sd',
    name: 'Sweets & Chocolates',
    productImages: [productImages['lays-magic-masala']],
    productCount: 67,
  },
  {
    id: 'drinks-juices-sd',
    name: 'Drinks & Juices',
    productImages: getProductsByCategory('cold-drinks', 1),
    productCount: 89,
    categoryId: 'cold-drinks',
  },
  {
    id: 'tea-coffee-milk-sd',
    name: 'Tea, Coffee & Milk Drinks',
    productImages: [productImages['amul-butter']],
    productCount: 76,
  },
  {
    id: 'instant-food-sd',
    name: 'Instant Food',
    productImages: getProductsByCategory('breakfast-instant', 1),
    productCount: 78,
    categoryId: 'breakfast-instant',
  },
  {
    id: 'sauces-spreads-sd',
    name: 'Sauces & Spreads',
    productImages: [productImages['amul-butter']],
    productCount: 54,
  },
  {
    id: 'paan-corner-sd',
    name: 'Paan Corner',
    productImages: [productImages['parle-rusk']],
    productCount: 32,
  },
  {
    id: 'ice-creams-more-sd',
    name: 'Ice Creams & More',
    productImages: [productImages['amul-curd']],
    productCount: 48,
  },
];

export const beautyPersonalCareTiles = [
  {
    id: 'bath-body-bpc',
    name: 'Bath & Body',
    productImages: getProductsByCategory('personal-care', 4),
    productCount: 134,
  },
  {
    id: 'hair-bpc',
    name: 'Hair',
    productImages: getProductsByCategory('personal-care', 4),
    productCount: 98,
  },
  {
    id: 'skin-face-bpc',
    name: 'Skin & Face',
    productImages: getProductsByCategory('personal-care', 4),
    productCount: 112,
  },
  {
    id: 'beauty-cosmetics-bpc',
    name: 'Beauty & Cosmetics',
    productImages: getProductsByCategory('personal-care', 4),
    productCount: 87,
  },
  {
    id: 'oral-care-bpc',
    name: 'Oral Care',
    productImages: [productImages['amul-butter']],
    productCount: 56,
  },
  {
    id: 'men-care-bpc',
    name: "Men's Care",
    productImages: [productImages['lays-magic-masala']],
    productCount: 43,
  },
  {
    id: 'feminine-hygiene-bpc',
    name: 'Feminine Hygiene',
    productImages: getProductsByCategory('personal-care', 1),
    productCount: 45,
  },
  {
    id: 'baby-care-bpc',
    name: 'Baby Care',
    productImages: [productImages['aashirvaad-atta']],
    productCount: 67,
  },
];

export const householdEssentialsTiles = [
  {
    id: 'home-lifestyle',
    name: 'Home & Lifestyle',
    productImages: getProductsByCategory('cleaning', 1),
    productCount: 156,
    bgColor: 'bg-amber-50',
  },
  {
    id: 'cleaners-repellents',
    name: 'Cleaners & Repellents',
    productImages: getProductsByCategory('cleaning', 1),
    productCount: 98,
    categoryId: 'cleaning',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    productImages: getProductsByCategory('cleaning', 1),
    productCount: 67,
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'stationery-games',
    name: 'Stationery & Games',
    productImages: getProductsByCategory('cleaning', 1),
    productCount: 45,
    bgColor: 'bg-orange-50',
  },
];

export const shopByStoreTiles = [
  {
    id: 'spiritual-store',
    name: 'Spiritual Store',
    productImages: ['/assets/shopbystore/spiritual.jpg'],
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'pharma-store',
    name: 'Pharma Store',
    productImages: ['/assets/shopbystore/pharma.jpg'],
    bgColor: 'bg-green-100',
  },
  {
    id: 'e-gifts-store',
    name: 'E-Gifts Store',
    productImages: ['/assets/shopbystore/egift.jpg'],
    bgColor: 'bg-pink-100',
  },
  {
    id: 'pet-store',
    name: 'Pet Store',
    productImages: ['/assets/shopbystore/pet.jpg'],
    bgColor: 'bg-blue-100',
  },
  {
    id: 'sports-store',
    name: 'Sports Store',
    productImages: ['/assets/shopbystore/sports.jpg'],
    bgColor: 'bg-orange-100',
  },
  {
    id: 'fashion-basics-store',
    name: 'Fashion Basics Store',
    productImages: ['/assets/shopbystore/fashion.jpg'],
    bgColor: 'bg-purple-100',
  },
  {
    id: 'toy-store',
    name: 'Toy Store',
    productImages: ['/assets/shopbystore/toy.jpg'],
    bgColor: 'bg-red-100',
  },
  {
    id: 'hobby-store',
    name: 'Hobby Store',
    productImages: ['/assets/shopbystore/hobby.jpg'],
    bgColor: 'bg-teal-100',
  },
];


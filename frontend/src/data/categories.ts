import { Category } from '../types/domain';
import { categoryImages } from '../utils/imagePaths';

export const categories: Category[] = [
  {
    id: 'fruits-veg',
    name: 'Fruits & Vegetables',
    icon: '🥬',
    imageUrl: categoryImages['Fruits & Vegetables'],
  },
  {
    id: 'dairy-breakfast',
    name: 'Dairy & Breakfast',
    icon: '🥛',
    imageUrl: categoryImages['Dairy, Bread & Eggs'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
    icon: '🍿',
    imageUrl: categoryImages['Snacks & Munchies'],
  },
  {
    id: 'cold-drinks',
    name: 'Cold Drinks & Juices',
    icon: '🥤',
    imageUrl: categoryImages['Cold Drinks & Juices'],
  },
  {
    id: 'atta-rice',
    name: 'Atta, Rice & Dal',
    icon: '🌾',
    imageUrl: categoryImages['Atta, Rice & Dal'],
  },
  {
    id: 'masala-oil',
    name: 'Masala & Oil',
    icon: '🧂',
    imageUrl: categoryImages['Masala, Oil & More'],
  },
  {
    id: 'biscuits-bakery',
    name: 'Biscuits & Bakery',
    icon: '🍪',
    imageUrl: categoryImages['Bakery & Biscuits'],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '🧴',
    imageUrl: categoryImages['Personal Care'],
  },
  {
    id: 'cleaning',
    name: 'Household Essentials',
    icon: '🧹',
    imageUrl: categoryImages['Cleaning Essentials'],
  },
  {
    id: 'breakfast-instant',
    name: 'Breakfast & Instant Food',
    icon: '🍜',
    imageUrl: categoryImages['Breakfast & Instant Food'],
  },
  {
    id: 'wedding',
    name: 'Wedding',
    icon: '💍',
  },
  {
    id: 'winter',
    name: 'Winter',
    icon: '❄️',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: '💄',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
  },
  {
    id: 'dry-fruits',
    name: 'Dry Fruits & Cereals',
    icon: '🥜',
  },
  {
    id: 'chicken-meat',
    name: 'Chicken, Meat & Fish',
    icon: '🍗',
  },
  {
    id: 'kitchenware',
    name: 'Kitchenware & Appliances',
    icon: '🍳',
  },
  {
    id: 'tea-coffee',
    name: 'Tea, Coffee & Milk Drinks',
    icon: '☕',
  },
  {
    id: 'sauces-spreads',
    name: 'Sauces & Spreads',
    icon: '🍯',
  },
  {
    id: 'paan-corner',
    name: 'Paan Corner',
    icon: '🌿',
  },
  {
    id: 'ice-cream',
    name: 'Ice Creams & More',
    icon: '🍦',
  },
  {
    id: 'health-pharma',
    name: 'Health & Pharma',
    icon: '💊',
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    icon: '👶',
  },
  {
    id: 'oral-care',
    name: 'Oral Care',
    icon: '🦷',
  },
];


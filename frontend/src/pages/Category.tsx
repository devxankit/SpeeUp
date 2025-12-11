import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { categories } from '../data/categories';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

// Subcategories for each category
const getSubcategories = (categoryId: string) => {
  const subcategoriesMap: Record<string, Array<{ id: string; name: string; icon: string }>> = {
    'fruits-veg': [
      { id: 'all', name: 'All', icon: '🥬' },
      { id: 'fresh-vegetables', name: 'Fresh Vegetables', icon: '🥒' },
      { id: 'fresh-fruits', name: 'Fresh Fruits', icon: '🍓' },
      { id: 'exotics', name: 'Exotics', icon: '🥭' },
      { id: 'coriander-others', name: 'Coriander & Others', icon: '🌿' },
      { id: 'flowers-leaves', name: 'Flowers & Leaves', icon: '🌹' },
      { id: 'trusted-organics', name: 'Trusted Organics', icon: '🍎' },
      { id: 'seasonal', name: 'Seasonal', icon: '🍊' },
      { id: 'freshly-cut-sprouts', name: 'Freshly Cut & Sprouts', icon: '🥗' },
      { id: 'safal', name: 'Safal', icon: '🌿' },
    ],
    'dairy-breakfast': [
      { id: 'all', name: 'All', icon: '🥛' },
      { id: 'milk', name: 'Milk', icon: '🥛' },
      { id: 'cheese', name: 'Cheese', icon: '🧀' },
      { id: 'butter-ghee', name: 'Butter & Ghee', icon: '🧈' },
      { id: 'bread', name: 'Bread', icon: '🍞' },
      { id: 'eggs', name: 'Eggs', icon: '🥚' },
      { id: 'yogurt', name: 'Yogurt', icon: '🥤' },
      { id: 'cream', name: 'Cream', icon: '🍦' },
    ],
    'snacks': [
      { id: 'all', name: 'All', icon: '🍿' },
      { id: 'chips', name: 'Chips', icon: '🥔' },
      { id: 'namkeen', name: 'Namkeen', icon: '🥨' },
      { id: 'biscuits', name: 'Biscuits', icon: '🍪' },
      { id: 'sweets', name: 'Sweets', icon: '🍬' },
      { id: 'chocolates', name: 'Chocolates', icon: '🍫' },
      { id: 'nuts', name: 'Nuts', icon: '🥜' },
      { id: 'popcorn', name: 'Popcorn', icon: '🍿' },
    ],
    'cold-drinks': [
      { id: 'all', name: 'All', icon: '🥤' },
      { id: 'soft-drinks', name: 'Soft Drinks', icon: '🥤' },
      { id: 'juices', name: 'Juices', icon: '🧃' },
      { id: 'energy-drinks', name: 'Energy Drinks', icon: '⚡' },
      { id: 'water', name: 'Water', icon: '💧' },
      { id: 'soda', name: 'Soda', icon: '🥤' },
    ],
    'atta-rice': [
      { id: 'all', name: 'All', icon: '🌾' },
      { id: 'atta', name: 'Atta', icon: '🌾' },
      { id: 'rice', name: 'Rice', icon: '🍚' },
      { id: 'dal', name: 'Dal', icon: '🫘' },
      { id: 'besan', name: 'Besan', icon: '🌾' },
      { id: 'poha', name: 'Poha', icon: '🌾' },
    ],
    'masala-oil': [
      { id: 'all', name: 'All', icon: '🧂' },
      { id: 'oil', name: 'Oil', icon: '🫒' },
      { id: 'ghee', name: 'Ghee', icon: '🧈' },
      { id: 'masala', name: 'Masala', icon: '🌶️' },
      { id: 'salt', name: 'Salt', icon: '🧂' },
      { id: 'spices', name: 'Spices', icon: '🌶️' },
    ],
    'biscuits-bakery': [
      { id: 'all', name: 'All', icon: '🍪' },
      { id: 'biscuits', name: 'Biscuits', icon: '🍪' },
      { id: 'cookies', name: 'Cookies', icon: '🍪' },
      { id: 'cakes', name: 'Cakes', icon: '🎂' },
      { id: 'rusk', name: 'Rusk', icon: '🍞' },
      { id: 'bread', name: 'Bread', icon: '🍞' },
    ],
    'personal-care': [
      { id: 'all', name: 'All', icon: '🧴' },
      { id: 'soap', name: 'Soap', icon: '🧼' },
      { id: 'shampoo', name: 'Shampoo', icon: '🧴' },
      { id: 'toothpaste', name: 'Toothpaste', icon: '🪥' },
      { id: 'facewash', name: 'Face Wash', icon: '🧴' },
      { id: 'conditioner', name: 'Conditioner', icon: '🧴' },
    ],
    'cleaning': [
      { id: 'all', name: 'All', icon: '🧹' },
      { id: 'detergents', name: 'Detergents', icon: '🧼' },
      { id: 'cleaners', name: 'Cleaners', icon: '🧽' },
      { id: 'brooms', name: 'Brooms', icon: '🧹' },
      { id: 'mops', name: 'Mops', icon: '🧹' },
      { id: 'sponges', name: 'Sponges', icon: '🧽' },
    ],
    'breakfast-instant': [
      { id: 'all', name: 'All', icon: '🍜' },
      { id: 'noodles', name: 'Noodles', icon: '🍜' },
      { id: 'poha', name: 'Poha', icon: '🍚' },
      { id: 'upma', name: 'Upma', icon: '🍚' },
      { id: 'cereals', name: 'Cereals', icon: '🥣' },
      { id: 'instant-mix', name: 'Instant Mix', icon: '🥄' },
    ],
    'wedding': [
      { id: 'all', name: 'All', icon: '💍' },
      { id: 'gift-packs', name: 'Gift Packs', icon: '🎁' },
      { id: 'dry-fruits', name: 'Dry Fruits', icon: '🥜' },
      { id: 'sweets', name: 'Sweets', icon: '🍬' },
      { id: 'decorative', name: 'Decorative', icon: '🎨' },
    ],
    'winter': [
      { id: 'all', name: 'All', icon: '❄️' },
      { id: 'woolen', name: 'Woolen', icon: '🧶' },
      { id: 'caps', name: 'Caps', icon: '🧢' },
      { id: 'gloves', name: 'Gloves', icon: '🧤' },
      { id: 'blankets', name: 'Blankets', icon: '🛏️' },
    ],
    'electronics': [
      { id: 'all', name: 'All', icon: '📱' },
      { id: 'chargers', name: 'Chargers', icon: '🔌' },
      { id: 'cables', name: 'Cables', icon: '🔌' },
      { id: 'powerbanks', name: 'Power Banks', icon: '🔋' },
      { id: 'earphones', name: 'Earphones', icon: '🎧' },
    ],
    'beauty': [
      { id: 'all', name: 'All', icon: '💄' },
      { id: 'makeup', name: 'Makeup', icon: '💄' },
      { id: 'skincare', name: 'Skincare', icon: '🧴' },
      { id: 'lipstick', name: 'Lipstick', icon: '💋' },
      { id: 'kajal', name: 'Kajal', icon: '👁️' },
    ],
    'fashion': [
      { id: 'all', name: 'All', icon: '👕' },
      { id: 'clothing', name: 'Clothing', icon: '👕' },
      { id: 'shoes', name: 'Shoes', icon: '👟' },
      { id: 'accessories', name: 'Accessories', icon: '👜' },
      { id: 'watches', name: 'Watches', icon: '⌚' },
    ],
    'sports': [
      { id: 'all', name: 'All', icon: '⚽' },
      { id: 'cricket', name: 'Cricket', icon: '🏏' },
      { id: 'football', name: 'Football', icon: '⚽' },
      { id: 'badminton', name: 'Badminton', icon: '🏸' },
      { id: 'fitness', name: 'Fitness', icon: '💪' },
    ],
    'dry-fruits': [
      { id: 'all', name: 'All', icon: '🥜' },
      { id: 'almonds', name: 'Almonds', icon: '🥜' },
      { id: 'cashews', name: 'Cashews', icon: '🥜' },
      { id: 'raisins', name: 'Raisins', icon: '🍇' },
      { id: 'dates', name: 'Dates', icon: '📅' },
      { id: 'cereals', name: 'Cereals', icon: '🥣' },
    ],
    'chicken-meat': [
      { id: 'all', name: 'All', icon: '🍗' },
      { id: 'chicken', name: 'Chicken', icon: '🍗' },
      { id: 'mutton', name: 'Mutton', icon: '🥩' },
      { id: 'fish', name: 'Fish', icon: '🐟' },
      { id: 'seafood', name: 'Seafood', icon: '🦐' },
    ],
    'kitchenware': [
      { id: 'all', name: 'All', icon: '🍳' },
      { id: 'cookware', name: 'Cookware', icon: '🍳' },
      { id: 'cutlery', name: 'Cutlery', icon: '🔪' },
      { id: 'appliances', name: 'Appliances', icon: '⚡' },
      { id: 'storage', name: 'Storage', icon: '📦' },
    ],
    'tea-coffee': [
      { id: 'all', name: 'All', icon: '☕' },
      { id: 'tea', name: 'Tea', icon: '🍵' },
      { id: 'coffee', name: 'Coffee', icon: '☕' },
      { id: 'green-tea', name: 'Green Tea', icon: '🍵' },
      { id: 'milk-drinks', name: 'Milk Drinks', icon: '🥛' },
    ],
    'sauces-spreads': [
      { id: 'all', name: 'All', icon: '🍯' },
      { id: 'ketchup', name: 'Ketchup', icon: '🍅' },
      { id: 'mayonnaise', name: 'Mayonnaise', icon: '🥄' },
      { id: 'jam', name: 'Jam', icon: '🍯' },
      { id: 'honey', name: 'Honey', icon: '🍯' },
    ],
    'paan-corner': [
      { id: 'all', name: 'All', icon: '🌿' },
      { id: 'paan', name: 'Paan', icon: '🌿' },
      { id: 'mouth-freshener', name: 'Mouth Freshener', icon: '🌿' },
      { id: 'supari', name: 'Supari', icon: '🌰' },
    ],
    'ice-cream': [
      { id: 'all', name: 'All', icon: '🍦' },
      { id: 'ice-cream', name: 'Ice Cream', icon: '🍦' },
      { id: 'frozen-desserts', name: 'Frozen Desserts', icon: '🧊' },
      { id: 'popsicles', name: 'Popsicles', icon: '🍭' },
    ],
    'health-pharma': [
      { id: 'all', name: 'All', icon: '💊' },
      { id: 'medicines', name: 'Medicines', icon: '💊' },
      { id: 'vitamins', name: 'Vitamins', icon: '💊' },
      { id: 'supplements', name: 'Supplements', icon: '💊' },
    ],
    'baby-care': [
      { id: 'all', name: 'All', icon: '👶' },
      { id: 'diapers', name: 'Diapers', icon: '👶' },
      { id: 'baby-food', name: 'Baby Food', icon: '🍼' },
      { id: 'baby-care-products', name: 'Baby Care Products', icon: '🧴' },
    ],
    'oral-care': [
      { id: 'all', name: 'All', icon: '🦷' },
      { id: 'toothpaste', name: 'Toothpaste', icon: '🪥' },
      { id: 'toothbrush', name: 'Toothbrush', icon: '🪥' },
      { id: 'mouthwash', name: 'Mouthwash', icon: '💧' },
    ],
  };

  return subcategoriesMap[categoryId] || [
    { id: 'all', name: 'All', icon: '📦' },
  ];
};

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const category = categories.find((c) => c.id === id);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Type');

  // Function to filter products by subcategory
  const filterProductsBySubcategory = (productsList: typeof products, subcategoryId: string, mainCategoryId: string) => {
    if (subcategoryId === 'all') {
      return productsList;
    }

    // Define subcategory priority (higher number = more specific, takes precedence)
    // Products matching higher priority subcategories should only appear there
    const subcategoryPriority: Record<string, Record<string, number>> = {
      'fruits-veg': {
        'safal': 10,
        'trusted-organics': 9,
        'freshly-cut-sprouts': 8,
        'exotics': 7,
        'coriander-others': 6,
        'flowers-leaves': 6,
        'seasonal': 6,
        'fresh-vegetables': 5,
        'fresh-fruits': 5,
      },
      'dairy-breakfast': {
        'cream': 6,
        'butter-ghee': 5,
        'milk': 5,
        'cheese': 5,
        'yogurt': 5,
        'bread': 5,
        'eggs': 5,
      },
      'snacks': {
        'chocolates': 7, // Higher than sweets (5) to avoid overlap
        'chips': 6,
        'namkeen': 6,
        'biscuits': 6, // Higher than biscuits-bakery (6) - but snacks biscuits are different
        'sweets': 5,
        'nuts': 6,
        'popcorn': 6,
      },
      'atta-rice': {
        'poha': 6,
        'besan': 6,
        'atta': 5,
        'rice': 5,
        'dal': 5,
      },
      'masala-oil': {
        'ghee': 6,
        'oil': 5,
        'masala': 5,
        'salt': 5,
        'spices': 5,
      },
      'biscuits-bakery': {
        'cookies': 7,
        'cakes': 7,
        'rusk': 7,
        'biscuits': 6,
        'bread': 6, // Higher than dairy-breakfast bread (5)
      },
      'breakfast-instant': {
        'poha': 7, // Higher than atta-rice poha (6)
        'noodles': 6,
        'upma': 6,
        'cereals': 6,
        'instant-mix': 6,
      },
    };

    // Define keywords for each category's subcategories
    const categoryKeywords: Record<string, Record<string, string[]>> = {
      'fruits-veg': {
        'fresh-vegetables': ['onion', 'tomato', 'potato', 'carrot', 'cabbage', 'cauliflower', 'brinjal', 'cucumber', 'ladyfinger', 'beans', 'peas', 'spinach', 'ginger', 'garlic', 'beetroot', 'radish', 'turnip', 'pumpkin', 'bottle gourd', 'ridge gourd', 'bitter gourd', 'okra', 'capsicum', 'bell pepper'],
        'fresh-fruits': ['apple', 'banana', 'orange', 'mango', 'guava', 'papaya', 'watermelon', 'grapes', 'sweet lime', 'mosambi'],
        'exotics': ['dragon fruit', 'kiwi', 'avocado', 'passion fruit', 'blueberry', 'raspberry', 'blackberry', 'strawberry', 'cherry', 'pomegranate', 'pineapple'],
        'coriander-others': ['coriander', 'mint', 'curry leaf', 'fenugreek', 'dill', 'parsley', 'basil'],
        'flowers-leaves': ['rose', 'marigold', 'flower', 'jasmine', 'betel leaf', 'betel leaves'],
        'trusted-organics': ['organic'],
        'seasonal': ['seasonal', 'lychee', 'jackfruit', 'custard apple', 'wood apple'],
        'freshly-cut-sprouts': ['freshly cut', 'cut fruits', 'cut vegetables', 'sprout', 'sprouts', 'chopped'],
        'safal': ['safal'],
      },
      'dairy-breakfast': {
        'milk': ['milk'],
        'cheese': ['cheese', 'paneer'],
        'butter-ghee': ['butter', 'ghee', 'cream'],
        'bread': ['bread', 'pav'],
        'eggs': ['egg'],
        'yogurt': ['curd', 'yogurt'],
        'cream': ['cream'],
      },
      'snacks': {
        'chips': ['lays', 'chip', 'uncle', 'bingo'],
        'namkeen': ['namkeen', 'sev', 'bhujia', 'haldiram', 'balaji'],
        'biscuits': ['biscuit', 'parle', 'good day', 'marie', 'tiger', 'monaco'],
        'sweets': ['sweet', 'chocolate', 'candy'],
        'chocolates': ['chocolate', 'cadbury', 'dairy milk'],
        'nuts': ['nut', 'almond', 'cashew', 'pistachio'],
        'popcorn': ['popcorn', 'act2'],
      },
      'cold-drinks': {
        'soft-drinks': ['coke', 'pepsi', 'sprite', 'fanta', 'thums up', 'mountain dew', 'mirinda', 'limca', '7up'],
        'juices': ['juice', 'tropicana', 'real', 'maaza', 'slice'],
        'energy-drinks': ['red bull', 'energy'],
        'water': ['water', 'bisleri', 'aquafina'],
        'soda': ['soda'],
      },
      'atta-rice': {
        'atta': ['atta', 'flour', 'wheat'],
        'rice': ['rice', 'basmati', 'sona', 'kolam', 'pulav'],
        'dal': ['dal', 'moong', 'toor', 'chana', 'urad', 'masoor', 'rajma'],
        'besan': ['besan'],
        'poha': ['poha'],
      },
      'masala-oil': {
        'oil': ['oil', 'refined', 'mustard', 'sunflower', 'groundnut', 'coconut', 'sesame', 'soya'],
        'ghee': ['ghee'],
        'masala': ['masala', 'garam', 'chicken', 'everest', 'mdh'],
        'salt': ['salt', 'tata salt'],
        'spices': ['chilli', 'turmeric', 'coriander', 'cumin', 'mustard seed', 'fenugreek'],
      },
      'biscuits-bakery': {
        'biscuits': ['biscuit', 'parle', 'good day', 'marie', 'tiger', 'monaco', 'hide', 'seek'],
        'cookies': ['cookie', 'oreo', 'dark fantasy', 'good day'],
        'cakes': ['cake', 'britannia'],
        'rusk': ['rusk'],
        'bread': ['bread', 'britannia'],
      },
      'personal-care': {
        'soap': ['soap', 'dove', 'lux', 'lifebuoy', 'dettol', 'santoor'],
        'shampoo': ['shampoo', 'dove', 'sunsilk', 'pantene'],
        'toothpaste': ['toothpaste', 'colgate', 'pepsodent'],
        'facewash': ['face', 'himalaya'],
        'conditioner': ['conditioner', 'dove'],
      },
      'cleaning': {
        'detergents': ['detergent', 'surf', 'ariel', 'rin'],
        'cleaners': ['cleaner', 'vim', 'harpic', 'lizol', 'colin'],
        'brooms': ['broom'],
        'mops': ['mop'],
        'sponges': ['sponge', 'scrubber'],
      },
      'breakfast-instant': {
        'noodles': ['noodle', 'maggi', 'yippee', 'top ramen'],
        'poha': ['poha', 'mtr poha'],
        'upma': ['upma', 'mtr upma'],
        'cereals': ['corn', 'oats', 'muesli', 'kellogg'],
        'instant-mix': ['idli', 'dosa', 'mix', 'mtr'],
      },
      'wedding': {
        'gift-packs': ['gift', 'pack', 'box'],
        'dry-fruits': ['dry', 'fruit', 'nut', 'almond', 'cashew', 'pistachio', 'date'],
        'sweets': ['sweet', 'chocolate', 'ferrero', 'rocher'],
        'decorative': ['decorative', 'candle', 'coconut'],
      },
      'winter': {
        'woolen': ['woolen', 'wool'],
        'caps': ['cap'],
        'gloves': ['glove'],
        'blankets': ['blanket'],
      },
      'electronics': {
        'chargers': ['charger'],
        'cables': ['cable', 'usb'],
        'powerbanks': ['power', 'bank'],
        'earphones': ['earphone', 'headphone'],
      },
      'beauty': {
        'makeup': ['makeup', 'cosmetic'],
        'skincare': ['skincare', 'moisturizer', 'cream'],
        'lipstick': ['lipstick', 'lakme'],
        'kajal': ['kajal', 'colossal', 'maybelline'],
      },
      'fashion': {
        'clothing': ['tshirt', 'shirt', 'jeans', 'clothing'],
        'shoes': ['shoe'],
        'accessories': ['bag', 'backpack'],
        'watches': ['watch'],
      },
      'sports': {
        'cricket': ['cricket', 'bat'],
        'football': ['football'],
        'badminton': ['badminton', 'racket'],
        'fitness': ['yoga', 'mat', 'dumbbell', 'fitness'],
      },
    };

    const keywords = categoryKeywords[mainCategoryId]?.[subcategoryId] || [];
    if (keywords.length === 0) return productsList;

    const currentPriority = subcategoryPriority[mainCategoryId]?.[subcategoryId] || 0;
    const allSubcategories = Object.keys(categoryKeywords[mainCategoryId] || {});

    return productsList.filter((product) => {
      const nameLower = product.name.toLowerCase();
      const tagsLower = (product.tags || []).map(tag => tag.toLowerCase());
      
      // Check if product matches current subcategory
      const matchesCurrent = keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase().trim();
        
        // For multi-word keywords, match the entire phrase
        if (keywordLower.includes(' ')) {
          return nameLower.includes(keywordLower) || tagsLower.some(tag => tag.includes(keywordLower));
        }
        
        // For single-word keywords, check if it appears as a whole word
        const nameWords = nameLower.split(/\s+/);
        const tagWords = tagsLower.flatMap(tag => tag.split(/\s+/));
        
        const exactMatch = nameWords.includes(keywordLower) || tagWords.includes(keywordLower);
        const wordBoundaryPattern = new RegExp(`(^|\\s)${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
        const boundaryMatch = wordBoundaryPattern.test(nameLower) || tagsLower.some(tag => wordBoundaryPattern.test(tag));
        
        return exactMatch || boundaryMatch;
      });

      if (!matchesCurrent) return false;

      // Check if product matches a higher priority subcategory - if so, exclude from current
      for (const otherSubcatId of allSubcategories) {
        if (otherSubcatId === subcategoryId) continue;
        
        const otherPriority = subcategoryPriority[mainCategoryId]?.[otherSubcatId] || 0;
        if (otherPriority <= currentPriority) continue; // Skip lower or equal priority
        
        const otherKeywords = categoryKeywords[mainCategoryId]?.[otherSubcatId] || [];
        const matchesOther = otherKeywords.some(keyword => {
          const keywordLower = keyword.toLowerCase().trim();
          
          if (keywordLower.includes(' ')) {
            return nameLower.includes(keywordLower) || tagsLower.some(tag => tag.includes(keywordLower));
          }
          
          const nameWords = nameLower.split(/\s+/);
          const tagWords = tagsLower.flatMap(tag => tag.split(/\s+/));
          const exactMatch = nameWords.includes(keywordLower) || tagWords.includes(keywordLower);
          const wordBoundaryPattern = new RegExp(`(^|\\s)${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
          const boundaryMatch = wordBoundaryPattern.test(nameLower) || tagsLower.some(tag => wordBoundaryPattern.test(tag));
          
          return exactMatch || boundaryMatch;
        });
        
        // If product matches a higher priority subcategory, exclude from current
        if (matchesOther) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Get all products for this category and filter by subcategory
  const categoryProducts = useMemo(() => {
    const allCategoryProducts = products.filter((p) => p.categoryId === id);
    return filterProductsBySubcategory(allCategoryProducts, selectedSubcategory, id || '');
  }, [id, selectedSubcategory]);

  if (!category) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Category not found
        </h1>
        <p className="text-neutral-600 md:text-lg">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  const subcategories = getSubcategories(id || '');

  // Extract filter options from products
  const getFilterOptions = () => {
    const categoryProducts = products.filter((p) => p.categoryId === id);
    const filterMap = new Map<string, number>();
    
    categoryProducts.forEach((product) => {
      // Extract main ingredient/type from product name
      const name = product.name.toLowerCase();
      // Remove common prefixes like "fresh", "organic", etc.
      const cleanName = name.replace(/^(fresh|organic|premium|best|new)\s+/i, '').trim();
      
      const commonTypes = [
        { keywords: ['tomato', 'tomatoes'], display: 'Tomato' },
        { keywords: ['potato', 'potatoes'], display: 'Potato' },
        { keywords: ['chilli', 'chili', 'chilies'], display: 'Chilli' },
        { keywords: ['spinach'], display: 'Spinach' },
        { keywords: ['brinjal', 'eggplant'], display: 'Brinjal' },
        { keywords: ['onion', 'onions'], display: 'Onion' },
        { keywords: ['peanut', 'peanuts'], display: 'Peanuts' },
        { keywords: ['lemon', 'lemons'], display: 'Lemon' },
        { keywords: ['mushroom', 'mushrooms'], display: 'Mushroom' },
        { keywords: ['capsicum', 'bell pepper', 'pepper'], display: 'Capsicum' },
        { keywords: ['ginger'], display: 'Ginger' },
        { keywords: ['carrot', 'carrots'], display: 'Carrot' },
        { keywords: ['fenugreek', 'methi'], display: 'Fenugreek' },
        { keywords: ['broccoli'], display: 'Broccoli' },
        { keywords: ['cucumber', 'cucumbers'], display: 'Cucumber' },
        { keywords: ['cabbage'], display: 'Cabbage' },
        { keywords: ['cauliflower'], display: 'Cauliflower' },
        { keywords: ['ladyfinger', 'okra'], display: 'Ladyfinger' },
        { keywords: ['beans'], display: 'Beans' },
        { keywords: ['peas'], display: 'Peas' },
        { keywords: ['garlic'], display: 'Garlic' },
        { keywords: ['apple', 'apples'], display: 'Apple' },
        { keywords: ['banana', 'bananas'], display: 'Banana' },
        { keywords: ['orange', 'oranges'], display: 'Orange' },
        { keywords: ['mango', 'mangoes'], display: 'Mango' },
      ];
      
      for (const type of commonTypes) {
        if (type.keywords.some(keyword => cleanName.includes(keyword))) {
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
      'Tomato': '🍅',
      'Potato': '🥔',
      'Chilli': '🌶️',
      'Spinach': '🥬',
      'Brinjal': '🍆',
      'Onion': '🧅',
      'Peanuts': '🥜',
      'Lemon': '🍋',
      'Mushroom': '🍄',
      'Capsicum': '🫑',
      'Ginger': '🫚',
      'Carrot': '🥕',
      'Fenugreek': '🌿',
      'Broccoli': '🥦',
      'Cucumber': '🥒',
      'Cabbage': '🥬',
      'Cauliflower': '🥦',
      'Apple': '🍎',
      'Banana': '🍌',
      'Orange': '🍊',
      'Mango': '🥭',
    };
    return iconMap[name] || '🥬';
  };

  const filterOptions = getFilterOptions();
  const filteredOptions = filterOptions.filter(option =>
    option.name.toLowerCase().includes(filterSearchQuery.toLowerCase())
  );

  const handleFilterToggle = (filterName: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterName)
        ? prev.filter(f => f !== filterName)
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
            const isSelected = selectedSubcategory === subcat.id;
            return (
              <button
                key={subcat.id}
                type="button"
                onClick={() => {
                  console.log('Clicked subcategory:', subcat.id);
                  setSelectedSubcategory(subcat.id);
                }}
                className="w-full flex flex-col items-center justify-center py-2 relative hover:bg-neutral-50 transition-colors cursor-pointer"
                style={{ 
                  minHeight: '70px', 
                  paddingLeft: '4px', 
                  paddingRight: '4px',
                  pointerEvents: 'auto',
                  zIndex: 10
                }}
              >
                {/* Green vertical line indicator for active */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-600" style={{ zIndex: 0, pointerEvents: 'none' }}></div>
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1.5 flex-shrink-0 pointer-events-none ${isSelected
                    ? 'bg-white border-2 border-green-600'
                    : 'bg-white border border-neutral-300'
                    }`}
                >
                  {subcat.icon}
                </div>
                <span
                  className={`text-[9px] text-center leading-tight break-words pointer-events-none ${isSelected ? 'font-semibold text-neutral-900' : 'text-neutral-600'
                    }`}
                  style={{
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    lineHeight: '1.1',
                    width: '100%',
                    paddingLeft: '2px',
                    paddingRight: '2px'
                  }}
                >
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
                  aria-label="Go back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h1 className="text-base md:text-xl font-bold text-neutral-900">{category.name}</h1>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors flex-shrink-0 whitespace-nowrap"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <circle cx="6" cy="8" r="1.5" fill="currentColor" />
                <circle cx="6" cy="16" r="1.5" fill="currentColor" />
                <path d="M3 8h6M3 16h6M10 8h11M10 16h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Filters</span>
              <span className="text-neutral-500 text-[10px] ml-0.5">▾</span>
            </button>
            
            {/* Sort Button */}
            <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors flex-shrink-0 whitespace-nowrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M7 8l5-5 5 5M7 16l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Sort</span>
              <span className="text-neutral-500 text-[10px] ml-0.5">▾</span>
            </button>

            {/* Category Buttons */}
            {subcategories.filter(subcat => subcat.id !== 'all').map((subcat) => {
              const isSelected = selectedSubcategory === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => setSelectedSubcategory(subcat.id)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors flex-shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-white border border-neutral-300 text-neutral-900'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-sm flex-shrink-0">{subcat.icon}</span>
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
              <p className="text-neutral-500 md:text-lg">No products found in this category.</p>
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
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-neutral-200">
                  <h2 className="text-base font-bold text-neutral-900">Filters</h2>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-3 border-b border-neutral-200">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                      onClick={() => setSelectedFilterCategory('Type')}
                      className={`w-full px-3 py-3 text-left text-sm font-medium transition-colors ${
                        selectedFilterCategory === 'Type'
                          ? 'bg-green-50 text-green-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      Type
                    </button>
                    <button
                      onClick={() => setSelectedFilterCategory('Properties')}
                      className={`w-full px-3 py-3 text-left text-sm font-medium transition-colors ${
                        selectedFilterCategory === 'Properties'
                          ? 'bg-green-50 text-green-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
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
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 rounded-lg transition-colors"
                          >
                            <span className="text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center">{option.icon}</span>
                            <span className="flex-1 text-left text-sm font-medium text-neutral-700">
                              {option.name}
                            </span>
                            <span className="text-sm text-neutral-500">({option.count})</span>
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                              {isChecked ? (
                                <div className="w-5 h-5 border-2 border-green-600 bg-green-600 rounded-sm flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
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
                    className="flex-1 px-4 py-2.5 border border-green-600 text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors bg-white"
                  >
                    Clear Filter
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      selectedFilters.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                    disabled={selectedFilters.length === 0}
                  >
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

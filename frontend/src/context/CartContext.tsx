import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Cart, CartItem } from '../types/cart';
import { Product } from '../types/domain';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart
} from '../services/api/customerCartService';

const CART_STORAGE_KEY = 'saved_cart';

interface AddToCartEvent {
  product: Product;
  sourcePosition?: { x: number; y: number };
}

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, sourceElement?: HTMLElement | null) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  lastAddEvent: AddToCartEvent | null;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Extended interface to include Cart Item ID
interface ExtendedCartItem extends CartItem {
  id?: string;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage for persistence on refresh
  const [items, setItems] = useState<ExtendedCartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out items with null/undefined products (corrupted localStorage data)
        return Array.isArray(parsed) ? parsed.filter((item: any) => item?.product) : [];
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
    return [];
  });
  const [lastAddEvent, setLastAddEvent] = useState<AddToCartEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();

  // Helper to map API cart items to internal CartItem structure
  const mapApiItemsToState = (apiItems: any[]): ExtendedCartItem[] => {
    return apiItems
      .filter((item: any) => item.product) // Safety filter
      .map((item: any) => ({
        id: item._id, // Store CartItem ID
        product: {
          id: item.product._id, // Map _id to id
          name: item.product.productName || item.product.name,
          price: item.product.price,
          mrp: item.product.mrp,
          imageUrl: item.product.mainImage || item.product.imageUrl,
          pack: item.product.pack || '1 unit',
          categoryId: item.product.category || '',
          description: item.product.description
        },
        quantity: item.quantity
      }));
  };

  // Sync to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Helper to sync cart from API
  const fetchCart = async () => {
    if (!isAuthenticated || user?.userType !== 'Customer') {
      // If we cleared it above but had things in localStorage, we keep them for guests?
      // For now, if logged out, we clear if it was an authenticated session.
      // But if guest, we might want to keep it.
      // Let's only clear if we are transition from logged in to logged out.
      setLoading(false);
      return;
    }

    try {
      const response = await getCart();
      if (response && response.data && response.data.items) {
        setItems(mapApiItemsToState(response.data.items));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Guest cart is already in 'items' from localStorage if it existed
      setLoading(false);
    }
  }, [isAuthenticated, user?.userType]);

  const cart: Cart = useMemo(() => {
    // Filter out any items with null products before computing totals
    const validItems = items.filter(item => item?.product);
    const total = validItems.reduce((sum, item) => sum + item.product.price * (item.quantity || 0), 0);
    const itemCount = validItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return { items: validItems, total, itemCount };
  }, [items]);

  const addToCart = async (product: Product, sourceElement?: HTMLElement | null) => {
    // Optimistic Update
    // Get source position if element is provided
    let sourcePosition: { x: number; y: number } | undefined;
    if (sourceElement) {
      const rect = sourceElement.getBoundingClientRect();
      sourcePosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    setLastAddEvent({ product, sourcePosition });
    setTimeout(() => setLastAddEvent(null), 800);

    // Optimistically update state
    const previousItems = [...items];
    setItems((prevItems) => {
      // Filter out null products and find existing item
      const validItems = prevItems.filter(item => item?.product);
      const existingItem = validItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return validItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...validItems, { product, quantity: 1 }];
    });

    try {
      const response = await apiAddToCart(product.id);
      if (response && response.data && response.data.items) {
        // Atomic update from server response
        setItems(mapApiItemsToState(response.data.items));
      }
    } catch (error) {
      console.error("Add to cart failed", error);
      // Revert on error
      setItems(previousItems);
    }
  };

  const removeFromCart = async (productId: string) => {
    const itemToRemove = items.find(item => item?.product && item.product.id === productId);
    if (!itemToRemove || !itemToRemove.id) {
      console.warn("Cannot remove item without CartItemID");
      await fetchCart();
      return;
    }

    const previousItems = [...items];
    setItems((prevItems) => prevItems.filter((item) => item?.product && item.product.id !== productId));

    try {
      const response = await apiRemoveFromCart(itemToRemove.id);
      if (response && response.data && response.data.items) {
        setItems(mapApiItemsToState(response.data.items));
      }
    } catch (error) {
      console.error("Remove from cart failed", error);
      setItems(previousItems);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const itemToUpdate = items.find(item => item?.product && item.product.id === productId);
    if (!itemToUpdate || !itemToUpdate.id) {
      await fetchCart();
      return;
    }

    const previousItems = [...items];
    setItems((prevItems) =>
      prevItems.filter(item => item?.product).map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    try {
      const response = await apiUpdateCartItem(itemToUpdate.id, quantity);
      if (response && response.data && response.data.items) {
        setItems(mapApiItemsToState(response.data.items));
      }
    } catch (error) {
      console.error("Update quantity failed", error);
      setItems(previousItems);
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await apiClearCart();
    } catch (error) {
      console.error("Clear cart failed", error);
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, lastAddEvent, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}



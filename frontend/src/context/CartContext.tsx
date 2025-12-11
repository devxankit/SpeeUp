import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Cart, CartItem } from '../types/cart';
import { Product } from '../types/domain';
import { products } from '../data/products';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Load cart from localStorage on mount
  const loadCartFromStorage = (): CartItem[] => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const savedItems = JSON.parse(saved);
        // Reconstruct cart items by finding products by ID
        const cartItems: CartItem[] = savedItems
          .map((item: { productId: string; quantity: number }) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              return { product, quantity: item.quantity };
            }
            return null;
          })
          .filter((item: CartItem | null) => item !== null) as CartItem[];
        return cartItems;
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
    return [];
  };

  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [lastAddEvent, setLastAddEvent] = useState<AddToCartEvent | null>(null);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      // Save only product IDs and quantities to localStorage
      const itemsToSave = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itemsToSave));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [items]);

  const cart: Cart = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, total, itemCount };
  }, [items]);

  const addToCart = (product: Product, sourceElement?: HTMLElement | null) => {
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
    
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });

    // Clear the event after a short delay
    setTimeout(() => setLastAddEvent(null), 100);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Clear localStorage when cart is cleared (order placed)
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, lastAddEvent }}
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


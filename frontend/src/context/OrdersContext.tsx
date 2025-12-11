import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Order } from '../types/order';

const ORDERS_STORAGE_KEY = 'saved_orders';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  // Load orders from localStorage on mount
  const loadOrdersFromStorage = (): Order[] => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error);
    }
    return [];
  };

  const [orders, setOrders] = useState<Order[]>(loadOrdersFromStorage);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to storage:', error);
    }
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => {
      const newOrders = [order, ...prevOrders]; // Most recent first
      return newOrders;
    });
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrderById, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}



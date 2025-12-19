import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Order } from '../types/order';
import { createOrder, getMyOrders } from '../services/api/customerOrderService';
// updateOrderStatus might not be available in customerOrderService, but typical for cancellation
// Actually order creation is main thing here.

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Order) => Promise<string | undefined>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  loading: boolean;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();

  const fetchOrders = async () => {
    if (!isAuthenticated || user?.userType !== 'Customer') {
      setLoading(false);
      return;
    }

    try {
      const response = await getMyOrders();
      if (response && response.data) {
        // Map backend order to frontend Order type if needed
        // Currently assuming consistent, but likely need mapping if data structure differs
        // For now, storing as is, or with minimal mapping
        setOrders(response.data.map((o: any) => ({
          ...o,
          id: o._id, // Map _id to id
          // Ensure other fields match
        })));
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.userType]);

  const addOrder = async (order: Order): Promise<string | undefined> => {
    try {
      // Construct payload
      const payload = {
        address: {
          address: order.address.street || '',
          city: order.address.city,
          state: order.address.state || '',
          pincode: order.address.pincode,
          landmark: order.address.landmark || '',
          // lat/long if available in order address
        },
        paymentMethod: 'COD', // Default or from order object if available
        items: order.items.map(item => ({
          product: { id: item.product.id },
          quantity: item.quantity,
          variant: undefined // Add logic if variants exist
        })),
        fees: {
          deliveryFee: order.fees?.deliveryFee || 0,
          platformFee: order.fees?.platformFee || 0
        }
      };

      const response = await createOrder(payload as any);
      await fetchOrders();

      // Return the created order ID from response
      if (response && response.data) {
        return response.data._id || response.data.id;
      }
      return undefined;
    } catch (error) {
      console.error("Failed to create order", error);
      throw error;
    }
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // This is likely for cancellation if allowed
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? { ...order, status } : order))
    );
    // Call API if exists
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrderById, updateOrderStatus, loading }}>
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




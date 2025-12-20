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
  fetchOrderById: (id: string) => Promise<Order | undefined>; // Add this
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
      console.log('📦 Fetched orders response:', response);
      if (response && response.data) {
        // Backend now returns transformed data with id, totalItems, totalAmount, fees
        // Just use it directly
        const orders = response.data.map((o: any) => ({
          ...o,
          // Backend already provides 'id', but ensure it's set from _id if missing
          id: o.id || o._id,
        }));
        console.log('📦 Mapped orders:', orders);
        setOrders(orders);
      }
    } catch (error) {
      console.error("❌ Failed to fetch orders", error);
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
          address: order.address.street || order.address.address || '',
          city: order.address.city,
          state: order.address.state || '',
          pincode: order.address.pincode,
          landmark: order.address.landmark || '',
          latitude: order.address.latitude,
          longitude: order.address.longitude,
        },
        paymentMethod: order.paymentMethod || 'COD',
        items: order.items.map(item => ({
          product: {
            id: item.product.id || (item.product as any)._id
          },
          quantity: item.quantity,
          variant: item.variant // Pass variant if available
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

  const fetchOrderById = async (id: string): Promise<Order | undefined> => {
    try {
      const { getOrderById: apiGetOrderById } = await import('../services/api/customerOrderService');
      const response = await apiGetOrderById(id);
      if (response && response.data) {
        const mappedOrder = {
          ...response.data,
          id: response.data._id || response.data.id
        };
        // Optionally update the orders list
        setOrders(prev => {
          if (prev.find(o => o.id === mappedOrder.id)) return prev;
          return [...prev, mappedOrder];
        });
        return mappedOrder;
      }
    } catch (error) {
      console.error("Failed to fetch order by id", error);
    }
    return undefined;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    // This is likely for cancellation if allowed
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === id ? { ...order, status } : order))
    );
    // Call API if exists
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, getOrderById, fetchOrderById, updateOrderStatus, loading }}>
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




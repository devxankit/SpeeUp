export type DeliveryOrderStatus = 'Ready for pickup' | 'Out for delivery' | 'Delivered' | 'Cancelled';

export interface DeliveryOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: DeliveryOrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
  distance?: string;
}

export interface DeliveryNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route: string;
}

// Mock Orders
export const mockOrders: DeliveryOrder[] = [
  {
    id: 'del-1',
    orderId: 'ORD-123456',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    address: '123, Silicon City, Indore, MP 452001',
    items: [
      { name: 'Amul Butter 500g', quantity: 2, price: 120 },
      { name: 'Britannia Bread', quantity: 1, price: 35 },
      { name: 'Eggs (Dozen)', quantity: 1, price: 80 },
    ],
    totalAmount: 355,
    status: 'Ready for pickup',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedDeliveryTime: '10 mins',
    distance: '2.5 km',
  },
  {
    id: 'del-2',
    orderId: 'ORD-123457',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43211',
    address: '456, Vijay Nagar, Indore, MP 452010',
    items: [
      { name: 'Fortune Atta 5kg', quantity: 1, price: 250 },
      { name: 'Daawat Rice 5kg', quantity: 1, price: 450 },
      { name: 'Masoor Dal 1kg', quantity: 2, price: 180 },
    ],
    totalAmount: 1060,
    status: 'Out for delivery',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    estimatedDeliveryTime: '5 mins',
    distance: '1.8 km',
  },
  {
    id: 'del-3',
    orderId: 'ORD-123458',
    customerName: 'Amit Patel',
    customerPhone: '+91 98765 43212',
    address: '789, Palasia, Indore, MP 452001',
    items: [
      { name: 'Lays Magic Masala', quantity: 3, price: 60 },
      { name: 'Kurkure', quantity: 2, price: 40 },
      { name: 'Cold Drinks 1L', quantity: 2, price: 100 },
    ],
    totalAmount: 420,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    distance: '3.2 km',
  },
  {
    id: 'del-4',
    orderId: 'ORD-123459',
    customerName: 'Sneha Gupta',
    customerPhone: '+91 98765 43213',
    address: '321, Scheme 54, Indore, MP 452009',
    items: [
      { name: 'Amul Cheese 200g', quantity: 1, price: 95 },
      { name: 'Mother Dairy Curd 500g', quantity: 2, price: 60 },
    ],
    totalAmount: 215,
    status: 'Ready for pickup',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedDeliveryTime: '12 mins',
    distance: '1.5 km',
  },
  {
    id: 'del-5',
    orderId: 'ORD-123460',
    customerName: 'Vikram Singh',
    customerPhone: '+91 98765 43214',
    address: '654, Bhanwarkua, Indore, MP 452001',
    items: [
      { name: 'MTR Poha 500g', quantity: 2, price: 50 },
      { name: 'Fortune Poha 500g', quantity: 1, price: 45 },
      { name: 'Tea 500g', quantity: 1, price: 120 },
    ],
    totalAmount: 265,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    distance: '2.8 km',
  },
];

// Mock Notifications
export const mockNotifications: DeliveryNotification[] = [
  {
    id: 'notif-1',
    title: 'New Order Assigned',
    message: 'You have been assigned a new order ORD-123456',
    type: 'order',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Order Delivered',
    message: 'Order ORD-123458 has been successfully delivered',
    type: 'order',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Payment Received',
    message: 'Payment of ₹420 received for order ORD-123458',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'System Update',
    message: 'App updated to version 2.1.0 with new features',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'New Order Assigned',
    message: 'You have been assigned a new order ORD-123459',
    type: 'order',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: 'menu-1',
    title: 'Profile',
    icon: '',
    route: '/delivery/profile',
  },
  {
    id: 'menu-2',
    title: 'Earnings',
    icon: '',
    route: '/delivery/earnings',
  },
  {
    id: 'menu-3',
    title: 'Settings',
    icon: '',
    route: '/delivery/settings',
  },
  {
    id: 'menu-4',
    title: 'Help & Support',
    icon: '',
    route: '/delivery/help',
  },
  {
    id: 'menu-5',
    title: 'About',
    icon: '',
    route: '/delivery/about',
  },
  {
    id: 'menu-6',
    title: 'Logout',
    icon: '',
    route: '/delivery/login',
  },
];

// Calculate dashboard stats from mock data
export const getDashboardStats = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = mockOrders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const pendingOrders = todayOrders.filter((o) => o.status === 'Ready for pickup' || o.status === 'Out for delivery');
  const returnOrders = todayOrders.filter((o) => o.status === 'Cancelled');
  const deliveredOrders = todayOrders.filter((o) => o.status === 'Delivered');

  const dailyCollection = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const todayEarning = deliveredOrders.length * 25; // Assuming ₹25 per delivery
  const totalEarning = 358.70 + todayEarning;

  return {
    pendingOrders: pendingOrders.length,
    allOrders: todayOrders.length,
    returnOrders: returnOrders.length,
    returnItems: 0,
    dailyCollection,
    cashBalance: 0,
    todayEarning,
    totalEarning,
    pendingOrdersList: pendingOrders,
  };
};


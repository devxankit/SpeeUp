import { CartItem } from './cart';

export type OrderStatus = 'Placed' | 'Accepted' | 'On the way' | 'Delivered';

export interface OrderAddress {
  name: string;
  phone: string;
  flat: string;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  landmark?: string;
  id?: string; // Add id for backend ID mapping
  _id?: string; // Add _id for backend ID mapping
}

export interface OrderFees {
  platformFee?: number;
  deliveryFee?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  fees: OrderFees;
  totalAmount: number;
  address: OrderAddress;
  status: OrderStatus;
  createdAt: string;
}



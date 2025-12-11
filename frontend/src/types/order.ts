import { CartItem } from './cart';

export type OrderStatus = 'Placed' | 'Accepted' | 'On the way' | 'Delivered';

export interface OrderAddress {
  name: string;
  phone: string;
  flat: string;
  street: string;
  city: string;
  pincode: string;
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



import api from './config';

export interface OrderItem {
    product: {
        id: string;
        name: string;
        image: string;
        price: number;
    };
    quantity: number;
    total: number;
}

export interface CreateOrderData {
    items: {
        product: {
            id: string;
            name?: string;
        };
        quantity: number;
        variant?: string;
    }[];
    address: any; // We'll refine this type based on the address object structure
    paymentMethod: string;
    fees?: {
        deliveryFee: number;
        platformFee: number;
    };
}

export interface OrderResponse {
    success: boolean;
    message?: string;
    data: any;
}

export interface MyOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
}

/**
 * Create a new order
 */
export const createOrder = async (data: CreateOrderData): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>('/customer/orders', data);
    return response.data;
};

/**
 * Get my orders
 */
export const getMyOrders = async (params?: MyOrdersParams): Promise<any> => {
    const response = await api.get('/customer/orders', { params });
    return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<any> => {
    const response = await api.get(`/customer/orders/${id}`);
    return response.data;
};

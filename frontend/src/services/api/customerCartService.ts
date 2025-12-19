import api from './config';

export interface CartItem {
    _id: string;
    product: {
        _id: string;
        productName: string;
        price: number;
        mainImage: string;
        stock: number;
        pack?: string;
    };
    quantity: number;
    variation?: string;
}

export interface Cart {
    _id: string;
    items: CartItem[];
    total: number;
}

export interface CartResponse {
    success: boolean;
    message?: string;
    data: Cart;
}

/**
 * Get current user's cart
 */
export const getCart = async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/customer/cart');
    return response.data;
};

/**
 * Add item to cart
 */
export const addToCart = async (productId: string, quantity: number = 1, variation?: string): Promise<CartResponse> => {
    const response = await api.post<CartResponse>('/customer/cart/add', {
        productId,
        quantity,
        variation
    });
    return response.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (itemId: string, quantity: number): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(`/customer/cart/item/${itemId}`, { quantity });
    return response.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (itemId: string): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/customer/cart/item/${itemId}`);
    return response.data;
};

/**
 * Clear cart
 */
export const clearCart = async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>('/customer/cart');
    return response.data;
};

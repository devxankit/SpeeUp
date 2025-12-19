import api from './config';
import { Product } from '../../types/domain';

export interface WishlistResponse {
    success: boolean;
    message?: string;
    data: {
        _id: string;
        customer: string;
        products: Product[];
    };
}

export const getWishlist = async (): Promise<WishlistResponse> => {
    const response = await api.get<WishlistResponse>('/customer/wishlist');
    return response.data;
};

export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
    const response = await api.post<WishlistResponse>('/customer/wishlist', { productId });
    return response.data;
};

export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
    const response = await api.delete<WishlistResponse>(`/customer/wishlist/${productId}`);
    return response.data;
};

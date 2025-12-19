import api from "./config";
import { Product } from "./productService";

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
  const res = await api.get<WishlistResponse>("/customer/wishlist");
  return res.data;
};

export const addToWishlist = async (productId: string): Promise<WishlistResponse> => {
  const res = await api.post<WishlistResponse>("/customer/wishlist", { productId });
  return res.data;
};

export const removeFromWishlist = async (productId: string): Promise<WishlistResponse> => {
  const res = await api.delete<WishlistResponse>(`/customer/wishlist/${productId}`);
  return res.data;
};


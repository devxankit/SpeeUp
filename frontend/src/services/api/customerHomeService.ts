import api from "./config";

export interface HomeContentResponse {
  success: boolean;
  data: {
    bestsellers: any[];
    categories: any[];
    shops: any[];
    promoBanners: any[];
    trending: any[];
    cookingIdeas: any[];
    promoCards?: any[];
  };
}

/**
 * Get home page content
 * @param headerCategorySlug - Optional header category slug to filter categories (e.g., 'winter', 'wedding')
 */
export const getHomeContent = async (
  headerCategorySlug?: string
): Promise<HomeContentResponse> => {
  const params = headerCategorySlug ? { headerCategorySlug } : {};
  const response = await api.get<HomeContentResponse>("/customer/home", {
    params,
  });
  return response.data;
};

/**
 * Get products for a specific "shop" (e.g. Spiritual Store)
 */
export const getStoreProducts = async (storeId: string): Promise<any> => {
  const response = await api.get(`/customer/home/store/${storeId}`);
  return response.data;
};

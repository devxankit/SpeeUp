import api from "./config";

export interface HomeContentResponse {
  success: boolean;
  data: {
    bestsellers: any[];
    lowestPrices?: any[];
    categories: any[];
    shops: any[];
    promoBanners: any[];
    trending: any[];
    cookingIdeas: any[];
    promoCards?: any[];
    promoStrip?: any; // PromoStrip data from backend
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
export const getStoreProducts = async (
  storeId: string,
  latitude?: number,
  longitude?: number
): Promise<any> => {
  const params: any = {};
  if (latitude !== undefined && longitude !== undefined) {
    params.latitude = latitude;
    params.longitude = longitude;
  }
  const response = await api.get(`/customer/home/store/${storeId}`, { params });
  return response.data;
};

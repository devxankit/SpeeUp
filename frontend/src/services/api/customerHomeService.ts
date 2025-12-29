import api from "./config";
import { apiCache } from "../../utils/apiCache";

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
 * Get home page content with caching
 * @param headerCategorySlug - Optional header category slug to filter categories (e.g., 'winter', 'wedding')
 * @param useCache - Whether to use cache (default: true)
 * @param cacheTTL - Cache TTL in milliseconds (default: 5 minutes)
 */
export const getHomeContent = async (
  headerCategorySlug?: string,
  useCache: boolean = true,
  cacheTTL: number = 5 * 60 * 1000 // 5 minutes
): Promise<HomeContentResponse> => {
  const cacheKey = `home-content-${headerCategorySlug || 'all'}`;

  if (useCache) {
    return apiCache.getOrFetch(
      cacheKey,
      async () => {
        const params = headerCategorySlug ? { headerCategorySlug } : {};
        const response = await api.get<HomeContentResponse>("/customer/home", {
          params,
        });
        return response.data;
      },
      cacheTTL
    );
  }

  // Fetch without cache
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

import api from './config';

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
 */
export const getHomeContent = async (): Promise<HomeContentResponse> => {
    const response = await api.get<HomeContentResponse>('/customer/home');
    return response.data;
};

/**
 * Get products for a specific "shop" (e.g. Spiritual Store)
 */
export const getStoreProducts = async (storeId: string, latitude?: number, longitude?: number): Promise<any> => {
    const params: any = {};
    if (latitude !== undefined && longitude !== undefined) {
        params.latitude = latitude;
        params.longitude = longitude;
    }
    const response = await api.get(`/customer/home/store/${storeId}`, { params });
    return response.data;
}

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
export const getStoreProducts = async (storeId: string): Promise<any> => {
    const response = await api.get(`/customer/home/store/${storeId}`);
    return response.data;
}

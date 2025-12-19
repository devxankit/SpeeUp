import api from '../config';

const handleApiError = (error: any) => {
    if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'An unexpected error occurred');
};

const BASE_URL = '/delivery';

export interface DeliveryDashboardStats {
    dailyCollection: number; // Cash to be deposited
    cashBalance: number; // Total cash holding
    pendingOrders: number;
    allOrders: number;
    returnOrders: number;
    returnItems: number;
    todayEarning: number;
    totalEarning: number;
    pendingOrdersList: any[]; // Define stricter type if needed
}

// --- Dashboard ---
export const getDashboardStats = async (): Promise<DeliveryDashboardStats> => {
    try {
        const response = await api.get(`${BASE_URL}/dashboard/stats`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// --- Orders ---
export const getTodayOrders = async () => {
    try {
        const response = await api.get(`${BASE_URL}/orders/today`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getPendingOrders = async () => {
    try {
        const response = await api.get(`${BASE_URL}/orders/pending`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getOrderDetails = async (id: string) => {
    try {
        const response = await api.get(`${BASE_URL}/orders/${id}`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateOrderStatus = async (id: string, status: string) => {
    try {
        const response = await api.put(`${BASE_URL}/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// --- Earnings ---
export const getEarningsHistory = async () => {
    try {
        const response = await api.get(`${BASE_URL}/earnings`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// --- Profile ---
export const getDeliveryProfile = async () => {
    try {
        const response = await api.get(`${BASE_URL}/profile`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// --- Help & Support ---
export const getHelpSupport = async () => {
    try {
        const response = await api.get(`${BASE_URL}/help`);
        return response.data.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

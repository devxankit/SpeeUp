
import api from './config';

export interface WalletStats {
    balance: number;
    currency: string;
}

export interface WalletTransaction {
    _id: string;
    type: 'Credit' | 'Debit';
    amount: number;
    description: string;
    reference?: string;
    status: 'Pending' | 'Completed' | 'Failed';
    createdAt: string;
}

export const getWalletStats = async (): Promise<{ success: boolean; data: WalletStats }> => {
    const response = await api.get('/customer/wallet/stats');
    return response.data;
};

export const getWalletTransactions = async (page = 1, limit = 10): Promise<{ success: boolean; data: { transactions: WalletTransaction[], pagination: any } }> => {
    const response = await api.get(`/customer/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data;
};

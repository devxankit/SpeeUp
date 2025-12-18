import api from "../config";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  apiKey?: string;
  secretKey?: string;
  status: "Active" | "InActive";
  hasApiKeys: boolean;
  provider: string;
  type: "cod" | "gateway";
}

export interface UpdatePaymentMethodData {
  description?: string;
  apiKey?: string;
  secretKey?: string;
  status?: "Active" | "InActive";
}

export interface GetPaymentMethodsParams {
  status?: "Active" | "InActive";
}

/**
 * Get all payment methods
 */
export const getPaymentMethods = async (
  params?: GetPaymentMethodsParams
): Promise<ApiResponse<PaymentMethod[]>> => {
  const response = await api.get<ApiResponse<PaymentMethod[]>>(
    "/admin/payment-methods",
    { params }
  );
  return response.data;
};

/**
 * Get payment method by ID
 */
export const getPaymentMethodById = async (
  id: string
): Promise<ApiResponse<PaymentMethod>> => {
  const response = await api.get<ApiResponse<PaymentMethod>>(
    `/admin/payment-methods/${id}`
  );
  return response.data;
};

/**
 * Update payment method
 */
export const updatePaymentMethod = async (
  id: string,
  data: UpdatePaymentMethodData
): Promise<ApiResponse<PaymentMethod>> => {
  const response = await api.put<ApiResponse<PaymentMethod>>(
    `/admin/payment-methods/${id}`,
    data
  );
  return response.data;
};

/**
 * Update payment method status
 */
export const updatePaymentMethodStatus = async (
  id: string,
  status: "Active" | "InActive"
): Promise<ApiResponse<PaymentMethod>> => {
  const response = await api.patch<ApiResponse<PaymentMethod>>(
    `/admin/payment-methods/${id}/status`,
    { status }
  );
  return response.data;
};

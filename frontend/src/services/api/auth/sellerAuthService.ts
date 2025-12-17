import api, { setAuthToken, removeAuthToken } from '../config';

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      sellerName: string;
      mobile: string;
      email: string;
      storeName: string;
      status: string;
      logo?: string;
    };
  };
}

export interface RegisterData {
  sellerName: string;
  mobile: string;
  email: string;
  password: string;
  storeName: string;
  category?: string; // primary category (optional if categories array provided)
  categories: string[]; // multiple categories
  address: string;
  city: string;
  serviceableArea: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      sellerName: string;
      mobile: string;
      email: string;
      storeName: string;
      status: string;
      categories?: string[];
    };
  };
}

/**
 * Send OTP to seller mobile number
 */
export const sendOTP = async (mobile: string): Promise<SendOTPResponse> => {
  const response = await api.post<SendOTPResponse>('/auth/seller/send-otp', { mobile });
  return response.data;
};

/**
 * Verify OTP and login seller
 */
export const verifyOTP = async (mobile: string, otp: string): Promise<VerifyOTPResponse> => {
  const response = await api.post<VerifyOTPResponse>('/auth/seller/verify-otp', { mobile, otp });
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Register new seller
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/seller/register', data);
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Logout seller
 */
export const logout = (): void => {
  removeAuthToken();
};


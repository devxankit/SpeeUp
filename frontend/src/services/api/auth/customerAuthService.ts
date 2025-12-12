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
      name: string;
      phone: string;
      email: string;
      walletAmount: number;
      refCode: string;
      status: string;
    };
  };
}

export interface RegisterData {
  name: string;
  mobile: string;
  email: string;
  dateOfBirth?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      phone: string;
      email: string;
      walletAmount: number;
      refCode: string;
      status: string;
    };
  };
}

/**
 * Send OTP to customer mobile number
 */
export const sendOTP = async (mobile: string): Promise<SendOTPResponse> => {
  const response = await api.post<SendOTPResponse>('/auth/customer/send-otp', { mobile });
  return response.data;
};

/**
 * Verify OTP and login customer
 */
export const verifyOTP = async (mobile: string, otp: string): Promise<VerifyOTPResponse> => {
  const response = await api.post<VerifyOTPResponse>('/auth/customer/verify-otp', { mobile, otp });
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Register new customer
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/customer/register', data);
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Logout customer
 */
export const logout = (): void => {
  removeAuthToken();
};


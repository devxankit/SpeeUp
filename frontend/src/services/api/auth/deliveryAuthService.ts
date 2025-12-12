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
      mobile: string;
      email: string;
      city: string;
      status: string;
    };
  };
}

export interface RegisterData {
  name: string;
  mobile: string;
  email: string;
  dateOfBirth?: string;
  password: string;
  address: string;
  city: string;
  pincode?: string;
  drivingLicense?: string;
  nationalIdentityCard?: string;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bonusType?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      mobile: string;
      email: string;
      city: string;
      status: string;
    };
  };
}

/**
 * Send OTP to delivery mobile number
 */
export const sendOTP = async (mobile: string): Promise<SendOTPResponse> => {
  const response = await api.post<SendOTPResponse>('/auth/delivery/send-otp', { mobile });
  return response.data;
};

/**
 * Verify OTP and login delivery partner
 */
export const verifyOTP = async (mobile: string, otp: string): Promise<VerifyOTPResponse> => {
  const response = await api.post<VerifyOTPResponse>('/auth/delivery/verify-otp', { mobile, otp });
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Register new delivery partner
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/delivery/register', data);
  
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
  }
  
  return response.data;
};

/**
 * Logout delivery partner
 */
export const logout = (): void => {
  removeAuthToken();
};


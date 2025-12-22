import api, { setAuthToken, removeAuthToken } from '../config';

export interface SendOTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
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
 * Send Call OTP to customer mobile number
 */
export const sendOTP = async (mobile: string): Promise<SendOTPResponse> => {
  // Use new endpoint for Call OTP
  const response = await api.post<SendOTPResponse>('/auth/customer/send-call-otp', { mobile });
  return response.data;
};

/**
 * Verify Call OTP and login customer
 */
export const verifyOTP = async (mobile: string, otp: string, sessionId?: string): Promise<VerifyOTPResponse> => {
  // Use new endpoint and pass sessionId
  const response = await api.post<VerifyOTPResponse>('/auth/customer/verify-call-otp', { mobile, otp, sessionId });

  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    // Add userType to user data for proper identification
    const userData = {
      ...response.data.data.user,
      userType: 'Customer'
    };
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  return response.data;
};

/**
 * Register new customer
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/customer/register', data);

  // Note: Registration typically logs user in automatically in original implementation, 
  // but SignUp.tsx flow suggests OTP is required AFTER register?
  // Actually original SignUp.tsx: calls register(), then sendOTP(), then verifyOTP(). 
  // If register returns token, we might set it, but then verifyOTP overwrites it?

  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    // Add userType to user data for proper identification
    const userData = {
      ...response.data.data.user,
      userType: 'Customer'
    };
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  return response.data;
};

/**
 * Logout customer
 */
export const logout = (): void => {
  removeAuthToken();
};

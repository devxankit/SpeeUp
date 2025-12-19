import axios from 'axios';
import Otp from '../models/Otp';

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;

if (!TWOFACTOR_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('TWOFACTOR_API_KEY is not set in environment variables');
}

/**
 * Interface for Call/SMS OTP Response
 */
interface OtpResponse {
  success: boolean;
  sessionId?: string;
  message: string;
}

/**
 * Helper to generate numeric OTP
 */
function generateOTP(length: number = 4): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Save OTP to Database
 */
async function saveOtpToDb(mobile: string, otp: string, userType: 'Customer' | 'Delivery' | 'Seller' | 'Admin') {
  // Delete any existing OTP for this user/mobile
  await Otp.deleteMany({ mobile, userType });

  // Create new OTP record
  await Otp.create({
    mobile,
    otp,
    userType,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
  });
}

/**
 * Verify OTP from Database
 */
async function verifyOtpFromDb(mobile: string, otp: string, userType: 'Customer' | 'Delivery' | 'Seller' | 'Admin'): Promise<boolean> {
  const record = await Otp.findOne({ mobile, userType, otp });

  if (record) {
    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return false; // Expired
    }
    // Valid OTP
    await Otp.deleteOne({ _id: record._id }); // Consume OTP
    return true;
  }
  return false;
}

// ==========================================
// VOICE OTP (Customer / Delivery)
// ==========================================

export async function sendCallOtp(mobile: string, userType: 'Customer' | 'Delivery' = 'Delivery'): Promise<OtpResponse> {
  try {
    const otp = generateOTP(4);

    // Mock Mode Check
    if (process.env.USE_MOCK_OTP === 'true' || !TWOFACTOR_API_KEY || TWOFACTOR_API_KEY === 'your_2factor_api_key') {
      console.log(`[MOCK MODE] Generated OTP ${otp} for ${mobile} (${userType})`);
      await saveOtpToDb(mobile, otp, userType);

      return {
        success: true,
        sessionId: 'MOCK_SESSION_' + mobile,
        message: 'Voice OTP initiated (Mock Mode) - OTP: ' + otp,
      };
    }

    console.log(`[REAL MODE] Sending 4-digit Voice OTP to ${mobile} (${userType})`);
    await saveOtpToDb(mobile, otp, userType);

    // Endpoint for Custom Voice OTP: /VOICE/{mobile}/{otp}
    const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/VOICE/${mobile}/${otp}`;
    await axios.get(url);

    return {
      success: true,
      sessionId: 'DB_VERIFIED_' + mobile,
      message: 'Voice call initiated successfully',
    };

  } catch (error: any) {
    console.error('2Factor Service Error:', error.message);
    throw new Error(error.message || 'Failed to send Call OTP');
  }
}

// Updated Signature: Requires Mobile for DB lookup
export async function verifyCallOtp(sessionId: string, otpInput: string, mobile?: string, userType: 'Customer' | 'Delivery' = 'Delivery'): Promise<boolean> {

  // Developer Bypass
  if ((process.env.NODE_ENV !== 'production' || process.env.USE_MOCK_OTP === 'true') && otpInput === '999999') {
    return true;
  }

  // Fallback if mobile not provided (try to parse sessionId)
  let targetMobile = mobile;
  if (!targetMobile && sessionId && sessionId.startsWith('DB_VERIFIED_')) {
    targetMobile = sessionId.replace('DB_VERIFIED_', '');
  }
  if (!targetMobile && sessionId && sessionId.startsWith('MOCK_SESSION_')) {
    targetMobile = sessionId.replace('MOCK_SESSION_', '');
  }

  if (!targetMobile) {
    console.error("verifyCallOtp: Cannot verify without mobile number");
    return false;
  }

  return verifyOtpFromDb(targetMobile, otpInput, userType);
}


// ==========================================
// SMS OTP (Seller / Admin)
// ==========================================

export async function sendOTP(mobile: string, userType: 'Seller' | 'Admin' | 'Customer' | 'Delivery', isLogin: boolean = true): Promise<OtpResponse> {
  try {
    const otp = generateOTP(4);

    // Mock Mode Check
    if (process.env.USE_MOCK_OTP === 'true' || !TWOFACTOR_API_KEY || TWOFACTOR_API_KEY === 'your_2factor_api_key') {
      console.log(`[MOCK MODE] Generated SMS OTP ${otp} for ${mobile} (${userType})`);
      await saveOtpToDb(mobile, otp, userType);
      return {
        success: true,
        message: 'OTP sent successfully (Mock) - OTP: ' + otp,
      };
    }

    // Real Mode
    console.log(`[REAL MODE] Sending 4-digit SMS OTP to ${mobile}`);
    await saveOtpToDb(mobile, otp, userType);

    // Template Name - usually required for SMS. Assuming "OTP_VERIFICATION" or similar if configured.
    // If using open template: /SMS/{mobile}/{otp}
    const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}/OTP_VERIFICATION`;
    await axios.get(url);

    return {
      success: true,
      message: 'OTP sent successfully',
    };

  } catch (error: any) {
    console.error('2Factor SMS Error:', error.message);
    throw new Error(error.message || 'Failed to send SMS OTP');
  }
}

export async function verifyOTP(mobile: string, otpInput: string, userType: 'Seller' | 'Admin' | 'Customer' | 'Delivery'): Promise<boolean> {
  // Developer Bypass
  if ((process.env.NODE_ENV !== 'production' || process.env.USE_MOCK_OTP === 'true') && otpInput === '999999') {
    return true;
  }

  return verifyOtpFromDb(mobile, otpInput, userType);
}

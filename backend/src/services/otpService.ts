import Otp, { UserType } from '../models/Otp';
import axios from 'axios';


const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRES_IN?.replace('m', '') || '5', 10);
const DEFAULT_OTP = process.env.DEFAULT_OTP || '999999';

/**
 * Generate a random 6-digit OTP
 * @param isLogin - If true, always returns default OTP for login flows
 */
export function generateOTP(isLogin: boolean = false): string {
  // If USE_MOCK_OTP is explicitly true, always use default
  if (process.env.USE_MOCK_OTP === 'true') {
    return DEFAULT_OTP;
  }

  // For login flows, use default OTP if isLogin is true
  if (isLogin) {
    return DEFAULT_OTP;
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
}


/**
 * Send OTP to mobile number
 * For login flows (Customer, Seller, Delivery), always uses default OTP
 * In production, integrates with SMSIndiaHub for signup flows
 */
export async function sendOTP(mobile: string, userType: UserType, isLogin: boolean = false): Promise<{ success: boolean; message: string }> {
  try {
    // Delete any existing OTPs for this mobile and userType
    await Otp.deleteMany({ mobile, userType });

    // Generate OTP - for login flows, always use default OTP
    const otp = generateOTP(isLogin);

    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Store OTP in database
    await Otp.create({
      mobile,
      otp,
      userType,
      expiresAt,
      isVerified: false,
    });

    // Check if we should use mock OTP (dev mode or forced via env)
    const useMock = process.env.USE_MOCK_OTP === 'true';

    if (!useMock && process.env.FAST2SMS_API_KEY) {
      // Send real SMS via Fast2SMS
      const smsSent = await sendViaFast2SMS(mobile, otp);
      if (!smsSent) {
        // Fallback to error or maybe allow if it's critical?
        // For now, let's treat SMS failure as critical unless in dev
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Failed to send OTP via SMS Gateway');
        }
      }
    }

    // Return success message
    // In production/real-mode, don't return the OTP in the response body!
    if (!useMock && process.env.NODE_ENV === 'production') {
      return {
        success: true,
        message: 'OTP sent successfully to your mobile number',
      };
    }

    // specific debug mode message
    return {
      success: true,
      message: `OTP sent (Debug: ${otp})`,
    };

  } catch (error: any) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
}

/**
 * Send SMS using Fast2SMS API
 */
async function sendViaFast2SMS(mobile: string, otp: string): Promise<boolean> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const route = process.env.FAST2SMS_ROUTE || 'otp';

    // Construct payload based on route type if needed, but 'otp' route is simplest
    // https://www.fast2sms.com/dev/bulkV2
    const url = 'https://www.fast2sms.com/dev/bulkV2';

    const response = await axios.post(url, {
      route: route,
      variables_values: otp,
      numbers: mobile,
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.return === true) {
      console.log(`Fast2SMS Success: ${mobile}`);
      return true;
    } else {
      console.error('Fast2SMS Failed:', response.data);
      return false;
    }
  } catch (error: any) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    return false;
  }
}


/**
 * Verify OTP against stored value
 */
export async function verifyOTP(mobile: string, otp: string, userType: UserType): Promise<boolean> {
  try {
    const otpRecord = await Otp.findOne({
      mobile,
      userType,
      isVerified: false,
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return false;
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return false;
    }

    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    return true;
  } catch (error: any) {
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
}

/**
 * Cleanup expired OTPs (can be called periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  try {
    const result = await Otp.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  } catch (error: any) {
    throw new Error(`Failed to cleanup expired OTPs: ${error.message}`);
  }
}


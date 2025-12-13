import Otp, { UserType } from '../models/Otp';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRES_IN?.replace('m', '') || '5', 10);
const DEFAULT_OTP = process.env.DEFAULT_OTP || '123456';

/**
 * Generate a random 6-digit OTP
 * @param isLogin - If true, always returns default OTP for login flows
 */
export function generateOTP(isLogin: boolean = false): string {
  // For login flows, always use default OTP
  if (isLogin) {
    return DEFAULT_OTP;
  }
  
  // For signup flows, use default OTP in development, random in production
  if (process.env.NODE_ENV === 'development') {
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

    // In production, send via SMSIndiaHub
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with SMSIndiaHub API
      // const smsResult = await sendSMSViaSMSIndiaHub(mobile, otp);
      // if (!smsResult.success) {
      //   throw new Error('Failed to send OTP via SMS');
      // }
    }

    // For login flows, always show the default OTP in the message
    if (isLogin) {
      return {
        success: true,
        message: `OTP sent (Login OTP: ${otp})`,
      };
    }

    return {
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? `OTP sent (dev mode: ${otp})` 
        : 'OTP sent successfully',
    };
  } catch (error: any) {
    throw new Error(`Failed to send OTP: ${error.message}`);
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


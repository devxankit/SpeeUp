import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../../services/api/auth/customerAuthService';
import OTPInput from '../../components/OTPInput';

export default function Login() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const loginSectionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleContinue = async () => {
    if (mobileNumber.length !== 10) return;

    setLoading(true);
    setError('');

    try {
      await sendOTP(mobileNumber);
      setShowOTP(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await verifyOTP(mobileNumber, otp);
      if (response.success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleZomatoLogin = () => {
    // Handle Zomato login logic here
    navigate('/');
  };

  useEffect(() => {
    const updateOverlayPosition = () => {
      if (videoSectionRef.current && loginSectionRef.current && overlayRef.current) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          if (videoSectionRef.current && loginSectionRef.current && overlayRef.current) {
            const videoRect = videoSectionRef.current.getBoundingClientRect();

            // Position the unified overlay at the boundary between sections
            // Center it on the boundary line (half above, half below)
            const boundaryY = videoRect.bottom;
            const overlayHeight = 12; // Fixed height for the unified overlay
            overlayRef.current.style.top = `${boundaryY - overlayHeight / 2}px`;
            overlayRef.current.style.height = `${overlayHeight}px`;
          }
        });
      }
    };

    // Initial calculation with multiple attempts to ensure accuracy
    const timeoutId1 = setTimeout(updateOverlayPosition, 50);
    const timeoutId2 = setTimeout(updateOverlayPosition, 200);
    const timeoutId3 = setTimeout(updateOverlayPosition, 500);

    // Update on resize with debouncing
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateOverlayPosition, 100);
    };
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for more accurate updates when sections resize
    const resizeObserver = new ResizeObserver(() => {
      updateOverlayPosition();
    });

    if (videoSectionRef.current) {
      resizeObserver.observe(videoSectionRef.current);
    }
    if (loginSectionRef.current) {
      resizeObserver.observe(loginSectionRef.current);
    }

    // Also observe scroll events in case layout shifts
    window.addEventListener('scroll', updateOverlayPosition, { passive: true });

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateOverlayPosition);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col" style={{ overflow: 'hidden', backgroundColor: '#ffffff', width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors"
        aria-label="Back"
      >
        <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Video Section */}
      <div
        ref={videoSectionRef}
        className="overflow-hidden relative flex-1"
        style={{ minHeight: 0, border: 'none', borderBottom: 'none', padding: 0, margin: 0, marginLeft: '2px', backgroundColor: '#ffffff', zIndex: 0, width: 'calc(100% - 2px)', boxSizing: 'border-box', position: 'relative' }}
      >
        <video
          src="/assets/login/loginvideo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            verticalAlign: 'top',
            objectFit: 'cover',
            objectPosition: 'center top',
            background: 'transparent',
            position: 'relative',
            zIndex: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            transform: 'translateY(-60px)',
            marginTop: '-60px'
          }}
        />
      </div>

      {/* Unified white overlay to cover black partition - spans both sections */}
      <div
        ref={overlayRef}
        className="fixed bg-white"
        style={{
          height: '12px',
          zIndex: 10,
          left: '0px',
          right: '0px',
          width: '100%',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Login Section */}
      <div
        ref={loginSectionRef}
        className="bg-white flex flex-col items-center flex-shrink-0 relative"
        style={{ border: 'none', borderTop: 'none', margin: 0, marginTop: '-100px', marginLeft: '-2px', boxShadow: 'none', outline: 'none', backgroundColor: '#ffffff', zIndex: 1, padding: '4px 0px 12px', paddingTop: '6px', width: 'calc(100% + 4px)', boxSizing: 'border-box', position: 'relative' }}
      >
        {!showOTP ? (
          <>
            {/* Mobile Number Input */}
            <div className="w-full mb-1.5 sm:mb-2.5 px-4 relative z-10" style={{ maxWidth: '100%' }}>
              <div className="flex items-center bg-white border border-neutral-300 rounded-lg overflow-hidden focus-within:border-neutral-400 transition-colors">
                <div className="px-3 py-2 sm:py-2.5 text-sm font-medium text-neutral-400 border-r border-neutral-300 bg-white">
                  +91
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter mobile number"
                  className="flex-1 px-3 py-2 sm:py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none bg-white"
                  style={{ color: '#9ca3af', backgroundColor: '#ffffff' }}
                  maxLength={10}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="w-full mb-1 px-4 relative z-10 text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Continue Button */}
            <div className="w-full mb-1 px-4 relative z-10" style={{ maxWidth: '100%' }}>
              <button
                onClick={handleContinue}
                disabled={mobileNumber.length !== 10 || loading}
                className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm transition-colors border px-3 ${mobileNumber.length === 10 && !loading
                    ? 'bg-orange-50 text-orange-600 border-orange-500 hover:bg-orange-100'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed border-neutral-300'
                  }`}
              >
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </div>

            {/* OR Separator */}
            <div className="flex items-center gap-2.5 w-full mb-1 px-4 relative z-10">
              <div className="flex-1 h-px bg-neutral-200"></div>
              <span className="text-xs text-neutral-500">OR</span>
              <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            {/* Login with SpeeUp Button */}
            <div className="w-full mb-2 px-4 relative z-10" style={{ maxWidth: '100%' }}>
              <button
                onClick={handleZomatoLogin}
                className="w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5 px-3"
              >
                <span>Login with</span>
                <span className="font-bold">SpeeUp</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <div className="w-full mb-2 px-4 relative z-10 text-center">
              <p className="text-xs text-neutral-600 mb-2">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-xs font-semibold text-neutral-800">+91 {mobileNumber}</p>
            </div>
            <div className="w-full mb-2 px-4 relative z-10 flex justify-center">
              <OTPInput onComplete={handleOTPComplete} disabled={loading} />
            </div>
            {error && (
              <div className="w-full mb-1 px-4 relative z-10 text-xs text-red-600 bg-red-50 p-2 rounded text-center">
                {error}
              </div>
            )}
            <div className="w-full mb-1 px-4 relative z-10 flex gap-2">
              <button
                onClick={() => {
                  setShowOTP(false);
                  setError('');
                }}
                disabled={loading}
                className="flex-1 py-2 rounded-lg font-semibold text-xs bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors border border-neutral-300"
              >
                Change Number
              </button>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="flex-1 py-2 rounded-lg font-semibold text-xs bg-orange-50 text-orange-600 border border-orange-500 hover:bg-orange-100 transition-colors"
              >
                {loading ? 'Verifying...' : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

        {/* Sign Up Link */}
        {!showOTP && (
          <div className="text-center pt-2 px-4 relative z-10">
            <p className="text-xs text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}

        {/* Privacy Text */}
        <p className="text-[9px] sm:text-[10px] text-neutral-500 text-center max-w-sm leading-tight px-4 relative z-10 pb-1">
          Access your saved addresses from SpeeUp automatically!
        </p>
      </div>
    </div>
  );
}


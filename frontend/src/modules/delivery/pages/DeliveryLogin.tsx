import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appzetoLogo from '@assets/appzeto1.jpeg';

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [showPassword, setShowPassword] = useState(false);

  const handleMobileLogin = () => {
    if (mobileNumber.length === 10) {
      // Handle delivery login logic here
      // For now, navigate to delivery dashboard
      navigate('/delivery');
    }
  };

  const handleEmailLogin = () => {
    if (email && password) {
      // Handle delivery email login logic here
      // For now, navigate to delivery dashboard
      navigate('/delivery');
    }
  };

  const handleAppzetoLogin = () => {
    // Handle Appzeto login logic here
    navigate('/delivery');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-orange-500 px-6 py-8 text-center">
          <div className="mb-4">
            <img
              src={appzetoLogo}
              alt="Appzeto"
              className="h-16 w-auto mx-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Delivery Partner Login</h1>
          <p className="text-green-100 text-sm">Access your delivery dashboard</p>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-4">
          {/* Login Method Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setLoginMethod('mobile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'mobile'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Mobile
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Email
            </button>
          </div>

          {/* Mobile Login Form */}
          {loginMethod === 'mobile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center bg-white border border-neutral-300 rounded-lg overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                  <div className="px-3 py-2.5 text-sm font-medium text-neutral-600 border-r border-neutral-300 bg-neutral-50">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="flex-1 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                onClick={handleMobileLogin}
                disabled={mobileNumber.length !== 10}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  mobileNumber.length === 10
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2.5 pr-10 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-neutral-300 text-green-600 focus:ring-green-500" />
                  <span className="ml-2 text-neutral-600">Remember me</span>
                </label>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleEmailLogin}
                disabled={!email || !password}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  email && password
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Login
              </button>
            </div>
          )}

          {/* OR Separator */}
          <div className="flex items-center gap-2.5 my-4">
            <div className="flex-1 h-px bg-neutral-200"></div>
            <span className="text-xs text-neutral-500">OR</span>
            <div className="flex-1 h-px bg-neutral-200"></div>
          </div>

          {/* Login with Appzeto Button */}
          <button
            onClick={handleAppzetoLogin}
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-green-600 to-orange-500 text-white hover:from-green-700 hover:to-orange-600 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Login with</span>
            <span className="font-bold">Appzeto</span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Don't have a delivery partner account?{' '}
              <button className="text-green-600 hover:text-green-700 font-semibold">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <p className="mt-6 text-xs text-neutral-500 text-center max-w-md">
        By continuing, you agree to Appzeto's Terms of Service and Privacy Policy
      </p>
    </div>
  );
}


import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, CustomerProfile } from '../../services/api/customerService';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const [hideSensitiveItems, setHideSensitiveItems] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGstModal, setShowGstModal] = useState(false);
  const [gstNumber, setGstNumber] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getProfile();
        if (response.success) {
          setProfile(response.data);
        } else {
          setError('Failed to load profile');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          authLogout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      // If no user, redirect to login
      navigate('/login');
    }
  }, [user, navigate, authLogout]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const handleGstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just close the modal after entry; hook to API if available
    setShowGstModal(false);
  };

  if (loading) {
    return (
      <div className="pb-24 md:pb-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="pb-24 md:pb-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-teal-600 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use profile data if available, otherwise fallback to user data from context
  const displayName = profile?.name || user?.name || 'User';
  const displayPhone = profile?.phone || user?.phone || '';
  const displayDateOfBirth = profile?.dateOfBirth;

  return (
    <div className="pb-24 md:pb-8 bg-white min-h-screen">
      {/* Profile Header with Green Gradient */}
      <div className="bg-gradient-to-b from-green-200 via-green-100 to-white pb-6 md:pb-8 pt-12 md:pt-16">
        <div className="px-4 md:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-neutral-900"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-4 md:mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-200 flex items-center justify-center mb-3 md:mb-4 border-2 border-white shadow-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-500 md:w-12 md:h-12">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">{displayName}</h1>
            <div className="flex flex-col items-center gap-1.5 md:gap-2 text-xs md:text-sm text-neutral-600">
              {displayPhone && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{displayPhone}</span>
                </div>
              )}
              {displayDateOfBirth && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{formatDate(displayDateOfBirth)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 md:px-6 lg:px-8 -mt-4 md:-mt-6 mb-4 md:mb-6">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2.5 md:gap-6 max-w-2xl md:mx-auto">
          <button
            onClick={() => navigate('/orders')}
            className="bg-white rounded-lg border border-neutral-200 p-3 md:p-4 hover:shadow-md transition-shadow text-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-1.5 md:mb-2 text-neutral-700 md:w-6 md:h-6">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-[10px] md:text-xs font-semibold text-neutral-900">Your orders</div>
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-lg border border-neutral-200 p-3 md:p-4 hover:shadow-md transition-shadow text-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-1.5 md:mb-2 text-neutral-700 md:w-6 md:h-6">
              <path d="M21 4H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="text-[10px] md:text-xs font-semibold text-neutral-900">SpeeUp Money</div>
          </button>
          <button
            className="bg-white rounded-lg border border-neutral-200 p-3 md:p-4 hover:shadow-md transition-shadow text-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-1.5 md:mb-2 text-neutral-700 md:w-6 md:h-6">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-[10px] md:text-xs font-semibold text-neutral-900">Need help?</div>
          </button>
        </div>
      </div>



      {/* Your Information Section */}
      <div className="px-4 py-2.5">
        <h2 className="text-xs font-bold text-neutral-900 mb-2">Your information</h2>
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <button
            onClick={() => navigate('/address-book')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Address book</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button
            onClick={() => navigate('/wishlist')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Your wishlist</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button
            onClick={() => setShowGstModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">GST details</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12v6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">E-gift cards</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
        </div>
      </div>

      {/* Payment and Coupons Section */}
      <div className="px-4 py-2.5">
        <h2 className="text-xs font-bold text-neutral-900 mb-2">Payment and coupons</h2>
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <button
            onClick={() => navigate('/wallet')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M21 4H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">SpeeUp Money</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          {/* Claim Gift card button removed per request */}

          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 9h-1.5a2.5 2.5 0 0 0 0 5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 14.66V17.5a2.5 2.5 0 0 0 5 0v-2.84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Your collected rewards</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
        </div>
      </div>

      {/* Feeding India Section */}
      <div className="px-4 py-2.5">
        <h2 className="text-xs font-bold text-neutral-900 mb-2">Feeding India</h2>
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Your impact</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Get Feeding India receipt</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
        </div>
      </div>

      {/* Other Information Section */}
      <div className="px-4 py-2.5">
        <h2 className="text-xs font-bold text-neutral-900 mb-2">Other Information</h2>
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Share the app</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button
            onClick={() => navigate('/about-us')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">About us</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Account privacy</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Notification preferences</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
          >
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-700">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-neutral-900">Log out</span>
            </div>
            <span className="text-neutral-400 text-base">›</span>
          </button>
        </div>
      </div>

      {showGstModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 animate-fadeIn"
            onClick={() => setShowGstModal(false)}
          />

          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp">
            <div className="bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto relative">
              {/* Close Button */}
              <button
                onClick={() => setShowGstModal(false)}
                aria-label="Close"
                className="absolute -top-12 right-4 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="px-6 pt-8 pb-8 text-center">
                {/* Icon */}
                <div className="mx-auto mb-5 w-24 h-24 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-12 h-12 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                    <line x1="9" y1="15" x2="13" y2="15" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Add GST Details
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                  If you're a business owner, add your GST details and<br />
                  get GST invoice on your orders.
                </p>

                {/* Form */}
                <form onSubmit={handleGstSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="GST Number"
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#9ca0b0] text-white font-semibold py-3.5 disabled:opacity-50 hover:bg-[#8a8e9e] transition-colors"
                    disabled={!gstNumber.trim()}
                  >
                    Confirm
                  </button>
                </form>

                {/* Terms */}
                <p className="mt-5 text-xs text-neutral-500">
                  By continuing, you agree to our{' '}
                  <span className="underline cursor-pointer hover:text-neutral-700">Terms & Conditions</span>
                </p>
              </div>
            </div>
          </div>

          {/* Add custom animations */}
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }

            .animate-slideUp {
              animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
          `}</style>
        </>
      )}
    </div>
  );
}

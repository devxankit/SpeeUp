import React, { useState, useEffect } from 'react';
import { getSellerProfile, updateSellerProfile } from '../../../services/api/auth/sellerAuthService';
import { useAuth } from '../../../context/AuthContext';
import { getCategories, Category } from '../../../services/api/categoryService';

const SellerAccountSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Initial state with empty values
  const [sellerData, setSellerData] = useState({
    sellerName: '',
    email: '',
    mobile: '',
    storeName: '',
    category: '',
    address: '',
    city: '',
    serviceableArea: '',
    panCard: '',
    taxName: '',
    taxNumber: '',
    accountName: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifsc: '',
    profile: '',
    logo: '',
    storeBanner: '',
    storeDescription: '',
    commission: 0,
    status: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getSellerProfile();
      if (response.success) {
        setSellerData(response.data);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSellerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await updateSellerProfile(sellerData);
      if (response.success) {
        setIsEditing(false);
        setSellerData(response.data);
        if (updateUser) {
          updateUser({
            ...user,
            ...response.data,
            id: response.data._id || user?.id
          });
        }
        alert('Account settings updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sellerData.sellerName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Info' },
    { id: 'store', label: 'Store Details' },
    { id: 'branding', label: 'Store Branding' },
    { id: 'bank', label: 'Bank & Tax' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-800 font-bold">&times;</button>
        </div>
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
          <p className="text-neutral-500">Manage your profile and store information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-neutral-100">
                <div className="relative group">
                  <img
                    src={sellerData.profile || 'https://placehold.co/150'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{sellerData.sellerName}</h3>
                  <p className="text-neutral-500">{sellerData.email}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {sellerData.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    name="sellerName"
                    value={sellerData.sellerName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={sellerData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={sellerData.mobile}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                  {isEditing && <p className="text-xs text-neutral-400">Leave blank to keep current password</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-neutral-100">
                <div className="relative group">
                  <img
                    src={sellerData.logo || 'https://placehold.co/100'}
                    alt="Store Logo"
                    className="w-20 h-20 rounded-lg object-contain border border-neutral-200 bg-neutral-50"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Upload</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{sellerData.storeName}</h3>
                  <p className="text-neutral-500">{sellerData.category} Store</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={sellerData.storeName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Store Category</label>
                  <select
                    name="category"
                    value={sellerData.category}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Store Address</label>
                  <textarea
                    name="address"
                    value={sellerData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={sellerData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Serviceable Area</label>
                  <input
                    type="text"
                    name="serviceableArea"
                    value={sellerData.serviceableArea}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-neutral-700">Store Banner</label>
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-neutral-200 aspect-[21/9]">
                  <img
                    src={sellerData.storeBanner || 'https://placehold.co/1200x400?text=Store+Banner'}
                    alt="Store Banner"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium">Upload New Banner</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-neutral-700 flex justify-between">
                  <span>Store Description</span>
                  <span className="text-xs text-neutral-400 font-normal">Displayed on your store page</span>
                </label>
                <textarea
                  name="storeDescription"
                  value={sellerData.storeDescription || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={6}
                  placeholder="Tell customers about your store, specialty, and heritage..."
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-8">
              <section>
                <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Account Holder Name</label>
                    <input
                      type="text"
                      name="accountName"
                      value={sellerData.accountName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={sellerData.bankName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={sellerData.accountNumber || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">IFSC Code</label>
                    <input
                      type="text"
                      name="ifsc"
                      value={sellerData.ifsc || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Tax Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">PAN Card Number</label>
                    <input
                      type="text"
                      name="panCard"
                      value={sellerData.panCard || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Tax Number (GST)</label>
                    <input
                      type="text"
                      name="taxNumber"
                      value={sellerData.taxNumber || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SellerAccountSettings;
import { useState } from 'react';

export default function AdminAddDeliveryBoy() {
  const [formData, setFormData] = useState({
    // Personal & Contact Information
    name: '',
    mobile: '',
    dateOfBirth: '',
    password: '',
    address: '',
    
    // Document Uploads
    drivingLicense: null as File | null,
    nationalIdentityCard: null as File | null,
    
    // Bank Account Information
    bankAccountNumber: '',
    bankName: '',
    accountName: '',
    ifscCode: '',
    city: '',
    pincode: '',
    
    // Other Information
    otherPaymentInformation: '',
    bonusType: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Delivery boy added successfully!');
  };

  const cities = [
    'Select City',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
  ];

  const bonusTypes = [
    'Fixed or Salaried',
    'Fixed',
    'Salaried',
    'Commission Based',
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-teal-600 px-4 sm:px-6 py-4 rounded-t-lg">
        <h1 className="text-white text-xl sm:text-2xl font-semibold">Add Delivery Boy</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Personal & Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  placeholder="dd-----yyyy"
                  className="w-full px-4 py-2.5 pr-10 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Driving License <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-400 mb-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="mb-2 text-sm text-neutral-500">
                    <span className="font-semibold">Upload Driving License</span>
                  </p>
                  {formData.drivingLicense && (
                    <p className="text-xs text-neutral-500">{formData.drivingLicense.name}</p>
                  )}
                </div>
                <input
                  type="file"
                  name="drivingLicense"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  accept="image/*,.pdf"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                National Identity Card <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-400 mb-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="mb-2 text-sm text-neutral-500">
                    <span className="font-semibold">Upload National Identity Card</span>
                  </p>
                  {formData.nationalIdentityCard && (
                    <p className="text-xs text-neutral-500">{formData.nationalIdentityCard.name}</p>
                  )}
                </div>
                <input
                  type="file"
                  name="nationalIdentityCard"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  accept="image/*,.pdf"
                />
              </label>
            </div>
          </div>

          {/* Bank Account Information */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 mb-4">Bank Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Bank Account Number"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Bank Name"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Account Name"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="IFSC Code"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  {cities.map((city) => (
                    <option key={city} value={city === 'Select City' ? '' : city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Other Payment Information */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              Other Payment Information
            </label>
            <textarea
              name="otherPaymentInformation"
              value={formData.otherPaymentInformation}
              onChange={handleInputChange}
              placeholder="Other Payment Information"
              rows={4}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
            />
          </div>

          {/* Bonus Type */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              Bonus Type <span className="text-red-500">*</span>
            </label>
            <select
              name="bonusType"
              value={formData.bonusType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              {bonusTypes.map((type) => (
                <option key={type} value={type === 'Fixed or Salaried' ? '' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Separator */}
        <div className="h-1 bg-teal-100"></div>

        {/* Submit Button */}
        <div className="p-4 sm:p-6 flex justify-center">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Add Delivery Boy
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          Appzeto - 10 Minute App
        </a>
      </div>
    </div>
  );
}


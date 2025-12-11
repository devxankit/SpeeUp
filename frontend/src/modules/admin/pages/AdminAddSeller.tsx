import { useState } from 'react';

export default function AdminAddSeller() {
  const [formData, setFormData] = useState({
    // Seller Info
    sellerName: '',
    password: '',
    email: '',
    mobile: '',
    
    // Store Info
    storeName: '',
    panCard: '',
    category: '',
    taxName: '',
    address: '',
    taxNumber: '',
    
    // Store Location Info
    city: '',
    serviceableArea: '',
    searchLocation: '',
    latitude: '',
    longitude: '',
    
    // Payment Details
    accountName: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifsc: '',
    
    // Document Section
    profile: null as File | null,
    idProof: null as File | null,
    addressProof: null as File | null,
    
    // Other Info
    requireProductApproval: 'No',
    viewCustomerDetails: 'No',
    commission: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    alert('Seller added successfully!');
  };

  const categories = [
    'Select Categories',
    'Organic & Premium',
    'Instant Food',
    'Masala Oil',
    'Pet Care',
    'Sweet Tooth',
    'Tea Coffee',
    'Cleaning Essentials',
    'Personal Care',
  ];

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

  const serviceableAreas = [
    'Select Serviceable Area',
    'Area 1',
    'Area 2',
    'Area 3',
    'Area 4',
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Add Seller</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seller Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Seller Info</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Seller Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleInputChange}
                  placeholder="Enter Seller Name"
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
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
                  placeholder="Enter Password"
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
                  placeholder="Enter Mobile"
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Store Info</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  placeholder="Enter Store Name"
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Select Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat === 'Select Categories' ? '' : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter Address"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Pan Card
                </label>
                <input
                  type="text"
                  name="panCard"
                  value={formData.panCard}
                  onChange={handleInputChange}
                  placeholder="Enter PAN"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Tax Name/ GST Name
                </label>
                <input
                  type="text"
                  name="taxName"
                  value={formData.taxName}
                  onChange={handleInputChange}
                  placeholder="Enter Tax Name"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Tax Number/ GST Number
                </label>
                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Tax Number"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Location Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Store Location Info</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
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
                  Serviceable Area <span className="text-red-500">*</span>
                </label>
                <select
                  name="serviceableArea"
                  value={formData.serviceableArea}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  {serviceableAreas.map((area) => (
                    <option key={area} value={area === 'Select Serviceable Area' ? '' : area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Search Location
                </label>
                <input
                  type="text"
                  name="searchLocation"
                  value={formData.searchLocation}
                  onChange={handleInputChange}
                  placeholder="Search Location"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Enter Latitude"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Enter Longitude"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Google Map */}
            <div className="w-full h-96 border border-neutral-300 rounded overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.5!2d151.2093!3d-33.8688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae665e892fdd%3A0x3133f8d75a1ac251!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location Map"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Payment Details</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Enter Account Name"
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
                  placeholder="Enter Bank Name"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="Enter Branch"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Account Number"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  IFSC
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Document Section</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Profile <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2.5 border border-neutral-300 rounded text-sm cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    Choose File
                    <input
                      type="file"
                      name="profile"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                  <span className="text-sm text-neutral-500">
                    {formData.profile ? formData.profile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Id Proof
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2.5 border border-neutral-300 rounded text-sm cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    Choose File
                    <input
                      type="file"
                      name="idProof"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </label>
                  <span className="text-sm text-neutral-500">
                    {formData.idProof ? formData.idProof.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Address Proof
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2.5 border border-neutral-300 rounded text-sm cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    Choose File
                    <input
                      type="file"
                      name="addressProof"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </label>
                  <span className="text-sm text-neutral-500">
                    {formData.addressProof ? formData.addressProof.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Other Info</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Require Product's Approval? <span className="text-red-500">*</span>
                </label>
                <select
                  name="requireProductApproval"
                  value={formData.requireProductApproval}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  View Customer's Details? <span className="text-red-500">*</span>
                </label>
                <select
                  name="viewCustomerDetails"
                  value={formData.viewCustomerDetails}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Commission % <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleInputChange}
                  placeholder="Enter Commission"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Add Seller
          </button>
        </div>
      </form>
    </div>
  );
}


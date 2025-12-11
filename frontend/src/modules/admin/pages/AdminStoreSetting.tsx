import { useState } from 'react';

export default function AdminStoreSetting() {
  const [formData, setFormData] = useState({
    // Basic Information
    title: 'SpeeUp - 10 Minute App',
    email: 'info@speeup.com',
    phone: '9999999999',
    
    // Store Location
    storeAddress: '',
    searchLocation: '',
    
    // Coordinates
    latitude: '',
    longitude: '',
    
    // Logo Settings
    logoRatio: '1:1 Ratio (Square)',
    logo: null as File | null,
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
    alert('Store settings updated successfully!');
  };

  const logoRatios = [
    '1:1 Ratio (Square)',
    '16:9 Ratio (Wide)',
    '4:3 Ratio (Standard)',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Store Setting</h1>
          </div>
          <div className="text-sm text-neutral-600">
            <span className="text-blue-600">Home</span> / <span className="text-neutral-900">Store Setting</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="bg-teal-600 px-4 sm:px-6 py-3">
                  <h2 className="text-white text-lg font-semibold">Basic Information</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter Title"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter Phone"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Location Section */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="bg-teal-600 px-4 sm:px-6 py-3">
                  <h2 className="text-white text-lg font-semibold">Store Location</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Store Address
                      </label>
                      <input
                        type="text"
                        name="storeAddress"
                        value={formData.storeAddress}
                        onChange={handleInputChange}
                        placeholder="Enter Store Address"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Select Store Location
                      </label>
                      <input
                        type="text"
                        name="searchLocation"
                        value={formData.searchLocation}
                        onChange={handleInputChange}
                        placeholder="Search City"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="bg-teal-600 px-4 sm:px-6 py-3">
                  <h2 className="text-white text-lg font-semibold">Coordinates</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
              </div>

              {/* Logo Settings Section */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="bg-teal-600 px-4 sm:px-6 py-3">
                  <h2 className="text-white text-lg font-semibold">Logo Settings</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Select Logo Ratio <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="logoRatio"
                        value={formData.logoRatio}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      >
                        {logoRatios.map((ratio) => (
                          <option key={ratio} value={ratio}>
                            {ratio}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-2">
                        Logo
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 sm:p-12 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-neutral-400 mb-3"
                          >
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-sm font-medium text-neutral-700">Upload Logo</span>
                          <input
                            type="file"
                            name="logo"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      {formData.logo && (
                        <p className="mt-2 text-sm text-neutral-600">
                          Selected: {formData.logo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Google Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-neutral-300 rounded text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Map
                  </button>
                  <button className="px-4 py-2 border border-neutral-300 rounded text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors">
                    Satellite
                  </button>
                </div>
              </div>
              <div className="w-full h-[600px] border border-neutral-300 overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}


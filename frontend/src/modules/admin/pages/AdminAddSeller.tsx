import { useState } from "react";
import {
  uploadImage,
  uploadDocument,
} from "../../../services/api/uploadService";
import {
  validateImageFile,
  validateDocumentFile,
  createImagePreview,
} from "../../../utils/imageUpload";

export default function AdminAddSeller() {
  const [formData, setFormData] = useState({
    // Seller Info
    sellerName: "",
    password: "",
    email: "",
    mobile: "",

    // Store Info
    storeName: "",
    panCard: "",
    category: "",
    taxName: "",
    address: "",
    taxNumber: "",

    // Store Location Info
    city: "",
    serviceableArea: "",
    searchLocation: "",
    latitude: "",
    longitude: "",

    // Payment Details
    accountName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    ifsc: "",

    // Document URLs (from Cloudinary)
    profileUrl: "",
    idProofUrl: "",
    addressProofUrl: "",

    // Other Info
    requireProductApproval: "No",
    viewCustomerDetails: "No",
    commission: "",
  });

  // File state for UI
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    setUploadError("");

    if (name === "profile") {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid image file");
        return;
      }
      setProfileFile(file);
      try {
        const preview = await createImagePreview(file);
        setProfilePreview(preview);
      } catch (error) {
        setUploadError("Failed to create image preview");
      }
    } else if (name === "idProof" || name === "addressProof") {
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid document file");
        return;
      }
      if (name === "idProof") {
        setIdProofFile(file);
      } else {
        setAddressProofFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    // Basic validation
    if (
      !formData.sellerName ||
      !formData.email ||
      !formData.password ||
      !formData.mobile
    ) {
      setUploadError("Please fill all required fields");
      return;
    }

    if (!profileFile) {
      setUploadError("Profile image is required");
      return;
    }

    setUploading(true);

    try {
      // Upload profile image
      const profileResult = await uploadImage(
        profileFile,
        "speeup/sellers/profile"
      );
      setFormData((prev) => ({ ...prev, profileUrl: profileResult.secureUrl }));

      // Upload ID proof if provided
      if (idProofFile) {
        const idProofResult = await uploadDocument(
          idProofFile,
          "speeup/sellers/documents"
        );
        setFormData((prev) => ({
          ...prev,
          idProofUrl: idProofResult.secureUrl,
        }));
      }

      // Upload address proof if provided
      if (addressProofFile) {
        const addressProofResult = await uploadDocument(
          addressProofFile,
          "speeup/sellers/documents"
        );
        setFormData((prev) => ({
          ...prev,
          addressProofUrl: addressProofResult.secureUrl,
        }));
      }

      // Handle form submission with Cloudinary URLs
      console.log("Form submitted:", formData);
      alert("Seller added successfully!");

      // Reset form
      setFormData({
        sellerName: "",
        password: "",
        email: "",
        mobile: "",
        storeName: "",
        panCard: "",
        category: "",
        taxName: "",
        address: "",
        taxNumber: "",
        city: "",
        serviceableArea: "",
        searchLocation: "",
        latitude: "",
        longitude: "",
        accountName: "",
        bankName: "",
        branch: "",
        accountNumber: "",
        ifsc: "",
        profileUrl: "",
        idProofUrl: "",
        addressProofUrl: "",
        requireProductApproval: "No",
        viewCustomerDetails: "No",
        commission: "",
      });
      setProfileFile(null);
      setProfilePreview("");
      setIdProofFile(null);
      setAddressProofFile(null);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload documents. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    "Select Categories",
    "Organic & Premium",
    "Instant Food",
    "Masala Oil",
    "Pet Care",
    "Sweet Tooth",
    "Tea Coffee",
    "Cleaning Essentials",
    "Personal Care",
  ];

  const cities = [
    "Select City",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
  ];

  const serviceableAreas = [
    "Select Serviceable Area",
    "Area 1",
    "Area 2",
    "Area 3",
    "Area 4",
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
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat === "Select Categories" ? "" : cat}>
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
            <h2 className="text-white text-lg font-semibold">
              Store Location Info
            </h2>
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
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  {cities.map((city) => (
                    <option
                      key={city}
                      value={city === "Select City" ? "" : city}>
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
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  {serviceableAreas.map((area) => (
                    <option
                      key={area}
                      value={area === "Select Serviceable Area" ? "" : area}>
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
                title="Store Location Map"></iframe>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">
              Payment Details
            </h2>
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
            <h2 className="text-white text-lg font-semibold">
              Document Section
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {uploadError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Profile <span className="text-red-500">*</span>
                </label>
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  {profilePreview ? (
                    <div className="space-y-2">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="max-h-32 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-xs text-neutral-600">
                        {profileFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setProfileFile(null);
                          setProfilePreview("");
                        }}
                        className="text-xs text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mx-auto mb-2 text-neutral-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-xs text-neutral-600">Choose File</p>
                      <p className="text-xs text-neutral-500 mt-1">Max 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="profile"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Id Proof
                </label>
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  {idProofFile ? (
                    <div className="space-y-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mx-auto text-teal-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p className="text-xs text-neutral-600">
                        {idProofFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIdProofFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mx-auto mb-2 text-neutral-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-xs text-neutral-600">Choose File</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Image/PDF, Max 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="idProof"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Address Proof
                </label>
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  {addressProofFile ? (
                    <div className="space-y-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mx-auto text-teal-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p className="text-xs text-neutral-600">
                        {addressProofFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAddressProofFile(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mx-auto mb-2 text-neutral-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-xs text-neutral-600">Choose File</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Image/PDF, Max 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="addressProof"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf"
                    disabled={uploading}
                  />
                </label>
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
                  Require Product's Approval?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="requireProductApproval"
                  value={formData.requireProductApproval}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  View Customer's Details?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="viewCustomerDetails"
                  value={formData.viewCustomerDetails}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
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
            disabled={uploading}
            className={`px-8 py-3 rounded-lg text-base font-medium transition-colors ${
              uploading
                ? "bg-neutral-400 cursor-not-allowed text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}>
            {uploading ? "Uploading Documents..." : "Add Seller"}
          </button>
        </div>
      </form>
    </div>
  );
}

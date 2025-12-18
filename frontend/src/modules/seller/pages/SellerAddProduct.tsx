import React, { useState } from "react";
import { uploadImage, uploadImages } from "../../../services/api/uploadService";
import {
  validateImageFile,
  createImagePreview,
} from "../../../utils/imageUpload";

export default function SellerAddProduct() {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    subcategory: "",
    publish: "No",
    popular: "No",
    dealOfDay: "No",
    brand: "",
    tags: "",
    smallDescription: "",
    seoTitle: "",
    seoKeywords: "",
    seoImageAlt: "",
    seoDescription: "",
    variationType: "",
    manufacturer: "",
    madeIn: "",
    tax: "",
    isReturnable: "No",
    maxReturnDays: "",
    fssaiLicNo: "",
    totalAllowedQuantity: "",
    mainImageUrl: "",
    galleryImageUrls: [] as string[],
  });

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(
    []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid image file");
      return;
    }

    setMainImageFile(file);
    setUploadError("");

    try {
      const preview = await createImagePreview(file);
      setMainImagePreview(preview);
    } catch (error) {
      setUploadError("Failed to create image preview");
    }
  };

  const handleGalleryImagesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = files.filter((file) => !validateImageFile(file).valid);
    if (invalidFiles.length > 0) {
      setUploadError(
        "Some files are invalid. Please check file types and sizes."
      );
      return;
    }

    setGalleryImageFiles(files);
    setUploadError("");

    try {
      const previews = await Promise.all(
        files.map((file) => createImagePreview(file))
      );
      setGalleryImagePreviews(previews);
    } catch (error) {
      setUploadError("Failed to create image previews");
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImageFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    // Basic validation
    if (!formData.productName.trim()) {
      setUploadError("Please enter a product name.");
      return;
    }
    if (!formData.category) {
      setUploadError("Please select a category.");
      return;
    }

    setUploading(true);

    try {
      // Upload main image if provided
      if (mainImageFile) {
        const mainImageResult = await uploadImage(
          mainImageFile,
          "speeup/products"
        );
        setFormData((prev) => ({
          ...prev,
          mainImageUrl: mainImageResult.secureUrl,
        }));
      }

      // Upload gallery images if provided
      if (galleryImageFiles.length > 0) {
        const galleryResults = await uploadImages(
          galleryImageFiles,
          "speeup/products/gallery"
        );
        const galleryUrls = galleryResults.map((result) => result.secureUrl);
        setFormData((prev) => ({ ...prev, galleryImageUrls: galleryUrls }));
      }

      // Handle form submission with Cloudinary URLs
      console.log("Form submitted:", formData);
      alert("Product added successfully!");

      // Reset form
      setFormData({
        productName: "",
        category: "",
        subcategory: "",
        publish: "No",
        popular: "No",
        dealOfDay: "No",
        brand: "",
        tags: "",
        smallDescription: "",
        seoTitle: "",
        seoKeywords: "",
        seoImageAlt: "",
        seoDescription: "",
        variationType: "",
        manufacturer: "",
        madeIn: "",
        tax: "",
        isReturnable: "No",
        maxReturnDays: "",
        fssaiLicNo: "",
        totalAllowedQuantity: "",
        mainImageUrl: "",
        galleryImageUrls: [],
      });
      setMainImageFile(null);
      setMainImagePreview("");
      setGalleryImageFiles([]);
      setGalleryImagePreviews([]);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload images. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
              <h2 className="text-lg font-semibold">Product</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Enter Product Name"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="">Select Category</option>
                    <option value="pet-care">Pet Care</option>
                    <option value="sweet-tooth">Sweet Tooth</option>
                    <option value="tea-coffee">Tea Coffee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select SubCategory
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="">Select Subcategory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Product Publish Or Unpublish?
                  </label>
                  <select
                    name="publish"
                    value={formData.publish}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Make Product Popular?
                  </label>
                  <select
                    name="popular"
                    value={formData.popular}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Insert to Deal of the day?
                  </label>
                  <select
                    name="dealOfDay"
                    value={formData.dealOfDay}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Brand
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="">Select Brand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Select or create tags"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-red-500 mt-1">
                    This will help for search
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Small Description
                </label>
                <textarea
                  name="smallDescription"
                  value={formData.smallDescription}
                  onChange={handleChange}
                  placeholder="Enter Product Small Description"
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
              <h2 className="text-lg font-semibold">SEO Content</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  placeholder="Enter SEO Title"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleChange}
                  placeholder="Enter SEO Keywords"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  SEO Image Alt Text
                </label>
                <input
                  type="text"
                  name="seoImageAlt"
                  value={formData.seoImageAlt}
                  onChange={handleChange}
                  placeholder="Enter SEO Image Alt Text"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  placeholder="Enter SEO Description"
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Add Variation Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
              <h2 className="text-lg font-semibold">Add Variation</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Product Variation Type
                </label>
                <select
                  name="variationType"
                  value={formData.variationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                  <option value="">Select Product Type</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Other Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
              <h2 className="text-lg font-semibold">Add Other Details</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="Enter Manufacturer"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Made In
                  </label>
                  <input
                    type="text"
                    name="madeIn"
                    value={formData.madeIn}
                    onChange={handleChange}
                    placeholder="Enter Made In"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Tax
                  </label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="">Select Tax</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    is Returnable?
                  </label>
                  <select
                    name="isReturnable"
                    value={formData.isReturnable}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Return Days
                  </label>
                  <input
                    type="number"
                    name="maxReturnDays"
                    value={formData.maxReturnDays}
                    onChange={handleChange}
                    placeholder="Enter Max Return Days"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    FSSAI Lic. No.
                  </label>
                  <input
                    type="text"
                    name="fssaiLicNo"
                    value={formData.fssaiLicNo}
                    onChange={handleChange}
                    placeholder="Enter FSSAI Lic. No."
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Total allowed quantity
                  </label>
                  <input
                    type="number"
                    name="totalAllowedQuantity"
                    value={formData.totalAllowedQuantity}
                    onChange={handleChange}
                    placeholder="Enter Total allowed quantit"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Keep blank if no such limit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Images Section */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
              <h2 className="text-lg font-semibold">Add Images</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {uploadError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Main Image <span className="text-red-500">*</span>
                </label>
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                  {mainImagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={mainImagePreview}
                        alt="Main product preview"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-neutral-600">
                        {mainImageFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setMainImageFile(null);
                          setMainImagePreview("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-2 text-neutral-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-sm text-neutral-600 font-medium">
                        Upload Main Image
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Max 5MB, JPG/PNG/WEBP
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Gallery Images (Optional)
                </label>
                <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                  {galleryImagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeGalleryImage(index);
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {galleryImageFiles.length} image(s) selected
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-2 text-neutral-400">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p className="text-sm text-neutral-600 font-medium">
                        Upload Other Product Images Here
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Max 5MB per image, up to 10 images
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              disabled={uploading}
              className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-sm ${
                uploading
                  ? "bg-neutral-400 cursor-not-allowed text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}>
              {uploading ? "Uploading Images..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { uploadImage } from "../../../services/api/uploadService";
import {
  validateImageFile,
  createImagePreview,
} from "../../../utils/imageUpload";

interface Category {
  id: number;
  name: string;
  image: string;
  totalSubcategory: number;
  groupCategory: string;
  isBestseller: boolean;
  hasWarning: boolean;
}

export default function AdminCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [isBestseller, setIsBestseller] = useState("No");
  const [selectedGroupCategory, setSelectedGroupCategory] = useState("");
  const [hasWarning, setHasWarning] = useState("No");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Mock data
  const categories: Category[] = [
    {
      id: 2,
      name: "Pet Care",
      image: "/api/placeholder/100/100",
      totalSubcategory: 2,
      groupCategory: "",
      isBestseller: false,
      hasWarning: false,
    },
    {
      id: 3,
      name: "Sweet Tooth",
      image: "/api/placeholder/100/100",
      totalSubcategory: 3,
      groupCategory: "",
      isBestseller: false,
      hasWarning: false,
    },
    {
      id: 4,
      name: "Tea Coffee",
      image: "/api/placeholder/100/100",
      totalSubcategory: 3,
      groupCategory: "",
      isBestseller: false,
      hasWarning: false,
    },
    {
      id: 6,
      name: "Instant Food",
      image: "/api/placeholder/100/100",
      totalSubcategory: 3,
      groupCategory: "",
      isBestseller: false,
      hasWarning: false,
    },
    {
      id: 7,
      name: "Cleaning Essentials",
      image: "/api/placeholder/100/100",
      totalSubcategory: 2,
      groupCategory: "",
      isBestseller: false,
      hasWarning: false,
    },
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid image file");
      return;
    }

    setCategoryImageFile(file);
    setUploadError("");

    try {
      const preview = await createImagePreview(file);
      setCategoryImagePreview(preview);
    } catch (error) {
      setUploadError("Failed to create image preview");
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setUploadError("Please enter a category name");
      return;
    }

    if (!categoryImageFile) {
      setUploadError("Category image is required");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      // Upload category image
      const imageResult = await uploadImage(
        categoryImageFile,
        "speeup/categories"
      );
      const imageUrl = imageResult.secureUrl;

      // Handle add category logic here with Cloudinary URL
      console.log("Category added:", { name: categoryName, imageUrl });
      alert("Category added successfully!");

      // Reset form
      setCategoryName("");
      setCategoryImageFile(null);
      setCategoryImagePreview("");
      setCategoryImageUrl("");
      setIsBestseller("No");
      setSelectedGroupCategory("");
      setHasWarning("No");
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload category image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setCategoryName(category.name);
      setIsBestseller(category.isBestseller ? "Yes" : "No");
      setHasWarning(category.hasWarning ? "Yes" : "No");
      // You can add more edit logic here
    }
  };

  const handleDelete = (_id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      // Handle delete logic here
      alert("Category deleted successfully!");
    }
  };

  const handleExport = () => {
    alert("Export functionality will be implemented here");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Category</h1>
        <div className="text-sm text-blue-500">
          <span className="text-blue-500 hover:underline cursor-pointer">
            Home
          </span>{" "}
          <span className="text-neutral-400">/</span> Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Add Category */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">Add Category</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {uploadError}
              </div>
            )}
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category Name:
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter Category Name"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                disabled={uploading}
              />
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category Image:
              </label>
              <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                {categoryImagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={categoryImagePreview}
                      alt="Category preview"
                      className="max-h-32 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-xs text-neutral-600">
                      {categoryImageFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCategoryImageFile(null);
                        setCategoryImagePreview("");
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
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Is Bestseller Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Is Bestseller Category?:
              </label>
              <select
                value={isBestseller}
                onChange={(e) => setIsBestseller(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Select Group Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Group Category:
              </label>
              <select
                value={selectedGroupCategory}
                onChange={(e) => setSelectedGroupCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                <option value="">Select Group Category</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
                <option value="group3">Group 3</option>
              </select>
            </div>

            {/* Is it have Warning */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Is it have Warning?:
              </label>
              <select
                value={hasWarning}
                onChange={(e) => setHasWarning(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Add Category Button */}
            <button
              onClick={handleAddCategory}
              disabled={uploading}
              className={`w-full py-2.5 rounded text-sm font-medium transition-colors ${
                uploading
                  ? "bg-neutral-400 cursor-not-allowed text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}>
              {uploading ? "Uploading Image..." : "Add Category"}
            </button>
          </div>
        </div>

        {/* Right Panel - View Category */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">
              View Category
            </h2>
          </div>

          {/* Controls */}
          <div className="p-4 sm:p-6 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Entries Per Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-700">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-neutral-700">entries</span>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Search */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search..."
                  className="px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 min-w-[150px]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-2">
                      ID
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-400">
                        <path
                          d="M7 10L12 5L17 10M7 14L12 19L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-2">
                      Category Name
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-400">
                        <path
                          d="M7 10L12 5L17 10M7 14L12 19L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Category Image
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort("totalSubcategory")}>
                    <div className="flex items-center gap-2">
                      Total Subcategory
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-neutral-400">
                        <path
                          d="M7 10L12 5L17 10M7 14L12 19L17 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Group Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">
                        {category.id}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">
                        {category.name}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex items-center justify-center">
                          {categoryImage ? (
                            <img
                              src={URL.createObjectURL(categoryImage)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">
                        {category.totalSubcategory}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-500">
                        {category.groupCategory || "-"}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category.id)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="Edit">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            title="Delete">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredCategories.length)} of{" "}
              {filteredCategories.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === 1
                    ? "text-neutral-400 cursor-not-allowed bg-neutral-50"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
                aria-label="Previous page">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border border-neutral-300 rounded text-sm ${
                      currentPage === page
                        ? "bg-teal-600 text-white border-teal-600"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}>
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-neutral-400 cursor-not-allowed bg-neutral-50"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
                aria-label="Next page">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4">
        Copyright © 2025. Developed By{" "}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          SpeeUp - 10 Minute App
        </a>
      </div>
    </div>
  );
}

import { useState } from "react";
// import { shopByStoreTiles } from "../../../data/homeTiles"; // REMOVED

import { uploadImage } from "../../../services/api/uploadService";
import {
  validateImageFile,
  createImagePreview,
} from "../../../utils/imageUpload";

interface ShopByStoreTile {
  id: string;
  name: string;
  productImages: string[];
  bgColor: string;
}

export default function AdminShopByStore() {
  const [storeName, setStoreName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [storeImagePreview, setStoreImagePreview] = useState<string>("");
  const [bgColor, setBgColor] = useState("bg-yellow-100");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Initialize with existing shop by store tiles
  const [stores, setStores] = useState<ShopByStoreTile[]>([
    {
      id: 'spiritual',
      name: 'Spiritual Store',
      productImages: ['/assets/products/incense.jpg'],
      bgColor: 'bg-orange-50'
    },
    {
      id: 'fashion',
      name: 'Fashion Store',
      productImages: ['/assets/products/tshirt.jpg'],
      bgColor: 'bg-blue-50'
    }
    // ... Add more if needed or fetch from API
  ]);


  const bgColorOptions = [
    { value: "bg-yellow-100", label: "Yellow" },
    { value: "bg-green-100", label: "Green" },
    { value: "bg-pink-100", label: "Pink" },
    { value: "bg-blue-100", label: "Blue" },
    { value: "bg-orange-100", label: "Orange" },
    { value: "bg-purple-100", label: "Purple" },
    { value: "bg-red-100", label: "Red" },
    { value: "bg-teal-100", label: "Teal" },
    { value: "bg-amber-50", label: "Amber" },
    { value: "bg-indigo-50", label: "Indigo" },
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort stores
  const sortedStores = [...filteredStores].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "id":
        aValue = a.id.toLowerCase();
        bValue = b.id.toLowerCase();
        break;
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedStores.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedStores = sortedStores.slice(startIndex, endIndex);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid image file");
      return;
    }

    setStoreImageFile(file);
    setUploadError("");

    try {
      const preview = await createImagePreview(file);
      setStoreImagePreview(preview);
    } catch (error) {
      setUploadError("Failed to create image preview");
    }
  };

  const handleAddStore = async () => {
    if (!storeName.trim()) {
      setUploadError("Please enter a store name");
      return;
    }
    if (!storeId.trim()) {
      setUploadError("Please enter a store ID");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      let imageUrl = "";

      // Upload store image if provided
      if (storeImageFile) {
        const imageResult = await uploadImage(storeImageFile, "speeup/stores");
        imageUrl = imageResult.secureUrl;
      }

      if (editingId !== null) {
        // Update existing store
        setStores(
          stores.map((store) =>
            store.id === editingId
              ? {
                ...store,
                name: storeName.trim(),
                id: storeId.trim(),
                bgColor: bgColor,
                productImages: imageUrl ? [imageUrl] : store.productImages,
              }
              : store
          )
        );
        alert("Store updated successfully!");
        setEditingId(null);
      } else {
        // Check if ID already exists
        if (stores.some((s) => s.id === storeId.trim())) {
          setUploadError("Store ID already exists. Please use a different ID.");
          setUploading(false);
          return;
        }

        // Add new store
        const newStore: ShopByStoreTile = {
          id: storeId.trim(),
          name: storeName.trim(),
          bgColor: bgColor,
          productImages: imageUrl
            ? [imageUrl]
            : ["/assets/shopbystore/default.jpg"],
        };
        setStores([...stores, newStore]);
        alert("Store added successfully!");
      }

      // Reset form
      setStoreName("");
      setStoreId("");
      setStoreImageFile(null);
      setStoreImagePreview("");
      setBgColor("bg-yellow-100");
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
        error.message ||
        "Failed to upload store image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    const store = stores.find((s) => s.id === id);
    if (store) {
      setStoreName(store.name);
      setStoreId(store.id);
      setBgColor(store.bgColor);
      setEditingId(id);
      // Scroll to top form
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      setStores(stores.filter((store) => store.id !== id));
      if (editingId === id) {
        setStoreName("");
        setStoreId("");
        setStoreImageFile(null);
        setStoreImagePreview("");
        setBgColor("bg-yellow-100");
        setEditingId(null);
      }
      alert("Store deleted successfully!");
    }
  };

  const handleReset = () => {
    setStoreName("");
    setStoreId("");
    setStoreImageFile(null);
    setStoreImagePreview("");
    setBgColor("bg-yellow-100");
    setEditingId(null);
    setUploadError("");
  };

  const handleExport = () => {
    alert("Export functionality will be implemented here");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">
          Shop by Store
        </h1>
        <div className="text-sm text-blue-500">
          <span className="text-blue-500 hover:underline cursor-pointer">
            Home
          </span>{" "}
          <span className="text-neutral-400">/</span> Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Add Store */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">
              {editingId ? "Edit Store" : "Add Store"}
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Store ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Store ID: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="e.g., spiritual-store"
                disabled={editingId !== null}
                className={`w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${editingId ? "bg-neutral-100 cursor-not-allowed" : ""
                  }`}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Used for routing (e.g., /store/spiritual)
              </p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Store Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter Store Name"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Background Color:
              </label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500">
                {bgColorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {uploadError}
              </div>
            )}
            {/* Store Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Store Image:
              </label>
              <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                {storeImagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={storeImagePreview}
                      alt="Store preview"
                      className="max-h-32 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-xs text-neutral-600">
                      {storeImageFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setStoreImageFile(null);
                        setStoreImagePreview("");
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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddStore}
                disabled={uploading}
                className={`flex-1 py-2.5 rounded text-sm font-medium transition-colors ${uploading
                    ? "bg-neutral-400 cursor-not-allowed text-white"
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}>
                {uploading
                  ? "Uploading..."
                  : editingId
                    ? "Update Store"
                    : "Add Store"}
              </button>
              {editingId && (
                <button
                  onClick={handleReset}
                  className="px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-2.5 rounded text-sm font-medium transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - View Stores */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">View Stores</h2>
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
            <table className="w-full min-w-[600px]">
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
                      Store Name
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
                    Image
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedStores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No stores found
                    </td>
                  </tr>
                ) : (
                  displayedStores.map((store) => (
                    <tr key={store.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-mono">
                        {store.id}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">
                        {store.name}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="w-20 h-16 bg-neutral-100 rounded overflow-hidden flex items-center justify-center">
                          {store.productImages &&
                            store.productImages.length > 0 ? (
                            <img
                              src={store.productImages[0]}
                              alt={store.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <span className="text-xs text-neutral-400">
                              No Image
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(store.id)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
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
                            onClick={() => handleDelete(store.id)}
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
              {Math.min(endIndex, sortedStores.length)} of {sortedStores.length}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-neutral-300 rounded ${currentPage === 1
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
                    className={`px-3 py-1 border border-neutral-300 rounded text-sm ${currentPage === page
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
                className={`p-2 border border-neutral-300 rounded ${currentPage === totalPages || totalPages === 0
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

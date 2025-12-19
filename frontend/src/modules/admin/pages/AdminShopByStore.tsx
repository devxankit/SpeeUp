import { useState, useEffect } from "react";
import { uploadImage } from "../../../services/api/uploadService";
import {
  validateImageFile,
  createImagePreview,
} from "../../../utils/imageUpload";
import { getCategories, getSubcategories, Category, SubCategory } from "../../../services/api/categoryService";
import { getProducts, Product } from "../../../services/api/productService";

interface ShopByStoreTile {
  id: string;
  name: string;
  productImages: string[];
  bgColor: string;
  categoryId?: string;
  subCategoryId?: string;
  productIds?: string[];
}

export default function AdminShopByStore() {
  const [storeName, setStoreName] = useState("");
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

  // New State for Selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize with empty shops
  const [stores, setStores] = useState<ShopByStoreTile[]>([]);

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

  // Fetch Initial Data (Categories)
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Subcategories when Category changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubCategories(selectedCategoryId);
      // Reset subcategory selection if category changes
      if (!subCategories.find(sub => sub._id === selectedSubCategoryId)) {
        setSelectedSubCategoryId("");
      }
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId]);

  // Fetch Products based on Category/Subcategory
  useEffect(() => {
    // Only fetch if category is selected, otherwise we might fetch too many or none depending on logic
    if (selectedCategoryId) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [selectedCategoryId, selectedSubCategoryId]);


  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const res = await getSubcategories(categoryId);
      if (res.success) {
        setSubCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories", error);
    }
  };

  const fetchProducts = async () => {
    setLoadingData(true);
    try {
      const params: any = {};
      if (selectedCategoryId) params.category = selectedCategoryId;
      // Filter by subcategory if productService supports it logic or client side
      // Assuming getProducts supports basic filtering
      // If the API doesn't filter strictly by subcategory, we might need to filter client side

      const res = await getProducts(params);
      if (res.success && res.data) {
        let prods = res.data;
        // Client-side subcategory filter as fallback if API ignores it or to be safe
        if (selectedSubCategoryId) {
          prods = prods.filter(p => {
            // p.subcategory could be string id or object
            const pSubId = (typeof p.subcategory === 'string') ? p.subcategory : p.subcategory?._id;
            const pSubId2 = (typeof p.subcategoryId === 'string') ? p.subcategoryId : undefined;
            return pSubId === selectedSubCategoryId || pSubId2 === selectedSubCategoryId;
          });
        }
        setProducts(prods);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoadingData(false);
    }
  };


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

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddStore = async () => {
    if (!storeName.trim()) {
      setUploadError("Please enter a store name");
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

      // Generate ID from name
      const generatedId = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingId !== null) {
        // Update existing store
        setStores(
          stores.map((store) =>
            store.id === editingId
              ? {
                ...store,
                name: storeName.trim(),
                id: generatedId,
                bgColor: bgColor,
                productImages: imageUrl ? [imageUrl] : store.productImages,
                categoryId: selectedCategoryId,
                subCategoryId: selectedSubCategoryId,
                productIds: selectedProductIds
              }
              : store
          )
        );
        alert("Store updated successfully!");
        setEditingId(null);
      } else {
        // Check if ID already exists (generated)
        let finalId = generatedId;
        if (stores.some((s) => s.id === finalId)) {
          finalId = `${generatedId}-${Math.floor(Math.random() * 1000)}`;
        }

        // Add new store
        const newStore: ShopByStoreTile = {
          id: finalId,
          name: storeName.trim(),
          bgColor: bgColor,
          productImages: imageUrl
            ? [imageUrl]
            : ["/assets/shopbystore/default.jpg"],
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId,
          productIds: selectedProductIds
        };
        setStores([...stores, newStore]);
        alert("Store added successfully!");
      }

      // Reset form
      handleReset();
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
      setBgColor(store.bgColor);
      setSelectedCategoryId(store.categoryId || "");
      // trigger subcat fetch? effect will handle it, but we need to wait or just set state
      // Effect handles fetch, but we need to set Selected SubCat after. 
      // Simplified: Just set state, effect runs, subCats load. 
      // Ideally we should wait for subcats to load to show selected value correctly but React state might handle it if options match value.
      setSelectedSubCategoryId(store.subCategoryId || "");
      setSelectedProductIds(store.productIds || []);

      if (store.productImages && store.productImages.length > 0) {
        setStoreImagePreview(store.productImages[0]);
      } else {
        setStoreImagePreview("");
      }

      setEditingId(id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      setStores(stores.filter((store) => store.id !== id));
      if (editingId === id) {
        handleReset();
      }
      alert("Store deleted successfully!");
    }
  };

  const handleReset = () => {
    setStoreName("");
    setStoreImageFile(null);
    setStoreImagePreview("");
    setBgColor("bg-yellow-100");
    setEditingId(null);
    setUploadError("");
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setSelectedProductIds([]);
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

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category:
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* SubCategory Dropdown */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                SubCategory:
              </label>
              <select
                value={selectedSubCategoryId}
                onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer bg-white"
                disabled={!selectedCategoryId}
              >
                <option value="">Select SubCategory</option>
                {subCategories.map((sub) => (
                  <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.subcategoryName}</option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Products: {selectedProductIds.length} selected
              </label>
              <div className="border border-neutral-300 rounded-md max-h-48 overflow-y-auto p-2 bg-neutral-50">
                {loadingData ? (
                  <div className="text-center text-sm text-neutral-500 py-2">Loading products...</div>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id} className="flex items-center mb-2 hover:bg-neutral-100 p-1 rounded">
                      <input
                        type="checkbox"
                        id={`prod-${product._id}`}
                        checked={selectedProductIds.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`prod-${product._id}`} className="ml-2 block text-sm text-gray-900 truncate cursor-pointer flex-1">
                        {product.productName}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-neutral-500 py-2">
                    {selectedCategoryId ? "No products found in this category" : "Select a category to view products"}
                  </div>
                )}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Background Color:
              </label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white">
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
              <label className="block border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors bg-white">
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
                    : "Create Store"}
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
                  className="px-2 py-1 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 cursor-pointer">
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
                    Details
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
                      colSpan={5}
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
                      <td className="px-4 sm:px-6 py-3 text-xs text-neutral-500">
                        {store.productIds?.length || 0} Products
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden flex items-center justify-center border border-neutral-200">
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
                            <span className="text-[10px] text-neutral-400">
                              No Img
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

import { useState, useEffect } from "react";
import {
  getProducts,
  updateProductOrder,
  getCategories,
  type Product,
  type Category,
} from "../../../services/api/admin/adminProductService";
import { useAuth } from "../../../context/AuthContext";

interface ProductOrderItem {
  id: string;
  name: string;
}

export default function AdminProductOrder() {
  const { isAuthenticated, token } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [products, setProducts] = useState<ProductOrderItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategoriesList = async () => {
      if (!isAuthenticated || !token) return;
      setLoadingCategories(true);
      try {
        const response = await getCategories();
        if (response?.success && response?.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategoriesList();
  }, [isAuthenticated, token]);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      if (!isAuthenticated || !token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getProducts({
          category: selectedCategoryId,
          limit: 100, // Fetch more products for ordering
        });

        if (response?.success && response?.data) {
          // Convert API products to our format
          const productItems: ProductOrderItem[] = response.data.map(
            (product: Product) => ({
              id: product._id,
              name: product.productName,
            })
          );
          setProducts(productItems);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategoryId, isAuthenticated, token]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newProducts = [...products];
    const draggedItem = newProducts[draggedIndex];
    newProducts.splice(draggedIndex, 1);
    newProducts.splice(index, 0, draggedItem);
    setProducts(newProducts);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleUpdate = async () => {
    if (!selectedCategoryId) {
      alert("Please select a category");
      return;
    }

    if (products.length === 0) {
      alert("No products to update");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare order data
      const orderData = {
        products: products.map((product, index) => ({
          id: product.id,
          order: index + 1,
        })),
      };

      const response = await updateProductOrder(orderData);

      if (response.success) {
        alert("Product order updated successfully!");
      } else {
        setError(response.message || "Failed to update product order");
      }
    } catch (err) {
      console.error("Error updating product order:", err);
      setError("Failed to update product order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the product order?")) {
      return;
    }

    // Re-fetch products to reset to original order
    if (selectedCategoryId) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await getProducts({
            category: selectedCategoryId,
            limit: 100,
          });

          if (response?.success && response?.data) {
            const productItems: ProductOrderItem[] = response.data.map(
              (product: Product) => ({
                id: product._id,
                name: product.productName,
              })
            );
            setProducts(productItems);
            alert("Product order reset successfully!");
          } else {
            setError("Failed to reset product order");
          }
        } catch (err) {
          console.error("Error resetting products:", err);
          setError("Failed to reset product order. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden max-w-4xl">
        {/* Header */}
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
          <h2 className="text-base sm:text-lg font-semibold">
            Update Product Order
          </h2>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              Select category
            </label>
            {loadingCategories ? (
              <div className="text-sm text-neutral-500 py-2">Loading categories...</div>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product List */}
          {selectedCategoryId && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Product List (Drag to reorder)
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="ml-2 text-neutral-600">
                    Loading products...
                  </span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  No products found in this category
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      draggable={!saving}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-3 bg-neutral-50 rounded-lg border-2 border-transparent cursor-move hover:border-teal-300 transition-colors ${draggedIndex === index
                          ? "opacity-50"
                          : saving
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}>
                      <span className="text-sm font-medium text-neutral-800 flex-1">
                        {product.name}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-neutral-400">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {selectedCategoryId && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={handleUpdate}
                disabled={saving || loading || products.length === 0}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Product Order"
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={saving || loading}
                className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-300 disabled:cursor-not-allowed px-6 py-2.5 rounded text-sm font-medium transition-colors">
                Reset Order
              </button>
            </div>
          )}
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

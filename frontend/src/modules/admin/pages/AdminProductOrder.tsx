import { useState } from 'react';

interface Product {
  id: number;
  name: string;
}

export default function AdminProductOrder() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Conscious Food Desi A2 Ghee' },
    { id: 2, name: 'Conscious Food Desi A2 Ghee' },
    { id: 3, name: 'Natureland Organic Mustard Oil Cold Pressed' },
    { id: 4, name: 'Natureland Organic Mustard Oil Cold Pressed' },
    { id: 5, name: 'RNR Broken rice' },
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const categories = [
    'Select category',
    'Organic & Premium',
    'Instant Food',
    'Masala Oil',
    'Pet Care',
    'Sweet Tooth',
    'Tea Coffee',
    'Cleaning Essentials',
    'Personal Care',
    'Paan Corner',
    'Pharma And Wellness',
    'Bakery Biscuits',
    'Sauces Spreads',
    'Home Office',
  ];

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

  const handleUpdate = () => {
    if (!selectedCategory || selectedCategory === 'Select category') {
      alert('Please select a category');
      return;
    }
    // Handle update logic here
    alert('Product order updated successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the product order?')) {
      // Reset to original order
      setProducts([
        { id: 1, name: 'Conscious Food Desi A2 Ghee' },
        { id: 2, name: 'Conscious Food Desi A2 Ghee' },
        { id: 3, name: 'Natureland Organic Mustard Oil Cold Pressed' },
        { id: 4, name: 'Natureland Organic Mustard Oil Cold Pressed' },
        { id: 5, name: 'RNR Broken rice' },
      ]);
      alert('Product order reset successfully!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden max-w-4xl">
        {/* Header */}
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
          <h2 className="text-base sm:text-lg font-semibold">Update Product Order</h2>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              Select category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Product List */}
          {selectedCategory && selectedCategory !== 'Select category' && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Product List (Drag to reorder)
              </label>
              <div className="space-y-2">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 bg-neutral-50 rounded-lg border-2 border-transparent cursor-move hover:border-teal-300 transition-colors ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
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
                      className="text-neutral-400"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded text-sm font-medium transition-colors"
            >
              Update Product Order
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded text-sm font-medium transition-colors"
            >
              Reset Order
            </button>
          </div>
        </div>
      </div>

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

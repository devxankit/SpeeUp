import { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

export default function AdminCategoryOrder() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Organic & Premium' },
    { id: 2, name: 'Instant Food' },
    { id: 3, name: 'Masala Oil' },
    { id: 4, name: 'Pet Care' },
    { id: 5, name: 'Sweet Tooth' },
    { id: 6, name: 'Tea Coffee' },
    { id: 7, name: 'Cleaning Essentials' },
    { id: 8, name: 'Personal Care' },
    { id: 9, name: 'Paan Corner' },
    { id: 10, name: 'Pharma And Wellness' },
    { id: 11, name: 'Bakery Biscuits' },
    { id: 12, name: 'Sauces Spreads' },
    { id: 13, name: 'Home Office' },
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    setCategories(newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleUpdate = () => {
    // Handle update logic here - save the new order
    alert('Category order updated successfully!');
  };

  const handleReset = () => {
    // Reset to original order
    setCategories([
      { id: 1, name: 'Organic & Premium' },
      { id: 2, name: 'Instant Food' },
      { id: 3, name: 'Masala Oil' },
      { id: 4, name: 'Pet Care' },
      { id: 5, name: 'Sweet Tooth' },
      { id: 6, name: 'Tea Coffee' },
      { id: 7, name: 'Cleaning Essentials' },
      { id: 8, name: 'Personal Care' },
      { id: 9, name: 'Paan Corner' },
      { id: 10, name: 'Pharma And Wellness' },
      { id: 11, name: 'Bakery Biscuits' },
      { id: 12, name: 'Sauces Spreads' },
      { id: 13, name: 'Home Office' },
    ]);
    setSelectedIndex(0);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Left Panel - Category List */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 px-4 sm:px-6 py-4">
          <h1 className="text-white text-lg font-semibold">Update Category Order</h1>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelectedIndex(index)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-move transition-all ${
                selectedIndex === index
                  ? 'bg-purple-100 shadow-md'
                  : 'bg-neutral-50 hover:bg-neutral-100 shadow-sm'
              } ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <span className={`text-sm font-medium ${
                selectedIndex === index ? 'text-purple-900' : 'text-neutral-700'
              }`}>
                {category.name}
              </span>
              <div className="flex flex-col gap-1 cursor-grab active:cursor-grabbing">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                  <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-neutral-200 flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Update Order
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Right Panel - Empty Space */}
      <div className="hidden lg:block w-2/3 bg-white rounded-lg shadow-sm border border-neutral-200 relative">
        {/* Decorative gradient on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-green-500"></div>
      </div>
    </div>
  );
}


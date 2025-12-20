import { useState, useEffect } from 'react';
import {
  getHeaderCategoriesAdmin,
  createHeaderCategory,
  updateHeaderCategory,
  deleteHeaderCategory,
  HeaderCategory
} from '../../../services/api/headerCategoryService';
import { themes } from '../../../utils/themes';

export default function AdminHeaderCategory() {
  const [headerCategories, setHeaderCategories] = useState<HeaderCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [headerCategoryName, setHeaderCategoryName] = useState('');
  const [selectedIconLibrary, setSelectedIconLibrary] = useState('');
  const [headerCategoryIcon, setHeaderCategoryIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // This maps to relatedCategory
  const [selectedTheme, setSelectedTheme] = useState('all'); // This maps to slug
  const [selectedStatus, setSelectedStatus] = useState<'Published' | 'Unpublished'>('Published');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Table states
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const themeOptions = Object.keys(themes);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getHeaderCategoriesAdmin();
      setHeaderCategories(data);
    } catch (error) {
      console.error('Failed to fetch header categories', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredCategories = headerCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.relatedCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, endIndex);

  const resetForm = () => {
    setHeaderCategoryName('');
    setSelectedIconLibrary('');
    setHeaderCategoryIcon('');
    setSelectedCategory('');
    setSelectedTheme('all');
    setSelectedStatus('Published');
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!headerCategoryName.trim()) return alert('Please enter a header category name');
    if (!selectedIconLibrary) return alert('Please select an icon library');
    if (!headerCategoryIcon.trim()) return alert('Please enter an icon name');
    if (!selectedTheme) return alert('Please select a theme');
    // relatedCategory is optional but encouraged if mapping to products

    try {
      const payload = {
        name: headerCategoryName,
        iconLibrary: selectedIconLibrary,
        iconName: headerCategoryIcon,
        slug: selectedTheme, // Use theme as slug for color mapping
        relatedCategory: selectedCategory,
        status: selectedStatus,
      };

      if (editingId) {
        await updateHeaderCategory(editingId, payload);
        alert('Header Category updated successfully!');
      } else {
        await createHeaderCategory(payload);
        alert('Header Category added successfully!');
      }

      fetchCategories();
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category: HeaderCategory) => {
    setEditingId(category._id);
    setHeaderCategoryName(category.name);
    setSelectedIconLibrary(category.iconLibrary);
    setHeaderCategoryIcon(category.iconName);
    setSelectedCategory(category.relatedCategory || '');
    setSelectedTheme(category.slug);
    setSelectedStatus(category.status);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this header category?')) {
      try {
        await deleteHeaderCategory(id);
        alert('Header Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        console.error(error);
        alert('Failed to delete category');
      }
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Header Category</h1>
        <div className="text-sm text-blue-500">
          <span className="text-blue-500 hover:underline cursor-pointer">Home</span>{' '}
          <span className="text-neutral-400">/</span> Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Add Header Category */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">
              {editingId ? 'Edit Header Category' : 'Add Header Category'}
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Header Category Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Header Category Name:
              </label>
              <input
                type="text"
                value={headerCategoryName}
                onChange={(e) => setHeaderCategoryName(e.target.value)}
                placeholder="Enter Category Name"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Select Icon Library */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Icon Library:
              </label>
              <select
                value={selectedIconLibrary}
                onChange={(e) => setSelectedIconLibrary(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Icon Library</option>
                <option value="IonIcons">IonIcons</option>
                <option value="MaterialIcons">MaterialIcons</option>
                <option value="FontAwesome">FontAwesome</option>
                <option value="Feather">Feather</option>
              </select>
            </div>

            {/* Header Category Icon */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Header Category Icon Name:
              </label>
              <input
                type="text"
                value={headerCategoryIcon}
                onChange={(e) => setHeaderCategoryIcon(e.target.value)}
                placeholder="Enter Icon Name (e.g. fast-food)"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="mt-1 text-xs text-red-600">
                Enter correct icon name from selected library.
              </p>
            </div>

            {/* Theme / Color Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Theme Color:
              </label>
              <div className="grid grid-cols-4 gap-3 bg-neutral-50 p-3 rounded border border-neutral-200">
                {themeOptions.map(themeKey => {
                  const themeObj = themes[themeKey];
                  const color = themeObj.primary[0];
                  const isSelected = selectedTheme === themeKey;

                  // Map theme keys to user-friendly color names
                  const colorNames: Record<string, string> = {
                    all: 'Green',
                    wedding: 'Red',
                    winter: 'Sky Blue',
                    electronics: 'Yellow',
                    beauty: 'Pink',
                    grocery: 'Light Green',
                    fashion: 'Purple',
                    sports: 'Blue'
                  };

                  const displayColor = colorNames[themeKey] || themeKey;

                  return (
                    <div
                      key={themeKey}
                      onClick={() => setSelectedTheme(themeKey)}
                      title={displayColor}
                      className={`
                                cursor-pointer flex flex-col items-center gap-1 p-2 rounded transition-all
                                ${isSelected ? 'ring-2 ring-teal-500 bg-white shadow-sm' : 'hover:bg-neutral-200'}
                            `}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-sm border border-black/10"
                        style={{ background: color }}
                      />
                      <span className="text-[10px] text-neutral-600 font-medium capitalize text-center leading-tight">
                        {displayColor}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-1">This defines the header background color on the homepage.</p>
            </div>


            {/* Select Related Product Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Diff Category (Optional, for Product Filtering):
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Category</option>
                <option value="Instant Food">Instant Food</option>
                <option value="Pet Care">Pet Care</option>
                <option value="Cleaning Essentials">Cleaning Essentials</option>
                <option value="Bakery Biscuits">Bakery Biscuits</option>
                <option value="Sweet Tooth">Sweet Tooth</option>
                <option value="Tea Coffee">Tea Coffee</option>
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'Published' | 'Unpublished')}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="Published">Published</option>
                <option value="Unpublished">Unpublished</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddOrUpdate}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded text-sm font-medium transition-colors"
              >
                {editingId ? 'Update Category' : 'Add Category'}
              </button>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - View Header Category */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">View Header Category</h2>
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
                  className="px-2 py-1 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-neutral-700">entries</span>
              </div>

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
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Theme
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Product Cat
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      {loading ? 'Loading...' : 'No header categories found'}
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">{category.name}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">
                        {category.iconName} ({category.iconLibrary})
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">
                        <span className="inline-block px-2 py-0.5 rounded text-xs border border-gray-300 bg-gray-50 capitalize">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{category.relatedCategory || '-'}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">
                        <span className={`px-2 py-1 rounded text-xs ${category.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          {/* (Kept minimal for brevity but logic is straightforward) */}
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} entries
            </div>
            {/* Simple Pagination Buttons */}
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          SpeeUp - 10 Minute App
        </a>
      </div>
    </div>
  );
}

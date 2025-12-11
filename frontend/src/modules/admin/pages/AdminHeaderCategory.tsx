import { useState } from 'react';

interface HeaderCategory {
  id: number;
  name: string;
  iconLibrary: string;
  iconName: string;
  selectedCategory: string;
}

export default function AdminHeaderCategory() {
  const [headerCategoryName, setHeaderCategoryName] = useState('');
  const [selectedIconLibrary, setSelectedIconLibrary] = useState('');
  const [headerCategoryIcon, setHeaderCategoryIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const headerCategories: HeaderCategory[] = [
    {
      id: 1,
      name: 'Noodles',
      iconLibrary: 'IonIcons',
      iconName: 'fast-food',
      selectedCategory: 'Instant Food',
    },
    {
      id: 2,
      name: 'Pet Care',
      iconLibrary: 'MaterialIcons',
      iconName: 'pets',
      selectedCategory: 'Pet Care',
    },
    {
      id: 3,
      name: 'Cleaning',
      iconLibrary: 'MaterialIcons',
      iconName: 'cleaning-services',
      selectedCategory: 'Cleaning Essentials',
    },
    {
      id: 4,
      name: 'Bakery',
      iconLibrary: 'MaterialIcons',
      iconName: 'cake',
      selectedCategory: 'Bakery Biscuits',
    },
  ];

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
    category.selectedCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredCategories.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleAddHeaderCategory = () => {
    if (!headerCategoryName.trim()) {
      alert('Please enter a header category name');
      return;
    }
    if (!selectedIconLibrary) {
      alert('Please select an icon library');
      return;
    }
    if (!headerCategoryIcon.trim()) {
      alert('Please enter an icon name');
      return;
    }
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    // Handle add header category logic here
    alert('Header Category added successfully!');
    // Reset form
    setHeaderCategoryName('');
    setSelectedIconLibrary('');
    setHeaderCategoryIcon('');
    setSelectedCategory('');
  };

  const handleEdit = (id: number) => {
    const category = headerCategories.find(cat => cat.id === id);
    if (category) {
      setHeaderCategoryName(category.name);
      setSelectedIconLibrary(category.iconLibrary);
      setHeaderCategoryIcon(category.iconName);
      setSelectedCategory(category.selectedCategory);
      // You can add more edit logic here
    }
  };

  const handleDelete = (_id: number) => {
    if (window.confirm('Are you sure you want to delete this header category?')) {
      // Handle delete logic here
      alert('Header Category deleted successfully!');
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented here');
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
            <h2 className="text-base sm:text-lg font-semibold">Add Header Category</h2>
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
              <p className="mt-1 text-xs text-red-600">
                Use the correct icon library—wrong names may crash the app.
              </p>
            </div>

            {/* Header Category Icon */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Header Category Icon:
              </label>
              <input
                type="text"
                value={headerCategoryIcon}
                onChange={(e) => setHeaderCategoryIcon(e.target.value)}
                placeholder="Enter Category Icon"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="mt-1 text-xs text-red-600">
                Enter correct icon name from selected library—wrong names may crash the app.{' '}
                <a
                  href="https://react-icons.github.io/react-icons/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 underline"
                >
                  Find Icon from Here
                </a>
              </p>
            </div>

            {/* Select Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Category:
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

            {/* Add Header Category Button */}
            <button
              onClick={handleAddHeaderCategory}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded text-sm font-medium transition-colors"
            >
              Add Header Category
            </button>
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

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-2">
                      ID
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Header Category Name
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort('icon')}
                  >
                    <div className="flex items-center gap-2">
                      Icon Details
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      Selected Category
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort('action')}
                  >
                    <div className="flex items-center gap-2">
                      Action
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No header categories found
                    </td>
                  </tr>
                ) : (
                  displayedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{category.id}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">{category.name}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">
                        {category.iconName} {category.iconLibrary}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{category.selectedCategory}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category.id)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
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
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === 1
                    ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
                aria-label="Previous page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border border-neutral-300 rounded text-sm ${
                    currentPage === page
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
                aria-label="Next page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
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


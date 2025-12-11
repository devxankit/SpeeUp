import { useState } from 'react';

interface Brand {
  id: number;
  name: string;
  image: string;
}

export default function AdminBrand() {
  const [brandName, setBrandName] = useState('');
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const brands: Brand[] = [
    {
      id: 3,
      name: 'Amul',
      image: '/api/placeholder/100/100',
    },
    {
      id: 4,
      name: 'Haldiram',
      image: '/api/placeholder/100/100',
    },
    {
      id: 5,
      name: 'Nestle',
      image: '/api/placeholder/100/100',
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

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredBrands.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedBrands = filteredBrands.slice(startIndex, endIndex);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBrandImage(e.target.files[0]);
    }
  };

  const handleAddBrand = () => {
    if (!brandName.trim()) {
      alert('Please enter a brand name');
      return;
    }
    // Handle add brand logic here
    alert('Brand added successfully!');
    // Reset form
    setBrandName('');
    setBrandImage(null);
  };

  const handleEdit = (id: number) => {
    const brand = brands.find(b => b.id === id);
    if (brand) {
      setBrandName(brand.name);
      // You can add more edit logic here
    }
  };

  const handleDelete = (_id: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      // Handle delete logic here
      alert('Brand deleted successfully!');
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Brand</h1>
        <div className="text-sm text-blue-500">
          <span className="text-blue-500 hover:underline cursor-pointer">Home</span>{' '}
          <span className="text-neutral-400">/</span> Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Add Brand */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">Add Brand</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Brand Name:
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter Brand Name"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Brand Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Brand Image:
              </label>
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded text-sm cursor-pointer hover:bg-neutral-200 transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-neutral-500">
                  {brandImage ? brandImage.name : 'No file chosen'}
                </span>
              </div>
            </div>

            {/* Add Brand Button */}
            <button
              onClick={handleAddBrand}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded text-sm font-medium transition-colors"
            >
              Add Brand
            </button>
          </div>
        </div>

        {/* Right Panel - View Brand */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">View Brand</h2>
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
            <table className="w-full min-w-[600px]">
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
                      Brand Name
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Brand Image
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
                {displayedBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No brands found
                    </td>
                  </tr>
                ) : (
                  displayedBrands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{brand.id}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">{brand.name}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="w-20 h-16 bg-neutral-100 rounded overflow-hidden flex items-center justify-center">
                          {brandImage && brand.id === 3 ? (
                            <img
                              src={URL.createObjectURL(brandImage)}
                              alt={brand.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <img
                              src={brand.image}
                              alt={brand.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(brand.id)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBrands.length)} of {filteredBrands.length} entries
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


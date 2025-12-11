import { useState } from 'react';

interface Banner {
  id: number;
  bannerType: 'Header' | 'Home section' | 'Deal of the day';
  categoryName: string;
  bannerImage: string;
}

// Mock data matching the image
const INITIAL_BANNERS: Banner[] = [
  {
    id: 1,
    bannerType: 'Header',
    categoryName: 'No Category Selected',
    bannerImage: '/api/placeholder/200/100',
  },
  {
    id: 2,
    bannerType: 'Header',
    categoryName: 'No Category Selected',
    bannerImage: '/api/placeholder/200/100',
  },
  {
    id: 3,
    bannerType: 'Home section',
    categoryName: 'Cleaning Essentials',
    bannerImage: '/api/placeholder/200/100',
  },
  {
    id: 4,
    bannerType: 'Deal of the day',
    categoryName: 'No Category Selected',
    bannerImage: '/api/placeholder/200/100',
  },
  {
    id: 5,
    bannerType: 'Home section',
    categoryName: 'Tea Coffee',
    bannerImage: '/api/placeholder/200/100',
  },
];

export default function AdminBanner() {
  const [formData, setFormData] = useState({
    bannerType: '',
    category: '',
    bannerImage: null as File | null,
  });

  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const categories = [
    'Select Category',
    'No Category Selected',
    'Cleaning Essentials',
    'Tea Coffee',
    'Pet Care',
    'Sweet Tooth',
    'Instant Food',
    'Organic & Premium',
  ];

  const bannerTypes = [
    'Select Banner Type',
    'Header',
    'Home section',
    'Deal of the day',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, bannerImage: e.target.files![0] }));
    }
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bannerType || formData.bannerType === 'Select Banner Type') {
      alert('Please select a banner type');
      return;
    }

    if (!formData.bannerImage && !editingBanner) {
      alert('Please select a banner image');
      return;
    }

    const bannerImageUrl = formData.bannerImage 
      ? URL.createObjectURL(formData.bannerImage)
      : editingBanner?.bannerImage || '/api/placeholder/200/100';

    if (editingBanner) {
      // Update existing banner
      setBanners(banners.map(banner =>
        banner.id === editingBanner.id
          ? {
              ...banner,
              bannerType: formData.bannerType as Banner['bannerType'],
              categoryName: formData.category || 'No Category Selected',
              bannerImage: bannerImageUrl,
            }
          : banner
      ));
      setEditingBanner(null);
    } else {
      // Add new banner
      const newBanner: Banner = {
        id: banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1,
        bannerType: formData.bannerType as Banner['bannerType'],
        categoryName: formData.category || 'No Category Selected',
        bannerImage: bannerImageUrl,
      };
      setBanners([...banners, newBanner]);
    }

    // Reset form
    setFormData({
      bannerType: '',
      category: '',
      bannerImage: null,
    });
    
    alert(editingBanner ? 'Banner updated successfully!' : 'Banner added successfully!');
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      bannerType: banner.bannerType,
      category: banner.categoryName === 'No Category Selected' ? '' : banner.categoryName,
      bannerImage: null,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(banner => banner.id !== id));
      if (editingBanner?.id === id) {
        setEditingBanner(null);
        setFormData({
          bannerType: '',
          category: '',
          bannerImage: null,
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setFormData({
      bannerType: '',
      category: '',
      bannerImage: null,
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => (
    <span className="text-neutral-400 text-xs ml-1">
      {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  const getBannerTypeColor = (type: string) => {
    switch (type) {
      case 'Header':
        return 'bg-green-100 text-green-800';
      case 'Home section':
        return 'bg-blue-100 text-blue-800';
      case 'Deal of the day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  // Sort banners
  let sortedBanners = [...banners];
  if (sortColumn) {
    sortedBanners = [...sortedBanners].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'categoryName':
          aValue = a.categoryName;
          bValue = b.categoryName;
          break;
        case 'bannerType':
          aValue = a.bannerType;
          bValue = b.bannerType;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedBanners.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedBanners = sortedBanners.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 p-6">
        {/* Header with Title and Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Banner</h1>
          <div className="text-sm">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
            <span className="text-neutral-400 mx-1">/</span>
            <span className="text-neutral-600">Banner</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel: Add Banner */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Add Banner</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <form onSubmit={handleAddBanner} className="space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Banner Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bannerType"
                    value={formData.bannerType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    {bannerTypes.map((type) => (
                      <option key={type} value={type === 'Select Banner Type' ? '' : type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat === 'Select Category' || cat === 'No Category Selected' ? '' : cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded text-sm cursor-pointer hover:bg-neutral-200 transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required={!editingBanner}
                      />
                    </label>
                    <span className="text-sm text-neutral-500">
                      {formData.bannerImage ? formData.bannerImage.name : editingBanner ? 'Current image' : 'No file chosen'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    {editingBanner ? 'Update Banner' : 'Add Banner'}
                  </button>
                  {editingBanner && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: View Banner */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">View Banner</h2>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-neutral-600">entries</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-xs font-bold text-neutral-800 border-b border-neutral-200">
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Sr No <SortIcon column="id" />
                      </div>
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('categoryName')}
                    >
                      <div className="flex items-center">
                        Category Name <SortIcon column="categoryName" />
                      </div>
                    </th>
                    <th className="p-4">
                      <div className="flex items-center">
                        Banner Image <SortIcon column="bannerImage" />
                      </div>
                    </th>
                    <th className="p-4">
                      <div className="flex items-center">
                        Action <SortIcon column="action" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBanners.map((banner, index) => (
                    <tr
                      key={banner.id}
                      className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200"
                    >
                      <td className="p-4 align-middle">{startIndex + index + 1}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span>{banner.categoryName}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBannerTypeColor(banner.bannerType)}`}>
                            {banner.bannerType}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <img
                          src={banner.bannerImage}
                          alt={`Banner ${banner.id}`}
                          className="w-32 h-16 object-cover rounded border border-neutral-200"
                        />
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            title="Edit"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            title="Delete"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedBanners.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-neutral-400">
                        No banners found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-neutral-700">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedBanners.length)} of {sortedBanners.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 border border-green-600 rounded ${
                    currentPage === 1
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  aria-label="Previous page"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="px-3 py-1.5 border border-green-600 bg-green-600 text-white rounded font-medium text-sm">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 border border-green-600 rounded ${
                    currentPage === totalPages
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  aria-label="Next page"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Appzeto - 10 Minute App
        </a>
      </footer>
    </div>
  );
}


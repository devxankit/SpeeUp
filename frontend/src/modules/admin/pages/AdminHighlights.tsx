import { useState } from 'react';

interface Highlight {
  id: number;
  title: string;
  description: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
}

export default function AdminHighlights() {
  const [formData, setFormData] = useState({
    seller: '',
    title: '',
    description: '',
    type: '',
  });
  const [highlights, setHighlights] = useState<Highlight[]>([
    {
      id: 3,
      title: 'Fresh Vegitables',
      description: 'Get at your favorite Shop',
      mediaType: 'video',
      mediaUrl: 'https://example.com/video.mp4',
    },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sellers = [
    'Select Seller',
    'Seller 1',
    'Seller 2',
    'Seller 3',
  ];

  const types = [
    'Select Type',
    'Video',
    'Image',
    'Banner',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredHighlights = highlights.filter(highlight =>
    highlight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    highlight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    highlight.id.toString().includes(searchTerm)
  );

  const sortedHighlights = [...filteredHighlights].sort((a, b) => {
    if (sortColumn === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortColumn === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else if (sortColumn === 'description') {
      return sortDirection === 'asc' 
        ? a.description.localeCompare(b.description) 
        : b.description.localeCompare(a.description);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedHighlights.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedHighlights = sortedHighlights.slice(startIndex, endIndex);

  const handleAddHighlight = () => {
    if (!formData.seller || formData.seller === 'Select Seller') {
      alert('Please select a seller');
      return;
    }
    if (!formData.type || formData.type === 'Select Type') {
      alert('Please select a type');
      return;
    }
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (editingId !== null) {
      // Update existing highlight
      setHighlights(highlights.map(highlight => 
        highlight.id === editingId 
          ? { ...highlight, title: formData.title, description: formData.description }
          : highlight
      ));
      setEditingId(null);
    } else {
      // Add new highlight
      const newId = Math.max(...highlights.map(h => h.id), 0) + 1;
      setHighlights([...highlights, {
        id: newId,
        title: formData.title,
        description: formData.description,
        mediaType: formData.type.toLowerCase() === 'video' ? 'video' : 'image',
        mediaUrl: '',
      }]);
    }

    // Reset form
    setFormData({
      seller: '',
      title: '',
      description: '',
      type: '',
    });
  };

  const handleEdit = (highlight: Highlight) => {
    setFormData({
      seller: '',
      title: highlight.title,
      description: highlight.description,
      type: highlight.mediaType === 'video' ? 'Video' : 'Image',
    });
    setEditingId(highlight.id);
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      setHighlights(highlights.filter(highlight => highlight.id !== id));
      if (editingId === id) {
        setFormData({
          seller: '',
          title: '',
          description: '',
          type: '',
        });
        setEditingId(null);
      }
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Highlights</h1>
        <div className="text-sm text-neutral-600">
          <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-teal-600">Dashboard</span>
        </div>
      </div>

      {/* Add HighLight Section */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-teal-600 px-4 sm:px-6 py-3">
          <h2 className="text-white text-lg font-semibold">Add HighLight</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Select Seller <span className="text-red-500">*</span>
              </label>
              <select
                name="seller"
                value={formData.seller}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {sellers.map((seller) => (
                  <option key={seller} value={seller === 'Select Seller' ? '' : seller}>
                    {seller}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Title"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Description"
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Select Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {types.map((type) => (
                  <option key={type} value={type === 'Select Type' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleAddHighlight}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded text-sm font-medium transition-colors"
            >
              {editingId !== null ? 'Update HighLight' : 'Add HighLight'}
            </button>
          </div>
        </div>
      </div>

      {/* View HighLight Section */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">View HighLight</h2>
        </div>
        <div className="p-4 sm:p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
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
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <button
                onClick={handleExport}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search:"
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
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedHighlights.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No highlights available
                    </td>
                  </tr>
                ) : (
                  displayedHighlights.map((highlight) => (
                    <tr key={highlight.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{highlight.id}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">{highlight.title}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{highlight.description}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors">
                          View {highlight.mediaType === 'video' ? 'Video' : 'Image'}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(highlight)}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(highlight.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
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
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedHighlights.length)} of {sortedHighlights.length} entries
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
              <button
                className="p-2 border border-neutral-300 rounded bg-teal-600 text-white font-medium min-w-[32px]"
              >
                {currentPage}
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === totalPages
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
    </div>
  );
}


import { useState } from 'react';

interface DeliverableArea {
  id: number;
  city: string;
  deliverableAreaName: string;
}

// Mock data matching the image
const DELIVERABLE_AREAS: DeliverableArea[] = [
  {
    id: 9,
    city: 'Bhandara',
    deliverableAreaName: 'Global Area',
  },
  {
    id: 10,
    city: '',
    deliverableAreaName: 'Kimironk',
  },
  {
    id: 11,
    city: '',
    deliverableAreaName: 'G Noida',
  },
];

export default function AdminDeliverableAreaList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Sort deliverable areas
  let sortedAreas = [...DELIVERABLE_AREAS];
  if (sortColumn) {
    sortedAreas = [...sortedAreas].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'city':
          aValue = a.city || '';
          bValue = b.city || '';
          break;
        case 'deliverableAreaName':
          aValue = a.deliverableAreaName;
          bValue = b.deliverableAreaName;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedAreas.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedAreas = sortedAreas.slice(startIndex, endIndex);

  const handleEdit = (id: number) => {
    console.log('Edit deliverable area:', id);
    // Navigate to edit page or open edit modal
    alert(`Edit deliverable area ${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this deliverable area?')) {
      console.log('Delete deliverable area:', id);
      alert(`Delete deliverable area ${id}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 p-6">
        {/* Header with Title and Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Deliverable Area List</h1>
          <div className="text-sm">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
            <span className="text-neutral-400 mx-1">/</span>
            <span className="text-neutral-600">Deliverable Area List</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-800">Deliverable Area List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-xs font-bold text-neutral-800 border-b border-neutral-200">
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID <SortIcon column="id" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('city')}
                  >
                    <div className="flex items-center">
                      City <SortIcon column="city" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('deliverableAreaName')}
                  >
                    <div className="flex items-center">
                      Deliverable Area Name <SortIcon column="deliverableAreaName" />
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
                {displayedAreas.map((area) => (
                  <tr
                    key={area.id}
                    className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200"
                  >
                    <td className="p-4 align-middle">{area.id}</td>
                    <td className="p-4 align-middle">{area.city || ''}</td>
                    <td className="p-4 align-middle">{area.deliverableAreaName}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(area.id)}
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
                          onClick={() => handleDelete(area.id)}
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
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedAreas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400">
                      No deliverable areas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedAreas.length)} of {sortedAreas.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-teal-600 rounded ${
                  currentPage === 1
                    ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                    : 'text-teal-600 hover:bg-teal-50'
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
              <button className="px-3 py-1.5 border border-teal-600 bg-teal-600 text-white rounded font-medium text-sm">
                {currentPage}
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 border border-teal-600 rounded ${
                  currentPage === totalPages
                    ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                    : 'text-teal-600 hover:bg-teal-50'
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


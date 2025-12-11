import { useState } from 'react';

interface PosReportItem {
  id: string;
  customerDetails: string;
  mobile: string;
  date: string;
  paymentMethod: string;
  amount: number;
  billBy: string;
  invoice: string;
}

export default function AdminPosReport() {
  const [fromDate, setFromDate] = useState('12/09/2025');
  const [toDate, setToDate] = useState('12/09/2025');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data - empty for now
  const reportData: PosReportItem[] = [];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = reportData.filter(item =>
    item.customerDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mobile.includes(searchTerm) ||
    item.id.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedData = filteredData.slice(startIndex, endIndex);

  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  const handleClearDates = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">POS Report</h1>
        <div className="text-sm text-blue-500">
          <span className="text-blue-500 hover:underline cursor-pointer">Dashboard</span>{' '}
          <span className="text-neutral-400">/</span> POS Report
        </div>
      </div>

      {/* Report Card */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        {/* Green Header Bar */}
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
          <h2 className="text-base sm:text-lg font-semibold">View POS Report</h2>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            {/* Left Side Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-600 whitespace-nowrap">From - To Order Date:</label>
                <div className="relative flex-1 min-w-[200px]">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={fromDate && toDate ? `${fromDate} - ${toDate}` : ''}
                    placeholder="Select date range"
                    readOnly
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 cursor-pointer"
                    onClick={() => {
                      // Date picker functionality can be added here
                    }}
                  />
                </div>
                <button
                  onClick={handleClearDates}
                  className="px-3 py-2 bg-neutral-700 hover:bg-neutral-800 text-white text-sm rounded transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              </div>

              {/* Sellers Dropdown */}
              <select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 min-w-[150px]"
              >
                <option value="all">All Sellers</option>
                <option value="1">Chirag Seller</option>
                <option value="2">Vaishnavi Seller</option>
                <option value="3">Pratik Seller</option>
              </select>

              {/* Payment Methods Dropdown */}
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 min-w-[180px]"
              >
                <option value="all">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {/* Right Side Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
                    O. Id
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('customerDetails')}
                >
                  <div className="flex items-center gap-2">
                    Customer Details
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('mobile')}
                >
                  <div className="flex items-center gap-2">
                    Mobile
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('paymentMethod')}
                >
                  <div className="flex items-center gap-2">
                    Payment Method
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('billBy')}
                >
                  <div className="flex items-center gap-2">
                    Bill By
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                displayedData.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{item.id}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{item.customerDetails}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{item.mobile}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{item.date}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{item.paymentMethod}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">₹{item.amount.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{item.billBy}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        {item.invoice}
                      </button>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
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


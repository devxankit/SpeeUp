import { useState } from 'react';

interface TopSellingProduct {
  id: number;
  productName: string;
  totalSold: number;
}

export default function AdminAIInsightReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data - empty initially as shown in image
  const [topSellingProducts] = useState<TopSellingProduct[]>([]);
  
  // Summary metrics
  const [summaryData] = useState({
    totalOrders: 405,
    totalRevenue: null as number | null,
    totalDiscounts: null as number | null,
    totalRefunds: 0,
  });

  const formatDateForDisplay = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleRefreshReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    // Simulate refreshing report data
    // In a real app, this would fetch data from an API
    alert('Report refreshed successfully!');
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

  // Filter and sort products
  let filteredProducts = topSellingProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortColumn) {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'productName':
          aValue = a.productName;
          bValue = b.productName;
          break;
        case 'totalSold':
          aValue = a.totalSold;
          bValue = b.totalSold;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleExport = () => {
    const headers = ['Product', 'Total Sold'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        `"${product.productName}"`,
        product.totalSold
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `top_selling_products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateDisplay = startDate && endDate 
    ? `${formatDateForDisplay(new Date(startDate))} ${formatDateForDisplay(new Date(endDate))}`
    : '30/Nov/-0001 30/Nov/-0001';

  // Icons for summary cards
  const ordersIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"></path>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"></path>
    </svg>
  );

  const revenueIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  const discountIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  const refundIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <path d="M9 9H15M9 15H15M9 12H15"></path>
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 p-6">
        {/* Header with Title and Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">AI Insight Report</h1>
          <div className="text-sm">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
            <span className="text-neutral-400 mx-1">/</span>
            <span className="text-neutral-600">AI Insight Report</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Refresh AI Insight Report */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Refresh AI Insight Report</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selling Report Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="dd-----yyyy"
                    />
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selling Report End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="dd-----yyyy"
                    />
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleRefreshReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Refresh Report
                </button>
              </div>
            </div>

            {/* View AI Insight Report */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                View AI Insight Report For {dateDisplay}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <div className="text-blue-600">{ordersIcon}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-neutral-900">{summaryData.totalOrders}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <div className="text-orange-600">{revenueIcon}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold text-neutral-900">
                    {summaryData.totalRevenue !== null ? `₹${summaryData.totalRevenue}` : '₹null'}
                  </p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <div className="text-pink-600">{discountIcon}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Total Discounts</h3>
                  <p className="text-2xl font-bold text-neutral-900">
                    {summaryData.totalDiscounts !== null ? `₹${summaryData.totalDiscounts}` : '₹null'}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <div className="text-red-600">{refundIcon}</div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-1">Total Refunds</h3>
                  <p className="text-2xl font-bold text-neutral-900">{summaryData.totalRefunds}</p>
                </div>
              </div>
            </div>

            {/* AI Business Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                  <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74M10 11h4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path>
                </svg>
                <h2 className="text-lg font-semibold text-neutral-800">
                  AI Business Insights For {dateDisplay}
                </h2>
              </div>
              <div className="text-sm text-neutral-600">
                <p className="mb-2">Order lpejakt Depart</p>
                <code className="block bg-neutral-50 p-2 rounded text-xs">html</code>
              </div>
            </div>
          </div>

          {/* Right Panel: Top Selling Products */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">
                Top Selling Products For {dateDisplay}
              </h2>
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
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-neutral-600">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Export
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                  <input
                    type="text"
                    className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-green-500 w-48"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-xs font-bold text-neutral-800 border-b border-neutral-200">
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('productName')}
                    >
                      <div className="flex items-center">
                        Product <SortIcon column="productName" />
                      </div>
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('totalSold')}
                    >
                      <div className="flex items-center">
                        Total Sold <SortIcon column="totalSold" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-neutral-400">
                        No data available in table.
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200"
                      >
                        <td className="p-4 align-middle">{product.productName}</td>
                        <td className="p-4 align-middle">{product.totalSold}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-neutral-700">
                Showing {startIndex} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} entries
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
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-2 border border-green-600 rounded ${
                    currentPage === totalPages || totalPages === 0
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

        {/* Detailed Analysis Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Detailed Analysis</h2>
          
          <div className="space-y-6">
            {/* Trends and Insights */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Trends and Insights</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">No Revenue Generated</h4>
                  <p className="text-sm text-neutral-600">
                    Despite having {summaryData.totalOrders} orders, there is no revenue recorded. This suggests either a data entry error or a misconfiguration in the sales system.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Absence of Top Selling Products</h4>
                  <p className="text-sm text-neutral-600">
                    The data does not reveal any top-selling products, indicating a potential issue in product tracking or a lack of focused sales strategy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Payments and Refunds</h4>
                  <p className="text-sm text-neutral-600">
                    With no data on payment methods and refunds, it's hard to gauge consumer payment preferences or satisfaction levels.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Business Recommendations</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
                <li>
                  <span className="font-medium">Review Sales Data Configuration:</span> Ensure that all sales transactions are correctly recorded in the system to reflect accurate revenue figures.
                </li>
                <li>
                  <span className="font-medium">Implement Product Tracking:</span> Develop a system to identify best-sellers to optimize stock management and marketing strategies.
                </li>
                <li>
                  <span className="font-medium">Enhance Payment Method Analytics:</span> Track and analyze payment method usage to tailor offerings that align with consumer preferences.
                </li>
              </ol>
            </div>

            {/* Ways to Reduce Return Rates */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Ways to Reduce Return Rates</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-neutral-600">
                <li>
                  <span className="font-medium">Improve Product Descriptions:</span> Provide detailed and accurate product information to manage customer expectations.
                </li>
                <li>
                  <span className="font-medium">Enhance Quality Control:</span> Implement stringent quality checks to minimize defective or subpar product deliveries.
                </li>
                <li>
                  <span className="font-medium">Customer Feedback Loop:</span> Create channels for customer feedback to quickly address any issues and improve overall satisfaction.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-blue-600 hover:underline">
          SpeeUp - 10 Minute App
        </a>
      </footer>
    </div>
  );
}


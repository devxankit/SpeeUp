import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock Data - Empty for now as shown in image
interface ProductSellingReport {
    productName: string;
    variantInfo: string;
    totalProductSold: number;
    totalAmount: number;
}

const PRODUCT_SELLING_REPORTS: ProductSellingReport[] = []; // Empty as shown in image

export default function SellerProductSellingReport() {
    const [fromDate, setFromDate] = useState('12/06/2025');
    const [toDate, setToDate] = useState('12/06/2025');
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const filteredReports = PRODUCT_SELLING_REPORTS.filter(report => {
        return Object.values(report).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedReports = filteredReports.slice(startIndex, endIndex);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }: { column: string }) => (
        <span className="text-neutral-300 text-[10px]">
            {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
        </span>
    );

    const handleClearDates = () => {
        setFromDate('');
        setToDate('');
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-neutral-50">
            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/seller" className="text-blue-600 hover:text-blue-700">
                        Home
                    </Link>
                    <span className="text-neutral-400">/</span>
                    <span className="text-neutral-900">Product Selling Report</span>
                </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 p-4 sm:p-6">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
                    {/* Section Header */}
                    <div className="bg-teal-600 text-white px-4 sm:px-6 py-3 rounded-t-lg">
                        <h1 className="text-lg sm:text-xl font-semibold">View Product Selling Report</h1>
                    </div>

                    {/* Controls Panel */}
                    <div className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-neutral-100">
                        {/* Left Side: Date Range Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-neutral-600 whitespace-nowrap">From - To Date:</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fromDate && toDate ? `${fromDate} - ${toDate}` : ''}
                                    placeholder="Select date range"
                                    className="pl-10 pr-3 py-2 bg-white border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none w-full sm:w-64"
                                    readOnly
                                />
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <button
                                onClick={handleClearDates}
                                className="px-3 py-2 bg-neutral-700 hover:bg-neutral-800 text-white text-sm rounded transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Right Side: Per Page, Export, Search */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Per Page */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Per Page:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={() => {
                                    const headers = ['Product Name', 'Variant Info', 'Total Product Sold', 'Total Amount'];
                                    const csvContent = [
                                        headers.join(','),
                                        ...filteredReports.map(report => [
                                            `"${report.productName}"`,
                                            `"${report.variantInfo}"`,
                                            report.totalProductSold,
                                            report.totalAmount
                                        ].join(','))
                                    ].join('\n');
                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const link = document.createElement('a');
                                    const url = URL.createObjectURL(blob);
                                    link.setAttribute('href', url);
                                    link.setAttribute('download', `product_selling_report_${new Date().toISOString().split('T')[0]}.csv`);
                                    link.style.visibility = 'hidden';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {/* Search */}
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                                <input
                                    type="text"
                                    className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500 w-full sm:w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-neutral-200">
                            <thead>
                                <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                                    <th
                                        className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('productName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Product Name
                                            <SortIcon column="productName" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('variantInfo')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Variant Info
                                            <SortIcon column="variantInfo" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('totalProductSold')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Total Product Sold
                                            <SortIcon column="totalProductSold" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('totalAmount')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Total Amount
                                            <SortIcon column="totalAmount" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-neutral-500">
                                            No data available in table
                                        </td>
                                    </tr>
                                ) : (
                                    displayedReports.map((report, index) => (
                                        <tr key={index} className="hover:bg-neutral-50">
                                            <td className="p-4 border border-neutral-200 text-sm text-neutral-900">{report.productName}</td>
                                            <td className="p-4 border border-neutral-200 text-sm text-neutral-900">{report.variantInfo}</td>
                                            <td className="p-4 border border-neutral-200 text-sm text-neutral-900">{report.totalProductSold}</td>
                                            <td className="p-4 border border-neutral-200 text-sm text-neutral-900">₹{report.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-neutral-600">
                            Showing {filteredReports.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || totalPages === 0}
                                className="w-8 h-8 flex items-center justify-center border border-teal-300 rounded hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="w-8 h-8 flex items-center justify-center border border-teal-300 rounded hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="px-4 sm:px-6 py-4 text-center bg-white border-t border-neutral-200">
                <p className="text-xs sm:text-sm text-neutral-600">
                    Copyright © 2025. Developed By{' '}
                    <span className="font-semibold text-teal-600">Appzeto - 10 Minute App</span>
                </p>
            </footer>
        </div>
    );
}


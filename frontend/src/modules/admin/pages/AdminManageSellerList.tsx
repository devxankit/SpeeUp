import { useState } from 'react';

interface Seller {
    id: number;
    name: string;
    storeName: string;
    phone: string;
    email: string;
    logo: string;
    balance: number;
    commission: number;
    categories: string[];
    status: 'Approved' | 'Pending' | 'Rejected';
    needApproval: boolean;
}

// Mock data matching the image
const SELLERS: Seller[] = [
    {
        id: 1,
        name: 'Chirag Seller',
        storeName: 'Chirag store',
        phone: '9766846429',
        email: 'info@chirag.com',
        logo: '/api/placeholder/40/40',
        balance: 1.70,
        commission: 5.00,
        categories: ['Organic & Premium', 'Instant Food', 'Pet Care', 'Sweet Tooth', 'Tea Coffee', 'Cleaning Essentials', 'Pharma And Wellness'],
        status: 'Approved',
        needApproval: false,
    },
    {
        id: 2,
        name: 'Vaishnavi Seller',
        storeName: 'Vaishnavi Store',
        phone: '9766846428',
        email: 'info@vaishnavi.com',
        logo: '/api/placeholder/40/40',
        balance: 7929.75,
        commission: 5.00,
        categories: ['Pet Care', 'Sweet Tooth', 'Personal Care', 'Paan Corner', 'Home Office'],
        status: 'Approved',
        needApproval: false,
    },
    {
        id: 3,
        name: 'Pratik Seller',
        storeName: 'Pratik Store',
        phone: '9766846427',
        email: 'info@pratik.com',
        logo: '/api/placeholder/40/40',
        balance: 8379.00,
        commission: 5.00,
        categories: ['Pet Care', 'Sweet Tooth', 'Tea Coffee'],
        status: 'Approved',
        needApproval: false,
    },
];

export default function AdminManageSellerList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
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

    // Filter sellers
    let filteredSellers = SELLERS.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.phone.includes(searchTerm)
    );

    // Sort sellers
    if (sortColumn) {
        filteredSellers = [...filteredSellers].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'storeName':
                    aValue = a.storeName;
                    bValue = b.storeName;
                    break;
                case 'balance':
                    aValue = a.balance;
                    bValue = b.balance;
                    break;
                case 'commission':
                    aValue = a.commission;
                    bValue = b.commission;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(filteredSellers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedSellers = filteredSellers.slice(startIndex, endIndex);

    const handleExport = () => {
        const headers = ['Id', 'Name', 'Store Name', 'Contact', 'Balance', 'Commission', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredSellers.map(seller => [
                seller.id,
                `"${seller.name}"`,
                `"${seller.storeName}"`,
                `"${seller.phone}, ${seller.email}"`,
                seller.balance,
                `${seller.commission}%`,
                seller.status
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sellers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (id: number) => {
        console.log('Edit seller:', id);
        // Navigate to edit page or open edit modal
        alert(`Edit seller ${id}`);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this seller?')) {
            console.log('Delete seller:', id);
            alert(`Delete seller ${id}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Content */}
            <div className="flex-1 p-6">
                {/* Main Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                    {/* Header */}
                    <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                        <h2 className="text-lg font-semibold">View Seller List</h2>
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
                                className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                Export
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                                <input
                                    type="text"
                                    className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500 w-48"
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 text-xs font-bold text-neutral-800 border-b border-neutral-200">
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center">
                                            Id <SortIcon column="id" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Name <SortIcon column="name" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('storeName')}
                                    >
                                        <div className="flex items-center">
                                            Store Name <SortIcon column="storeName" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Contact
                                    </th>
                                    <th className="p-4">
                                        Logo
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('balance')}
                                    >
                                        <div className="flex items-center">
                                            Balance <SortIcon column="balance" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('commission')}
                                    >
                                        <div className="flex items-center">
                                            Commission <SortIcon column="commission" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Category
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status <SortIcon column="status" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Need Approval?
                                    </th>
                                    <th className="p-4">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedSellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200">
                                        <td className="p-4 align-middle">{seller.id}</td>
                                        <td className="p-4 align-middle">{seller.name}</td>
                                        <td className="p-4 align-middle">{seller.storeName}</td>
                                        <td className="p-4 align-middle">
                                            <div className="text-xs">
                                                <div>{seller.phone}</div>
                                                <div className="text-neutral-500">{seller.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <img 
                                                src={seller.logo} 
                                                alt={seller.storeName}
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        </td>
                                        <td className="p-4 align-middle">{seller.balance.toFixed(2)}</td>
                                        <td className="p-4 align-middle">{seller.commission.toFixed(2)}%</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {seller.categories.map((category, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
                                                    >
                                                        {category}
                                                        <svg 
                                                            width="12" 
                                                            height="12" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            strokeWidth="2" 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round"
                                                            className="cursor-pointer hover:text-teal-600"
                                                        >
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                seller.status === 'Approved' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : seller.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {seller.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                seller.needApproval 
                                                    ? 'bg-pink-100 text-pink-800' 
                                                    : 'bg-pink-100 text-pink-800'
                                            }`}>
                                                {seller.needApproval ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(seller.id)}
                                                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(seller.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                                ))}
                                {displayedSellers.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-neutral-400">
                                            No sellers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-neutral-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredSellers.length)} of {filteredSellers.length} entries
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
                            <button
                                className="px-3 py-1.5 border border-teal-600 bg-teal-600 text-white rounded font-medium text-sm"
                            >
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
                <a href="#" className="text-blue-600 hover:underline">Appzeto - 10 Minute App</a>
            </footer>
        </div>
    );
}


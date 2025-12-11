import { useState } from 'react';

interface DeliveryBoy {
    id: number;
    name: string;
    mobile: string;
    address: string;
    city: string;
    commissionType: 'Percentage' | 'Fixed';
    commission?: number;
    minAmount?: number;
    maxAmount?: number;
    balance: number;
    cashCollected: number;
    status: 'Active' | 'Inactive';
    available: 'Available' | 'Not Available';
}

// Mock data matching the image
const DELIVERY_BOYS: DeliveryBoy[] = [
    {
        id: 1,
        name: 'Chirag',
        mobile: '9999999999',
        address: 'Santaji ward, Bhandara',
        city: 'Bhandara',
        commissionType: 'Percentage',
        commission: 4,
        minAmount: 5,
        maxAmount: 25,
        balance: 0.64,
        cashCollected: 0.00,
        status: 'Active',
        available: 'Available',
    },
    {
        id: 2,
        name: 'Vaishnavi',
        mobile: '7777777777',
        address: 'Santaji ward, Bhandara',
        city: 'Bhandara',
        commissionType: 'Percentage',
        commission: 5,
        minAmount: 10,
        maxAmount: 25,
        balance: 115.00,
        cashCollected: 0.00,
        status: 'Active',
        available: 'Available',
    },
    {
        id: 3,
        name: 'Pratik',
        mobile: '8888888888',
        address: 'Santaji ward, Bhandara',
        city: 'Bhandara',
        commissionType: 'Percentage',
        commission: 10,
        minAmount: 5,
        maxAmount: 30,
        balance: 208.70,
        cashCollected: 0.00,
        status: 'Active',
        available: 'Available',
    },
    {
        id: 4,
        name: 'Abdullah',
        mobile: '3408886444',
        address: 'Bandara',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 5,
        name: 'Xikdkdkdk',
        mobile: '6565646535',
        address: 'Jcisoaaakalla',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 6,
        name: 'Nikhil',
        mobile: '7061973879',
        address: 'Pune Maharashtra India',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 7,
        name: 'Ankit',
        mobile: '8791136048',
        address: 'Vijaynagar',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 8,
        name: 'Singh',
        mobile: '8888888881',
        address: 'Diaper',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 9,
        name: 'Vansh Girhepunje',
        mobile: '8080430337',
        address: 'Sant kabir ward',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
    {
        id: 10,
        name: 'Rohit Kumbhalkar',
        mobile: '8379002195',
        address: 'Shukrawari rajendra ward bhandara',
        city: 'Bhandara',
        commissionType: 'Fixed',
        balance: 0.00,
        cashCollected: 0.00,
        status: 'Inactive',
        available: 'Not Available',
    },
];

export default function AdminManageDeliveryBoy() {
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

    // Filter delivery boys
    let filteredDeliveryBoys = DELIVERY_BOYS.filter(deliveryBoy =>
        deliveryBoy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryBoy.mobile.includes(searchTerm) ||
        deliveryBoy.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryBoy.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort delivery boys
    if (sortColumn) {
        filteredDeliveryBoys = [...filteredDeliveryBoys].sort((a, b) => {
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
                case 'mobile':
                    aValue = a.mobile;
                    bValue = b.mobile;
                    break;
                case 'city':
                    aValue = a.city;
                    bValue = b.city;
                    break;
                case 'balance':
                    aValue = a.balance;
                    bValue = b.balance;
                    break;
                case 'cashCollected':
                    aValue = a.cashCollected;
                    bValue = b.cashCollected;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'available':
                    aValue = a.available;
                    bValue = b.available;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(filteredDeliveryBoys.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedDeliveryBoys = filteredDeliveryBoys.slice(startIndex, endIndex);

    const handleExport = () => {
        const headers = ['Id', 'Name', 'Mobile', 'Address', 'City', 'Commission', 'Balance', 'Cash Collected', 'Status', 'Available'];
        const csvContent = [
            headers.join(','),
            ...filteredDeliveryBoys.map(deliveryBoy => [
                deliveryBoy.id,
                `"${deliveryBoy.name}"`,
                deliveryBoy.mobile,
                `"${deliveryBoy.address}"`,
                `"${deliveryBoy.city}"`,
                deliveryBoy.commissionType === 'Percentage' 
                    ? `"Commission ${deliveryBoy.commission}%"` 
                    : 'Fixed',
                deliveryBoy.balance,
                deliveryBoy.cashCollected,
                deliveryBoy.status,
                deliveryBoy.available
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `delivery_boys_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (id: number) => {
        console.log('Edit delivery boy:', id);
        // Navigate to edit page or open edit modal
        alert(`Edit delivery boy ${id}`);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this delivery boy?')) {
            console.log('Delete delivery boy:', id);
            alert(`Delete delivery boy ${id}`);
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
                        <h2 className="text-lg font-semibold">View Delivery Boy List</h2>
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
                                        onClick={() => handleSort('mobile')}
                                    >
                                        <div className="flex items-center">
                                            Mobile <SortIcon column="mobile" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Address
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('city')}
                                    >
                                        <div className="flex items-center">
                                            City <SortIcon column="city" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Commission
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
                                        onClick={() => handleSort('cashCollected')}
                                    >
                                        <div className="flex items-center">
                                            Cash Collected <SortIcon column="cashCollected" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status <SortIcon column="status" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('available')}
                                    >
                                        <div className="flex items-center">
                                            Available <SortIcon column="available" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedDeliveryBoys.map((deliveryBoy) => (
                                    <tr key={deliveryBoy.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200">
                                        <td className="p-4 align-middle">{deliveryBoy.id}</td>
                                        <td className="p-4 align-middle">{deliveryBoy.name}</td>
                                        <td className="p-4 align-middle">{deliveryBoy.mobile}</td>
                                        <td className="p-4 align-middle">{deliveryBoy.address}</td>
                                        <td className="p-4 align-middle">{deliveryBoy.city}</td>
                                        <td className="p-4 align-middle">
                                            {deliveryBoy.commissionType === 'Percentage' ? (
                                                <div className="text-xs">
                                                    <div className="font-medium">Commission {deliveryBoy.commission}%</div>
                                                    <div className="text-neutral-500 mt-1">
                                                        Min Amt: {deliveryBoy.minAmount}
                                                    </div>
                                                    <div className="text-neutral-500">
                                                        Max Amt: {deliveryBoy.maxAmount}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs">Fixed</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">{deliveryBoy.balance.toFixed(2)}</td>
                                        <td className="p-4 align-middle">{deliveryBoy.cashCollected.toFixed(2)}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                deliveryBoy.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {deliveryBoy.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                deliveryBoy.available === 'Available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {deliveryBoy.available}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(deliveryBoy.id)}
                                                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deliveryBoy.id)}
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
                                {displayedDeliveryBoys.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-neutral-400">
                                            No delivery boys found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-neutral-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredDeliveryBoys.length)} of {filteredDeliveryBoys.length} entries
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
                            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1.5 border border-teal-600 rounded font-medium text-sm ${
                                            currentPage === pageNum
                                                ? 'bg-teal-600 text-white'
                                                : 'text-teal-600 hover:bg-teal-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 4 && (
                                <span className="px-2 text-neutral-400">...</span>
                            )}
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


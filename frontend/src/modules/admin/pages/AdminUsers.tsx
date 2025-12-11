import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    registrationDate: string;
    status: 'Active' | 'Inactive';
    refCode: string;
    walletAmount: number;
}

// Mock data matching the image
const USERS: User[] = [
    {
        id: 1,
        name: 'Pratik',
        email: 'pratik@gmail.com',
        phone: '8966846429',
        registrationDate: '06:26 PM, 21st Mar 2025',
        status: 'Active',
        refCode: 'PRATEF2C',
        walletAmount: 10.00,
    },
    {
        id: 2,
        name: 'fyz.srd@gmail.com',
        email: 'fyz.srd@gmail.com',
        phone: '9123452139',
        registrationDate: '11:50 AM, 24th Mar 2025',
        status: 'Active',
        refCode: 'FYZ.A25D',
        walletAmount: 200.00,
    },
    {
        id: 3,
        name: 'Faycal Dous',
        email: 'drous@gmail.com',
        phone: '9876543210',
        registrationDate: '05:15 PM, 08th Apr 2025',
        status: 'Active',
        refCode: 'FAYCB513',
        walletAmount: 500.00,
    },
    {
        id: 4,
        name: 'Filmy Tube',
        email: 'filmy@gmail.com',
        phone: '9876543211',
        registrationDate: '05:59 PM, 08th Apr 2025',
        status: 'Inactive',
        refCode: 'FILM63F3',
        walletAmount: 0,
    },
    {
        id: 5,
        name: 'Sameer',
        email: 'sameer@gmail.com',
        phone: '9876542338',
        registrationDate: '11:30 PM, 08th Apr 2025',
        status: 'Inactive',
        refCode: 'SAME07DD',
        walletAmount: 0,
    },
    {
        id: 6,
        name: 'Sameer',
        email: 'sameer@protonmail.com',
        phone: '9876542338',
        registrationDate: '11:30 PM, 08th Apr 2025',
        status: 'Inactive',
        refCode: 'SAME5040',
        walletAmount: 0,
    },
    {
        id: 7,
        name: 'Yest',
        email: 'test@gmail.com',
        phone: '3212342536',
        registrationDate: '11:40 PM, 08th Apr 2025',
        status: 'Inactive',
        refCode: 'YEST77CE',
        walletAmount: 0,
    },
];

// Function to mask email
const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
        return `${localPart[0]}******@${domain}`;
    }
    const visible = localPart.substring(0, 2);
    return `${visible}********@${domain}`;
};

// Function to mask phone
const maskPhone = (phone: string): string => {
    if (phone.length < 4) return phone;
    const visible = phone.substring(0, 2);
    const lastTwo = phone.substring(phone.length - 4);
    return `${visible}****${lastTwo}`;
};

export default function AdminUsers() {
    const [searchTerm] = useState('');
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

    // Filter users
    let filteredUsers = USERS.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.refCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
    if (sortColumn) {
        filteredUsers = [...filteredUsers].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'registrationDate':
                    aValue = a.registrationDate;
                    bValue = b.registrationDate;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'refCode':
                    aValue = a.refCode.toLowerCase();
                    bValue = b.refCode.toLowerCase();
                    break;
                case 'walletAmount':
                    aValue = a.walletAmount;
                    bValue = b.walletAmount;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedUsers = filteredUsers.slice(startIndex, endIndex);

    const handleEdit = (id: number) => {
        console.log('Edit user:', id);
        alert(`Edit user ${id}`);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            console.log('Delete user:', id);
            alert(`Delete user ${id}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Header */}
            <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-teal-800">User List</h1>
                    <div className="text-sm text-blue-500">
                        <span className="text-blue-500 hover:underline cursor-pointer">Home</span>{' '}
                        <span className="text-neutral-400">/</span> User List
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 px-6 pb-6">
                {/* Main Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                    {/* Header */}
                    <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                        <h2 className="text-lg font-semibold">View Users</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Show</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-white text-teal-600 border border-teal-300 rounded py-1 px-2 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm">entries</span>
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
                                            Sr No <SortIcon column="id" />
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
                                    <th className="p-4">
                                        Contact
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('registrationDate')}
                                    >
                                        <div className="flex items-center">
                                            registration Date <SortIcon column="registrationDate" />
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
                                        onClick={() => handleSort('refCode')}
                                    >
                                        <div className="flex items-center">
                                            Ref Code <SortIcon column="refCode" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('walletAmount')}
                                    >
                                        <div className="flex items-center">
                                            Wallet Amt <SortIcon column="walletAmount" />
                                        </div>
                                    </th>
                                    <th className="p-4">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200">
                                        <td className="p-4 align-middle">{startIndex + index + 1}</td>
                                        <td className="p-4 align-middle">{user.name}</td>
                                        <td className="p-4 align-middle">
                                            <div className="text-xs">
                                                <div>{maskEmail(user.email)}</div>
                                                {user.phone && (
                                                    <div className="text-neutral-500">{maskPhone(user.phone)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{user.registrationDate}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">{user.refCode}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <span>₹ {user.walletAmount.toFixed(2)}</span>
                                                <input
                                                    type="text"
                                                    className="w-8 h-6 border border-neutral-300 rounded text-xs text-center"
                                                    defaultValue=""
                                                    placeholder=""
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user.id)}
                                                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {displayedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-neutral-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <div className="text-xs sm:text-sm text-neutral-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 border border-teal-600 rounded ${currentPage === 1
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
                                        className={`px-3 py-1.5 border border-teal-600 rounded font-medium text-sm ${currentPage === pageNum
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
                                className={`p-2 border border-teal-600 rounded ${currentPage === totalPages
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
                <a href="#" className="text-blue-600 hover:underline">SpeeUp - 10 Minute App</a>
            </footer>
        </div>
    );
}


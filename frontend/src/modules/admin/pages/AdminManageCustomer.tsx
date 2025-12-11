import { useState, useMemo } from 'react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
  refCode: string;
  walletAmount: number;
  totalOrders: number;
  totalSpent: number;
}

type SortField = 'id' | 'name' | 'email' | 'phone' | 'registrationDate' | 'status' | 'walletAmount' | 'totalOrders' | 'totalSpent';
type SortDirection = 'asc' | 'desc';

export default function AdminManageCustomer() {
  const [dateRange, setDateRange] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Mock data
  const customers: Customer[] = [
    {
      id: 1,
      name: 'Pratik',
      email: 'pratik@gmail.com',
      phone: '8966846429',
      registrationDate: '06:26 PM, 21st Mar 2025',
      status: 'Active',
      refCode: 'PRATEF2C',
      walletAmount: 10.00,
      totalOrders: 15,
      totalSpent: 2500.00,
    },
    {
      id: 2,
      name: 'Faycal Dous',
      email: 'fyz.srd@gmail.com',
      phone: '9123452139',
      registrationDate: '11:50 AM, 24th Mar 2025',
      status: 'Active',
      refCode: 'FYZ.A25D',
      walletAmount: 200.00,
      totalOrders: 8,
      totalSpent: 1800.00,
    },
    {
      id: 3,
      name: 'Sameer',
      email: 'sameer@gmail.com',
      phone: '9876543210',
      registrationDate: '05:15 PM, 08th Apr 2025',
      status: 'Inactive',
      refCode: 'SAME07DD',
      walletAmount: 0,
      totalOrders: 3,
      totalSpent: 450.00,
    },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.refCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [customers, searchQuery, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / Number(entriesPerPage));
  const startIndex = (currentPage - 1) * Number(entriesPerPage);
  const endIndex = startIndex + Number(entriesPerPage);
  const displayedCustomers = filteredAndSortedCustomers.slice(startIndex, endIndex);

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Registration Date', 'Status', 'Ref Code', 'Wallet Amount', 'Total Orders', 'Total Spent'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedCustomers.map(customer => 
        [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.registrationDate,
          customer.status,
          customer.refCode,
          customer.walletAmount,
          customer.totalOrders,
          customer.totalSpent
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="text-neutral-300 text-[10px]">
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Manage Customer</h1>
          </div>
          <div className="text-sm text-neutral-600">
            <span className="text-blue-600">Home</span> / <span className="text-neutral-900">Manage Customer</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Date Range</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="MM/DD/YYYY - MM/DD/YYYY"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Show</label>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Export
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 sm:p-6 border-b border-neutral-200">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-14 pr-3 py-2 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500"
                placeholder="Search by name, email, phone, or ref code..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center justify-between">
                      ID <SortIcon field="id" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center justify-between">
                      Name <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center justify-between">
                      Email <SortIcon field="email" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center justify-between">
                      Phone <SortIcon field="phone" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('registrationDate')}
                  >
                    <div className="flex items-center justify-between">
                      Registration Date <SortIcon field="registrationDate" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-between">
                      Status <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="p-4 border border-neutral-200">Ref Code</th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('walletAmount')}
                  >
                    <div className="flex items-center justify-between">
                      Wallet Amount <SortIcon field="walletAmount" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('totalOrders')}
                  >
                    <div className="flex items-center justify-between">
                      Total Orders <SortIcon field="totalOrders" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center justify-between">
                      Total Spent <SortIcon field="totalSpent" />
                    </div>
                  </th>
                  <th className="p-4 border border-neutral-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
                    <td className="p-4 border border-neutral-200">{customer.id}</td>
                    <td className="p-4 border border-neutral-200">{customer.name}</td>
                    <td className="p-4 border border-neutral-200">{customer.email}</td>
                    <td className="p-4 border border-neutral-200">{customer.phone}</td>
                    <td className="p-4 border border-neutral-200">{customer.registrationDate}</td>
                    <td className="p-4 border border-neutral-200">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 border border-neutral-200">{customer.refCode}</td>
                    <td className="p-4 border border-neutral-200">₹{customer.walletAmount.toFixed(2)}</td>
                    <td className="p-4 border border-neutral-200">{customer.totalOrders}</td>
                    <td className="p-4 border border-neutral-200">₹{customer.totalSpent.toFixed(2)}</td>
                    <td className="p-4 border border-neutral-200">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="View Details"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-neutral-400 border border-neutral-200">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} entries
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
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18L9 12L15 6"></path>
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
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18L15 12L9 6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


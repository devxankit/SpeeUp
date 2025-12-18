import { useState } from 'react';

type TabType = 'transaction' | 'withdraw' | 'balance' | 'earning';

interface Transaction {
  id: number;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
}

interface WithdrawRequest {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  paymentMethod: string;
  accountDetails: string;
  remark?: string;
}

interface Balance {
  userId: string;
  userName: string;
  currentBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
}

interface Earning {
  id: number;
  userId: string;
  userName: string;
  source: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

interface AdminEarning {
  id: number;
  source: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  description: string;
}

export default function AdminWallet() {
  const [activeTab, setActiveTab] = useState<TabType>('transaction');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Admin Earnings Data
  const adminEarnings: AdminEarning[] = [
    {
      id: 1,
      source: 'Platform Commission',
      amount: 15000.00,
      date: '12/09/2025',
      status: 'Paid',
      description: 'Commission from all orders',
    },
    {
      id: 2,
      source: 'Service Fee',
      amount: 8500.00,
      date: '11/09/2025',
      status: 'Paid',
      description: 'Service fees collected',
    },
    {
      id: 3,
      source: 'Subscription Revenue',
      amount: 25000.00,
      date: '10/09/2025',
      status: 'Paid',
      description: 'Seller subscription fees',
    },
    {
      id: 4,
      source: 'Advertisement Revenue',
      amount: 12000.00,
      date: '09/09/2025',
      status: 'Paid',
      description: 'Banner and promotion ads',
    },
    {
      id: 5,
      source: 'Platform Commission',
      amount: 18000.00,
      date: '08/09/2025',
      status: 'Pending',
      description: 'Commission from orders (pending settlement)',
    },
  ];

  // Calculate admin earnings summary
  const adminEarningsSummary = {
    totalEarnings: adminEarnings.reduce((sum, earning) => sum + earning.amount, 0),
    paidEarnings: adminEarnings.filter(e => e.status === 'Paid').reduce((sum, earning) => sum + earning.amount, 0),
    pendingEarnings: adminEarnings.filter(e => e.status === 'Pending').reduce((sum, earning) => sum + earning.amount, 0),
    thisMonthEarnings: adminEarnings.filter(e => {
      const earningDate = new Date(e.date.split('/').reverse().join('-'));
      const now = new Date();
      return earningDate.getMonth() === now.getMonth() && earningDate.getFullYear() === now.getFullYear();
    }).reduce((sum, earning) => sum + earning.amount, 0),
  };

  // Mock data
  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'Credit',
      amount: 5000.00,
      description: 'Order Payment - Order #12345',
      date: '12/09/2025 10:30 AM',
      status: 'Completed',
      reference: 'TXN-20250912-001',
    },
    {
      id: 2,
      type: 'Debit',
      amount: 1500.00,
      description: 'Withdrawal - Bank Transfer',
      date: '12/09/2025 09:15 AM',
      status: 'Completed',
      reference: 'TXN-20250912-002',
    },
    {
      id: 3,
      type: 'Credit',
      amount: 3200.00,
      description: 'Commission Earned',
      date: '11/09/2025 03:45 PM',
      status: 'Completed',
      reference: 'TXN-20250911-001',
    },
    {
      id: 4,
      type: 'Debit',
      amount: 800.00,
      description: 'Service Fee',
      date: '11/09/2025 02:20 PM',
      status: 'Completed',
      reference: 'TXN-20250911-002',
    },
    {
      id: 5,
      type: 'Credit',
      amount: 2500.00,
      description: 'Order Payment - Order #12340',
      date: '10/09/2025 11:00 AM',
      status: 'Pending',
      reference: 'TXN-20250910-001',
    },
  ];

  const withdrawRequests: WithdrawRequest[] = [
    {
      id: 1,
      userId: 'USR001',
      userName: 'John Doe',
      amount: 5000.00,
      requestDate: '12/09/2025 10:00 AM',
      status: 'Pending',
      paymentMethod: 'Bank Transfer',
      accountDetails: 'XXXX1234 - HDFC Bank',
    },
    {
      id: 2,
      userId: 'USR002',
      userName: 'Jane Smith',
      amount: 3000.00,
      requestDate: '11/09/2025 02:30 PM',
      status: 'Approved',
      paymentMethod: 'UPI',
      accountDetails: 'jane@upi',
      remark: 'Payment processed',
    },
    {
      id: 3,
      userId: 'USR003',
      userName: 'Mike Johnson',
      amount: 7500.00,
      requestDate: '10/09/2025 09:15 AM',
      status: 'Rejected',
      paymentMethod: 'Bank Transfer',
      accountDetails: 'XXXX5678 - ICICI Bank',
      remark: 'Insufficient balance',
    },
    {
      id: 4,
      userId: 'USR004',
      userName: 'Sarah Williams',
      amount: 2000.00,
      requestDate: '09/09/2025 04:45 PM',
      status: 'Pending',
      paymentMethod: 'UPI',
      accountDetails: 'sarah@upi',
    },
  ];

  const balances: Balance[] = [
    {
      userId: 'USR001',
      userName: 'John Doe',
      currentBalance: 12500.00,
      pendingBalance: 2500.00,
      totalEarnings: 50000.00,
      totalWithdrawn: 37500.00,
    },
    {
      userId: 'USR002',
      userName: 'Jane Smith',
      currentBalance: 8500.00,
      pendingBalance: 1500.00,
      totalEarnings: 35000.00,
      totalWithdrawn: 26500.00,
    },
    {
      userId: 'USR003',
      userName: 'Mike Johnson',
      currentBalance: 15200.00,
      pendingBalance: 3200.00,
      totalEarnings: 60000.00,
      totalWithdrawn: 44800.00,
    },
    {
      userId: 'USR004',
      userName: 'Sarah Williams',
      currentBalance: 6800.00,
      pendingBalance: 1200.00,
      totalEarnings: 28000.00,
      totalWithdrawn: 21200.00,
    },
  ];

  const earnings: Earning[] = [
    {
      id: 1,
      userId: 'USR001',
      userName: 'John Doe',
      source: 'Order Commission',
      amount: 500.00,
      date: '12/09/2025',
      status: 'Paid',
    },
    {
      id: 2,
      userId: 'USR002',
      userName: 'Jane Smith',
      source: 'Order Commission',
      amount: 300.00,
      date: '12/09/2025',
      status: 'Paid',
    },
    {
      id: 3,
      userId: 'USR003',
      userName: 'Mike Johnson',
      source: 'Referral Bonus',
      amount: 1000.00,
      date: '11/09/2025',
      status: 'Paid',
    },
    {
      id: 4,
      userId: 'USR001',
      userName: 'John Doe',
      source: 'Order Commission',
      amount: 250.00,
      date: '11/09/2025',
      status: 'Pending',
    },
    {
      id: 5,
      userId: 'USR004',
      userName: 'Sarah Williams',
      source: 'Order Commission',
      amount: 400.00,
      date: '10/09/2025',
      status: 'Paid',
    },
  ];

  // Filter data based on active tab
  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'transaction':
        data = transactions;
        break;
      case 'withdraw':
        data = withdrawRequests;
        break;
      case 'balance':
        data = balances;
        break;
      case 'earning':
        data = earnings;
        break;
    }

    // Apply filters
    let filtered = data.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      let matchesStatus = true;
      if (statusFilter !== 'All' && item.status) {
        matchesStatus = item.status === statusFilter;
      }
      
      return matchesSearch && matchesStatus;
    });

    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedData = filteredData.slice(startIndex, endIndex);

  const handleApproveWithdraw = (id: number) => {
    if (window.confirm('Are you sure you want to approve this withdrawal request?')) {
      alert(`Withdrawal request #${id} approved successfully!`);
    }
  };

  const handleRejectWithdraw = (id: number) => {
    const remark = prompt('Enter rejection remark:');
    if (remark) {
      alert(`Withdrawal request #${id} rejected. Remark: ${remark}`);
    }
  };

  const tabs = [
    { id: 'transaction' as TabType, label: 'Transaction', icon: '💳' },
    { id: 'withdraw' as TabType, label: 'Withdraw Request', icon: '💰' },
    { id: 'balance' as TabType, label: 'Balance', icon: '💵' },
    { id: 'earning' as TabType, label: 'Earning', icon: '📈' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Wallet Management</h1>
        <div className="text-sm text-neutral-600">
          <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">Wallet</span>
        </div>
      </div>

      {/* Admin Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-teal-100">Total Earnings</h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <p className="text-3xl font-bold">₹{adminEarningsSummary.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-teal-100 mt-1">All time earnings</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Paid Earnings</h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p className="text-3xl font-bold">₹{adminEarningsSummary.paidEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-green-100 mt-1">Successfully received</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-100">Pending Earnings</h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p className="text-3xl font-bold">₹{adminEarningsSummary.pendingEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-yellow-100 mt-1">Awaiting settlement</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">This Month</h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <p className="text-3xl font-bold">₹{adminEarningsSummary.thisMonthEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-blue-100 mt-1">Current month earnings</p>
        </div>
      </div>

      {/* Admin Earnings Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-teal-600 px-4 sm:px-6 py-3">
          <h2 className="text-white text-lg font-semibold">Admin Earnings Details</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {adminEarnings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No earnings found
                    </td>
                  </tr>
                ) : (
                  adminEarnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{earning.id}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-neutral-900">{earning.source}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{earning.description}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm font-medium text-green-700">
                        ₹{earning.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{earning.date}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            earning.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {earning.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            {(activeTab === 'transaction' || activeTab === 'withdraw' || activeTab === 'earning') && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="All">All Status</option>
                  {activeTab === 'transaction' && (
                    <>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </>
                  )}
                  {activeTab === 'withdraw' && (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                  {activeTab === 'earning' && (
                    <>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Transaction Tab */}
          {activeTab === 'transaction' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {displayedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    displayedData.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="hover:bg-neutral-50">
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{transaction.id}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'Credit'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-neutral-900">
                          ₹{transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{transaction.description}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{transaction.date}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600 font-mono text-xs">
                          {transaction.reference}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Withdraw Request Tab */}
          {activeTab === 'withdraw' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Account Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {displayedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                        No withdrawal requests found
                      </td>
                    </tr>
                  ) : (
                    displayedData.map((request: WithdrawRequest) => (
                      <tr key={request.id} className="hover:bg-neutral-50">
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{request.id}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{request.userName}</div>
                            <div className="text-xs text-neutral-500">{request.userId}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-neutral-900">
                          ₹{request.amount.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{request.paymentMethod}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{request.accountDetails}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{request.requestDate}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          {request.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveWithdraw(request.id)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdraw(request.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {request.remark && (
                            <span className="text-xs text-neutral-500">{request.remark}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Balance Tab */}
          {activeTab === 'balance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedData.length === 0 ? (
                <div className="col-span-full text-center py-8 text-sm text-neutral-500">
                  No balance records found
                </div>
              ) : (
                displayedData.map((balance: Balance) => (
                  <div key={balance.userId} className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 border border-teal-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{balance.userName}</h3>
                        <p className="text-xs text-neutral-500">{balance.userId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">Current Balance</p>
                        <p className="text-2xl font-bold text-teal-700">₹{balance.currentBalance.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-teal-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Pending Balance:</span>
                        <span className="font-medium text-neutral-900">₹{balance.pendingBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Total Earnings:</span>
                        <span className="font-medium text-green-700">₹{balance.totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Total Withdrawn:</span>
                        <span className="font-medium text-neutral-900">₹{balance.totalWithdrawn.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Earning Tab */}
          {activeTab === 'earning' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {displayedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                        No earnings found
                      </td>
                    </tr>
                  ) : (
                    displayedData.map((earning: Earning) => (
                      <tr key={earning.id} className="hover:bg-neutral-50">
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{earning.id}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{earning.userName}</div>
                            <div className="text-xs text-neutral-500">{earning.userId}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{earning.source}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-green-700">
                          ₹{earning.amount.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{earning.date}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              earning.status === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {earning.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 border-t border-neutral-200 pt-4">
              <div className="text-sm text-neutral-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
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


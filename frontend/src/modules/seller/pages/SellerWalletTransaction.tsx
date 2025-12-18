import { useState, useMemo } from "react";

// Mock Data
interface Transaction {
  id: number;
  sellerName: string;
  orderId: number;
  orderItemId: number;
  productName: string;
  variation: string;
  flag: string;
  amount: number;
  remark: string;
  date: string;
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  message: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  remark: string;
  reqDate: string;
  paymentDate: string;
}

// Mock transaction data
const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    sellerName: "SpeeUp Store",
    orderId: 1001,
    orderItemId: 5001,
    productName: "Fresh Tomatoes",
    variation: "1 kg",
    flag: "Credit",
    amount: 850.0,
    remark: "Order payment received",
    date: "12/01/2025",
  },
  {
    id: 2,
    sellerName: "SpeeUp Store",
    orderId: 1002,
    orderItemId: 5002,
    productName: "Organic Onions",
    variation: "1 kg",
    flag: "Credit",
    amount: 650.0,
    remark: "Order payment received",
    date: "12/02/2025",
  },
  {
    id: 3,
    sellerName: "SpeeUp Store",
    orderId: 1003,
    orderItemId: 5003,
    productName: "Premium Basmati Rice",
    variation: "1 kg",
    flag: "Credit",
    amount: 1200.0,
    remark: "Order payment received",
    date: "12/03/2025",
  },
  {
    id: 4,
    sellerName: "SpeeUp Store",
    orderId: 1004,
    orderItemId: 5004,
    productName: "Fresh Milk",
    variation: "1 L",
    flag: "Debit",
    amount: 500.0,
    remark: "Withdrawal processed",
    date: "12/04/2025",
  },
  {
    id: 5,
    sellerName: "SpeeUp Store",
    orderId: 1005,
    orderItemId: 5005,
    productName: "Organic Potatoes",
    variation: "1 kg",
    flag: "Credit",
    amount: 450.0,
    remark: "Order payment received",
    date: "12/05/2025",
  },
  {
    id: 6,
    sellerName: "SpeeUp Store",
    orderId: 1006,
    orderItemId: 5006,
    productName: "Carrots",
    variation: "500 g",
    flag: "Credit",
    amount: 380.0,
    remark: "Order payment received",
    date: "12/06/2025",
  },
];

// Mock withdrawal requests data
const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 1,
    amount: 500.0,
    message: "Request for withdrawal",
    status: "Pending",
    remark: "Awaiting approval",
    reqDate: "12/04/2025",
    paymentDate: "-",
  },
  {
    id: 2,
    amount: 1000.0,
    message: "Request for withdrawal",
    status: "Approved",
    remark: "Payment processed",
    reqDate: "11/28/2025",
    paymentDate: "11/30/2025",
  },
  {
    id: 3,
    amount: 750.0,
    message: "Request for withdrawal",
    status: "Completed",
    remark: "Payment completed",
    reqDate: "11/20/2025",
    paymentDate: "11/22/2025",
  },
];

export default function SellerWalletTransaction() {
  const [fromDate, setFromDate] = useState("12/06/2025");
  const [toDate, setToDate] = useState("12/06/2025");
  const [methodFilter, setMethodFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    const totalEarnings = TRANSACTIONS.filter(
      (t) => t.flag === "Credit"
    ).reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = TRANSACTIONS.filter(
      (t) => t.flag === "Debit"
    ).reduce((sum, t) => sum + t.amount, 0);

    const pendingWithdrawals = WITHDRAWAL_REQUESTS.filter(
      (w) => w.status === "Pending"
    ).reduce((sum, w) => sum + w.amount, 0);

    const approvedWithdrawals = WITHDRAWAL_REQUESTS.filter(
      (w) => w.status === "Approved"
    ).reduce((sum, w) => sum + w.amount, 0);

    const availableBalance =
      totalEarnings - totalWithdrawals - approvedWithdrawals;
    const pendingAmount = pendingWithdrawals + approvedWithdrawals;

    return {
      totalEarnings,
      availableBalance,
      pendingAmount,
      totalWithdrawals:
        totalWithdrawals +
        WITHDRAWAL_REQUESTS.filter(
          (w) => w.status === "Completed" || w.status === "Approved"
        ).reduce((sum, w) => sum + w.amount, 0),
      pendingWithdrawalRequests: WITHDRAWAL_REQUESTS.filter(
        (w) => w.status === "Pending"
      ).length,
      totalTransactions: TRANSACTIONS.length,
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = TRANSACTIONS.filter((transaction) => {
      const matchesSearch = Object.values(transaction).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesMethod =
        methodFilter === "All" || transaction.flag === methodFilter;
      return matchesSearch && matchesMethod;
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];

        if (typeof aValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (sortDirection === "asc") {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return filtered;
  }, [searchTerm, methodFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => (
    <span className="text-neutral-300 text-[10px]">
      {sortColumn === column ? (sortDirection === "asc" ? "↑" : "↓") : "⇅"}
    </span>
  );

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
        <h1 className="text-lg sm:text-xl font-semibold">
          Wallet Transactions & Payment Overview
        </h1>
      </div>

      {/* Payment Summary Cards */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {/* Total Earnings Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">Total Earnings</div>
            <div className="text-xl font-bold text-neutral-900">
              ₹{paymentStats.totalEarnings.toFixed(2)}
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">
              Available Balance
            </div>
            <div className="text-xl font-bold text-blue-600">
              ₹{paymentStats.availableBalance.toFixed(2)}
            </div>
          </div>

          {/* Pending Amount Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">Pending Amount</div>
            <div className="text-xl font-bold text-orange-600">
              ₹{paymentStats.pendingAmount.toFixed(2)}
            </div>
          </div>

          {/* Total Withdrawals Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">
              Total Withdrawals
            </div>
            <div className="text-xl font-bold text-purple-600">
              ₹{paymentStats.totalWithdrawals.toFixed(2)}
            </div>
          </div>

          {/* Pending Withdrawal Requests Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-600">
                  <path d="M18 20V10"></path>
                  <path d="M12 20V4"></path>
                  <path d="M6 20v-6"></path>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">
              Pending Requests
            </div>
            <div className="text-xl font-bold text-yellow-600">
              {paymentStats.pendingWithdrawalRequests}
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="text-sm text-neutral-600 mb-1">
              Total Transactions
            </div>
            <div className="text-xl font-bold text-teal-600">
              {paymentStats.totalTransactions}
            </div>
          </div>
        </div>

        {/* Withdrawal Requests Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Withdrawal Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-neutral-200">
              <thead>
                <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                  <th className="p-3 border border-neutral-200">ID</th>
                  <th className="p-3 border border-neutral-200">Amount</th>
                  <th className="p-3 border border-neutral-200">Status</th>
                  <th className="p-3 border border-neutral-200">
                    Request Date
                  </th>
                  <th className="p-3 border border-neutral-200">
                    Payment Date
                  </th>
                  <th className="p-3 border border-neutral-200">Remark</th>
                </tr>
              </thead>
              <tbody>
                {WITHDRAWAL_REQUESTS.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-neutral-500">
                      No withdrawal requests
                    </td>
                  </tr>
                ) : (
                  WITHDRAWAL_REQUESTS.slice(0, 5).map((request) => (
                    <tr key={request.id} className="hover:bg-neutral-50">
                      <td className="p-3 border border-neutral-200 text-sm text-neutral-900">
                        {request.id}
                      </td>
                      <td className="p-3 border border-neutral-200 text-sm text-neutral-900 font-medium">
                        ₹{request.amount.toFixed(2)}
                      </td>
                      <td className="p-3 border border-neutral-200 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "Approved"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-3 border border-neutral-200 text-sm text-neutral-900">
                        {request.reqDate}
                      </td>
                      <td className="p-3 border border-neutral-200 text-sm text-neutral-900">
                        {request.paymentDate}
                      </td>
                      <td className="p-3 border border-neutral-200 text-sm text-neutral-900">
                        {request.remark}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
          {/* Section Header */}
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">
              Transaction History
            </h2>
          </div>

          {/* Controls Panel */}
          <div className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-neutral-100">
            {/* Left Side: Date Range and Method Filter */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-600 whitespace-nowrap">
                  From - To Date:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromDate && toDate ? `${fromDate} - ${toDate}` : ""}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <button
                  onClick={handleClearDates}
                  className="px-3 py-2 bg-neutral-700 hover:bg-neutral-800 text-white text-sm rounded transition-colors">
                  Clear
                </button>
              </div>

              {/* Method Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-600 whitespace-nowrap">
                  Filter by Method:
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer">
                  <option value="All">All</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
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
                  className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={() => {
                  const headers = [
                    "ID",
                    "Seller Name",
                    "Order Id",
                    "Order Item Id",
                    "Product Name",
                    "Variation",
                    "Flag",
                    "Amount",
                    "Remark",
                    "Date",
                  ];
                  const csvContent = [
                    headers.join(","),
                    ...filteredTransactions.map((transaction) =>
                      [
                        transaction.id,
                        `"${transaction.sellerName}"`,
                        transaction.orderId,
                        transaction.orderItemId,
                        `"${transaction.productName}"`,
                        `"${transaction.variation}"`,
                        `"${transaction.flag}"`,
                        transaction.amount,
                        `"${transaction.remark}"`,
                        transaction.date,
                      ].join(",")
                    ),
                  ].join("\n");
                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute(
                    "download",
                    `wallet_transactions_${
                      new Date().toISOString().split("T")[0]
                    }.csv`
                  );
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                  Search:
                </span>
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
                    onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-1">
                      Id
                      <SortIcon column="id" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("sellerName")}>
                    <div className="flex items-center gap-1">
                      Seller Name
                      <SortIcon column="sellerName" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("orderId")}>
                    <div className="flex items-center gap-1">
                      Order Id
                      <SortIcon column="orderId" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("orderItemId")}>
                    <div className="flex items-center gap-1">
                      Order Item Id
                      <SortIcon column="orderItemId" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("productName")}>
                    <div className="flex items-center gap-1">
                      Product Name
                      <SortIcon column="productName" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("variation")}>
                    <div className="flex items-center gap-1">
                      Variation
                      <SortIcon column="variation" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("flag")}>
                    <div className="flex items-center gap-1">
                      Flag
                      <SortIcon column="flag" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("amount")}>
                    <div className="flex items-center gap-1">
                      Amount
                      <SortIcon column="amount" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("remark")}>
                    <div className="flex items-center gap-1">
                      Remark
                      <SortIcon column="remark" />
                    </div>
                  </th>
                  <th
                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort("date")}>
                    <div className="flex items-center gap-1">
                      Date
                      <SortIcon column="date" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-8 text-center text-neutral-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-neutral-50">
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.id}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.sellerName}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.orderId}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.orderItemId}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.productName}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.variation}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.flag === "Credit"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {transaction.flag}
                        </span>
                      </td>
                      <td
                        className={`p-4 border border-neutral-200 text-sm font-medium ${
                          transaction.flag === "Credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {transaction.flag === "Credit" ? "+" : "-"}₹
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.remark}
                      </td>
                      <td className="p-4 border border-neutral-200 text-sm text-neutral-900">
                        {transaction.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-neutral-600">
              Showing {filteredTransactions.length === 0 ? 0 : startIndex + 1}{" "}
              to {Math.min(endIndex, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
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
          Copyright © 2025. Developed By{" "}
          <span className="font-semibold text-teal-600">
            SpeeUp - 10 Minute App
          </span>
        </p>
      </footer>
    </div>
  );
}

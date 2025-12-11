import { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import OrderChart from '../components/OrderChart';
import SalesLineChart from '../components/SalesLineChart';
import GaugeChart from '../components/GaugeChart';
import { getAdminDashboardStats, getNewOrders, getTopSellers } from '../data/mockData';

export default function AdminDashboard() {
  const stats = getAdminDashboardStats();
  const newOrders = getNewOrders();
  const topSellers = getTopSellers();
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Icons for KPI cards
  const userIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );

  const categoryIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const subcategoryIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const productIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const ordersIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const completedOrdersIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const pendingOrdersIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const cancelledOrdersIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 7L8 15M8 7L16 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const soldOutIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const lowStockIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const totalPagesNewOrders = Math.ceil(newOrders.length / entriesPerPage);
  const startIndexNewOrders = (currentPage - 1) * entriesPerPage;
  const endIndexNewOrders = startIndexNewOrders + entriesPerPage;
  const displayedNewOrders = newOrders.slice(startIndexNewOrders, endIndexNewOrders);

  const totalPagesTopSellers = Math.ceil(topSellers.length / entriesPerPage);
  const startIndexTopSellers = (currentPage - 1) * entriesPerPage;
  const endIndexTopSellers = startIndexTopSellers + entriesPerPage;
  const displayedTopSellers = topSellers.slice(startIndexTopSellers, endIndexTopSellers);

  // Calculate sales today and comparison
  const salesToday = 0;
  const salesLastWeekSameDay = 1158;
  const salesDifference = salesToday - salesLastWeekSameDay;
  const salesPercentChange = salesLastWeekSameDay > 0 ? ((salesDifference / salesLastWeekSameDay) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <DashboardCard icon={userIcon} title="Total User" value={stats.totalUser} accentColor="#3b82f6" />
        <DashboardCard icon={categoryIcon} title="Total Category" value={stats.totalCategory} accentColor="#eab308" />
        <DashboardCard icon={subcategoryIcon} title="Total Subcategory" value={stats.totalSubcategory} accentColor="#ec4899" />
        <DashboardCard icon={productIcon} title="Total Product" value={stats.totalProduct} accentColor="#ef4444" />
        <DashboardCard icon={ordersIcon} title="Total Orders" value={stats.totalOrders} accentColor="#3b82f6" />
        <DashboardCard icon={completedOrdersIcon} title="Completed Orders" value={stats.completedOrders} accentColor="#16a34a" />
        <DashboardCard icon={pendingOrdersIcon} title="Pending Orders" value={stats.pendingOrders} accentColor="#a855f7" />
        <DashboardCard icon={cancelledOrdersIcon} title="Cancelled Orders" value={stats.cancelledOrders} accentColor="#ef4444" />
        <DashboardCard icon={soldOutIcon} title="Product Sold Out" value={stats.soldOutProducts} accentColor="#ec4899" />
        <DashboardCard icon={lowStockIcon} title="Product low on Stock" value={stats.lowStockProducts} accentColor="#eab308" />
      </div>

      {/* Sales Section - Top Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Sales Today */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Total Sales Today</h3>
          <div className="mb-4">
            <p className="text-3xl font-bold text-neutral-900">₹{salesToday.toFixed(2)}</p>
            <p className="text-sm text-red-600 mt-1">
              ▼ ₹{Math.abs(salesDifference).toFixed(2)} ({salesPercentChange}%) vs same day last week
            </p>
          </div>
          <SalesLineChart thisMonthData={stats.salesThisMonth} lastMonthData={stats.salesLastMonth} height={200} />
        </div>

        {/* Sales by Location & Gauge */}
        <div className="space-y-4 sm:space-y-6">
          {/* Sales by Location */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sales by Location</h3>
            <div className="space-y-3">
              {stats.salesByLocation.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{location.location}</span>
                  <span className="text-sm font-semibold text-neutral-900">₹{(location.amount / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avg. Completed Order Value */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Avg. Completed Order Value</h3>
            <GaugeChart value={stats.avgCompletedOrderValue} maxValue={521} label="Average Order Value" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <OrderChart title="Order - Dec 2025" data={stats.orderDataDec2025} maxValue={3} height={400} />
        <OrderChart title="Order - 2025" data={stats.orderData2025} maxValue={80} height={400} />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* View New Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">View New Orders</h2>
          </div>

          <div className="px-4 sm:px-6 py-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700">Show</span>
              <input
                type="number"
                value={entriesPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 10;
                  setEntriesPerPage(Math.max(1, Math.min(100, value)));
                  setCurrentPage(1);
                }}
                className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm text-neutral-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                min="1"
                max="100"
              />
              <span className="text-sm text-neutral-700">entries</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      ID
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      O. Date
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Status
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Amount
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedNewOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  displayedNewOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{order.id}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{order.userDetails}</td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{order.orderDate}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-neutral-600 bg-neutral-50">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">₹ {order.amount}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <button className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded transition-colors" aria-label="View order">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndexNewOrders + 1} to {Math.min(endIndexNewOrders, newOrders.length)} of {newOrders.length} entries
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPagesNewOrders, prev + 1))}
                disabled={currentPage === totalPagesNewOrders}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === totalPagesNewOrders
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

        {/* View Top Seller Table */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
            <h2 className="text-base sm:text-lg font-semibold">View Top Seller</h2>
          </div>

          <div className="px-4 sm:px-6 py-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700">Show</span>
              <input
                type="number"
                value={entriesPerPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 10;
                  setEntriesPerPage(Math.max(1, Math.min(100, value)));
                  setCurrentPage(1);
                }}
                className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm text-neutral-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                min="1"
                max="100"
              />
              <span className="text-sm text-neutral-700">entries</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      ID
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Seller Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Store Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Total Revenue
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400 cursor-pointer">
                        <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayedTopSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-neutral-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{seller.id}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{seller.sellerName}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-600">{seller.storeName}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">₹ {seller.totalRevenue.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <button className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded transition-colors" aria-label="View seller">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndexTopSellers + 1} to {Math.min(endIndexTopSellers, topSellers.length)} of {topSellers.length} entries
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
              <span className="px-3 py-2 border border-neutral-300 rounded text-sm text-neutral-700 bg-white">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPagesTopSellers, prev + 1))}
                disabled={currentPage === totalPagesTopSellers}
                className={`p-2 border border-neutral-300 rounded ${
                  currentPage === totalPagesTopSellers
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


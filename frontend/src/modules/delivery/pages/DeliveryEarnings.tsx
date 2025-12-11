import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader';
import DeliveryBottomNav from '../components/DeliveryBottomNav';
import { getDashboardStats } from '../data/mockData';

export default function DeliveryEarnings() {
  const navigate = useNavigate();
  const stats = getDashboardStats();

  // Mock earnings data
  const earningsData = [
    { date: 'Today', amount: stats.todayEarning, deliveries: stats.pendingOrders + 2 },
    { date: 'Yesterday', amount: 250, deliveries: 10 },
    { date: '2 days ago', amount: 225, deliveries: 9 },
    { date: '3 days ago', amount: 275, deliveries: 11 },
    { date: '4 days ago', amount: 200, deliveries: 8 },
  ];

  const totalEarnings = earningsData.reduce((sum, day) => sum + day.amount, 0);
  const totalDeliveries = earningsData.reduce((sum, day) => sum + day.deliveries, 0);

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      <DeliveryHeader />
      <div className="px-4 py-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="text-neutral-900 text-xl font-semibold">Earnings</h2>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-white mb-4 shadow-sm">
          <p className="text-orange-100 text-sm mb-2">Total Earnings</p>
          <p className="text-3xl font-bold mb-1">₹ {stats.totalEarning.toFixed(2)}</p>
          <p className="text-orange-100 text-xs">From {totalDeliveries} deliveries</p>
        </div>

        {/* Today's Earnings */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs mb-1">Today's Earnings</p>
              <p className="text-neutral-900 text-2xl font-bold">₹ {stats.todayEarning}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500 text-xs mb-1">Deliveries</p>
              <p className="text-neutral-900 text-2xl font-bold">{stats.pendingOrders + 2}</p>
            </div>
          </div>
        </div>

        {/* Earnings History */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-neutral-900 font-semibold">Recent Earnings</h3>
          </div>
          <div className="divide-y divide-neutral-200">
            {earningsData.map((day, index) => (
              <div key={index} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-neutral-900 text-sm font-medium">{day.date}</p>
                  <p className="text-neutral-500 text-xs mt-1">{day.deliveries} deliveries</p>
                </div>
                <p className="text-neutral-900 text-lg font-bold">₹ {day.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mt-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-neutral-500 text-xs mb-1">This Week</p>
              <p className="text-neutral-900 text-xl font-bold">₹ {totalEarnings}</p>
            </div>
            <div className="text-center">
              <p className="text-neutral-500 text-xs mb-1">Avg per Delivery</p>
              <p className="text-neutral-900 text-xl font-bold">
                ₹ {totalDeliveries > 0 ? Math.round(totalEarnings / totalDeliveries) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <button className="w-full mt-4 bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors">
          Withdraw Earnings
        </button>
      </div>
      <DeliveryBottomNav />
    </div>
  );
}


import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700';
    case 'On the way':
      return 'bg-blue-100 text-blue-700';
    case 'Accepted':
      return 'bg-yellow-100 text-yellow-700';
    case 'Placed':
      return 'bg-neutral-100 text-neutral-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Orders() {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No orders yet</h2>
        <p className="text-neutral-600 mb-6">Start shopping to see your orders here!</p>
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 py-4 bg-white border-b border-neutral-200 mb-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-neutral-900">My Orders</h1>
      </div>

      <div className="px-4 space-y-4">
        {orders.map((order) => {
          const shortId = order.id.split('-').slice(-1)[0];
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 mb-1">
                    Order #{shortId}
                  </div>
                  <div className="text-xs text-neutral-500">{formatDate(order.createdAt)}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                </div>
                <div className="text-lg font-bold text-neutral-900">
                  ₹{order.totalAmount.toFixed(0)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

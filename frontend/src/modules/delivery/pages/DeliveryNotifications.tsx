import DeliveryHeader from '../components/DeliveryHeader';
import { mockNotifications } from '../data/mockData';

export default function DeliveryNotifications() {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 8V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6V8H21C21.5523 8 22 8.44772 22 9V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V9C2 8.44772 2.44772 8 3 8H5Z"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M7 8V6C7 5.44772 7.44772 5 8 5H16C16.5523 5 17 5.44772 17 6V8"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="9" cy="13" r="1" fill="#16a34a"/>
            <circle cx="15" cy="13" r="1" fill="#16a34a"/>
          </svg>
        );
      case 'payment':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="#FFC94A" strokeWidth="2" fill="none"/>
            <path d="M6 10H18M6 14H14" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="12" r="2" stroke="#FFC94A" strokeWidth="2" fill="none"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 8A6 6 0 0 0 6 8C6 11.3137 4 14 4 14H20C20 14 18 11.3137 18 8Z"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      <DeliveryHeader />
      <div className="px-4 py-4">
        <h2 className="text-neutral-900 text-xl font-semibold mb-4">Notifications</h2>
        {mockNotifications.length > 0 ? (
          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  notification.read
                    ? 'border-neutral-200'
                    : 'border-green-500 border-l-4'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p
                        className={`text-sm font-medium ${
                          notification.read ? 'text-neutral-600' : 'text-neutral-900'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-neutral-600 text-xs mb-2">{notification.message}</p>
                    <p className="text-neutral-400 text-xs">{formatTime(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 min-h-[400px] flex items-center justify-center shadow-sm border border-neutral-200">
            <p className="text-neutral-500 text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}





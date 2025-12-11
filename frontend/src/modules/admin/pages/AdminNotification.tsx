import { useState } from 'react';

interface Notification {
  id: number;
  users: string;
  title: string;
  description: string;
  date: string;
  isSystemGenerated: boolean;
}

// Mock data matching the image
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    users: 'All Users',
    title: 'Hi Groc',
    description: 'Testing',
    date: '02-May-2025 12:39:31',
    isSystemGenerated: false,
  },
  {
    id: 2,
    users: 'All Users',
    title: 'Hi Groc',
    description: 'Testing',
    date: '02-May-2025 12:39:04',
    isSystemGenerated: false,
  },
  {
    id: 3,
    users: 'All Users',
    title: 'Hi Groc',
    description: 'Testing',
    date: '02-May-2025 12:38:37',
    isSystemGenerated: false,
  },
  {
    id: 4,
    users: 'All Users',
    title: 'Hi Groc',
    description: 'Testing',
    date: '02-May-2025 12:38:09',
    isSystemGenerated: false,
  },
  {
    id: 5,
    users: 'Lorem Ipsum',
    title: 'Lorem Ipsum',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
    date: '13-Mar-2025 12:48:16',
    isSystemGenerated: false,
  },
];

export default function AdminNotification() {
  const [formData, setFormData] = useState({
    userType: 'For All User',
    title: '',
    description: '',
  });

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showSystemGenerated, setShowSystemGenerated] = useState('No');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const newNotification: Notification = {
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      users: formData.userType === 'For All User' ? 'All Users' : formData.userType,
      title: formData.title,
      description: formData.description,
      date: formatDate(new Date()),
      isSystemGenerated: false,
    };

    setNotifications([newNotification, ...notifications]);
    
    // Reset form
    setFormData({
      userType: 'For All User',
      title: '',
      description: '',
    });
    
    alert('Notification sent successfully!');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

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

  // Filter notifications
  let filteredNotifications = notifications.filter(notification => {
    // Filter by system generated
    if (showSystemGenerated === 'Yes' && !notification.isSystemGenerated) return false;
    if (showSystemGenerated === 'No' && notification.isSystemGenerated) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.description.toLowerCase().includes(searchLower) ||
        notification.users.toLowerCase().includes(searchLower) ||
        notification.date.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Sort notifications
  if (sortColumn) {
    filteredNotifications = [...filteredNotifications].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'users':
          aValue = a.users;
          bValue = b.users;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleExport = () => {
    const headers = ['Sr No', 'Users', 'Title', 'Description', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredNotifications.map((notification, index) => [
        index + 1,
        `"${notification.users}"`,
        `"${notification.title}"`,
        `"${notification.description}"`,
        notification.date
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 p-6">
        {/* Header with Title and Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Notification</h1>
          <div className="text-sm">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
            <span className="text-neutral-400 mx-1">/</span>
            <span className="text-neutral-600">Notification</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel: Send Notification */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Send Notification</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <form onSubmit={handleSendNotification} className="space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select User Type
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    <option value="For All User">For All User</option>
                    <option value="Specific User">Specific User</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Title"
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter Description"
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  />
                </div>
                
                <div className="mt-auto">
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: View Notification */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">View Notification</h2>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-neutral-600">Show System Generated</span>
                <select
                  value={showSystemGenerated}
                  onChange={(e) => {
                    setShowSystemGenerated(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none cursor-pointer"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none cursor-pointer"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Export
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                  <input
                    type="text"
                    className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-green-500 w-48"
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
            <div className="overflow-x-auto flex-1">
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
                      onClick={() => handleSort('users')}
                    >
                      <div className="flex items-center">
                        Users <SortIcon column="users" />
                      </div>
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Title <SortIcon column="title" />
                      </div>
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Description <SortIcon column="description" />
                      </div>
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date <SortIcon column="date" />
                      </div>
                    </th>
                    <th className="p-4">
                      <div className="flex items-center">
                        Action <SortIcon column="action" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedNotifications.map((notification, index) => (
                    <tr
                      key={notification.id}
                      className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200"
                    >
                      <td className="p-4 align-middle">{startIndex + index + 1}</td>
                      <td className="p-4 align-middle">{notification.users}</td>
                      <td className="p-4 align-middle">{notification.title}</td>
                      <td className="p-4 align-middle max-w-md">{notification.description}</td>
                      <td className="p-4 align-middle">{notification.date}</td>
                      <td className="p-4 align-middle">
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Delete"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedNotifications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400">
                        No notifications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-neutral-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredNotifications.length)} of {filteredNotifications.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 border border-green-600 rounded ${
                    currentPage === 1
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                      : 'text-green-600 hover:bg-green-50'
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
                <button className="px-3 py-1.5 border border-green-600 bg-green-600 text-white rounded font-medium text-sm">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 border border-green-600 rounded ${
                    currentPage === totalPages
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                      : 'text-green-600 hover:bg-green-50'
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
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Appzeto - 10 Minute App
        </a>
      </footer>
    </div>
  );
}


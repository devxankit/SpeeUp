import { useState } from 'react';

interface Coupon {
  id: number;
  couponTitle: string;
  couponImage: string;
  couponCode: string;
  couponDiscount: number;
  userType: 'All Users' | 'Specific User';
  specificUserName?: string;
  numberOfTimes: 'Single Time' | 'Multi Time';
  discountType: 'Value' | 'Percentage';
  couponExpiryDate: string;
  couponStatus: 'Published' | 'Draft';
  couponOrderMinValue: number;
  couponDescription: string;
}

// Mock data matching the image
const INITIAL_COUPONS: Coupon[] = [
  {
    id: 1,
    couponTitle: 'FREE10',
    couponImage: '/api/placeholder/40/40',
    couponCode: 'KTR1VIWZ',
    couponDiscount: 10,
    userType: 'All Users',
    numberOfTimes: 'Single Time',
    discountType: 'Value',
    couponExpiryDate: '2025-03-31',
    couponStatus: 'Published',
    couponOrderMinValue: 100,
    couponDescription: 'Get 10 off on orders above 100',
  },
  {
    id: 2,
    couponTitle: 'try',
    couponImage: '/api/placeholder/40/40',
    couponCode: '1AGD89DT',
    couponDiscount: 30,
    userType: 'All Users',
    numberOfTimes: 'Multi Time',
    discountType: 'Value',
    couponExpiryDate: '2025-03-31',
    couponStatus: 'Published',
    couponOrderMinValue: 100,
    couponDescription: 'Try this coupon',
  },
  {
    id: 3,
    couponTitle: 'FRee',
    couponImage: '/api/placeholder/40/40',
    couponCode: 'B5N6NPOM',
    couponDiscount: 10,
    userType: 'All Users',
    numberOfTimes: 'Multi Time',
    discountType: 'Value',
    couponExpiryDate: '2025-03-28',
    couponStatus: 'Published',
    couponOrderMinValue: 1500,
    couponDescription: 'Free discount',
  },
  {
    id: 4,
    couponTitle: '100 OFF',
    couponImage: '/api/placeholder/40/40',
    couponCode: 'CGCGHCGD',
    couponDiscount: 100,
    userType: 'All Users',
    numberOfTimes: 'Multi Time',
    discountType: 'Value',
    couponExpiryDate: '2025-04-19',
    couponStatus: 'Published',
    couponOrderMinValue: 500,
    couponDescription: '100 off on orders above 500',
  },
  {
    id: 5,
    couponTitle: 'OnlyForYou',
    couponImage: '/api/placeholder/40/40',
    couponCode: 'AA794EKI',
    couponDiscount: 50,
    userType: 'Specific User',
    specificUserName: 'Pratik',
    numberOfTimes: 'Single Time',
    discountType: 'Value',
    couponExpiryDate: '2025-04-05',
    couponStatus: 'Published',
    couponOrderMinValue: 500,
    couponDescription: 'Only for you',
  },
  {
    id: 6,
    couponTitle: '50 OFF',
    couponImage: '/api/placeholder/40/40',
    couponCode: 'Y3KJ8DRO',
    couponDiscount: 50,
    userType: 'Specific User',
    specificUserName: 'Pratik',
    numberOfTimes: 'Single Time',
    discountType: 'Value',
    couponExpiryDate: '2025-04-05',
    couponStatus: 'Published',
    couponOrderMinValue: 500,
    couponDescription: '50 off coupon',
  },
];

export default function AdminCoupon() {
  const [formData, setFormData] = useState({
    userType: '',
    numberOfTimes: 'Single Time Valid',
    couponImage: null as File | null,
    couponExpiryDate: '',
    couponCode: '',
    couponTitle: '',
    couponStatus: '',
    couponMinOrderAmount: '',
    couponValue: '',
    couponType: 'Percentage',
    couponDescription: '',
  });

  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, couponImage: e.target.files![0] }));
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, couponCode: code }));
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.userType || !formData.couponTitle || !formData.couponCode || 
        !formData.couponExpiryDate || !formData.couponStatus || !formData.couponMinOrderAmount ||
        !formData.couponValue || !formData.couponDescription) {
      alert('Please fill in all required fields');
      return;
    }

    const newCoupon: Coupon = {
      id: coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1,
      couponTitle: formData.couponTitle,
      couponImage: formData.couponImage ? URL.createObjectURL(formData.couponImage) : '/api/placeholder/40/40',
      couponCode: formData.couponCode,
      couponDiscount: parseFloat(formData.couponValue),
      userType: formData.userType === 'All Users' ? 'All Users' : 'Specific User',
      numberOfTimes: formData.numberOfTimes === 'Single Time Valid' ? 'Single Time' : 'Multi Time',
      discountType: formData.couponType === 'Percentage' ? 'Percentage' : 'Value',
      couponExpiryDate: formData.couponExpiryDate,
      couponStatus: formData.couponStatus === 'Published' ? 'Published' : 'Draft',
      couponOrderMinValue: parseFloat(formData.couponMinOrderAmount),
      couponDescription: formData.couponDescription,
    };

    setCoupons([...coupons, newCoupon]);
    
    // Reset form
    setFormData({
      userType: '',
      numberOfTimes: 'Single Time Valid',
      couponImage: null,
      couponExpiryDate: '',
      couponCode: '',
      couponTitle: '',
      couponStatus: '',
      couponMinOrderAmount: '',
      couponValue: '',
      couponType: 'Percentage',
      couponDescription: '',
    });
    
    alert('Coupon added successfully!');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== id));
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

  // Sort coupons
  let sortedCoupons = [...coupons];
  if (sortColumn) {
    sortedCoupons = [...sortedCoupons].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'couponTitle':
          aValue = a.couponTitle;
          bValue = b.couponTitle;
          break;
        case 'couponCode':
          aValue = a.couponCode;
          bValue = b.couponCode;
          break;
        case 'couponDiscount':
          aValue = a.couponDiscount;
          bValue = b.couponDiscount;
          break;
        case 'couponExpiryDate':
          aValue = a.couponExpiryDate;
          bValue = b.couponExpiryDate;
          break;
        case 'couponStatus':
          aValue = a.couponStatus;
          bValue = b.couponStatus;
          break;
        case 'couponOrderMinValue':
          aValue = a.couponOrderMinValue;
          bValue = b.couponOrderMinValue;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedCoupons.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedCoupons = sortedCoupons.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Content */}
      <div className="flex-1 p-6">
        {/* Header with Title and Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Coupon</h1>
          <div className="text-sm">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
            <span className="text-neutral-400 mx-1">/</span>
            <span className="text-neutral-600">Coupon</span>
          </div>
        </div>

        {/* Add Coupon Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-lg font-semibold">Add Coupon</h2>
          </div>
          
          <form onSubmit={handleAddCoupon} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select User Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="">Select User Type</option>
                  <option value="All Users">All Users</option>
                  <option value="Specific User">Specific User</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Number of Times <span className="text-red-500">*</span>
                </label>
                <select
                  name="numberOfTimes"
                  value={formData.numberOfTimes}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="Single Time Valid">Single Time Valid</option>
                  <option value="Multi Time Valid">Multi Time Valid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 border border-neutral-300 rounded cursor-pointer hover:bg-neutral-50 transition-colors">
                    <span className="text-sm text-neutral-600">Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                  <span className="text-sm text-neutral-500">
                    {formData.couponImage ? formData.couponImage.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Row 2 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="couponExpiryDate"
                    value={formData.couponExpiryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    onClick={generateCouponCode}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                    title="Generate Code"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="couponTitle"
                  value={formData.couponTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Enter coupon title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Row 3 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="couponStatus"
                  value={formData.couponStatus}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="">Select Coupon Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Min Order Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="couponMinOrderAmount"
                  value={formData.couponMinOrderAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Enter min order amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="couponValue"
                  value={formData.couponValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Enter coupon value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Coupon Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="couponType"
                  value={formData.couponType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Value">Value</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              {/* Row 4 */}
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Coupon Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="couponDescription"
                value={formData.couponDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                placeholder="Enter coupon description"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition-colors"
            >
              Add Coupon
            </button>
          </form>
        </div>

        {/* View Coupon Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-800">View Coupon</h2>
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
              <span className="text-sm text-neutral-600">entries</span>
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
                      Sr No. <SortIcon column="id" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponTitle')}
                  >
                    <div className="flex items-center">
                      Coupon Title <SortIcon column="couponTitle" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponCode')}
                  >
                    <div className="flex items-center">
                      Coupon Code <SortIcon column="couponCode" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponDiscount')}
                  >
                    <div className="flex items-center">
                      Coupon Discount? <SortIcon column="couponDiscount" />
                    </div>
                  </th>
                  <th className="p-4">
                    <div className="flex items-center">
                      Coupon Type <SortIcon column="couponType" />
                    </div>
                  </th>
                  <th className="p-4">
                    <div className="flex items-center">
                      Discount Type <SortIcon column="discountType" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponExpiryDate')}
                  >
                    <div className="flex items-center">
                      Coupon Expiry Date <SortIcon column="couponExpiryDate" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponStatus')}
                  >
                    <div className="flex items-center">
                      Coupon Status <SortIcon column="couponStatus" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                    onClick={() => handleSort('couponOrderMinValue')}
                  >
                    <div className="flex items-center">
                      Coupon Order Min Value <SortIcon column="couponOrderMinValue" />
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
                {displayedCoupons.map((coupon, index) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200"
                  >
                    <td className="p-4 align-middle">{startIndex + index + 1}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <img
                          src={coupon.couponImage}
                          alt={coupon.couponTitle}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span>{coupon.couponTitle}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{coupon.couponCode}</td>
                    <td className="p-4 align-middle">{coupon.couponDiscount}</td>
                    <td className="p-4 align-middle">
                      <div className="text-xs">
                        <div>{coupon.userType === 'All Users' ? 'Applicable for All Users' : `Only applicable for ${coupon.specificUserName || 'User'}`}</div>
                        <div className="text-neutral-500">{coupon.numberOfTimes}</div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{coupon.discountType}</td>
                    <td className="p-4 align-middle">{coupon.couponExpiryDate}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {coupon.couponStatus}
                      </span>
                    </td>
                    <td className="p-4 align-middle">{coupon.couponOrderMinValue}</td>
                    <td className="p-4 align-middle">
                      <button
                        onClick={() => handleDelete(coupon.id)}
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
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {displayedCoupons.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-neutral-400">
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-neutral-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCoupons.length)} of {sortedCoupons.length} entries
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
        <a href="#" className="text-blue-600 hover:underline">
          SpeeUp - 10 Minute App
        </a>
      </footer>
    </div>
  );
}


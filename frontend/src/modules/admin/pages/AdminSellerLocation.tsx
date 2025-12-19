import { useState, useEffect } from 'react';
import { getAllSellers, Seller as SellerType } from '../../../services/api/sellerService';

interface Seller {
  _id: string;
  sellerName: string;
  storeName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  searchLocation?: string;
  latitude?: string;
  longitude?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export default function AdminSellerLocation() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await getAllSellers();
        // Handle ApiResponse format: { success: boolean, data: Seller[] }
        if (response.success && response.data) {
          const mappedSellers: Seller[] = response.data.map((seller: SellerType) => ({
            _id: seller._id,
            sellerName: seller.sellerName || 'Unknown',
            storeName: seller.storeName || 'Unknown Store',
            email: seller.email || '',
            phone: seller.mobile || '',
            address: seller.address,
            city: seller.city,
            searchLocation: seller.searchLocation,
            latitude: seller.latitude,
            longitude: seller.longitude,
            status: seller.status || 'Pending',
          }));

          // Filter sellers with valid location data
          const sellersWithLocation = mappedSellers.filter(
            (seller) => seller.latitude && seller.longitude
          );

          setSellers(sellersWithLocation.length > 0 ? sellersWithLocation : MOCK_SELLERS);
        } else {
          // Use mock data as fallback
          setSellers(MOCK_SELLERS);
        }
      } catch (error) {
        console.error('Error fetching sellers:', error);
        // Use mock data as fallback
        setSellers(MOCK_SELLERS);
      }
    };

    fetchSellers();
  }, []);

  // Filter sellers based on search and status
  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || seller.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Generate Google Maps embed URL with markers
  const generateMapUrl = () => {
    if (filteredSellers.length === 0) {
      // Default map location (India center)
      return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin';
    }

    // If we have sellers with locations, create a map with markers


    // Use Google Maps Static API or embed with markers
    // For now, use embed with center point
    const centerLat = filteredSellers[0]?.latitude || '28.6139';
    const centerLng = filteredSellers[0]?.longitude || '77.2090';

    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d${centerLng}!3d${centerLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjgrMzYnNDkuMSJOIDc3KzEyJzMyLjQiRQ!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin`;
  };

  const handleSellerClick = (seller: Seller) => {
    setSelectedSeller(seller);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Seller Locations</h1>
        <div className="text-sm text-neutral-600">
          <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">Seller Locations</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search Sellers
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, store, city, or address..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content - Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Map Section - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Seller Locations Map</h2>
          </div>
          <div className="h-96 sm:h-[600px] w-full">
            <iframe
              src={generateMapUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Seller Locations Map"
              className="w-full h-full"
            ></iframe>
          </div>
          {selectedSeller && (
            <div className="p-4 sm:p-6 border-t border-neutral-200 bg-teal-50">
              <h3 className="font-semibold text-neutral-900 mb-2">Selected Seller</h3>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">{selectedSeller.storeName}</span> - {selectedSeller.sellerName}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {selectedSeller.address}, {selectedSeller.city}
              </p>
              {selectedSeller.latitude && selectedSeller.longitude && (
                <p className="text-xs text-neutral-500 mt-1">
                  Coordinates: {selectedSeller.latitude}, {selectedSeller.longitude}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sellers List - Takes 1 column */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">
              Sellers ({filteredSellers.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredSellers.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">
                <p>No sellers found with location data.</p>
                <p className="text-sm mt-2">Make sure sellers have latitude and longitude set.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {filteredSellers.map((seller) => (
                  <div
                    key={seller._id}
                    onClick={() => handleSellerClick(seller)}
                    className={`p-4 cursor-pointer transition-colors ${selectedSeller?._id === seller._id
                      ? 'bg-teal-50 border-l-4 border-teal-600'
                      : 'hover:bg-neutral-50'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 text-sm">
                          {seller.storeName}
                        </h3>
                        <p className="text-xs text-neutral-600 mt-1">{seller.sellerName}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                          seller.status
                        )}`}
                      >
                        {seller.status}
                      </span>
                    </div>
                    {seller.address && (
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                        📍 {seller.address}
                        {seller.city && `, ${seller.city}`}
                      </p>
                    )}
                    {seller.latitude && seller.longitude && (
                      <p className="text-xs text-neutral-400 mt-1">
                        {seller.latitude}, {seller.longitude}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                      <span>📞 {seller.phone}</span>
                      {seller.email && <span>✉️ {seller.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

// Mock data as fallback
const MOCK_SELLERS: Seller[] = [
  {
    _id: 'mock1',
    sellerName: 'Chirag Seller',
    storeName: 'Chirag Store',
    email: 'chirag@example.com',
    phone: '9766846429',
    address: '123 Main Street',
    city: 'Mumbai',
    searchLocation: 'Mumbai, Maharashtra',
    latitude: '19.0760',
    longitude: '72.8777',
    status: 'Approved',
  },
  {
    _id: 'mock2',
    sellerName: 'Rajesh Kumar',
    storeName: 'Rajesh Electronics',
    email: 'rajesh@example.com',
    phone: '9876543210',
    address: '456 Park Avenue',
    city: 'Delhi',
    searchLocation: 'New Delhi, Delhi',
    latitude: '28.6139',
    longitude: '77.2090',
    status: 'Approved',
  },
  {
    _id: 'mock3',
    sellerName: 'Priya Sharma',
    storeName: 'Priya Fashion',
    email: 'priya@example.com',
    phone: '9123456789',
    address: '789 MG Road',
    city: 'Bangalore',
    searchLocation: 'Bangalore, Karnataka',
    latitude: '12.9716',
    longitude: '77.5946',
    status: 'Pending',
  },
];


import { useState } from 'react';

interface City {
  id: number;
  name: string;
}

export default function AdminManageCity() {
  const [cityName, setCityName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const [cities, setCities] = useState<City[]>([
    { id: 6, name: 'Bhandara' },
    { id: 8, name: 'Casablanca' },
    { id: 9, name: 'Bengaluru' },
  ]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedCities = [...cities].sort((a, b) => {
    if (sortColumn === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortColumn === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedCities.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedCities = sortedCities.slice(startIndex, endIndex);

  const handleAddCity = () => {
    if (!cityName.trim()) {
      alert('Please enter a city name');
      return;
    }
    
    if (editingId !== null) {
      // Update existing city
      setCities(cities.map(city => 
        city.id === editingId ? { ...city, name: cityName } : city
      ));
      setEditingId(null);
    } else {
      // Add new city
      const newId = Math.max(...cities.map(c => c.id), 0) + 1;
      setCities([...cities, { id: newId, name: cityName }]);
    }
    
    setCityName('');
    setLatitude('');
    setLongitude('');
    setSearchCity('');
  };

  const handleReset = () => {
    setCityName('');
    setSearchCity('');
    setLatitude('');
    setLongitude('');
    setEditingId(null);
  };

  const handleEdit = (city: City) => {
    setCityName(city.name);
    setEditingId(city.id);
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      setCities(cities.filter(city => city.id !== id));
      if (editingId === id) {
        handleReset();
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Manage City</h1>
        <div className="text-sm text-neutral-600">
          <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-teal-600">Manage City</span>
        </div>
      </div>

      {/* Form and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-teal-600 px-4 sm:px-6 py-3">
            <h2 className="text-white text-lg font-semibold">Manage City</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Search City */}
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                Search City
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search City"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-red-500 text-xs mt-1">
                Search your city where you will provide service and to find co-ordinates.
              </p>
            </div>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* City Name */}
            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                City Name
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="City Name"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddCity}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors"
              >
                {editingId !== null ? 'Update City' : 'Add City'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Google Map */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="h-full min-h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.5!2d151.2093!3d-33.8688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae665e892fdd%3A0x3133f8d75a1ac251!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="City Location Map"
            ></iframe>
          </div>
        </div>
      </div>

      {/* City List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-teal-50 px-4 sm:px-6 py-3 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Staff List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                      <path d="M7 10L12 5L17 10M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </th>
                <th
                  className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    City
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
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
              {displayedCities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 sm:px-6 py-8 text-center text-sm text-neutral-500">
                    No cities available
                  </td>
                </tr>
              ) : (
                displayedCities.map((city) => (
                  <tr key={city.id} className="hover:bg-neutral-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900">{city.id}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-neutral-900 font-medium">{city.name}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(city)}
                          className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-neutral-700">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedCities.length)} of {sortedCities.length} entries
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
              className="p-2 border border-neutral-300 rounded bg-teal-600 text-white font-medium min-w-[32px]"
            >
              {currentPage}
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 border border-neutral-300 rounded ${
                currentPage === totalPages
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

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          Appzeto - 10 Minute App
        </a>
      </div>
    </div>
  );
}


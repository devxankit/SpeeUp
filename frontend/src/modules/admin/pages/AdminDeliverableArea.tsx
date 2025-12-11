import { useState } from 'react';

const CITIES = [
    'Select City',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Bhandara',
];

const DELIVERY_CHARGE_METHODS = [
    'Select Method',
    'Fixed Charge',
    'Per Kilometer',
    'Distance Based',
    'Weight Based',
];

export default function AdminDeliverableArea() {
    const [selectedCity, setSelectedCity] = useState('Select City');
    const [areaName, setAreaName] = useState('');
    const [timeToTravel, setTimeToTravel] = useState('');
    const [baseDeliveryTime, setBaseDeliveryTime] = useState('');
    const [minimumAmount, setMinimumAmount] = useState('');
    const [deliveryChargeMethod, setDeliveryChargeMethod] = useState('Select Method');

    const handleSaveBoundaries = () => {
        if (selectedCity === 'Select City') {
            alert('Please select a city');
            return;
        }
        if (!areaName.trim()) {
            alert('Please enter area name');
            return;
        }
        if (!timeToTravel.trim()) {
            alert('Please enter time to travel');
            return;
        }
        if (!baseDeliveryTime.trim()) {
            alert('Please enter base delivery time');
            return;
        }
        if (!minimumAmount.trim()) {
            alert('Please enter minimum amount for free delivery');
            return;
        }
        if (deliveryChargeMethod === 'Select Method') {
            alert('Please select delivery charge method');
            return;
        }

        // In real app, this would save the boundaries and form data
        console.log('Saving boundaries:', {
            city: selectedCity,
            areaName,
            timeToTravel,
            baseDeliveryTime,
            minimumAmount,
            deliveryChargeMethod,
        });
        alert('Boundaries saved successfully!');
    };

    const handleClearMap = () => {
        if (window.confirm('Are you sure you want to clear the map? All boundary points will be removed.')) {
            // In real app, this would clear the map boundaries
            alert('Map cleared');
        }
    };

    const handleRemoveNewLine = () => {
        // In real app, this would remove the last added boundary line
        alert('Last added line removed');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Content */}
            <div className="flex-1 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Section: Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col">
                        <h2 className="text-lg font-semibold text-neutral-800 mb-6">Deliverable Area for City</h2>
                        
                        <div className="space-y-5 flex-1">
                            {/* Select City */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Select City <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-blue-600 mt-1">
                                    Search your city in which you will provide the service and city points.
                                </p>
                            </div>

                            {/* Enter Area Name */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Enter Area Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={areaName}
                                    onChange={(e) => setAreaName(e.target.value)}
                                    placeholder="Enter Area Name"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>

                            {/* Time to travel 1 (km) */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Time to travel 1 (km) <span className="text-red-500">*</span>
                                    <span className="text-xs font-normal text-neutral-500 ml-2">(Enter in minutes)</span>
                                </label>
                                <input
                                    type="number"
                                    value={timeToTravel}
                                    onChange={(e) => setTimeToTravel(e.target.value)}
                                    placeholder="Enter Time to travel 1 (km)."
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>

                            {/* Base Delivery Time */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Base Delivery Time <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-neutral-500 mb-1">
                                    (will be added in Time to Travel, using these quickcommerce time will be calculated in app)
                                </p>
                                <input
                                    type="number"
                                    value={baseDeliveryTime}
                                    onChange={(e) => setBaseDeliveryTime(e.target.value)}
                                    placeholder="Enter Base Delivery Time."
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>

                            {/* Minimum Amount for Free Delivery */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Minimum Amount for Free Delivery <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={minimumAmount}
                                    onChange={(e) => setMinimumAmount(e.target.value)}
                                    placeholder="Enter Delivarable Maximum Distance in km"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>

                            {/* Delivery Charge Methods */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Delivery Charge Methods <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={deliveryChargeMethod}
                                    onChange={(e) => setDeliveryChargeMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {DELIVERY_CHARGE_METHODS.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleSaveBoundaries}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium transition-colors"
                            >
                                Save Boundries
                            </button>
                        </div>
                    </div>

                    {/* Right Section: Map */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                            Boundry Points <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-xs text-red-600 mb-4">
                            Please edit Map or City Deliverable Area in desktop. It may not work in mobile device.
                        </p>

                        {/* Map Action Buttons */}
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={handleRemoveNewLine}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Remove Newly Added Line
                            </button>
                            <button
                                onClick={handleClearMap}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                Clear Map
                            </button>
                        </div>

                        {/* Google Map */}
                        <div className="flex-1 border border-neutral-300 rounded overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d79.65!3d21.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA5JzAwLjAiTiA3OcKwMzknMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0, minHeight: '500px' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Deliverable Area Map"
                            />
                        </div>

                        {/* Map Controls Info */}
                        <div className="mt-4 text-xs text-neutral-500">
                            <p>Use the map to draw boundary points for the deliverable area.</p>
                            <p className="mt-1">Click on the map to add points and create a boundary polygon.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
                Copyright © 2025. Developed By{' '}
                <a href="#" className="text-blue-600 hover:underline">Appzeto - 10 Minute App</a>
            </footer>
        </div>
    );
}


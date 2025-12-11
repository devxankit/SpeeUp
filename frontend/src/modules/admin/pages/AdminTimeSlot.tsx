import { useState } from 'react';

interface TimeSlot {
    id: number;
    minimumTime: string;
    maximumTime: string;
}

// Mock data matching the image
const INITIAL_TIME_SLOTS: TimeSlot[] = [
    { id: 1, minimumTime: '11:00', maximumTime: '12:00' },
    { id: 2, minimumTime: '13:00', maximumTime: '15:00' },
    { id: 3, minimumTime: '15:00', maximumTime: '18:00' },
    { id: 4, minimumTime: '19:00', maximumTime: '22:00' },
];

export default function AdminTimeSlot() {
    const [minimumTime, setMinimumTime] = useState('11:00');
    const [maximumTime, setMaximumTime] = useState('11:00');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INITIAL_TIME_SLOTS);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

    // Sort time slots
    let sortedTimeSlots = [...timeSlots];
    if (sortColumn) {
        sortedTimeSlots.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'minimumTime':
                    aValue = a.minimumTime;
                    bValue = b.minimumTime;
                    break;
                case 'maximumTime':
                    aValue = a.maximumTime;
                    bValue = b.maximumTime;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(sortedTimeSlots.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedTimeSlots = sortedTimeSlots.slice(startIndex, endIndex);



    const parseTimeInput = (timeInput: string): string => {
        // Convert "11:00" from input to "11:00" format
        return timeInput;
    };

    const handleAddTime = () => {
        if (!minimumTime || !maximumTime) {
            alert('Please fill in both time fields');
            return;
        }

        // Validate that maximum time is after minimum time
        const minTime = minimumTime.split(':').map(Number);
        const maxTime = maximumTime.split(':').map(Number);
        const minMinutes = minTime[0] * 60 + minTime[1];
        const maxMinutes = maxTime[0] * 60 + maxTime[1];

        if (maxMinutes <= minMinutes) {
            alert('Maximum time must be after minimum time');
            return;
        }

        const newTimeSlot: TimeSlot = {
            id: timeSlots.length > 0 ? Math.max(...timeSlots.map(t => t.id)) + 1 : 1,
            minimumTime: parseTimeInput(minimumTime),
            maximumTime: parseTimeInput(maximumTime),
        };

        setTimeSlots([...timeSlots, newTimeSlot]);

        // Reset form
        setMinimumTime('11:00');
        setMaximumTime('11:00');
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this time slot?')) {
            setTimeSlots(timeSlots.filter(slot => slot.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Header */}
            <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-800">Timeslot</h1>
                    <div className="text-sm text-blue-500">
                        <span className="text-blue-500 hover:underline cursor-pointer">Home</span>{' '}
                        <span className="text-neutral-400">/</span> Timeslot
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Panel: Select Time Slot */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
                        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                            <h2 className="text-lg font-semibold">Select Time Slot</h2>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Minimum Time Slot
                                    </label>
                                    <input
                                        type="time"
                                        value={minimumTime}
                                        onChange={(e) => setMinimumTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Maximum Time Slot
                                    </label>
                                    <input
                                        type="time"
                                        value={maximumTime}
                                        onChange={(e) => setMaximumTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleAddTime}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Add Time
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Time Slot Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
                        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                            <h2 className="text-lg font-semibold">Time Slot</h2>
                        </div>

                        {/* Controls */}
                        <div className="p-4 border-b border-neutral-200">
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
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 text-xs font-bold text-neutral-800 border-b border-neutral-200">
                                        <th
                                            className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            <div className="flex items-center">
                                                ID <SortIcon column="id" />
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('minimumTime')}
                                        >
                                            <div className="flex items-center">
                                                Minimum Time <SortIcon column="minimumTime" />
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('maximumTime')}
                                        >
                                            <div className="flex items-center">
                                                Maximum Time <SortIcon column="maximumTime" />
                                            </div>
                                        </th>
                                        <th className="p-4">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTimeSlots.map((slot) => (
                                        <tr key={slot.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200">
                                            <td className="p-4 align-middle">{slot.id}</td>
                                            <td className="p-4 align-middle">{slot.minimumTime}</td>
                                            <td className="p-4 align-middle">{slot.maximumTime}</td>
                                            <td className="p-4 align-middle">
                                                <button
                                                    onClick={() => handleDelete(slot.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedTimeSlots.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-neutral-400">
                                                No time slots found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            <div className="text-xs sm:text-sm text-neutral-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, sortedTimeSlots.length)} of {sortedTimeSlots.length} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 border border-teal-600 rounded ${currentPage === 1
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
                                <button
                                    className="px-3 py-1.5 border border-teal-600 bg-teal-600 text-white rounded font-medium text-sm"
                                >
                                    {currentPage}
                                </button>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 border border-teal-600 rounded ${currentPage === totalPages
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
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
                Copyright © 2025. Developed By{' '}
                <a href="#" className="text-blue-600 hover:underline">Appzeto - 10 Minute App</a>
            </footer>
        </div>
    );
}


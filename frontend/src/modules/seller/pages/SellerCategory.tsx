import { useState } from 'react';

// Mock Data
const CATEGORIES = [
    {
        id: 2,
        name: 'Pet Care',
        image: '/assets/category-pet-care.png', // Placeholder
        totalSubcategory: 2
    },
    {
        id: 3,
        name: 'Sweet Tooth',
        image: '/assets/category-sweet-tooth.png',
        totalSubcategory: 3
    },
    {
        id: 4,
        name: 'Tea Coffee',
        image: '/assets/category-tea-coffee.png',
        totalSubcategory: 3
    },
    {
        id: 6,
        name: 'Instant Food',
        image: '/assets/category-instant-food.png',
        totalSubcategory: 3
    },
    {
        id: 7,
        name: 'Cleaning Essentials',
        image: '/assets/category-cleaning.png',
        totalSubcategory: 2
    }
];

export default function SellerCategory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredCategories = CATEGORIES.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-neutral-800">Category</h1>
                <div className="text-sm text-blue-500">
                    <span className="cursor-pointer hover:underline">Home</span> <span className="text-neutral-400">/</span> <span className="text-neutral-600">Dashboard</span>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex-1 flex flex-col">
                <div className="p-4 border-b border-neutral-100 font-medium text-neutral-700">
                    View Category
                </div>

                {/* Controls */}
                <div className="p-4 flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="bg-neutral-100 border-none rounded py-1.5 px-3text-sm focus:ring-0 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>

                        <button
                            onClick={() => {
                                const headers = ['ID', 'Category Name', 'Total Subcategory'];
                                const csvContent = [
                                    headers.join(','),
                                    ...filteredCategories.map(cat => [
                                        cat.id,
                                        `"${cat.name}"`,
                                        cat.totalSubcategory
                                    ].join(','))
                                ].join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                            <input
                                type="text"
                                className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500 w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-neutral-200">
                        <thead>
                            <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                                <th className="p-4 w-16 border border-neutral-200">
                                    <div className="flex items-center justify-between cursor-pointer">ID <span className="text-neutral-300 text-[10px]">⇅</span></div>
                                </th>
                                <th className="p-4 border border-neutral-200">
                                    <div className="flex items-center justify-between cursor-pointer">Category Name <span className="text-neutral-300 text-[10px]">⇅</span></div>
                                </th>
                                <th className="p-4 border border-neutral-200">
                                    <div className="flex items-center justify-between cursor-pointer">Category Image <span className="text-neutral-300 text-[10px]">⇅</span></div>
                                </th>
                                <th className="p-4 border border-neutral-200">
                                    <div className="flex items-center justify-between cursor-pointer">Total Subcategory <span className="text-neutral-300 text-[10px]">⇅</span></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
                                    <td className="p-4 align-middle border border-neutral-200">{category.id}</td>
                                    <td className="p-4 align-middle border border-neutral-200">{category.name}</td>
                                    <td className="p-4 border border-neutral-200">
                                        <div className="w-16 h-12 bg-white border border-neutral-200 rounded p-1 flex items-center justify-center mx-auto">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/60x40?text=Img';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle border border-neutral-200">{category.totalSubcategory}</td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-neutral-400 border border-neutral-200">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Visual only mostly for now as per image doesn't show bottom) */}
                <div className="p-4 border-t border-neutral-100 mt-auto">
                    {/* Placeholder for potential pagination info if needed, or left empty as strictly per image top part */}
                </div>
            </div>
        </div>
    );
}

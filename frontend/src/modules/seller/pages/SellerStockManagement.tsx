import { useState } from 'react';

// Mock Data based on the image
interface StockItem {
    variationId: number;
    name: string;
    seller: string;
    image: string;
    variation: string;
    stock: number | 'Unlimited';
    status: 'Published' | 'Unpublished';
    category: string;
}

const STOCK_ITEMS: StockItem[] = [
    {
        variationId: 3,
        name: 'Maggi 2 - Minute Instant Noodles (Pack of 12)',
        seller: 'SpeeUp store',
        image: '/assets/product-mtr-poha.jpg',
        variation: '840 g (12 x 70 g)',
        stock: 134,
        status: 'Published',
        category: 'Instant Food'
    },
    {
        variationId: 14,
        name: 'Sumeru Grated Coconut (Frozen)',
        seller: 'SpeeUp store',
        image: '/assets/category-fruits-veg.png',
        variation: '200 g',
        stock: 67,
        status: 'Published',
        category: 'Instant Food'
    },
    {
        variationId: 16,
        name: 'Maggi Masala 2 Minutes Instant Noodles',
        seller: 'SpeeUp store',
        image: '/assets/product-mtr-poha.jpg',
        variation: '100g',
        stock: 'Unlimited',
        status: 'Published',
        category: 'Instant Food'
    },
    {
        variationId: 17,
        name: "Abbie's Pure Maple Syrup",
        seller: 'SpeeUp store',
        image: '/assets/category-sweet-tooth.png',
        variation: '250 ml',
        stock: 47,
        status: 'Published',
        category: 'Sweet Tooth'
    },
    {
        variationId: 18,
        name: 'Maggi Masala 2 Minutes Instant Noodles',
        seller: 'SpeeUp store',
        image: '/assets/product-mtr-poha.jpg',
        variation: '200g',
        stock: 47,
        status: 'Published',
        category: 'Instant Food'
    },
    {
        variationId: 21,
        name: 'Yoga Bar Chocolate Chunk Nut Multigrain Protein Bar (35 g)',
        seller: 'SpeeUp store',
        image: '/assets/category-snacks.png',
        variation: '35 g',
        stock: 6,
        status: 'Published',
        category: 'Snacks'
    }
];

export default function SellerStockManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Category');
    const [statusFilter, setStatusFilter] = useState('All Products');
    const [stockFilter, setStockFilter] = useState('All Products');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filter items
    let filteredItems = STOCK_ITEMS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.seller.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All Category' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'All Products' || 
            (statusFilter === 'Published' && item.status === 'Published') ||
            (statusFilter === 'Unpublished' && item.status === 'Unpublished');
        const matchesStock = stockFilter === 'All Products' ||
            (stockFilter === 'In Stock' && (item.stock === 'Unlimited' || item.stock > 0)) ||
            (stockFilter === 'Out of Stock' && item.stock === 0);
        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

    // Sort items
    if (sortColumn) {
        filteredItems.sort((a, b) => {
            let aVal: any = a[sortColumn as keyof typeof a];
            let bVal: any = b[sortColumn as keyof typeof b];
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (sortColumn === 'stock') {
                // Handle 'Unlimited' stock
                if (aVal === 'Unlimited') aVal = Infinity;
                if (bVal === 'Unlimited') bVal = Infinity;
            }
            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedItems = filteredItems.slice(startIndex, endIndex);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }: { column: string }) => (
        <span className="text-neutral-300 text-[10px]">
            {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
        </span>
    );

    // Get unique categories for filter
    const categories = Array.from(new Set(STOCK_ITEMS.map(item => item.category)));

    return (
        <div className="flex flex-col h-full">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-neutral-800">View Stock Management</h1>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex-1 flex flex-col">
                <div className="p-4 border-b border-neutral-100 font-medium text-neutral-700">
                    View Stock Management
                </div>

                {/* Filters and Controls */}
                <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center justify-between border-b border-neutral-100">
                    <div className="flex flex-wrap gap-3">
                        <div>
                            <label className="block text-xs text-neutral-600 mb-1">Filter By Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value="All Category">All Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-600 mb-1">Filter by Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value="All Products">All Products</option>
                                <option value="Published">Published</option>
                                <option value="Unpublished">Unpublished</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-600 mb-1">Filter by Stock</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value="All Products">All Products</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">Show</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="bg-white border border-neutral-300 rounded py-1.5 px-3 text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                const headers = ['Variation Id', 'Name', 'Seller', 'Variation', 'Stock', 'Status', 'Category'];
                                const csvContent = [
                                    headers.join(','),
                                    ...filteredItems.map(item => [
                                        item.variationId,
                                        `"${item.name}"`,
                                        `"${item.seller}"`,
                                        `"${item.variation}"`,
                                        item.stock,
                                        item.status,
                                        `"${item.category}"`
                                    ].join(','))
                                ].join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `stock_${new Date().toISOString().split('T')[0]}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                            <input
                                type="text"
                                className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500 w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder=""
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse border border-neutral-200">
                        <thead>
                            <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('variationId')}
                                >
                                    <div className="flex items-center justify-between">
                                        Variation Id <SortIcon column="variationId" />
                                    </div>
                                </th>
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center justify-between">
                                        Name <SortIcon column="name" />
                                    </div>
                                </th>
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('seller')}
                                >
                                    <div className="flex items-center justify-between">
                                        Seller <SortIcon column="seller" />
                                    </div>
                                </th>
                                <th className="p-4 border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        Image
                                    </div>
                                </th>
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('variation')}
                                >
                                    <div className="flex items-center justify-between">
                                        Variation <SortIcon column="variation" />
                                    </div>
                                </th>
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('stock')}
                                >
                                    <div className="flex items-center justify-between">
                                        Stock <SortIcon column="stock" />
                                    </div>
                                </th>
                                <th 
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center justify-between">
                                        Status <SortIcon column="status" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedItems.map((item) => (
                                <tr key={item.variationId} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
                                    <td className="p-4 align-middle border border-neutral-200">{item.variationId}</td>
                                    <td className="p-4 align-middle border border-neutral-200">{item.name}</td>
                                    <td className="p-4 align-middle border border-neutral-200">{item.seller}</td>
                                    <td className="p-4 border border-neutral-200">
                                        <div className="w-12 h-16 bg-white border border-neutral-200 rounded p-1 flex items-center justify-center mx-auto">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/40x60?text=Img';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle border border-neutral-200">{item.variation}</td>
                                    <td className="p-4 align-middle border border-neutral-200">
                                        {item.stock === 'Unlimited' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Unlimited
                                            </span>
                                        ) : (
                                            <span>{item.stock}</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle border border-neutral-200">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                                            item.status === 'Published' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {displayedItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-neutral-400 border border-neutral-200">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-neutral-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} entries
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 border border-teal-600 rounded font-medium text-sm ${
                                    currentPage === page
                                        ? 'bg-teal-600 text-white'
                                        : 'text-teal-600 hover:bg-teal-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
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
    );
}


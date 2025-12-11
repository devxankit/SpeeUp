import { useState } from 'react';

interface ProductVariation {
    id: number;
    name: string;
    seller: string;
    image: string;
    variation: string;
    stock: number | 'Unlimited';
    status: 'Published' | 'Unpublished';
    category: string;
}

// Mock data
const PRODUCT_VARIATIONS: ProductVariation[] = [
    {
        id: 1,
        name: 'Everest Turmeric Powder/Haldi abcde',
        seller: 'Pratik Store',
        image: '/api/placeholder/60/80',
        variation: '100g',
        stock: 14,
        status: 'Published',
        category: 'Masala Oil',
    },
    {
        id: 2,
        name: 'Everest Turmeric Powder/Haldi abcde',
        seller: 'Pratik Store',
        image: '/api/placeholder/60/80',
        variation: '200g',
        stock: 156,
        status: 'Published',
        category: 'Masala Oil',
    },
    {
        id: 3,
        name: 'Maggi 2 - Minute Instant Noodles (Pack of 12)',
        seller: 'Chirag store',
        image: '/api/placeholder/60/80',
        variation: '840 g (12 x 70 g)',
        stock: 134,
        status: 'Published',
        category: 'Instant Food',
    },
    {
        id: 4,
        name: 'Everest Tikhalal Red Chilli Powder',
        seller: 'Pratik Store',
        image: '/api/placeholder/60/80',
        variation: '100g',
        stock: 'Unlimited',
        status: 'Published',
        category: 'Masala Oil',
    },
    {
        id: 5,
        name: 'Everest Tikhalal Red Chilli Powder',
        seller: 'Pratik Store',
        image: '/api/placeholder/60/80',
        variation: '200g',
        stock: 'Unlimited',
        status: 'Published',
        category: 'Masala Oil',
    },
    {
        id: 6,
        name: 'Everest Tikhalal Red Chilli Powder',
        seller: 'Pratik Store',
        image: '/api/placeholder/60/80',
        variation: '500g',
        stock: 'Unlimited',
        status: 'Published',
        category: 'Masala Oil',
    },
];

const CATEGORIES = ['All Category', 'Masala Oil', 'Instant Food', 'Organic & Premium', 'Pet Care', 'Sweet Tooth'];
const SELLERS = ['All Sellers', 'Pratik Store', 'Chirag store'];
const STATUS_OPTIONS = ['All Products', 'Published', 'Unpublished'];
const STOCK_OPTIONS = ['All Products', 'In Stock', 'Out of Stock', 'Unlimited'];

export default function AdminStockManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const [filterCategory, setFilterCategory] = useState('All Category');
    const [filterSeller, setFilterSeller] = useState('All Sellers');
    const [filterStatus, setFilterStatus] = useState('All Products');
    const [filterStock, setFilterStock] = useState('All Products');

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

    // Filter products
    let filteredProducts = PRODUCT_VARIATIONS.filter(product => {
        const matchesCategory = filterCategory === 'All Category' || product.category === filterCategory;
        const matchesSeller = filterSeller === 'All Sellers' || product.seller === filterSeller;
        const matchesStatus = filterStatus === 'All Products' || product.status === filterStatus;
        const matchesStock = filterStock === 'All Products' || 
            (filterStock === 'Unlimited' && product.stock === 'Unlimited') ||
            (filterStock === 'In Stock' && product.stock !== 'Unlimited' && typeof product.stock === 'number' && product.stock > 0) ||
            (filterStock === 'Out of Stock' && product.stock !== 'Unlimited' && typeof product.stock === 'number' && product.stock === 0);
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.seller.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSeller && matchesStatus && matchesStock && matchesSearch;
    });

    // Sort products
    if (sortColumn) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'seller':
                    aValue = a.seller;
                    bValue = b.seller;
                    break;
                case 'variation':
                    aValue = a.variation;
                    bValue = b.variation;
                    break;
                case 'stock':
                    aValue = typeof a.stock === 'number' ? a.stock : 999999;
                    bValue = typeof b.stock === 'number' ? b.stock : 999999;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, endIndex);

    const handleExport = () => {
        const headers = ['Variation Id', 'Name', 'Seller', 'Variation', 'Stock', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(product => [
                product.id,
                `"${product.name}"`,
                `"${product.seller}"`,
                `"${product.variation}"`,
                product.stock === 'Unlimited' ? 'Unlimited' : product.stock,
                product.status
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `stock_management_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Content */}
            <div className="flex-1 p-6">
                {/* Main Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
                    {/* Header */}
                    <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                        <h2 className="text-lg font-semibold">View Stock Management</h2>
                    </div>

                    {/* Filters and Controls */}
                    <div className="p-4 border-b border-neutral-200">
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                    Filter By Category
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => {
                                        setFilterCategory(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                    Filter by Sellers
                                </label>
                                <select
                                    value={filterSeller}
                                    onChange={(e) => {
                                        setFilterSeller(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                                >
                                    {SELLERS.map((seller) => (
                                        <option key={seller} value={seller}>
                                            {seller}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                    Filter by Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                    Filter by Stock
                                </label>
                                <select
                                    value={filterStock}
                                    onChange={(e) => {
                                        setFilterStock(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                                >
                                    {STOCK_OPTIONS.map((stock) => (
                                        <option key={stock} value={stock}>
                                            {stock}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Table Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExport}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                    Export
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Search:</span>
                                    <input
                                        type="text"
                                        className="pl-14 pr-3 py-1.5 bg-neutral-100 border-none rounded text-sm focus:ring-1 focus:ring-teal-500 w-48"
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
                                            Variation Id <SortIcon column="id" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Name <SortIcon column="name" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('seller')}
                                    >
                                        <div className="flex items-center">
                                            Seller <SortIcon column="seller" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('image')}
                                    >
                                        <div className="flex items-center">
                                            Image <SortIcon column="image" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('variation')}
                                    >
                                        <div className="flex items-center">
                                            Variation <SortIcon column="variation" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('stock')}
                                    >
                                        <div className="flex items-center">
                                            Stock <SortIcon column="stock" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status <SortIcon column="status" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700 border-b border-neutral-200">
                                        <td className="p-4 align-middle">{product.id}</td>
                                        <td className="p-4 align-middle">{product.name}</td>
                                        <td className="p-4 align-middle">{product.seller}</td>
                                        <td className="p-4 align-middle">
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        </td>
                                        <td className="p-4 align-middle">{product.variation}</td>
                                        <td className="p-4 align-middle">
                                            {product.stock === 'Unlimited' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                                    Unlimited
                                                </span>
                                            ) : (
                                                <span>{product.stock}</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                product.status === 'Published' 
                                                    ? 'bg-teal-100 text-teal-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {displayedProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-neutral-400">
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
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} entries
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
                            <button
                                className="px-3 py-1.5 border border-teal-600 bg-teal-600 text-white rounded font-medium text-sm"
                            >
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
                <a href="#" className="text-blue-600 hover:underline">Appzeto - 10 Minute App</a>
            </footer>
        </div>
    );
}


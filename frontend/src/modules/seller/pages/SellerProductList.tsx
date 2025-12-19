import { useState, useEffect } from 'react';
import { getProducts, Product, ProductVariation } from '../../../services/api/productService';
import { getCategories, Category as apiCategory } from '../../../services/api/categoryService';
import { useAuth } from '../../../context/AuthContext';

interface ProductVariationDisplay extends ProductVariation {
    variationId: string;
    productName: string;
    sellerName: string;
    productImage: string;
    brandName: string;
    category: string;
    subCategory: string;
    variation: string;
    isPopular?: boolean;
}

interface ProductDisplay {
    productId: string;
    variations: ProductVariationDisplay[];
}

export default function SellerProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Category');
    const [statusFilter, setStatusFilter] = useState('All Products');
    const [stockFilter, setStockFilter] = useState('All Products');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [totalPages, setTotalPages] = useState(1);
    const [allCategories, setAllCategories] = useState<apiCategory[]>([]);
    const { user } = useAuth();

    // Fetch categories for filter
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await getCategories();
                if (res.success) setAllCategories(res.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCats();
    }, []);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const params: any = {
                    page: currentPage,
                    limit: rowsPerPage,
                    sortBy: sortColumn || 'createdAt',
                    sortOrder: sortDirection,
                };

                if (searchTerm) {
                    params.search = searchTerm;
                }
                if (categoryFilter !== 'All Category') {
                    params.category = categoryFilter;
                }
                if (statusFilter === 'Published') {
                    params.status = 'published';
                } else if (statusFilter === 'Unpublished') {
                    params.status = 'unpublished';
                }
                if (stockFilter === 'In Stock') {
                    params.stock = 'inStock';
                } else if (stockFilter === 'Out of Stock') {
                    params.stock = 'outOfStock';
                }

                const response = await getProducts(params);
                if (response.success && response.data) {
                    setProducts(response.data);
                    // Extract pagination info if available
                    if ((response as any).pagination) {
                        setTotalPages((response as any).pagination.pages);
                    }
                } else {
                    setError(response.message || 'Failed to fetch products');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, rowsPerPage, searchTerm, categoryFilter, statusFilter, stockFilter, sortColumn, sortDirection]);

    // Flatten products with variations for display
    const allVariations = products.flatMap(product =>
        product.variations.map((variation, index) => ({
            variationId: variation._id || `${product._id}-${index}`,
            productName: product.productName,
            sellerName: user?.storeName || '',
            productImage: product.mainImage || product.mainImageUrl || '/assets/product-placeholder.jpg',
            brandName: (product.brand as any)?.name || '-',
            category: (product.category as any)?.name || '-',
            subCategory: (product.subcategory as any)?.name || '-',
            price: variation.price,
            discPrice: variation.discPrice,
            variation: variation.title || variation.value || variation.name || 'Default',
            isPopular: product.popular,
            productId: product._id,
        }))
    );

    // Filter variations
    let filteredVariations = allVariations.filter(variation => {
        const matchesSearch = variation.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variation.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variation.brandName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All Category' || variation.category === categoryFilter;
        const matchesStatus = statusFilter === 'All Products';
        const matchesStock = stockFilter === 'All Products';
        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

    // Sort variations
    if (sortColumn) {
        filteredVariations.sort((a, b) => {
            let aVal: any = a[sortColumn as keyof typeof a];
            let bVal: any = b[sortColumn as keyof typeof b];
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    // Use API pagination if available, otherwise client-side pagination
    const displayTotalPages = totalPages > 1 ? totalPages : Math.ceil(filteredVariations.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedVariations = filteredVariations.slice(startIndex, endIndex);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const toggleProduct = (productId: string) => {
        setExpandedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const SortIcon = ({ column }: { column: string }) => (
        <span className="text-neutral-300 text-[10px]">
            {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
        </span>
    );

    // Get unique categories for filter
    const categories = allCategories.map(cat => cat.name);

    return (
        <div className="flex flex-col h-full">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-neutral-800">Product List</h1>
                <div className="text-sm text-blue-500">
                    <span className="cursor-pointer hover:underline">Home</span> <span className="text-neutral-400">/</span> <span className="text-neutral-600">Dashboard</span>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex-1 flex flex-col">
                <div className="p-4 border-b border-neutral-100 font-medium text-neutral-700">
                    View Product List
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
                                const headers = ['Product Id', 'Variation Id', 'Product Name', 'Seller Name', 'Brand Name', 'Category', 'Price', 'Disc Price', 'Variation'];
                                const csvContent = [
                                    headers.join(','),
                                    ...filteredVariations.map(v => [
                                        v.productId,
                                        v.variationId,
                                        `"${v.productName}"`,
                                        `"${v.sellerName}"`,
                                        `"${v.brandName}"`,
                                        `"${v.category}"`,
                                        v.price,
                                        v.discPrice,
                                        `"${v.variation}"`
                                    ].join(','))
                                ].join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
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
                                <th className="p-4 w-16 border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        Product Id
                                    </div>
                                </th>
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
                                    onClick={() => handleSort('productName')}
                                >
                                    <div className="flex items-center justify-between">
                                        Product Name <SortIcon column="productName" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('sellerName')}
                                >
                                    <div className="flex items-center justify-between">
                                        Seller Name <SortIcon column="sellerName" />
                                    </div>
                                </th>
                                <th className="p-4 border border-neutral-200">
                                    <div className="flex items-center justify-between">
                                        product Image
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('brandName')}
                                >
                                    <div className="flex items-center justify-between">
                                        Brand Name <SortIcon column="brandName" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('category')}
                                >
                                    <div className="flex items-center justify-between">
                                        Category <SortIcon column="category" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('subCategory')}
                                >
                                    <div className="flex items-center justify-between">
                                        SubCategory <SortIcon column="subCategory" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('price')}
                                >
                                    <div className="flex items-center justify-between">
                                        Price <SortIcon column="price" />
                                    </div>
                                </th>
                                <th
                                    className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                    onClick={() => handleSort('discPrice')}
                                >
                                    <div className="flex items-center justify-between">
                                        Disc Price <SortIcon column="discPrice" />
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
                            </tr>
                        </thead>
                        <tbody>
                            {displayedVariations.map((variation, index) => {
                                const isFirstVariation = index === 0 || displayedVariations[index - 1].productId !== variation.productId;
                                const product = products.find(p => p._id === variation.productId);
                                const hasMultipleVariations = product && product.variations.length > 1;
                                const isExpanded = expandedProducts.has(variation.productId);

                                return (
                                    <tr key={`${variation.productId}-${variation.variationId}`} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
                                        <td className="p-4 align-middle border border-neutral-200">
                                            <div className="flex items-center gap-2">
                                                {isFirstVariation && hasMultipleVariations && (
                                                    <button
                                                        onClick={() => toggleProduct(variation.productId)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            {isExpanded ? (
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            ) : (
                                                                <polyline points="9 18 15 12 9 6"></polyline>
                                                            )}
                                                        </svg>
                                                    </button>
                                                )}
                                                <span>{variation.productId}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.variationId}</td>
                                        <td className="p-4 align-middle border border-neutral-200">
                                            <div className="flex flex-col gap-1">
                                                <span>{variation.productName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.sellerName}</td>
                                        <td className="p-4 border border-neutral-200">
                                            <div className="w-16 h-12 bg-white border border-neutral-200 rounded p-1 flex items-center justify-center mx-auto">
                                                <img
                                                    src={variation.productImage}
                                                    alt={variation.productName}
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/60x40?text=Img';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.brandName || '-'}</td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.category}</td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.subCategory}</td>
                                        <td className="p-4 align-middle border border-neutral-200">₹{variation.price.toFixed(2)}</td>
                                        <td className="p-4 align-middle border border-neutral-200">
                                            {variation.discPrice > 0 ? `₹${variation.discPrice.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="p-4 align-middle border border-neutral-200">{variation.variation}</td>
                                    </tr>
                                );
                            })}
                            {displayedVariations.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-neutral-400 border border-neutral-200">
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
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredVariations.length)} of {filteredVariations.length} entries
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
                        {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 border border-teal-600 rounded font-medium text-sm ${currentPage === page
                                    ? 'bg-teal-600 text-white'
                                    : 'text-teal-600 hover:bg-teal-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(displayTotalPages, prev + 1))}
                            disabled={currentPage === displayTotalPages}
                            className={`p-2 border border-teal-600 rounded ${currentPage === displayTotalPages
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


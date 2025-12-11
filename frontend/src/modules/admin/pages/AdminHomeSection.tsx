import { useState } from 'react';

interface HomeSection {
    id: number;
    sectionName: string;
    category: string;
    subcategory: string;
    city?: string;
    deliverableArea?: string;
    status: 'Published' | 'Unpublished';
    productSortBy: string;
    productLimit: number;
}

// Mock data matching the image
const INITIAL_HOME_SECTIONS: HomeSection[] = [
    {
        id: 1,
        sectionName: 'Personal care',
        category: 'Personal Care',
        subcategory: 'Face & Body Moisturizers',
        status: 'Published',
        productSortBy: 'Default',
        productLimit: 10,
    },
    {
        id: 2,
        sectionName: 'Party Essentials',
        category: 'Home Office',
        subcategory: 'Party Essentials',
        status: 'Published',
        productSortBy: 'Default',
        productLimit: 10,
    },
    {
        id: 3,
        sectionName: 'Pets Food & Care',
        category: 'Pet Care',
        subcategory: 'Dog Need',
        status: 'Published',
        productSortBy: 'Default',
        productLimit: 10,
    },
    {
        id: 4,
        sectionName: 'Chocolates',
        category: 'Tea Coffee',
        subcategory: 'Milk Drink',
        status: 'Published',
        productSortBy: 'Default',
        productLimit: 10,
    },
    {
        id: 5,
        sectionName: 'Ready in 2 Min',
        category: 'Instant Food',
        subcategory: 'Noodles',
        status: 'Published',
        productSortBy: 'Default',
        productLimit: 10,
    },
];

const CITIES = ['Select City', 'Mumbai', 'Delhi', 'Bangalore', 'Bhandara'];
const DELIVERABLE_AREAS = ['Select Deliverable Area', 'Area 1', 'Area 2', 'Area 3'];
const STATUS_OPTIONS = ['Select Status', 'Published', 'Unpublished'];
const PRODUCT_SORT_OPTIONS = ['Default', 'Price Low to High', 'Price High to Low', 'Newest', 'Oldest', 'Popular'];
const CATEGORIES = ['Select Category', 'Personal Care', 'Home Office', 'Pet Care', 'Tea Coffee', 'Instant Food', 'Organic & Premium', 'Masala Oil'];
const SUBCATEGORIES: Record<string, string[]> = {
    'Personal Care': ['Select SubCategory', 'Face & Body Moisturizers', 'Hair Care', 'Oral Care'],
    'Home Office': ['Select SubCategory', 'Party Essentials', 'Office Supplies'],
    'Pet Care': ['Select SubCategory', 'Dog Need', 'Cat Need', 'Pet Accessories'],
    'Tea Coffee': ['Select SubCategory', 'Milk Drink', 'Tea', 'Coffee'],
    'Instant Food': ['Select SubCategory', 'Noodles', 'Ready Meals'],
    'Organic & Premium': ['Select SubCategory', 'Organic Grains', 'Organic Spices'],
    'Masala Oil': ['Select SubCategory', 'Spices', 'Cooking Oils'],
};

export default function AdminHomeSection() {
    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Select Category');
    const [selectedSubCategory, setSelectedSubCategory] = useState('Select SubCategory');
    const [selectedCity, setSelectedCity] = useState('Select City');
    const [selectedDeliverableArea, setSelectedDeliverableArea] = useState('Select Deliverable Area');
    const [selectedStatus, setSelectedStatus] = useState('Select Status');
    const [productSortBy, setProductSortBy] = useState('Default');
    const [productLimit, setProductLimit] = useState('');
    
    const [homeSections, setHomeSections] = useState<HomeSection[]>(INITIAL_HOME_SECTIONS);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

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

    // Filter home sections
    let filteredSections = homeSections;

    // Sort sections
    if (sortColumn) {
        filteredSections = [...filteredSections].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'sectionName':
                    aValue = a.sectionName.toLowerCase();
                    bValue = b.sectionName.toLowerCase();
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                case 'subcategory':
                    aValue = a.subcategory.toLowerCase();
                    bValue = b.subcategory.toLowerCase();
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

    const totalPages = Math.ceil(filteredSections.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedSections = filteredSections.slice(startIndex, endIndex);

    const handleAddHomeSection = () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (selectedCategory === 'Select Category') {
            alert('Please select a category');
            return;
        }
        if (selectedSubCategory === 'Select SubCategory') {
            alert('Please select a subcategory');
            return;
        }
        if (!productLimit.trim()) {
            alert('Please enter product limit');
            return;
        }

        const productLimitNum = parseInt(productLimit);
        if (isNaN(productLimitNum) || productLimitNum < 1) {
            alert('Please enter a valid product limit');
            return;
        }

        if (editingSection) {
            // Update existing section
            setHomeSections(homeSections.map(section =>
                section.id === editingSection.id
                    ? {
                        ...section,
                        sectionName: title,
                        category: selectedCategory,
                        subcategory: selectedSubCategory,
                        city: selectedCity !== 'Select City' ? selectedCity : undefined,
                        deliverableArea: selectedDeliverableArea !== 'Select Deliverable Area' ? selectedDeliverableArea : undefined,
                        status: selectedStatus !== 'Select Status' ? selectedStatus as 'Published' | 'Unpublished' : section.status,
                        productSortBy,
                        productLimit: productLimitNum,
                    }
                    : section
            ));
            setEditingSection(null);
        } else {
            // Add new section
            const newSection: HomeSection = {
                id: homeSections.length > 0 ? Math.max(...homeSections.map(s => s.id)) + 1 : 1,
                sectionName: title,
                category: selectedCategory,
                subcategory: selectedSubCategory,
                city: selectedCity !== 'Select City' ? selectedCity : undefined,
                deliverableArea: selectedDeliverableArea !== 'Select Deliverable Area' ? selectedDeliverableArea : undefined,
                status: selectedStatus !== 'Select Status' ? selectedStatus as 'Published' | 'Unpublished' : 'Published',
                productSortBy,
                productLimit: productLimitNum,
            };
            setHomeSections([...homeSections, newSection]);
        }

        // Reset form
        setTitle('');
        setSelectedCategory('Select Category');
        setSelectedSubCategory('Select SubCategory');
        setSelectedCity('Select City');
        setSelectedDeliverableArea('Select Deliverable Area');
        setSelectedStatus('Select Status');
        setProductSortBy('Default');
        setProductLimit('');
    };

    const handleEdit = (section: HomeSection) => {
        setTitle(section.sectionName);
        setSelectedCategory(section.category);
        setSelectedSubCategory(section.subcategory);
        setSelectedCity(section.city || 'Select City');
        setSelectedDeliverableArea(section.deliverableArea || 'Select Deliverable Area');
        setSelectedStatus(section.status);
        setProductSortBy(section.productSortBy);
        setProductLimit(section.productLimit.toString());
        setEditingSection(section);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this home section?')) {
            setHomeSections(homeSections.filter(section => section.id !== id));
            if (editingSection?.id === id) {
                setEditingSection(null);
                // Reset form
                setTitle('');
                setSelectedCategory('Select Category');
                setSelectedSubCategory('Select SubCategory');
                setSelectedCity('Select City');
                setSelectedDeliverableArea('Select Deliverable Area');
                setSelectedStatus('Select Status');
                setProductSortBy('Default');
                setProductLimit('');
            }
        }
    };

    const availableSubCategories = selectedCategory !== 'Select Category' 
        ? (SUBCATEGORIES[selectedCategory] || ['Select SubCategory'])
        : ['Select SubCategory'];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Page Header */}
            <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-800">Home Section</h1>
                    <div className="text-sm text-blue-500">
                        <span className="text-blue-500 hover:underline cursor-pointer">Home</span>{' '}
                        <span className="text-neutral-400">/</span> Home Section
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Left Sidebar: Add Home Section Form */}
                    <div className="bg-gray-100 rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col">
                        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Home Section</h2>
                        
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter Title"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Select Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSelectedSubCategory('Select SubCategory');
                                    }}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Select SubCategory
                                </label>
                                <select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    disabled={selectedCategory === 'Select Category'}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none disabled:bg-gray-200 disabled:cursor-not-allowed"
                                >
                                    {availableSubCategories.map((subcat) => (
                                        <option key={subcat} value={subcat}>
                                            {subcat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Select City
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Select Deliverable Area
                                </label>
                                <select
                                    value={selectedDeliverableArea}
                                    onChange={(e) => setSelectedDeliverableArea(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {DELIVERABLE_AREAS.map((area) => (
                                        <option key={area} value={area}>
                                            {area}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Status?
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Product Sort By <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={productSortBy}
                                    onChange={(e) => setProductSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    {PRODUCT_SORT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Product Limit <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={productLimit}
                                    onChange={(e) => setProductLimit(e.target.value)}
                                    placeholder="Enter Product Limit"
                                    min="1"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleAddHomeSection}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium transition-colors"
                            >
                                {editingSection ? 'Update Home Section' : 'Add Home Section'}
                            </button>
                            {editingSection && (
                                <button
                                    onClick={() => {
                                        setEditingSection(null);
                                        setTitle('');
                                        setSelectedCategory('Select Category');
                                        setSelectedSubCategory('Select SubCategory');
                                        setSelectedCity('Select City');
                                        setSelectedDeliverableArea('Select Deliverable Area');
                                        setSelectedStatus('Select Status');
                                        setProductSortBy('Default');
                                        setProductLimit('');
                                    }}
                                    className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Section: View Home Sections Table */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
                        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                            <h2 className="text-lg font-semibold">View Home Sections</h2>
                        </div>

                        {/* Controls */}
                        <div className="p-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-600">Show</span>
                                <input
                                    type="number"
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="w-16 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                                />
                                <span className="text-sm text-neutral-600">entries</span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse border border-neutral-200">
                                <thead>
                                    <tr className="bg-neutral-50 text-xs font-bold text-neutral-800">
                                        <th 
                                            className="p-4 w-16 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            <div className="flex items-center justify-between">
                                                Sr No <SortIcon column="id" />
                                            </div>
                                        </th>
                                        <th 
                                            className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('sectionName')}
                                        >
                                            <div className="flex items-center justify-between">
                                                Section Name <SortIcon column="sectionName" />
                                            </div>
                                        </th>
                                        <th 
                                            className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('category')}
                                        >
                                            <div className="flex items-center justify-between">
                                                Section Category <SortIcon column="category" />
                                            </div>
                                        </th>
                                        <th 
                                            className="p-4 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            onClick={() => handleSort('subcategory')}
                                        >
                                            <div className="flex items-center justify-between">
                                                Section Subcategory <SortIcon column="subcategory" />
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
                                        <th className="p-4 border border-neutral-200">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedSections.map((section, index) => (
                                        <tr key={section.id} className="hover:bg-neutral-50 transition-colors text-sm text-neutral-700">
                                            <td className="p-4 align-middle border border-neutral-200">{startIndex + index + 1}</td>
                                            <td className="p-4 align-middle border border-neutral-200">{section.sectionName}</td>
                                            <td className="p-4 align-middle border border-neutral-200">{section.category}</td>
                                            <td className="p-4 align-middle border border-neutral-200">{section.subcategory}</td>
                                            <td className="p-4 align-middle border border-neutral-200">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    section.status === 'Published' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {section.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle border border-neutral-200">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(section)}
                                                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(section.id)}
                                                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedSections.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-neutral-400 border border-neutral-200">
                                                No home sections found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-4 sm:px-6 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            <div className="text-xs sm:text-sm text-neutral-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredSections.length)} of {filteredSections.length} entries
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
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-neutral-600 border-t border-neutral-200 bg-white">
                Copyright © 2025. Developed By{' '}
                <a href="#" className="text-blue-600 hover:underline">SpeeUp - 10 Minute App</a>
            </footer>
        </div>
    );
}


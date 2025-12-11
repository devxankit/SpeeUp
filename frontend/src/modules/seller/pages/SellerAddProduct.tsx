import React, { useState } from 'react';

export default function SellerAddProduct() {
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        subcategory: '',
        publish: 'No',
        popular: 'No',
        dealOfDay: 'No',
        brand: '',
        tags: '',
        smallDescription: '',
        seoTitle: '',
        seoKeywords: '',
        seoImageAlt: '',
        seoDescription: '',
        variationType: '',
        manufacturer: '',
        madeIn: '',
        tax: '',
        isReturnable: 'No',
        maxReturnDays: '',
        fssaiLicNo: '',
        totalAllowedQuantity: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.productName.trim()) {
            alert('Please enter a product name.');
            return;
        }
        if (!formData.category) {
            alert('Please select a category.');
            return;
        }
        
        // Handle form submission
        console.log('Form submitted:', formData);
        alert('Product added successfully!');
        // Reset form
        setFormData({
            productName: '',
            category: '',
            subcategory: '',
            publish: 'No',
            popular: 'No',
            dealOfDay: 'No',
            brand: '',
            tags: '',
            smallDescription: '',
            seoTitle: '',
            seoKeywords: '',
            seoImageAlt: '',
            seoDescription: '',
            variationType: '',
            manufacturer: '',
            madeIn: '',
            tax: '',
            isReturnable: 'No',
            maxReturnDays: '',
            fssaiLicNo: '',
            totalAllowedQuantity: '',
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
                            <h2 className="text-lg font-semibold">Product</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        placeholder="Enter Product Name"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="pet-care">Pet Care</option>
                                        <option value="sweet-tooth">Sweet Tooth</option>
                                        <option value="tea-coffee">Tea Coffee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select SubCategory</label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">Select Subcategory</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Product Publish Or Unpublish?</label>
                                    <select
                                        name="publish"
                                        value={formData.publish}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Make Product Popular?</label>
                                    <select
                                        name="popular"
                                        value={formData.popular}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Insert to Deal of the day?</label>
                                    <select
                                        name="dealOfDay"
                                        value={formData.dealOfDay}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select Brand</label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">Select Brand</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select Tags</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="Select or create tags"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-red-500 mt-1">This will help for search</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Product Small Description</label>
                                <textarea
                                    name="smallDescription"
                                    value={formData.smallDescription}
                                    onChange={handleChange}
                                    placeholder="Enter Product Small Description"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Content Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
                            <h2 className="text-lg font-semibold">SEO Content</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    name="seoTitle"
                                    value={formData.seoTitle}
                                    onChange={handleChange}
                                    placeholder="Enter SEO Title"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Keywords</label>
                                <input
                                    type="text"
                                    name="seoKeywords"
                                    value={formData.seoKeywords}
                                    onChange={handleChange}
                                    placeholder="Enter SEO Keywords"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Image Alt Text</label>
                                <input
                                    type="text"
                                    name="seoImageAlt"
                                    value={formData.seoImageAlt}
                                    onChange={handleChange}
                                    placeholder="Enter SEO Image Alt Text"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">SEO Description</label>
                                <textarea
                                    name="seoDescription"
                                    value={formData.seoDescription}
                                    onChange={handleChange}
                                    placeholder="Enter SEO Description"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Variation Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
                            <h2 className="text-lg font-semibold">Add Variation</h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Select Product Variation Type</label>
                                <select
                                    name="variationType"
                                    value={formData.variationType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                >
                                    <option value="">Select Product Type</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Add Other Details Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
                            <h2 className="text-lg font-semibold">Add Other Details</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Manufacturer</label>
                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        placeholder="Enter Manufacturer"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Made In</label>
                                    <input
                                        type="text"
                                        name="madeIn"
                                        value={formData.madeIn}
                                        onChange={handleChange}
                                        placeholder="Enter Made In"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select Tax</label>
                                    <select
                                        name="tax"
                                        value={formData.tax}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">Select Tax</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">is Returnable?</label>
                                    <select
                                        name="isReturnable"
                                        value={formData.isReturnable}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Max Return Days</label>
                                    <input
                                        type="number"
                                        name="maxReturnDays"
                                        value={formData.maxReturnDays}
                                        onChange={handleChange}
                                        placeholder="Enter Max Return Days"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">FSSAI Lic. No.</label>
                                    <input
                                        type="text"
                                        name="fssaiLicNo"
                                        value={formData.fssaiLicNo}
                                        onChange={handleChange}
                                        placeholder="Enter FSSAI Lic. No."
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Total allowed quantity</label>
                                    <input
                                        type="number"
                                        name="totalAllowedQuantity"
                                        value={formData.totalAllowedQuantity}
                                        onChange={handleChange}
                                        placeholder="Enter Total allowed quantit"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Keep blank if no such limit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Images Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
                            <h2 className="text-lg font-semibold">Add Images</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Product Main Image</label>
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-neutral-400">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <p className="text-sm text-neutral-600 font-medium">Upload Main Image</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Product Other Images</label>
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-neutral-400">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <p className="text-sm text-neutral-600 font-medium">Upload Other Product Images Here</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pb-6">
                        <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-sm"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


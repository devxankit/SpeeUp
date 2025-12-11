import React, { useState } from 'react';

export default function AdminBulkImport() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDownloadSample = () => {
        // Create a sample CSV file
        const sampleCSV = `Product Name *,Brand ID *,Category ID *,Subcategory ID,Description,Publish Status *,Popular Status *,Deal Of The Day Status *,Tax ID,Manufacturer,Made In,Is Returnable *,Maximum Return Days,Total Allowed Quantity *,FSSAI NO,Product variant title,Price *,Discounted Price,Stock *,Status *
Sample Product,1,2,3,Sample description,1,0,0,1,Sample Manufacturer,India,1,7,10,12345678909876,100Gm,100,80,50,1`;

        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_bulk_upload_sample.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleUpload = () => {
        if (!selectedFile) {
            alert('Please select a CSV file first');
            return;
        }
        // Handle file upload
        console.log('Uploading file:', selectedFile);
        alert('File upload functionality will be implemented');
    };

    const handleClear = () => {
        setSelectedFile(null);
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex-1">
                <div>
                    {/* Title Banner */}
                    <div className="bg-teal-600 text-white px-4 sm:px-6 py-4 rounded-t-lg">
                        <h1 className="text-2xl font-bold">Product Bulk Upload Form</h1>
                    </div>

                    {/* Instructions Section */}
                    <div className="bg-pink-50 border border-pink-200 px-4 sm:px-6 py-4 space-y-4">
                        <div className="bg-pink-100 border-l-4 border-pink-500 p-3">
                            <p className="text-sm font-semibold text-pink-800">
                                always download and use new sample file
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-neutral-700">
                            <p className="font-semibold">Steps to bulk upload:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Firstly, read Notes carefully.</li>
                                <li>Images will need to update later manually.</li>
                                <li>Create/ Edit .csv file for product as explain below:</li>
                            </ol>
                        </div>

                        <div className="space-y-3 text-sm text-neutral-700">
                            <p className="font-semibold">CSV Field Explanations:</p>
                            <div className="space-y-2 font-mono text-xs">
                                <p><span className="font-semibold">Product Name *</span> -&gt; Name of the product.</p>
                                <p><span className="font-semibold">Brand ID *</span> -&gt; Brand ID of the product (You can find Brand ID in Categories section).</p>
                                <p><span className="font-semibold">Category ID *</span> -&gt; Category ID of the product (You can find Category ID in Categories section).</p>
                                <p><span className="font-semibold">Subcategory ID</span> -&gt; Subcategory ID of the product (You can find Subcategory ID in Subcategories section).</p>
                                <p><span className="font-semibold">Description</span> -&gt; Description about product.</p>
                                <p><span className="font-semibold">Publish Status *</span> -&gt; 0 - Unpublish, 1 - Publish.</p>
                                <p><span className="font-semibold">Popular Status *</span> -&gt; 0 - Unpopular, 1 - Popular.</p>
                                <p><span className="font-semibold">Deal Of The Day Status *</span> -&gt; 0 - No, 1 - Yes.</p>
                                <p><span className="font-semibold">Tax ID</span> -&gt; Tax ID of the tax (You can find Tax ID in Subcategories section, Enter 0 if you don't want to use).</p>
                                <p><span className="font-semibold">Manufacturer</span> -&gt; Manufacturer of the product.</p>
                                <p><span className="font-semibold">Made In</span> -&gt; Product Made In.</p>
                                <p><span className="font-semibold">Is Returnable *</span> -&gt; 0 - No, 1 - Yes.</p>
                                <p><span className="font-semibold">Maximum Return Days</span> -&gt; If Is Returnable then only mention date in number (Ex: if product is can be return in 7 days so enter 7).</p>
                                <p><span className="font-semibold">Total Allowed Quantity *</span> -&gt; It is number of quantity user can add at a cart in single order (Ex: if you want to sell product limitedly per user then enter quantity</p>
                                <p><span className="font-semibold">FSSAI NO</span> -&gt; Fssai Number should be 14 numeric. (ex. 12345678909876). Leave it blank if don't want to add fssai no.</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-neutral-700">
                            <p className="font-semibold">-&gt; Add following columns for variants of products. you need to add this columns in continued (You can check example on sample file)</p>
                            <p className="font-semibold">-&gt; for example, If you want to add 3 variants then you need to add this column 3 times. Product must have 1 variant. You can add maximum 3 variant at a time.</p>
                            
                            <div className="space-y-2 font-mono text-xs ml-4">
                                <p><span className="font-semibold">Product variant title</span> -&gt; Enter Variation title Ex: 100Gm.</p>
                                <p><span className="font-semibold">Price *</span> -&gt; Price of the variant. (Must be greater than discounted price).</p>
                                <p><span className="font-semibold">Discounted Price</span> -&gt; Discounted Price of the variant 0 if no discount. (Must be less than price).</p>
                                <p><span className="font-semibold">Stock *</span> -&gt; Enter number of stocks (If stock is unlimited, enter 0).</p>
                                <p><span className="font-semibold">Status *</span> -&gt; Availability of the variant 0 - Sold out, 1 - Available.</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4">
                            <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Note</span> - Do not set empty field. if you have no value on specific column then add "0" (zero) in that column.
                            </p>
                        </div>
                    </div>

                    {/* CSV File Upload Section */}
                    <div className="bg-white border border-neutral-200 border-t-0 rounded-b-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4">CSV File</h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Select CSV File</label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer">
                                    <input
                                        id="csv-file-input"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="inline-block px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-200 transition-colors">
                                        Choose File
                                    </span>
                                </label>
                                <span className="text-sm text-neutral-500">
                                    {selectedFile ? selectedFile.name : 'No file chosen'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleDownloadSample}
                                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                Download Sample File
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-6 py-2.5 bg-neutral-400 hover:bg-neutral-500 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


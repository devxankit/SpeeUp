import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getOrderDetailById, SellerOrderDetail as SellerOrderDetailType } from '../data/mockData';
import jsPDF from 'jspdf';

export default function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;
  const orderDetail = orderId ? getOrderDetailById(orderId) : null;
  const [orderStatus, setOrderStatus] = useState<SellerOrderDetailType['status']>(
    orderDetail?.status || 'Out For Delivery'
  );

  // Update status when orderDetail changes
  useEffect(() => {
    if (orderDetail) {
      setOrderStatus(orderDetail.status);
    }
  }, [orderDetail]);

  if (!orderDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/seller')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    return `${day}${suffix} ${month}, ${year}`;
  };

  const handleExportPDF = () => {
    if (!orderDetail) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Header - Company Info
    doc.setFillColor(22, 163, 74); // Green color
    doc.rect(margin, yPos, contentWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SpeeUp - 10 Minute App', margin + 5, yPos + 10);
    
    yPos += 20;

    // Company Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SpeeUp - 10 Minute App', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('From: SpeeUp - 10 Minute App', margin, yPos);
    yPos += 6;
    doc.text('Phone: 8956656429', margin, yPos);
    yPos += 6;
    doc.text('Email: info@speeup.com', margin, yPos);
    yPos += 6;
    doc.text('Website: https://speeup.com', margin, yPos);
    yPos += 12;

    // Invoice Details (Right aligned)
    const rightX = pageWidth - margin;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDate(orderDetail.orderDate)}`, rightX, yPos - 30, { align: 'right' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #${orderDetail.invoiceNumber}`, rightX, yPos - 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${orderDetail.id}`, rightX, yPos - 14, { align: 'right' });
    doc.text(`Delivery Date: ${formatDate(orderDetail.deliveryDate)}`, rightX, yPos - 8, { align: 'right' });
    doc.text(`Time Slot: ${orderDetail.timeSlot}`, rightX, yPos - 2, { align: 'right' });
    
    // Status badge
    const statusWidth = doc.getTextWidth(orderStatus) + 8;
    doc.setFillColor(59, 130, 246); // Blue for status
    doc.roundedRect(rightX - statusWidth, yPos + 2, statusWidth, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(orderStatus, rightX - statusWidth / 2, yPos + 5.5, { align: 'center' });
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);

    // Draw a line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Table Header
    checkPageBreak(20);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    
    const colWidths = [
      contentWidth * 0.08,  // Sr. No.
      contentWidth * 0.25,  // Product
      contentWidth * 0.15,  // Sold By
      contentWidth * 0.08,  // Unit
      contentWidth * 0.12,  // Price
      contentWidth * 0.12,  // Tax
      contentWidth * 0.08,  // Qty
      contentWidth * 0.12,  // Subtotal
    ];

    let xPos = margin;
    const headers = ['Sr. No.', 'Product', 'Sold By', 'Unit', 'Price', 'Tax ₹ (%)', 'Qty', 'Subtotal'];
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPos + 7);
      xPos += colWidths[index];
    });

    yPos += 12;

    // Table Rows
    orderDetail.items.forEach((item) => {
      checkPageBreak(15);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      xPos = margin;
      const rowData = [
        item.srNo.toString(),
        item.product,
        item.soldBy,
        item.unit,
        `₹${item.price.toFixed(2)}`,
        `${item.tax.toFixed(2)} (${item.taxPercent.toFixed(2)}%)`,
        item.qty.toString(),
        `₹${item.subtotal.toFixed(2)}`,
      ];

      rowData.forEach((data, index) => {
        // Truncate long text
        const maxWidth = colWidths[index] - 4;
        let text = data;
        if (doc.getTextWidth(text) > maxWidth && index === 1) {
          // Truncate product name if too long
          while (doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
            text = text.slice(0, -1);
          }
          text += '...';
        }
        doc.text(text, xPos + 2, yPos + 5);
        xPos += colWidths[index];
      });

      // Draw row separator
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPos + 8, pageWidth - margin, yPos + 8);
      
      yPos += 10;
    });

    // Calculate totals
    const totalSubtotal = orderDetail.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalTax = orderDetail.items.reduce((sum, item) => sum + item.tax, 0);
    const grandTotal = totalSubtotal + totalTax;

    yPos += 5;
    checkPageBreak(30);

    // Totals Section
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - margin - 60, yPos, { align: 'right' });
    doc.text(`₹${totalSubtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    doc.text('Tax:', pageWidth - margin - 60, yPos, { align: 'right' });
    doc.text(`₹${totalTax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', pageWidth - margin - 60, yPos, { align: 'right' });
    doc.text(`₹${grandTotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;

    // Footer
    checkPageBreak(20);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Bill Generated by SpeeUp - 10 Minute App', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(8);
    doc.text('Copyright © 2025. Developed By SpeeUp - 10 Minute App', pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF
    const fileName = `Invoice_${orderDetail.invoiceNumber}_${orderDetail.id}.pdf`;
    doc.save(fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeClass = (status: SellerOrderDetailType['status']) => {
    switch (status) {
      case 'Out For Delivery':
        return 'bg-blue-600 text-white border border-blue-700';
      case 'Received':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Payment Pending':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Order Action Section */}
      <div className="bg-white mb-6 rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
          <h2 className="text-base sm:text-lg font-semibold">Order Action Section</h2>
        </div>
        <div className="bg-neutral-50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as SellerOrderDetailType['status'])}
                className="w-full sm:w-64 px-4 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Received">Received</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Export Invoice PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* View Order Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-3">
          <h2 className="text-base sm:text-lg font-semibold">View Order Details</h2>
        </div>
        <div className="bg-white px-4 sm:px-6 py-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
            {/* Left: Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div>
                  <div className="text-xs text-green-600 font-semibold">SpeeUp</div>
                  <div className="text-[10px] text-green-600">in 10 Minutes</div>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">SpeeUp - 10 Minute App</h1>
              <div className="text-sm text-neutral-600 mb-1">
                <span className="font-medium">From:</span> SpeeUp - 10 Minute App
              </div>
              <div className="text-sm text-neutral-600 space-y-1">
                <div>
                  <span className="font-medium">Phone:</span> 8956656429
                </div>
                <div>
                  <span className="font-medium">Email:</span> info@speeup.com
                </div>
                <div>
                  <span className="font-medium">Website:</span> https://speeup.com
                </div>
              </div>
            </div>

            {/* Right: Invoice Details */}
            <div className="flex-1 lg:text-right">
              <div className="text-sm text-neutral-600 mb-4">
                <span className="font-medium">Date:</span> {formatDate(orderDetail.orderDate)}
              </div>
              <div className="text-lg font-semibold text-neutral-900 mb-1">Invoice #{orderDetail.invoiceNumber}</div>
              <div className="text-sm text-neutral-600 mb-1">
                <span className="font-medium">Order ID:</span> {orderDetail.id}
              </div>
              <div className="text-sm text-neutral-600 mb-1">
                <span className="font-medium">Delivery Date:</span> {formatDate(orderDetail.deliveryDate)}
              </div>
              <div className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">Time Slot:</span> {orderDetail.timeSlot}
              </div>
              <div className="flex items-center gap-2 lg:justify-end">
                <span className="text-sm font-medium text-neutral-700">Order Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(orderStatus)}`}>
                  {orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full min-w-[800px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Sr. No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Sold By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Tax ₹ (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {orderDetail.items.map((item) => (
                  <tr key={item.srNo}>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.srNo}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.product}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{item.soldBy}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {item.tax.toFixed(2)} ({item.taxPercent.toFixed(2)}%)
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.qty}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 font-medium">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Generation Note */}
          <div className="border-t border-dashed border-neutral-300 pt-4">
            <p className="text-sm text-neutral-600 text-center">
              Bill Generated by SpeeUp - 10 Minute App
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 px-4 sm:px-6 text-center py-4 bg-neutral-100 rounded-lg">
        <p className="text-xs sm:text-sm text-neutral-600">
          Copyright © 2025. Developed By{' '}
          <span className="font-semibold text-teal-600">SpeeUp - 10 Minute App</span>
        </p>
      </footer>
    </div>
  );
}


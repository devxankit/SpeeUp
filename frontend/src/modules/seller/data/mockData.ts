export interface SellerDashboardStats {
  totalUser: number;
  totalCategory: number;
  totalSubcategory: number;
  totalProduct: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  soldOutProducts: number;
  lowStockProducts: number;
  orderDataDec2025: { date: string; value: number }[];
  orderData2025: { date: string; value: number }[];
}

export const getSellerDashboardStats = (): SellerDashboardStats => {
  // Mock data matching the image
  const orderDataDec2025 = [
    { date: '01-Dec', value: 0 },
    { date: '02-Dec', value: 0 },
    { date: '03-Dec', value: 0.2 },
    { date: '04-Dec', value: 1 },
    { date: '05-Dec', value: 0 },
    { date: '06-Dec', value: 0 },
    { date: '07-Dec', value: 0 },
    { date: '08-Dec', value: 0 },
    { date: '09-Dec', value: 0 },
    { date: '10-Dec', value: 0 },
    { date: '11-Dec', value: 0 },
    { date: '12-Dec', value: 0 },
    { date: '13-Dec', value: 0 },
    { date: '14-Dec', value: 0 },
    { date: '15-Dec', value: 0 },
    { date: '16-Dec', value: 0 },
    { date: '17-Dec', value: 0 },
    { date: '18-Dec', value: 0 },
    { date: '19-Dec', value: 0 },
    { date: '20-Dec', value: 0 },
    { date: '21-Dec', value: 0 },
    { date: '22-Dec', value: 0 },
    { date: '23-Dec', value: 0 },
    { date: '24-Dec', value: 0 },
    { date: '25-Dec', value: 0 },
    { date: '26-Dec', value: 0 },
    { date: '27-Dec', value: 0 },
    { date: '28-Dec', value: 0 },
    { date: '29-Dec', value: 0 },
    { date: '30-Dec', value: 0.1 },
    { date: '31-Dec', value: 0.2 },
  ];

  const orderData2025 = [
    { date: 'January', value: 2 },
    { date: 'February', value: 4 },
    { date: 'March', value: 16 },
    { date: 'April', value: 17 },
    { date: 'May', value: 16 },
    { date: 'June', value: 8 },
    { date: 'July', value: 19 },
    { date: 'August', value: 0 },
    { date: 'September', value: 0 },
    { date: 'October', value: 0 },
    { date: 'November', value: 0 },
    { date: 'December', value: 0 },
  ];

  return {
    totalUser: 734,
    totalCategory: 7,
    totalSubcategory: 17,
    totalProduct: 25,
    totalOrders: 521,
    completedOrders: 1,
    pendingOrders: 1,
    cancelledOrders: 1,
    soldOutProducts: 1,
    lowStockProducts: 3,
    orderDataDec2025,
    orderData2025,
  };
};

export interface OrderDetailItem {
  srNo: number;
  product: string;
  soldBy: string;
  unit: string;
  price: number;
  tax: number;
  taxPercent: number;
  qty: number;
  subtotal: number;
}

export interface SellerOrderDetail {
  id: number;
  invoiceNumber: string;
  orderDate: string;
  deliveryDate: string;
  timeSlot: string;
  status: 'Out For Delivery' | 'Received' | 'Payment Pending' | 'Cancelled';
  items: OrderDetailItem[];
}

// Helper function to convert date from MM/DD/YYYY to YYYY-MM-DD
const convertDate = (dateStr: string): string => {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const getOrderDetailById = (id: number): SellerOrderDetail | null => {
  // Order data from SellerOrders page
  const orderData: Record<number, { orderDate: string; deliveryDate: string; status: string; amount: number }> = {
    1: { orderDate: '01/15/2025', deliveryDate: '01/16/2025', status: 'On the way', amount: 340.00 },
    2: { orderDate: '01/14/2025', deliveryDate: '01/15/2025', status: 'Delivered', amount: 141.70 },
    3: { orderDate: '01/13/2025', deliveryDate: '01/14/2025', status: 'Pending', amount: 250.50 },
    4: { orderDate: '01/12/2025', deliveryDate: '01/13/2025', status: 'On the way', amount: 180.00 },
    5: { orderDate: '01/11/2025', deliveryDate: '01/12/2025', status: 'Delivered', amount: 420.75 },
    6: { orderDate: '01/10/2025', deliveryDate: '01/11/2025', status: 'Cancelled', amount: 150.00 },
    7: { orderDate: '01/09/2025', deliveryDate: '01/10/2025', status: 'Accepted', amount: 275.30 },
    8: { orderDate: '01/08/2025', deliveryDate: '01/09/2025', status: 'Pending', amount: 195.50 },
    9: { orderDate: '01/07/2025', deliveryDate: '01/08/2025', status: 'Delivered', amount: 320.00 },
    10: { orderDate: '01/06/2025', deliveryDate: '01/07/2025', status: 'On the way', amount: 210.25 },
    11: { orderDate: '01/05/2025', deliveryDate: '01/06/2025', status: 'Delivered', amount: 380.00 },
    12: { orderDate: '01/04/2025', deliveryDate: '01/05/2025', status: 'Accepted', amount: 165.75 },
    13: { orderDate: '12/04/2025', deliveryDate: '12/05/2025', status: 'Pending', amount: 290.00 },
    14: { orderDate: '12/05/2025', deliveryDate: '12/06/2025', status: 'On the way', amount: 450.50 },
    15: { orderDate: '12/05/2025', deliveryDate: '12/06/2025', status: 'Delivered', amount: 175.25 },
  };

  const order = orderData[id];
  if (!order) return null;

  // Map status from SellerOrders to SellerOrderDetail status
  const statusMap: Record<string, 'Out For Delivery' | 'Received' | 'Payment Pending' | 'Cancelled'> = {
    'On the way': 'Out For Delivery',
    'Delivered': 'Received',
    'Pending': 'Payment Pending',
    'Accepted': 'Out For Delivery',
    'Cancelled': 'Cancelled',
  };

  const orderStatus = statusMap[order.status] || 'Out For Delivery';
  const orderDateFormatted = convertDate(order.orderDate);
  const deliveryDateFormatted = convertDate(order.deliveryDate);

  // Generate items based on order amount
  // Create realistic item breakdowns
  const generateItems = (amount: number): OrderDetailItem[] => {
    const items: OrderDetailItem[] = [];
    const productList = [
      { name: 'Fresh Tomatoes', unit: '1 kg', basePrice: 80 },
      { name: 'Organic Onions', unit: '1 kg', basePrice: 60 },
      { name: 'Premium Basmati Rice', unit: '1 kg', basePrice: 120 },
      { name: 'Fresh Milk', unit: '1 L', basePrice: 65 },
      { name: 'Organic Potatoes', unit: '1 kg', basePrice: 45 },
      { name: 'Carrots', unit: '500 g', basePrice: 40 },
      { name: 'Capsicum', unit: '500 g', basePrice: 70 },
      { name: 'Cauliflower', unit: '1 pc', basePrice: 50 },
      { name: 'Brinjal', unit: '500 g', basePrice: 55 },
      { name: 'Cucumber', unit: '500 g', basePrice: 35 },
    ];

    let remainingAmount = amount;
    let srNo = 1;

    // Distribute items
    while (remainingAmount > 0 && srNo <= 5) {
      const product = productList[(id + srNo - 1) % productList.length];
      const maxQty = Math.floor(remainingAmount / (product.basePrice * 1.18));
      const qty = Math.max(1, Math.min(maxQty || 1, 3));
      const itemSubtotal = product.basePrice * qty;
      const itemTax = itemSubtotal * 0.18;
      const itemTotal = itemSubtotal + itemTax;

      if (itemTotal <= remainingAmount) {
        items.push({
          srNo: srNo++,
          product: product.name,
          soldBy: 'SpeeUp Store',
          unit: product.unit,
          price: product.basePrice,
          tax: itemTax,
          taxPercent: 18.00,
          qty: qty,
          subtotal: itemSubtotal,
        });
        remainingAmount -= itemTotal;
      } else {
        // Last item - adjust to match remaining amount
        const lastQty = Math.max(1, Math.floor(remainingAmount / (product.basePrice * 1.18)));
        const lastSubtotal = product.basePrice * lastQty;
        const lastTax = lastSubtotal * 0.18;
        items.push({
          srNo: srNo++,
          product: product.name,
          soldBy: 'SpeeUp Store',
          unit: product.unit,
          price: product.basePrice,
          tax: lastTax,
          taxPercent: 18.00,
          qty: lastQty,
          subtotal: lastSubtotal,
        });
        break;
      }
    }

    // If no items were added, add at least one
    if (items.length === 0) {
      const product = productList[id % productList.length];
      const qty = 1;
      const itemSubtotal = product.basePrice * qty;
      const itemTax = itemSubtotal * 0.18;
      items.push({
        srNo: 1,
        product: product.name,
        soldBy: 'SpeeUp Store',
        unit: product.unit,
        price: product.basePrice,
        tax: itemTax,
        taxPercent: 18.00,
        qty: qty,
        subtotal: itemSubtotal,
      });
    }

    return items;
  };

  const timeSlots = [
    '10:00 AM - 12:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '12:00 PM - 2:00 PM',
  ];

  return {
    id: id,
    invoiceNumber: `INV-2025-${String(id).padStart(3, '0')}`,
    orderDate: orderDateFormatted,
    deliveryDate: deliveryDateFormatted,
    timeSlot: timeSlots[id % timeSlots.length],
    status: orderStatus,
    items: generateItems(order.amount),
  };
};

export interface NewOrder {
  id: number;
  orderDate: string;
  status: 'Out For Delivery' | 'Received' | 'Payment Pending' | 'Cancelled';
  amount: number;
}

export const getNewOrders = (): NewOrder[] => {
  return [
    {
      id: 1,
      orderDate: '2025-01-15',
      status: 'Out For Delivery',
      amount: 340.00,
    },
    {
      id: 2,
      orderDate: '2025-01-14',
      status: 'Received',
      amount: 141.70,
    },
    {
      id: 3,
      orderDate: '2025-01-13',
      status: 'Payment Pending',
      amount: 250.50,
    },
    {
      id: 4,
      orderDate: '2025-01-12',
      status: 'Out For Delivery',
      amount: 180.00,
    },
    {
      id: 5,
      orderDate: '2025-01-11',
      status: 'Received',
      amount: 420.75,
    },
    {
      id: 6,
      orderDate: '2025-01-10',
      status: 'Cancelled',
      amount: 150.00,
    },
    {
      id: 7,
      orderDate: '2025-01-09',
      status: 'Out For Delivery',
      amount: 275.30,
    },
    {
      id: 8,
      orderDate: '2025-01-08',
      status: 'Payment Pending',
      amount: 195.50,
    },
    {
      id: 9,
      orderDate: '2025-01-07',
      status: 'Received',
      amount: 320.00,
    },
    {
      id: 10,
      orderDate: '2025-01-06',
      status: 'Out For Delivery',
      amount: 210.25,
    },
    {
      id: 11,
      orderDate: '2025-01-05',
      status: 'Received',
      amount: 380.00,
    },
    {
      id: 12,
      orderDate: '2025-01-04',
      status: 'Payment Pending',
      amount: 165.75,
    },
  ];
};



import { useState, useEffect } from 'react';

// Types
interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    marketPrice: number;
    weight: string;
    discount: number;
    stock?: number;
}

interface CartItem extends Product {
    quantity: number;
}

// Mock Data
const PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Maggi Masala 2 Minutes Instant Noodles',
        image: '/assets/product-aashirvaad-atta.jpg', // Placeholder since Maggi image not found
        price: 55.00,
        marketPrice: 60.00,
        weight: '100g',
        discount: 8,
        stock: 48
    },
    {
        id: '2',
        name: 'Maggi Masala 2 Minutes Instant Noodles',
        image: '/assets/product-act2-popcorn.jpg', // Placeholder
        price: 110.00,
        marketPrice: 120.00,
        weight: '200g',
        discount: 8
    },
    {
        id: '3',
        name: 'Conscious Food Desi A2 Ghee',
        image: '/assets/product-amul-butter.jpg', // Placeholder for Ghee
        price: 1400.00,
        marketPrice: 1521.00,
        weight: '1 ltr',
        discount: 8
    },
    {
        id: '4',
        name: 'Conscious Food Desi A2 Ghee',
        image: '/assets/product-amul-cheese.jpg', // Placeholder
        price: 3000.00,
        marketPrice: 3200.00,
        weight: '2 ltr',
        discount: 8
    },
    {
        id: '5',
        name: 'Daawat Rice',
        image: '/assets/category-atta-rice.png',
        price: 90.00,
        marketPrice: 110.00,
        weight: '1 kg',
        discount: 18
    },
    {
        id: '6',
        name: 'Maggi Mega Pack',
        image: '/assets/category-snacks.png',
        price: 120.00,
        marketPrice: 140.00,
        weight: '500g',
        discount: 14
    },
    {
        id: '7',
        name: 'Safal Green Peas',
        image: '/assets/category-fruits-veg.png',
        price: 95.00,
        marketPrice: 100.00,
        weight: '500g',
        discount: 5
    },
    {
        id: '8',
        name: 'Sumeru Coconut',
        image: '/assets/category-fruits-veg.png',
        price: 45.00,
        marketPrice: 50.00,
        weight: '1 pc',
        discount: 10
    }
];

export default function SellerPos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [additionalDiscount, setAdditionalDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [additionalCharges, setAdditionalCharges] = useState<{ name: string; amount: number }[]>([]);
    const [newChargeName, setNewChargeName] = useState('');
    const [newChargeAmount, setNewChargeAmount] = useState('');

    // Filter products
    const filteredProducts = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cart Functions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };


    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // Assuming tax inclusive or 0 for now as per image showing 0.00 or specific logic
    const discountVal = discountType === 'flat'
        ? additionalDiscount
        : (subtotal * additionalDiscount / 100);

    const additionalChargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);

    const total = subtotal + tax - discountVal + additionalChargesTotal;

    const addAdditionalCharge = () => {
        if (newChargeName && newChargeAmount) {
            const amount = parseFloat(newChargeAmount);
            if (!isNaN(amount) && amount > 0) {
                setAdditionalCharges([...additionalCharges, { name: newChargeName, amount }]);
                setNewChargeName('');
                setNewChargeAmount('');
            }
        }
    };

    const removeCharge = (index: number) => {
        setAdditionalCharges(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear the cart?')) {
            setCart([]);
            setAdditionalDiscount(0);
            setCustomerSearch('');
            setAdditionalCharges([]);
            setNewChargeName('');
            setNewChargeAmount('');
        }
    };

    // Key listeners for shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                document.getElementById('product-search')?.focus();
            } else if (e.key === 'F3') {
                e.preventDefault();
                document.getElementById('customer-search')?.focus();
            } else if (e.key === 'F8') {
                e.preventDefault();
                clearCart();
            } else if (e.key === 'F9') {
                e.preventDefault();
                if (cart.length === 0) {
                    alert('Cart is empty. Please add items to cart.');
                    return;
                }
                const orderData = {
                    customer: customerSearch || 'Walk-in Customer',
                    items: cart,
                    subtotal,
                    tax,
                    discount: discountVal,
                    additionalCharges: additionalChargesTotal,
                    total,
                    paymentMethod,
                    date: new Date().toISOString()
                };
                console.log('Order placed:', orderData);
                alert(`Order placed successfully!\nTotal: ₹${total.toFixed(2)}\nPayment Method: ${paymentMethod}`);
                setCart([]);
                setAdditionalDiscount(0);
                setCustomerSearch('');
                setAdditionalCharges([]);
                setNewChargeName('');
                setNewChargeAmount('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-neutral-100">
            {/* Top Header Strip within page */}
            <div className="flex justify-between items-center px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                <h1 className="text-xl font-medium text-neutral-800">POS System</h1>
                <div className="text-sm text-blue-500">
                    Dashboard <span className="text-neutral-400">/</span> POS
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden p-4 gap-4">
                {/* Left Panel: Products */}
                <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden min-w-[300px]">
                    {/* Products Header / Search */}
                    <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                        <h2 className="text-base font-medium text-neutral-700">Products</h2>
                        <div className="flex items-center gap-2 w-1/2">
                            <div className="relative flex-1">
                                <input
                                    id="product-search"
                                    type="text"
                                    placeholder="Search products... (F2)"
                                    className="w-full pl-3 pr-10 py-2 border border-neutral-300 rounded focus:outline-none focus:border-green-500 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="absolute right-0 top-0 bottom-0 px-3 bg-green-600 text-white rounded-r hover:bg-green-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded border border-neutral-200 p-2 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="relative aspect-square mb-2 bg-neutral-100 rounded overflow-hidden">
                                        {/* Discount Badge */}
                                        {product.discount > 0 && (
                                            <div className="absolute top-0 right-0 bg-pink-100 text-pink-600 border border-pink-200 text-xs font-bold px-1 py-0.5 rounded-bl">
                                                {product.discount}% OFF
                                            </div>
                                        )}
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-medium text-neutral-800 line-clamp-2 min-h-[2.5em]">
                                        {product.name}
                                    </h3>
                                    <div className="text-xs text-neutral-500 mt-1">{product.weight}</div>

                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-sm font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                                        {product.marketPrice > product.price && (
                                            <span className="text-xs text-neutral-400 line-through">₹{product.marketPrice.toFixed(2)}</span>
                                        )}
                                    </div>
                                    {product.stock && (
                                        <div className="mt-1 text-xs text-blue-500">Stock: {product.stock}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Cart */}
                <div className="w-full lg:w-[35%] xl:w-[400px] min-w-[320px] bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col h-full overflow-y-auto">
                    {/* Cart Header */}
                    <div className="flex-shrink-0 p-3 border-b border-neutral-200 flex justify-between items-center bg-white rounded-t-lg">
                        <h2 className="font-medium text-neutral-700">Cart</h2>
                        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                            Hold (F4)
                        </button>
                    </div>

                    {/* Customer Select */}
                    <div className="flex-shrink-0 p-4 border-b border-neutral-100">
                        <label className="block text-sm font-bold text-neutral-800 mb-1">Customer:</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    id="customer-search"
                                    type="text"
                                    placeholder="Search or add customer... (F3)"
                                    className="w-full px-3 py-2 bg-neutral-100 border-none rounded focus:ring-1 focus:ring-green-500 text-sm"
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                />
                            </div>
                            <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Cart Items List - Always Visible, No Scrolling */}
                    <div className="p-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                                    <span className="text-sm">Cart is empty</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-start border-b border-neutral-100 pb-2">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-neutral-800">{item.name}</div>
                                                <div className="text-xs text-neutral-500">₹{item.price} x {item.quantity}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-neutral-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    {/* Checkout Section - Fixed at Bottom */}
                    <div className="flex-shrink-0 bg-neutral-50 p-4 border-t border-neutral-200">
                            {/* Additional Discount */}
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-neutral-800 mb-1">Additional Discount:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={additionalDiscount}
                                        onChange={(e) => setAdditionalDiscount(Number(e.target.value))}
                                        className="flex-1 px-3 py-1.5 border border-neutral-300 rounded text-sm"
                                        placeholder="0"
                                    />
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                                        className="px-2 py-1.5 border border-neutral-300 rounded text-sm bg-white"
                                    >
                                        <option value="flat">₹ Flat</option>
                                        <option value="percentage">%</option>
                                    </select>
                                </div>
                            </div>

                            {/* Additional Charges */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-neutral-800 mb-2">Additional Charges:</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        placeholder="Charge name"
                                        className="flex-[2] px-3 py-2 bg-neutral-100 border-none rounded-l text-sm focus:ring-1 focus:ring-green-500"
                                        value={newChargeName}
                                        onChange={(e) => setNewChargeName(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        className="flex-1 px-3 py-2 bg-neutral-100 border-l border-white text-sm focus:ring-1 focus:ring-green-500"
                                        value={newChargeAmount}
                                        onChange={(e) => setNewChargeAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={addAdditionalCharge}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-r transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                </div>
                                {/* List of added charges - implicitly requested via function, showing them for UX */}
                                {additionalCharges.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {additionalCharges.map((charge, index) => (
                                            <div key={index} className="flex justify-between text-xs text-neutral-600 bg-neutral-50 p-1 rounded">
                                                <span>{charge.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>₹{charge.amount.toFixed(2)}</span>
                                                    <button onClick={() => removeCharge(index)} className="text-red-500 hover:text-red-700">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between text-neutral-800">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-800">
                                    <span>Tax:</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Discount:</span>
                                    <span>-₹{discountVal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-800">
                                    <span>Additional Charges:</span>
                                    <span>₹{additionalChargesTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-neutral-900 mt-2">
                                    <span>Total:</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-neutral-800 mb-2">Payment Method:</label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-100 border-none rounded text-sm appearance-none focus:ring-1 focus:ring-green-500"
                                >
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>UPI</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button 
                                    onClick={() => {
                                        if (cart.length === 0) {
                                            alert('Cart is empty. Please add items to cart.');
                                            return;
                                        }
                                        const orderData = {
                                            customer: customerSearch || 'Walk-in Customer',
                                            items: cart,
                                            subtotal,
                                            tax,
                                            discount: discountVal,
                                            additionalCharges: additionalChargesTotal,
                                            total,
                                            paymentMethod,
                                            date: new Date().toISOString()
                                        };
                                        console.log('Order placed:', orderData);
                                        alert(`Order placed successfully!\nTotal: ₹${total.toFixed(2)}\nPayment Method: ${paymentMethod}`);
                                        // Clear cart after successful order
                                        setCart([]);
                                        setAdditionalDiscount(0);
                                        setCustomerSearch('');
                                        setAdditionalCharges([]);
                                        setNewChargeName('');
                                        setNewChargeAmount('');
                                    }}
                                    disabled={cart.length === 0}
                                    className={`w-full text-white py-3 rounded text-sm font-medium flex justify-center items-center gap-2 shadow-sm transition-colors ${
                                        cart.length === 0 
                                            ? 'bg-neutral-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Place Order (F9)
                                </button>

                                <button
                                    id="clear-cart-btn"
                                    onClick={clearCart}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Clear Cart (F8)
                                </button>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

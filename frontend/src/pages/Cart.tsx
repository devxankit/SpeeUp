import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/button';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryFee = cart.total >= 199 ? 0 : 40;
  const platformFee = 2; // Example platform fee
  const totalAmount = cart.total + deliveryFee + platformFee;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.items.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-600 mb-6">Add some items to get started!</p>
        <Link to="/">
          <Button variant="default" size="lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-neutral-200 mb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-neutral-900">Your Basket</h1>
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-600 font-medium hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-600">Delivered in 10–15 mins</p>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-4 mb-4">
        {cart.items.map((item) => (
          <div
            key={item.product.id}
            className="bg-white rounded-lg border border-neutral-200 p-4"
          >
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl text-neutral-400">
                    {item.product.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                  {item.product.name}
                </h3>
                <p className="text-xs text-neutral-500 mb-2">{item.product.pack}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-bold text-neutral-900">
                    ₹{item.product.price}
                  </span>
                  {item.product.mrp && item.product.mrp > item.product.price && (
                    <span className="text-xs text-neutral-500 line-through">
                      ₹{item.product.mrp}
                    </span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 p-0 border-neutral-300 text-neutral-600 hover:border-green-600 hover:text-green-600"
                  >
                    −
                  </Button>
                  <span className="text-base font-semibold text-neutral-900 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 p-0 border-neutral-300 text-neutral-600 hover:border-green-600 hover:text-green-600"
                  >
                    +
                  </Button>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-neutral-900">
                      ₹{(item.product.price * item.quantity).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-neutral-400 hover:text-red-600 transition-colors self-start"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-24">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span className="font-medium">₹{cart.total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Platform Fee</span>
              <span className="font-medium">₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Delivery Charges</span>
              <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
              </span>
            </div>
            {cart.total < 199 && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Add ₹{(199 - cart.total).toFixed(0)} more for free delivery
              </div>
            )}
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-neutral-900">Total</span>
              <span className="text-xl font-bold text-neutral-900">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={handleCheckout}
              className="w-full"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


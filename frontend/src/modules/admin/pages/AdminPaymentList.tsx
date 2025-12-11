import { useState } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  apiKey?: string;
  secretKey?: string;
  status: 'Active' | 'InActive';
  hasApiKeys: boolean;
}

export default function AdminPaymentList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'cod',
      name: 'Cash on Delivery Payments',
      description: 'Using COD Save Service Tax.',
      status: 'Active',
      hasApiKeys: false,
    },
    {
      id: 'paypal',
      name: 'Paypal Payments',
      description: 'Online Payment',
      apiKey: '',
      secretKey: '',
      status: 'Active',
      hasApiKeys: true,
    },
    {
      id: 'razorpay',
      name: 'Razorpay Payments',
      description: '100% Secure Payment',
      apiKey: '',
      secretKey: '',
      status: 'Active',
      hasApiKeys: true,
    },
    {
      id: 'paystack',
      name: 'Paystack Payments',
      description: '100% Secure Payment',
      apiKey: '',
      secretKey: '',
      status: 'Active',
      hasApiKeys: true,
    },
    {
      id: 'cashfree',
      name: 'Cash Free Payments',
      description: '100% Secure Payment',
      apiKey: '',
      secretKey: '',
      status: 'Active',
      hasApiKeys: true,
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: '100% Secure Payment',
      apiKey: '',
      secretKey: '',
      status: 'InActive',
      hasApiKeys: true,
    },
  ]);

  const handleUpdate = (id: string, field: string, value: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    );
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'InActive') => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, status: newStatus } : method
      )
    );
  };

  const handleUpdatePaymentMethod = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method) {
      alert(`${method.name} updated successfully!`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl font-semibold text-neutral-800">Payment Method</h1>
        <div className="text-sm text-neutral-600">
          <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">Payment Method</span>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="bg-teal-600 px-4 sm:px-6 py-3">
              <h2 className="text-white text-lg font-semibold">{method.name}</h2>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={method.description}
                  onChange={(e) => handleUpdate(method.id, 'description', e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-neutral-50 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* API Key (if applicable) */}
              {method.hasApiKeys && (
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2">
                    API Key/ Client Id/ Public Key
                  </label>
                  <input
                    type="text"
                    value={method.apiKey || ''}
                    onChange={(e) => handleUpdate(method.id, 'apiKey', e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-neutral-50 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}

              {/* Secret Key (if applicable) */}
              {method.hasApiKeys && (
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2">
                    Secret Key/ Client Secret
                  </label>
                  <input
                    type="password"
                    value={method.secretKey || ''}
                    onChange={(e) => handleUpdate(method.id, 'secretKey', e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-neutral-50 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  Status
                </label>
                <select
                  value={method.status}
                  onChange={(e) => handleStatusChange(method.id, e.target.value as 'Active' | 'InActive')}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>

              {/* Update Button */}
              <button
                onClick={() => handleUpdatePaymentMethod(method.id)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors"
              >
                Update Payment Method
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4">
        Copyright © 2025. Developed By{' '}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          Appzeto - 10 Minute App
        </a>
      </div>
    </div>
  );
}


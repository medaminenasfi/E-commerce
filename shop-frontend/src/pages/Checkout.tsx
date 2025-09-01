import React from 'react';
import { useCart } from '../contexts/CartContext';
import CheckoutForm from '../components/CheckoutForm';

const Checkout: React.FC = () => {
  const { cart } = useCart();

  const handleCheckout = (data: any) => {
    console.log('Checkout data:', data);
    // Implement checkout logic here
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
            <p className="text-gray-600">Please add items to your cart before checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm onSubmit={handleCheckout} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.variantSku}`} className="flex justify-between">
                    <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {cart.couponCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupon ({cart.couponCode})</span>
                      <span className="text-green-600">-${cart.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${cart.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

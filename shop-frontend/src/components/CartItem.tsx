import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from './QuantityStepper';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (quantity: number) => {
    updateQuantity(item.productId, item.variantSku, quantity);
  };

  const handleRemove = () => {
    removeItem(item.productId, item.variantSku);
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
      <div className="flex-shrink-0">
        <img
          src={item.image || '/placeholder-product.jpg'}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-md"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
        <p className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <QuantityStepper
          quantity={item.quantity}
          onQuantityChange={handleQuantityChange}
          min={1}
          max={99}
        />
        
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${item.total.toFixed(2)}</p>
        </div>
        
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 p-2"
          aria-label="Remove item"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

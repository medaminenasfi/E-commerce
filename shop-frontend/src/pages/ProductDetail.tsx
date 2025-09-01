import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from '../components/QuantityStepper';
import api from '../api/axios';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (product && product.variants[selectedVariant]) {
      const variant = product.variants[selectedVariant];
      addItem({
        productId: product._id,
        variantSku: variant.sku,
        name: product.name,
        price: variant.price,
        quantity,
        image: product.images[0],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-96 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded w-3/4"></div>
              <div className="bg-gray-300 h-6 rounded w-1/2"></div>
              <div className="bg-gray-300 h-4 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const variant = product.variants[selectedVariant];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="p-8">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="mt-4 flex space-x-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.brand && (
                  <p className="text-lg text-gray-600 mb-2">Brand: {product.brand}</p>
                )}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">(4.5)</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${variant.price.toFixed(2)}
                  </span>
                  {variant.comparePrice && variant.comparePrice > variant.price && (
                    <span className="text-xl text-gray-400 line-through">
                      ${variant.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-6">{product.description}</p>
              </div>

              {/* Variant Selection */}
              {product.variants.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Select Variant</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant.sku}
                        onClick={() => setSelectedVariant(index)}
                        className={`p-3 border rounded-lg text-left ${
                          selectedVariant === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-gray-600">${variant.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <QuantityStepper
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      min={1}
                      max={99}
                    />
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Heart className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {variant.weight && <p>Weight: {variant.weight} kg</p>}
                  {variant.dimensions && (
                    <p>
                      Dimensions: {variant.dimensions.length} × {variant.dimensions.width} × {variant.dimensions.height} cm
                    </p>
                  )}
                  {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                    <div>
                      <p className="font-medium">Attributes:</p>
                      <div className="ml-4">
                        {Object.entries(variant.attributes).map(([key, value]) => (
                          <p key={key}>
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

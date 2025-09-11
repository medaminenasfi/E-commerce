import React from "react";

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-500 text-white text-center py-10">
        <h1 className="text-4xl font-bold">Welcome to Our Store</h1>
        <p className="mt-2 text-lg">Discover the best products and deals!</p>
      </div>

      {/* Promotions / Banners */}
      <div className="mt-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x150"
              alt="Promotion 1"
              className="rounded-md"
            />
            <h3 className="mt-2 text-lg font-bold">Promotion 1</h3>
            <p className="text-sm text-gray-600">Save up to 50% on select items!</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x150"
              alt="Promotion 2"
              className="rounded-md"
            />
            <h3 className="mt-2 text-lg font-bold">Promotion 2</h3>
            <p className="text-sm text-gray-600">Buy one, get one free!</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x150"
              alt="Promotion 3"
              className="rounded-md"
            />
            <h3 className="mt-2 text-lg font-bold">Promotion 3</h3>
            <p className="text-sm text-gray-600">Free shipping on orders over $50!</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mt-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((product) => (
            <div
              key={product}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <img
                src="https://via.placeholder.com/200"
                alt={`Product ${product}`}
                className="rounded-md"
              />
              <h3 className="mt-2 text-lg font-bold">Product {product}</h3>
              <p className="text-sm text-gray-600">$19.99</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
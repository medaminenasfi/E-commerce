import Cart, {  } from '../models/Cart';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export const getCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

export const addToCart = async (userId: string, productId: string, quantity: number) => {
  const cart = await getCart(userId);
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity });
  }
  await cart.save();
  return cart;
};

export const removeFromCart = async (userId: string, productId: string) => {
  console.log('Removing product from cart:', { userId, productId }); // Log input data
  const cart = await getCart(userId);
  console.log('Cart before removal:', cart.items); // Log cart items before removal

  const productObjectId = new mongoose.Types.ObjectId(productId); // Convert productId to ObjectId
  const initialItemCount = cart.items.length;
  cart.items = cart.items.filter(item => !item.product.equals(productObjectId)); // Use equals for ObjectId comparison

  const result = await cart.save(); // Save the updated cart
  console.log('Cart after removal:', cart.items); // Log cart items after removal
  console.log('Save operation result:', result); // Log save operation result

  const wasRemoved = initialItemCount > cart.items.length; // Check if an item was removed
  return { cart, wasRemoved };
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
  console.log('Updating product quantity in cart:', { userId, productId, quantity }); // Log input data
  const cart = await getCart(userId);
  console.log('Cart before update:', cart.items); // Log cart items before update

  const productObjectId = new mongoose.Types.ObjectId(productId); // Convert productId to ObjectId
  const item = cart.items.find(item => item.product.equals(productObjectId)); // Use equals for ObjectId comparison

  if (item) {
    console.log('Product found in cart:', item); // Log the found item
    item.quantity = quantity; // Update the quantity
    await cart.save(); // Save the updated cart
    console.log('Cart after update:', cart.items); // Log cart items after update
    return { cart, success: true };
  } else {
    console.log('Product not found in cart'); // Log if product is not found
    return { cart, success: false };
  }
};

export const clearCart = async (userId: string) => {
  console.log('Clearing cart for user:', userId); // Log user ID
  const cart = await getCart(userId);
  console.log('Cart before clearing:', cart.items); // Log cart items before clearing
  cart.items = []; // Clear the cart
  const result = await cart.save(); // Save the updated cart
  console.log('Cart after clearing:', cart.items); // Log cart items after clearing
  console.log('Save operation result:', result); // Log save operation result
  const wasCleared = cart.items.length === 0; // Check if the cart was cleared
  return { cart, wasCleared };
};

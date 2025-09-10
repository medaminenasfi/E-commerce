import Wishlist from '../models/Wishlist';
import mongoose from 'mongoose';

export const getWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

export const addToWishlist = async (userId: string, productId: string) => {
  const wishlist = await getWishlist(userId);
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const itemExists = wishlist.items.some(item => item.product.equals(productObjectId));

  if (!itemExists) {
    wishlist.items.push({ product: productObjectId });
    await wishlist.save();
  }

  return wishlist;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await getWishlist(userId);
  const productObjectId = new mongoose.Types.ObjectId(productId);
  wishlist.items = wishlist.items.filter(item => !item.product.equals(productObjectId));
  await wishlist.save();
  return wishlist;
};

export const listWishlistItems = async (userId: string) => {
  const wishlist = await getWishlist(userId);
  return wishlist.items;
};

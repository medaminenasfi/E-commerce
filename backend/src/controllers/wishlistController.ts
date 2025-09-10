import { Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlistService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const items = await wishlistService.listWishlistItems(req.user!.userId);
    if (items.length === 0) {
      res.json({ message: 'Wishlist is empty', items: [] }); // Return empty message
    } else {
      res.json(items); // Return wishlist items
    }
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.addToWishlist(req.user!.userId, productId);
    res.json({ message: 'Item added to wishlist successfully', wishlist }); // Return success message
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.removeFromWishlist(req.user!.userId, productId);
    const itemExists = wishlist.items.some(item => item.product.toString() === productId);

    if (!itemExists) {
      res.json({ message: 'Item removed successfully', wishlist }); // Return success message
    } else {
      res.status(400).json({ message: 'Item not found in wishlist' }); // Return error message
    }
  } catch (err) {
    next(err);
  }
};

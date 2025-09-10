import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { Order } from '../models/Order';
import Wishlist, { IWishlist } from '../models/Wishlist';
import { Product } from '../models/Product';

const router = Router();

// Order History
router.get('/dashboard/orders', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order history', error });
  }
});

// Wishlist Management
router.get('/dashboard/wishlist', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId }).populate('items');
    res.status(200).json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error });
  }
});

// Reviews Management
router.get('/dashboard/reviews', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Product.find({ 'reviews.user': userId }, { reviews: 1 });
    const userReviews = products.flatMap(product => product.reviews.filter(review => review.user.toString() === userId));
    res.status(200).json({ reviews: userReviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error });
  }
});

export default router;
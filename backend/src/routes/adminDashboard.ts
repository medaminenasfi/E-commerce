import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { Order } from '../models/Order';
import { User } from '../models/User';
import Cart, { ICart } from '../models/Cart';

const router = Router();

// Sales Statistics
router.get('/dashboard/sales', authenticate, isAdmin, async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalOrders = await Order.countDocuments();
    const bestProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
    res.status(200).json({ totalRevenue: totalRevenue[0]?.total || 0, totalOrders, bestProducts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales statistics', error });
  }
});

// User Activity & Cart Statistics
router.get('/dashboard/users', authenticate, isAdmin, async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const totalCarts = await Cart.countDocuments();
    const abandonedCarts = await Cart.countDocuments({ items: { $exists: true, $not: { $size: 0 } }, updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    res.status(200).json({ activeUsers, totalCarts, abandonedCarts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user activity statistics', error });
  }
});

// Platform Performance
router.get('/dashboard/performance', authenticate, isAdmin, async (req, res) => {
  try {
    // Placeholder for performance metrics
    res.status(200).json({ message: 'Platform performance metrics not implemented yet' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch platform performance metrics', error });
  }
});

export default router;
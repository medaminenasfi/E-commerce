import express from 'express';
import {
  placeOrder,
  trackOrder,
  cancelOrder,
  adminViewOrders,
  adminUpdateOrder,
} from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';

const router = express.Router();

// User routes
router.post('/', authenticate, placeOrder);
router.get('/:id', authenticate, trackOrder);
router.delete('/:id', authenticate, cancelOrder);

// Admin routes
router.get('/admin', authenticate, isAdmin, adminViewOrders);
router.patch('/admin/:id', authenticate, isAdmin, adminUpdateOrder);

export default router;

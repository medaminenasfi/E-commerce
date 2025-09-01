import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { validateBody, validateParams } from '../middlewares/validation';
import { optionalAuth } from '../middlewares/auth';
import { cartSession } from '../middlewares/cart';
import { z } from 'zod';
import { addCartItemSchema, updateCartItemSchema, applyCouponSchema } from '../utils/validation';

const router = Router();

// Apply cart session middleware to all routes
router.use(cartSession);

// Optional authentication for all cart routes
router.use(optionalAuth);

// Cart management routes
router.get('/', cartController.getCart);

router.post('/items', validateBody(addCartItemSchema), cartController.addItem);

router.patch(
  '/items/:itemId',
  validateParams(z.object({ itemId: z.string() })),
  validateBody(updateCartItemSchema),
  cartController.updateItem
);

router.delete(
  '/items/:itemId',
  validateParams(z.object({ itemId: z.string() })),
  cartController.removeItem
);

router.post('/apply-coupon', validateBody(applyCouponSchema), cartController.applyCoupon);
router.delete('/remove-coupon', cartController.removeCoupon);
router.delete('/clear', cartController.clearCart);
router.get('/validate', cartController.validateCart);

export default router;

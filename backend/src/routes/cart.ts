import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart); // View cart
router.post('/add', cartController.addToCart); // Add product to cart
router.put('/update', cartController.updateCartItem); // Update product quantity
router.delete('/remove', cartController.removeFromCart); // Remove product from cart
router.delete('/clear', cartController.clearCart); // Clear cart

export default router;

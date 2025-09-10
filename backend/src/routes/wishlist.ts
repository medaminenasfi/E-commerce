import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist); // List wishlist items
router.post('/add', wishlistController.addToWishlist); // Add item to wishlist
router.delete('/remove', wishlistController.removeFromWishlist); // Remove item from wishlist

export default router;

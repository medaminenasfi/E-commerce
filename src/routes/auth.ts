import { Router } from 'express';
import { validateBody } from '../middlewares/validation';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema, updateProfileSchema } from '../utils/validation';
import { authenticate } from '../middlewares/auth';
import { authController } from '../controllers/authController';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);
router.post('/merge-cart', authenticate, authController.mergeCart);

export default router;

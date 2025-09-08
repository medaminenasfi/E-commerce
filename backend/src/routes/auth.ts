
import { Router } from 'express';
import { validateBody } from '../middlewares/validation';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema, updateProfileSchema } from '../utils/validation';
import { authenticate } from '../middlewares/auth';
import { authController } from '../controllers/authController';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/errorHandler';

const router = Router();

// Delete own account
router.delete('/me', authenticate, async (req: AuthenticatedRequest, res) => {
	const userId = req.user?.userId;
	if (!userId) {
		return res.status(401).json({
			error: {
				code: 'AUTHENTICATION_ERROR',
				message: 'Authentication required',
			},
		});
	}
	const user = await User.findByIdAndDelete(userId);
	if (!user) {
		return res.status(404).json({
			error: {
				code: 'NOT_FOUND_ERROR',
				message: 'User not found',
			},
		});
	}
	res.status(200).json({ message: 'Account deleted successfully' });
});

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

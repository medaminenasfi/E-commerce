import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { User } from '../models/User';

const router = Router();

// GET all users (admin only)
router.get('/users', authenticate, isAdmin, async (_req, res) => {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ users });
});

// DELETE a user by id (admin only)
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({
            error: {
                code: 'NOT_FOUND_ERROR',
                message: 'User not found',
            },
        });
    }
    res.status(200).json({ message: 'User deleted successfully' });
});

export default router;

// Ban a user (admin only)
router.patch('/users/:id/ban', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { banned: true }, { new: true });
    if (!user) {
        return res.status(404).json({
            error: {
                code: 'NOT_FOUND_ERROR',
                message: 'User not found',
            },
        });
    }
    res.status(200).json({ message: 'User banned successfully', user });
});

// Unban a user (admin only)
router.patch('/users/:id/unban', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { banned: false }, { new: true });
    if (!user) {
        return res.status(404).json({
            error: {
                code: 'NOT_FOUND_ERROR',
                message: 'User not found',
            },
        });
    }
    res.status(200).json({ message: 'User unbanned successfully', user });
});

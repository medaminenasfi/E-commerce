import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { validateBody } from '../middlewares/validation';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';
import { Category } from '../models/Category';

const router = Router();

// Get all categories (public)
router.get('/', async (_req, res) => {
  const categories = await Category.find();
  res.status(200).json({ categories });
});

// Add category (admin only)
router.post('/', authenticate, isAdmin, validateBody(createCategorySchema), async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).json({ message: 'Category created', category });
});

// Update category (admin only)
router.put('/:id', authenticate, isAdmin, validateBody(updateCategorySchema), async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!category) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Category not found' },
    });
  }
  res.status(200).json({ message: 'Category updated', category });
});

// Delete category (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Category not found' },
    });
  }
  res.status(200).json({ message: 'Category deleted' });
});

export default router;

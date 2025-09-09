

import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/admin';
import { validateBody } from '../middlewares/validation';
import { createProductSchema, updateProductSchema } from '../utils/validation';
import { Product } from '../models/Product';
import { AuthenticatedRequest } from '../middlewares/errorHandler';

const router = Router();

// Add a review to a product (user only)
router.post('/:id/reviews', authenticate, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' },
    });
  }
  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Comment is required' },
    });
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  product.reviews.push({
    user: new (require('mongoose')).Types.ObjectId(req.user!.userId),
    rating,
    comment,
    createdAt: new Date(),
  });
  await product.save();
  res.status(201).json({ message: 'Review added', reviews: product.reviews });
});

// Update a review (user only)
router.put('/:productId/reviews/:reviewId', authenticate, async (req: AuthenticatedRequest, res) => {
  const { productId, reviewId } = req.params;
  const { rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' } });
  }
  const reviewIndex = product.reviews.findIndex(r => r._id?.toString() === reviewId);
  if (reviewIndex === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Review not found' } });
  }
  const review = product.reviews[reviewIndex];
  if (review.user.toString() !== req.user!.userId) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only update your own review' } });
  }
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  await product.save();
  res.status(200).json({ message: 'Review updated', review });
});

// Delete a review (user only)
router.delete('/:productId/reviews/:reviewId', authenticate, async (req: AuthenticatedRequest, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' } });
  }
  const reviewIndex = product.reviews.findIndex(r => r._id?.toString() === reviewId);
  if (reviewIndex === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Review not found' } });
  }
  const review = product.reviews[reviewIndex];
  if (review.user.toString() !== req.user!.userId) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only delete your own review' } });
  }
  product.reviews.splice(reviewIndex, 1);
  await product.save();
  res.status(200).json({ message: 'Review deleted' });
});

// Admin delete any review
router.delete('/:productId/reviews/:reviewId/admin', authenticate, isAdmin, async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' } });
  }
  const reviewIndex = product.reviews.findIndex(r => r._id?.toString() === reviewId);
  if (reviewIndex === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', message: 'Review not found' } });
  }
  product.reviews.splice(reviewIndex, 1);
  await product.save();
  res.status(200).json({ message: 'Review deleted by admin' });
});
// Add a review to a product (user only)
router.post('/:id/reviews', authenticate, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Rating must be between 1 and 5' },
    });
  }
  if (!comment || typeof comment !== 'string') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Comment is required' },
    });
  }
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  product.reviews.push({
    user: new (require('mongoose')).Types.ObjectId(req.user!.userId),
    rating,
    comment,
    createdAt: new Date(),
  });
  await product.save();
  res.status(201).json({ message: 'Review added', reviews: product.reviews });
});

// Get all products (public)
router.get('/', async (_req, res) => {
  const products = await Product.find();
  res.status(200).json({ products });
});

// Get product details (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  res.status(200).json({ product });
});

// Add product (admin only)
router.post('/', authenticate, isAdmin, validateBody(createProductSchema), async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json({ message: 'Product created', product });
});

// Update product (admin only)
router.put('/:id', authenticate, isAdmin, validateBody(updateProductSchema), async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  res.status(200).json({ message: 'Product updated', product });
});

// Delete product (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  res.status(200).json({ message: 'Product deleted' });
});

// Update product availability (admin only)
router.patch('/:id/availability', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const product = await Product.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!product) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND_ERROR', message: 'Product not found' },
    });
  }
  res.status(200).json({ message: 'Product availability updated', product });
});

export default router;

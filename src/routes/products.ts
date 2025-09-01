import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { uploadMultipleToCloudinary } from '../middlewares/upload';
import { z } from 'zod';
import { 
  createProductSchema, 
  updateProductSchema, 
  productFilterSchema 
} from '../utils/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/', validateQuery(productFilterSchema), productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', validateParams(z.object({ id: z.string() })), productController.getProductById);

// Protected routes (authentication required)
router.use(authenticate);

// Admin/Employer only routes
router.post(
  '/',
  requireRole(['employer', 'admin']),
  uploadMultipleToCloudinary,
  validateBody(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  requireRole(['employer', 'admin']),
  validateParams(z.object({ id: z.string() })),
  validateBody(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  requireRole(['employer', 'admin']),
  validateParams(z.object({ id: z.string() })),
  productController.deleteProduct
);

// Image management routes (Admin/Employer only)
router.post(
  '/:id/images',
  requireRole(['employer', 'admin']),
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({
    imageUrls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image URL is required')
  })),
  productController.addProductImages
);

router.delete(
  '/:id/images',
  requireRole(['employer', 'admin']),
  validateParams(z.object({ id: z.string() })),
  validateBody(z.object({
    imageUrl: z.string().url('Invalid image URL')
  })),
  productController.removeProductImage
);

export default router;

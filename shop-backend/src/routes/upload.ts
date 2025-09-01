import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { uploadMultipleToCloudinary } from '../middlewares/upload';
import { HTTP_STATUS } from '../utils/errors';

const router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Admin/Employer only routes
router.post(
  '/products',
  requireRole(['employer', 'admin']),
  uploadMultipleToCloudinary,
  (req, res) => {
    res.status(HTTP_STATUS.OK).json({
      message: 'Files uploaded successfully',
      data: {
        files: req.body.uploadedFiles,
        imageUrls: req.body.imageUrls,
      },
    });
  }
);

export default router;

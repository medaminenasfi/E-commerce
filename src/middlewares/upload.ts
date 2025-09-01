import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: any, cb: any) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only image files are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
});

// Middleware to handle file uploads to Cloudinary
export const uploadToCloudinary = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ValidationError('No files uploaded'));
    }

    const uploadPromises = req.files.map(async (file: any) => {
      try {
        // Convert buffer to base64
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64String, {
          folder: 'products',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Resize large images
            { quality: 'auto:good' }, // Optimize quality
          ],
        });

        return {
          originalName: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
        };
      } catch (error: any) {
        throw new ValidationError(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    // Add upload results to request body
    req.body.uploadedFiles = uploadResults;
    req.body.imageUrls = uploadResults.map((file: any) => file.url);
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to delete files from Cloudinary
export const deleteFromCloudinary = async (publicIds: string[]) => {
  try {
    const deletePromises = publicIds.map(async (publicId) => {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Failed to delete ${publicId}:`, error);
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting files from Cloudinary:', error);
  }
};

// Single file upload middleware
export const uploadSingle = upload.single('image');

// Multiple files upload middleware
export const uploadMultiple = upload.array('images', 10);

// Combined middleware for single file upload with Cloudinary
export const uploadSingleToCloudinary = [uploadSingle, uploadToCloudinary];

// Combined middleware for multiple files upload with Cloudinary
export const uploadMultipleToCloudinary = [uploadMultiple, uploadToCloudinary];

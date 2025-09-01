import { Response } from 'express';
import { productService } from '../services/productService';
import { AuthenticatedRequest } from '../middlewares/errorHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { HTTP_STATUS } from '../utils/errors';
import { ProductFilterInput } from '../utils/validation';

export class ProductController {
  getProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const filters: ProductFilterInput = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      categoryId: req.query.categoryId as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isFeatured: req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
      search: req.query.search as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    };

    const result = await productService.getProducts(filters);

    res.status(HTTP_STATUS.OK).json({
      message: 'Products retrieved successfully',
      data: {
        products: result.products,
        pagination: {
          page: result.page,
          limit: filters.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    });
  });

  getProductById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  });

  getProductBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product retrieved successfully',
      data: product,
    });
  });

  createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await productService.createProduct(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Product created successfully',
      data: product,
    });
  });

  updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product updated successfully',
      data: product,
    });
  });

  deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product deleted successfully',
    });
  });

  addProductImages = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Image URLs array is required',
      });
      return;
    }

    const product = await productService.addProductImages(id, imageUrls);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product images added successfully',
      data: {
        id: product._id,
        images: product.images,
      },
    });
  });

  removeProductImage = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Image URL is required',
      });
      return;
    }

    const product = await productService.removeProductImage(id, imageUrl);

    res.status(HTTP_STATUS.OK).json({
      message: 'Product image removed successfully',
      data: {
        id: product._id,
        images: product.images,
      },
    });
  });

  getFeaturedProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;
    const products = await productService.getFeaturedProducts(limit);

    res.status(HTTP_STATUS.OK).json({
      message: 'Featured products retrieved successfully',
      data: products,
    });
  });

  getProductsByCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { categoryId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const products = await productService.getProductsByCategory(categoryId, limit);

    res.status(HTTP_STATUS.OK).json({
      message: 'Products by category retrieved successfully',
      data: products,
    });
  });
}

export const productController = new ProductController();

import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
  role: z.enum(['user', 'admin']).optional(),

});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'New password cannot exceed 100 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email'),
});

// Cart validation schemas
export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantSku: z.string().min(1, 'Variant SKU is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer').min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer').min(1, 'Quantity must be at least 1'),
});

export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required').toUpperCase(),
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().min(1, 'Product description is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  categoryId: z.string().min(1, 'Category ID is required'),
  brand: z.string().max(100, 'Brand name cannot exceed 100 characters').optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().positive('Price must be positive'),
    comparePrice: z.number().positive('Compare price must be positive').optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    dimensions: z.object({
      length: z.number().positive('Length must be positive'),
      width: z.number().positive('Width must be positive'),
      height: z.number().positive('Height must be positive'),
    }).optional(),
    attributes: z.record(z.string()).optional(),
    isActive: z.boolean().default(true),
  })).min(1, 'At least one variant is required'),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// Coupon validation schemas
export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').regex(/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers'),
  name: z.string().min(1, 'Coupon name is required').max(100, 'Coupon name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  type: z.enum(['percentage', 'fixed'], { required_error: 'Coupon type is required' }),
  value: z.number().positive('Coupon value must be positive'),
  minimumOrderAmount: z.number().positive('Minimum order amount must be positive').optional(),
  maximumDiscount: z.number().positive('Maximum discount must be positive').optional(),
  usageLimit: z.number().int().positive('Usage limit must be a positive integer').min(1, 'Usage limit must be at least 1'),
  validFrom: z.string().datetime('Valid from must be a valid date'),
  validUntil: z.string().datetime('Valid until must be a valid date'),
  isActive: z.boolean().default(true),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantSku: z.string().min(1, 'Variant SKU is required'),
    name: z.string().min(1, 'Product name is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer').min(1, 'Quantity must be at least 1'),
    price: z.number().positive('Price must be positive'),
    total: z.number().positive('Total must be positive'),
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
  }),
  subtotal: z.number().positive('Subtotal must be positive'),
  shippingCost: z.number().min(0, 'Shipping cost cannot be negative'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
  couponCode: z.string().optional(),
  couponDiscount: z.number().min(0, 'Coupon discount cannot be negative').default(0),
  total: z.number().positive('Total must be positive'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Pagination and filtering schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const productFilterSchema = paginationSchema.extend({
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Common validation types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

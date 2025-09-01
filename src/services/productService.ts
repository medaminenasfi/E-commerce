import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CreateProductInput, UpdateProductInput, ProductFilterInput } from '../utils/validation';

export class ProductService {
  async createProduct(productData: CreateProductInput): Promise<IProduct> {
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: productData.slug });
    if (existingProduct) {
      throw new ValidationError('Product with this slug already exists');
    }

    // Check if SKUs are unique across all products
    const skus = productData.variants.map(v => v.sku);
    const existingSkus = await Product.find({
      'variants.sku': { $in: skus }
    });
    
    if (existingSkus.length > 0) {
      const duplicateSkus = existingSkus
        .flatMap(p => p.variants.map(v => v.sku))
        .filter(sku => skus.includes(sku));
      throw new ValidationError(`SKUs already exist: ${duplicateSkus.join(', ')}`);
    }

    const product = new Product(productData);
    return await product.save();
  }

  async getProducts(filters: ProductFilterInput): Promise<{ products: IProduct[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filterParams } = filters;
    
    // Build filter query
    const filterQuery: any = {};
    
    if (filterParams.categoryId) {
      filterQuery.categoryId = new mongoose.Types.ObjectId(filterParams.categoryId);
    }
    
    if (filterParams.brand) {
      filterQuery.brand = { $regex: filterParams.brand, $options: 'i' };
    }
    
    if (filterParams.minPrice !== undefined || filterParams.maxPrice !== undefined) {
      filterQuery['variants.price'] = {};
      if (filterParams.minPrice !== undefined) {
        filterQuery['variants.price'].$gte = filterParams.minPrice;
      }
      if (filterParams.maxPrice !== undefined) {
        filterQuery['variants.price'].$lte = filterParams.maxPrice;
      }
    }
    
    if (filterParams.isActive !== undefined) {
      filterQuery.isActive = filterParams.isActive;
    }
    
    if (filterParams.isFeatured !== undefined) {
      filterQuery.isFeatured = filterParams.isFeatured;
    }
    
    if (filterParams.search) {
      filterQuery.$or = [
        { name: { $regex: filterParams.search, $options: 'i' } },
        { description: { $regex: filterParams.search, $options: 'i' } },
        { brand: { $regex: filterParams.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filterParams.search, 'i')] } }
      ];
    }
    
    if (filterParams.tags && filterParams.tags.length > 0) {
      filterQuery.tags = { $in: filterParams.tags.map(tag => tag.toLowerCase()) };
    }

    // Build sort query
    const sortQuery: any = {};
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(filterQuery)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filterQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      totalPages
    };
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .lean();
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    return product;
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug description')
      .lean();
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    return product;
  }

  async updateProduct(id: string, updateData: UpdateProductInput): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug && updateData.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: updateData.slug });
      if (existingProduct) {
        throw new ValidationError('Product with this slug already exists');
      }
    }

    // Check if SKUs are being updated and if they're unique
    if (updateData.variants) {
      const newSkus = updateData.variants.map(v => v.sku);
      const existingSkus = await Product.find({
        _id: { $ne: id },
        'variants.sku': { $in: newSkus }
      });
      
      if (existingSkus.length > 0) {
        const duplicateSkus = existingSkus
          .flatMap(p => p.variants.map(v => v.sku))
          .filter(sku => newSkus.includes(sku));
        throw new ValidationError(`SKUs already exist: ${duplicateSkus.join(', ')}`);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug description');

    if (!updatedProduct) {
      throw new NotFoundError('Product not found');
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
  }

  async addProductImages(id: string, imageUrls: string[]): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.images.push(...imageUrls);
    return await product.save();
  }

  async removeProductImage(id: string, imageUrl: string): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    product.images = product.images.filter(img => img !== imageUrl);
    return await product.save();
  }

  async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    return await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  }

  async getProductsByCategory(categoryId: string, limit: number = 20): Promise<IProduct[]> {
    return await Product.find({ 
      categoryId: new mongoose.Types.ObjectId(categoryId), 
      isActive: true 
    })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const productService = new ProductService();

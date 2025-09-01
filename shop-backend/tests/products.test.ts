import request from 'supertest';
import express from 'express';
import { productController } from '../src/controllers/productController';
import { errorHandler } from '../src/middlewares/errorHandler';
import { Product } from '../src/models/Product';
import { Category } from '../src/models/Category';
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/products', productController.getProducts);
app.get('/products/featured', productController.getFeaturedProducts);
app.get('/products/category/:categoryId', productController.getProductsByCategory);
app.get('/products/slug/:slug', productController.getProductBySlug);
app.get('/products/:id', productController.getProductById);
app.post('/products', productController.createProduct);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);
app.post('/products/:id/images', productController.addProductImages);
app.delete('/products/:id/images', productController.removeProductImage);

// Error handling
app.use(errorHandler);

describe('Product Endpoints', () => {
  let testProduct: any;
  let testCategory: any;

  beforeEach(async () => {
    // Create test category
    testCategory = new Category({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category description',
    });
    await testCategory.save();

    // Create test product
    testProduct = new Product({
      name: 'Test Product',
      description: 'Test product description',
      slug: 'test-product',
      categoryId: testCategory._id,
      brand: 'Test Brand',
      variants: [
        {
          name: 'Test Variant',
          sku: 'TEST-SKU-001',
          price: 29.99,
          comparePrice: 39.99,
          weight: 0.5,
          dimensions: {
            length: 10,
            width: 5,
            height: 2,
          },
          attributes: {
            color: 'Red',
            size: 'Medium',
          },
          isActive: true,
        },
      ],
      images: ['https://example.com/image1.jpg'],
      tags: ['test', 'product'],
      isActive: true,
      isFeatured: false,
      metaTitle: 'Test Product Meta Title',
      metaDescription: 'Test Product Meta Description',
    });
    await testProduct.save();
  });

  afterEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  describe('GET /products', () => {
    it('should return products with pagination', async () => {
      const response = await request(app)
        .get('/products')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.message).toBe('Products retrieved successfully');
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/products')
        .query({ categoryId: testCategory._id.toString() })
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].categoryId).toBe(testCategory._id.toString());
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get('/products')
        .query({ brand: 'Test Brand' })
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].brand).toBe('Test Brand');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/products')
        .query({ minPrice: 20, maxPrice: 40 })
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].variants[0].price).toBe(29.99);
    });

    it('should search products by text', async () => {
      const response = await request(app)
        .get('/products')
        .query({ search: 'Test Product' })
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toBe('Test Product');
    });

    it('should filter products by tags', async () => {
      const response = await request(app)
        .get('/products')
        .query({ tags: 'test,product' })
        .expect(200);

      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].tags).toContain('test');
    });
  });

  describe('GET /products/featured', () => {
    it('should return featured products', async () => {
      // Make product featured
      testProduct.isFeatured = true;
      await testProduct.save();

      const response = await request(app)
        .get('/products/featured')
        .expect(200);

      expect(response.body.message).toBe('Featured products retrieved successfully');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isFeatured).toBe(true);
    });
  });

  describe('GET /products/category/:categoryId', () => {
    it('should return products by category', async () => {
      const response = await request(app)
        .get(`/products/category/${testCategory._id}`)
        .expect(200);

      expect(response.body.message).toBe('Products by category retrieved successfully');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].categoryId).toBe(testCategory._id.toString());
    });
  });

  describe('GET /products/slug/:slug', () => {
    it('should return product by slug', async () => {
      const response = await request(app)
        .get('/products/slug/test-product')
        .expect(200);

      expect(response.body.message).toBe('Product retrieved successfully');
      expect(response.body.data.slug).toBe('test-product');
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app)
        .get('/products/slug/non-existent')
        .expect(404);
    });
  });

  describe('GET /products/:id', () => {
    it('should return product by ID', async () => {
      const response = await request(app)
        .get(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.message).toBe('Product retrieved successfully');
      expect(response.body.data._id).toBe(testProduct._id.toString());
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/products/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProductData = {
        name: 'New Product',
        description: 'New product description',
        slug: 'new-product',
        categoryId: testCategory._id.toString(),
        brand: 'New Brand',
        variants: [
          {
            name: 'New Variant',
            sku: 'NEW-SKU-001',
            price: 49.99,
            isActive: true,
          },
        ],
        tags: ['new', 'product'],
        isActive: true,
      };

      const response = await request(app)
        .post('/products')
        .send(newProductData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data.name).toBe('New Product');
      expect(response.body.data.slug).toBe('new-product');
    });

    it('should validate required fields', async () => {
      const invalidProductData = {
        name: '', // Empty name
        description: 'Description',
        slug: 'invalid-slug',
      };

      await request(app)
        .post('/products')
        .send(invalidProductData)
        .expect(400);
    });

    it('should validate unique slug', async () => {
      const duplicateProductData = {
        name: 'Duplicate Product',
        description: 'Duplicate product description',
        slug: 'test-product', // Same slug as existing product
        categoryId: testCategory._id.toString(),
        variants: [
          {
            name: 'Variant',
            sku: 'DUPLICATE-SKU-001',
            price: 29.99,
            isActive: true,
          },
        ],
      };

      await request(app)
        .post('/products')
        .send(duplicateProductData)
        .expect(400);
    });

    it('should validate unique SKUs', async () => {
      const duplicateSkuData = {
        name: 'Duplicate SKU Product',
        description: 'Product with duplicate SKU',
        slug: 'duplicate-sku-product',
        categoryId: testCategory._id.toString(),
        variants: [
          {
            name: 'Variant',
            sku: 'TEST-SKU-001', // Same SKU as existing product
            price: 29.99,
            isActive: true,
          },
        ],
      };

      await request(app)
        .post('/products')
        .send(duplicateSkuData)
        .expect(400);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        description: 'Updated description',
        brand: 'Updated Brand',
      };

      const response = await request(app)
        .put(`/products/${testProduct._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.data.name).toBe('Updated Product Name');
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.brand).toBe('Updated Brand');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Name' };

      await request(app)
        .put(`/products/${fakeId}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete an existing product', async () => {
      await request(app)
        .delete(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is deleted
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/products/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /products/:id/images', () => {
    it('should add images to product', async () => {
      const imageUrls = [
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const response = await request(app)
        .post(`/products/${testProduct._id}/images`)
        .send({ imageUrls })
        .expect(200);

      expect(response.body.message).toBe('Product images added successfully');
      expect(response.body.data.images).toContain('https://example.com/image2.jpg');
      expect(response.body.data.images).toContain('https://example.com/image3.jpg');
    });

    it('should validate image URLs array', async () => {
      await request(app)
        .post(`/products/${testProduct._id}/images`)
        .send({ imageUrls: [] })
        .expect(400);
    });
  });

  describe('DELETE /products/:id/images', () => {
    it('should remove image from product', async () => {
      const imageUrl = 'https://example.com/image1.jpg';

      const response = await request(app)
        .delete(`/products/${testProduct._id}/images`)
        .send({ imageUrl })
        .expect(200);

      expect(response.body.message).toBe('Product image removed successfully');
      expect(response.body.data.images).not.toContain(imageUrl);
    });

    it('should validate image URL', async () => {
      await request(app)
        .delete(`/products/${testProduct._id}/images`)
        .send({ imageUrl: 'invalid-url' })
        .expect(400);
    });
  });
});

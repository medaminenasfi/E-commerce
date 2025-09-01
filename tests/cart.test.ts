import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { cartController } from '../src/controllers/cartController';
import { errorHandler } from '../src/middlewares/errorHandler';
import { cartSession } from '../src/middlewares/cart';
import { Product } from '../src/models/Product';
import { Inventory } from '../src/models/Inventory';
import { Category } from '../src/models/Category';
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cartSession);

// Routes
app.get('/cart', cartController.getCart);
app.post('/cart/items', cartController.addItem);
app.patch('/cart/items/:itemId', cartController.updateItem);
app.delete('/cart/items/:itemId', cartController.removeItem);
app.post('/cart/apply-coupon', cartController.applyCoupon);

// Error handling
app.use(errorHandler);

describe('Cart Endpoints', () => {
  let testProduct: any;
  let testCategory: any;
  let testInventory: any;

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
      variants: [
        {
          name: 'Test Variant',
          sku: 'TEST-SKU-001',
          price: 29.99,
          isActive: true,
        },
      ],
      isActive: true,
    });
    await testProduct.save();

    // Create test inventory
    testInventory = new Inventory({
      productId: testProduct._id,
      variantSku: 'TEST-SKU-001',
      quantity: 100,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      isActive: true,
    });
    await testInventory.save();
  });

  describe('GET /cart', () => {
    it('should return empty cart for new session', async () => {
      const response = await request(app)
        .get('/cart')
        .expect(200);

      expect(response.body.cart).toBeDefined();
      expect(response.body.cart.items).toEqual([]);
      expect(response.body.cart.itemCount).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
      expect(response.body.cart.total).toBe(0);
    });

    it('should return cart with items', async () => {
      // First add an item
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 2,
      };

      await request(app)
        .post('/cart/items')
        .send(itemData);

      // Then get the cart
      const response = await request(app)
        .get('/cart')
        .expect(200);

      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.itemCount).toBe(2);
      expect(response.body.cart.subtotal).toBe(59.98);
      expect(response.body.cart.total).toBe(59.98);
    });
  });

  describe('POST /cart/items', () => {
    it('should add item to cart successfully', async () => {
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 3,
      };

      const response = await request(app)
        .post('/cart/items')
        .send(itemData)
        .expect(200);

      expect(response.body.message).toBe('Item added to cart successfully');
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.itemCount).toBe(3);
      expect(response.body.cart.subtotal).toBe(89.97);
    });

    it('should return error for non-existent product', async () => {
      const itemData = {
        productId: new mongoose.Types.ObjectId().toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 1,
      };

      const response = await request(app)
        .post('/cart/items')
        .send(itemData)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toBe('Product not found');
    });

    it('should return error for non-existent variant', async () => {
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'NON-EXISTENT-SKU',
        quantity: 1,
      };

      const response = await request(app)
        .post('/cart/items')
        .send(itemData)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toBe('Product variant not found');
    });

    it('should return error for insufficient stock', async () => {
      // Update inventory to have low stock
      await Inventory.findByIdAndUpdate(testInventory._id, { quantity: 1 });

      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 5,
      };

      const response = await request(app)
        .post('/cart/items')
        .send(itemData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Insufficient stock');
    });

    it('should update quantity for existing item', async () => {
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 2,
      };

      // Add item first time
      await request(app)
        .post('/cart/items')
        .send(itemData);

      // Add same item again
      const response = await request(app)
        .post('/cart/items')
        .send(itemData)
        .expect(200);

      expect(response.body.cart.itemCount).toBe(4); // 2 + 2
      expect(response.body.cart.subtotal).toBe(119.96); // 4 * 29.99
    });
  });

  describe('PATCH /cart/items/:itemId', () => {
    it('should update item quantity successfully', async () => {
      // First add an item
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 2,
      };

      await request(app)
        .post('/cart/items')
        .send(itemData);

      // Update quantity
      const itemId = `${testProduct._id}:TEST-SKU-001`;
      const updateData = { quantity: 5 };

      const response = await request(app)
        .patch(`/cart/items/${itemId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Cart item updated successfully');
      expect(response.body.cart.itemCount).toBe(5);
      expect(response.body.cart.subtotal).toBe(149.95);
    });

    it('should remove item when quantity is 0', async () => {
      // First add an item
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 2,
      };

      await request(app)
        .post('/cart/items')
        .send(itemData);

      // Set quantity to 0
      const itemId = `${testProduct._id}:TEST-SKU-001`;
      const updateData = { quantity: 0 };

      const response = await request(app)
        .patch(`/cart/items/${itemId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.itemCount).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
    });

    it('should return error for invalid item ID format', async () => {
      const response = await request(app)
        .patch('/cart/items/invalid-id')
        .send({ quantity: 5 })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid item ID format');
    });
  });

  describe('DELETE /cart/items/:itemId', () => {
    it('should remove item from cart successfully', async () => {
      // First add an item
      const itemData = {
        productId: testProduct._id.toString(),
        variantSku: 'TEST-SKU-001',
        quantity: 2,
      };

      await request(app)
        .post('/cart/items')
        .send(itemData);

      // Remove the item
      const itemId = `${testProduct._id}:TEST-SKU-001`;

      const response = await request(app)
        .delete(`/cart/items/${itemId}`)
        .expect(200);

      expect(response.body.message).toBe('Item removed from cart successfully');
      expect(response.body.cart.items).toHaveLength(0);
      expect(response.body.cart.itemCount).toBe(0);
      expect(response.body.cart.subtotal).toBe(0);
    });

    it('should return error for invalid item ID format', async () => {
      const response = await request(app)
        .delete('/cart/items/invalid-id')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid item ID format');
    });
  });

  describe('POST /cart/apply-coupon', () => {
    it('should return error for non-existent coupon', async () => {
      const couponData = {
        couponCode: 'INVALID-COUPON',
      };

      const response = await request(app)
        .post('/cart/apply-coupon')
        .send(couponData)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toBe('Coupon not found');
    });

    it('should return error for empty cart', async () => {
      const couponData = {
        couponCode: 'VALID-COUPON',
      };

      const response = await request(app)
        .post('/cart/apply-coupon')
        .send(couponData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Cart is empty');
    });
  });
});

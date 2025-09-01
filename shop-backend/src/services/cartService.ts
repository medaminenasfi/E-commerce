import mongoose from 'mongoose';
import { Cart, ICart } from '../models/Cart';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { Coupon } from '../models/Coupon';
import { NotFoundError, ValidationError } from '../utils/errors';
import { AddCartItemInput, UpdateCartItemInput, ApplyCouponInput } from '../utils/validation';

export class CartService {
  async getCart(identifier: string, isUserId: boolean = false): Promise<ICart> {
    const query = isUserId ? { userId: identifier } : { sessionId: identifier };
    
    let cart = await Cart.findOne(query)
      .populate({
        path: 'items.productId',
        select: 'name images variants',
      });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        [isUserId ? 'userId' : 'sessionId']: identifier,
        items: [],
        subtotal: 0,
        total: 0,
      });
      await cart.save();
    }

    return cart;
  }

  async addItem(
    identifier: string,
    isUserId: boolean,
    itemData: AddCartItemInput
  ): Promise<ICart> {
    const { productId, variantSku, quantity } = itemData;

    // Validate product and variant
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const variant = product.variants.find(v => v.sku === variantSku);
    if (!variant) {
      throw new NotFoundError('Product variant not found');
    }

    if (!variant.isActive) {
      throw new ValidationError('Product variant is not available');
    }

    // Check inventory
    const inventory = await Inventory.findOne({ productId, variantSku });
    if (!inventory || inventory.availableQuantity < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    // Get or create cart
    const cart = await this.getCart(identifier, isUserId);

    // Add item to cart
    cart.addItem(
      new mongoose.Types.ObjectId(productId),
      variantSku,
      quantity,
      variant.price
    );

    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async updateItem(
    identifier: string,
    isUserId: boolean,
    productId: string,
    variantSku: string,
    quantity: number
  ): Promise<ICart> {
    const cart = await this.getCart(identifier, isUserId);

    // Check inventory if quantity is being increased
    const currentItem = cart.items.find(
      item => item.productId.toString() === productId && item.variantSku === variantSku
    );

    if (quantity > (currentItem?.quantity || 0)) {
      const inventory = await Inventory.findOne({ productId, variantSku });
      if (!inventory || inventory.availableQuantity < quantity) {
        throw new ValidationError('Insufficient stock');
      }
    }

    // Update item quantity
    cart.updateItemQuantity(
      new mongoose.Types.ObjectId(productId),
      variantSku,
      quantity
    );

    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async removeItem(
    identifier: string,
    isUserId: boolean,
    productId: string,
    variantSku: string
  ): Promise<ICart> {
    const cart = await this.getCart(identifier, isUserId);

    cart.removeItem(
      new mongoose.Types.ObjectId(productId),
      variantSku
    );

    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async applyCoupon(
    identifier: string,
    isUserId: boolean,
    couponData: ApplyCouponInput
  ): Promise<ICart> {
    const { couponCode } = couponData;

    // Find coupon
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (!coupon.isValid) {
      throw new ValidationError('Coupon is not valid');
    }

    const cart = await this.getCart(identifier, isUserId);

    if (cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cart.subtotal);

    if (discount <= 0) {
      throw new ValidationError('Coupon cannot be applied to this cart');
    }

    // Apply coupon
    cart.couponCode = couponCode;
    cart.couponDiscount = discount;

    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async removeCoupon(identifier: string, isUserId: boolean): Promise<ICart> {
    const cart = await this.getCart(identifier, isUserId);

    cart.couponCode = undefined;
    cart.couponDiscount = 0;

    await cart.save();
    return cart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async clearCart(identifier: string, isUserId: boolean): Promise<ICart> {
    const cart = await this.getCart(identifier, isUserId);

    cart.clearCart();

    await cart.save();
    return cart;
  }

  async mergeGuestCart(sessionId: string, userId: string): Promise<ICart> {
    const guestCart = await Cart.findOne({ sessionId });
    const userCart = await Cart.findOne({ userId });

    if (!guestCart || guestCart.items.length === 0) {
      return userCart || this.getCart(userId, true);
    }

    if (!userCart) {
      // Convert guest cart to user cart
      guestCart.sessionId = undefined;
      guestCart.userId = new mongoose.Types.ObjectId(userId);
      await guestCart.save();
      return guestCart.populate({
        path: 'items.productId',
        select: 'name images variants',
      });
    }

    // Merge items from guest cart to user cart
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        item => item.productId.equals(guestItem.productId) && item.variantSku === guestItem.variantSku
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.price = guestItem.price; // Use guest cart price
      } else {
        userCart.items.push(guestItem);
      }
    }

    // Apply guest cart coupon if user cart doesn't have one
    if (guestCart.couponCode && !userCart.couponCode) {
      userCart.couponCode = guestCart.couponCode;
      userCart.couponDiscount = guestCart.couponDiscount;
    }

    await userCart.save();
    
    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    return userCart.populate({
      path: 'items.productId',
      select: 'name images variants',
    });
  }

  async validateCart(identifier: string, isUserId: boolean): Promise<{ isValid: boolean; errors: string[] }> {
    const cart = await this.getCart(identifier, isUserId);
    const errors: string[] = [];

    for (const item of cart.items) {
      // Check if product exists and is active
      const product = await Product.findById(item.productId);
      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }

      if (!product.isActive) {
        errors.push(`Product ${product.name} is not available`);
        continue;
      }

      // Check if variant exists and is active
      const variant = product.variants.find(v => v.sku === item.variantSku);
      if (!variant) {
        errors.push(`Variant ${item.variantSku} not found for product ${product.name}`);
        continue;
      }

      if (!variant.isActive) {
        errors.push(`Variant ${variant.name} is not available for product ${product.name}`);
        continue;
      }

      // Check inventory
      const inventory = await Inventory.findOne({ productId: item.productId, variantSku: item.variantSku });
      if (!inventory) {
        errors.push(`Inventory not found for ${product.name} - ${variant.name}`);
        continue;
      }

      if (inventory.availableQuantity < item.quantity) {
        errors.push(`Insufficient stock for ${product.name} - ${variant.name}. Available: ${inventory.availableQuantity}, Requested: ${item.quantity}`);
        continue;
      }

      // Check if price has changed
      if (variant.price !== item.price) {
        errors.push(`Price has changed for ${product.name} - ${variant.name}. New price: ${variant.price}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const cartService = new CartService();

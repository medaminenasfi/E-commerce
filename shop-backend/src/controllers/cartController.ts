import { Response } from 'express';
import { cartService } from '../services/cartService';
import { CartRequest } from '../middlewares/errorHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { getCartIdentifier, isGuestCart } from '../middlewares/cart';
import { HTTP_STATUS } from '../utils/errors';

export class CartController {
  getCart = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);
    const cart = await cartService.getCart(cartIdentifier, isUserId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Cart retrieved successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  addItem = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);
    const { productId, variantSku, quantity } = req.body;

    const cart = await cartService.addItem(cartIdentifier, isUserId, { productId, variantSku, quantity });

    res.status(HTTP_STATUS.OK).json({
      message: 'Item added to cart successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  updateItem = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Parse itemId to get productId and variantSku
    const [productId, variantSku] = itemId.split('_');
    if (!productId || !variantSku) {
      throw new Error('Invalid item ID format');
    }

    const cart = await cartService.updateItem(cartIdentifier, isUserId, productId, variantSku, quantity);

    res.status(HTTP_STATUS.OK).json({
      message: 'Item updated successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  removeItem = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);
    const { itemId } = req.params;

    // Parse itemId to get productId and variantSku
    const [productId, variantSku] = itemId.split('_');
    if (!productId || !variantSku) {
      throw new Error('Invalid item ID format');
    }

    const cart = await cartService.removeItem(cartIdentifier, isUserId, productId, variantSku);

    res.status(HTTP_STATUS.OK).json({
      message: 'Item removed from cart successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  applyCoupon = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);
    const { couponCode } = req.body;

    const cart = await cartService.applyCoupon(cartIdentifier, isUserId, { couponCode });

    res.status(HTTP_STATUS.OK).json({
      message: 'Coupon applied successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  removeCoupon = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);

    const cart = await cartService.removeCoupon(cartIdentifier, isUserId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Coupon removed successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  clearCart = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);

    const cart = await cartService.clearCart(cartIdentifier, isUserId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Cart cleared successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        couponCode: cart.couponCode,
        couponDiscount: cart.couponDiscount,
        itemCount: cart.items.length,
      },
    });
  });

  validateCart = asyncHandler(async (req: CartRequest, res: Response): Promise<void> => {
    const cartIdentifier = getCartIdentifier(req);
    const isUserId = !isGuestCart(req);

    const validation = await cartService.validateCart(cartIdentifier, isUserId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Cart validation completed',
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: [],
    });
  });
}

export const cartController = new CartController();

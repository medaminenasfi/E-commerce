import { Response, NextFunction } from 'express';
import * as cartService from '../services/cartService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user!.userId, productId, quantity);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Authenticated User:', req.user); // Log the authenticated user
    const { productId } = req.body;
    const { cart, wasRemoved } = await cartService.removeFromCart(req.user!.userId, productId);

    if (wasRemoved) {
      res.json({ message: 'Product removed successfully', cart }); // Return success message
    } else {
      res.status(400).json({ message: 'Product not found in cart' }); // Return error message
    }
  } catch (err) {
    console.error('Error in removeFromCart:', err.message); // Log the error
    next(err);
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Authenticated User:', req.user); // Log the authenticated user
    const { productId, quantity } = req.body;
    const { cart, success } = await cartService.updateCartItem(req.user!.userId, productId, quantity);

    if (success) {
      res.json({ message: 'Product quantity updated successfully', cart }); // Return success message
    } else {
      res.status(400).json({ message: 'Product not found in cart' }); // Return error message
    }
  } catch (err) {
    console.error('Error in updateCartItem:', err.message); // Log the error
    next(err);
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Authenticated User:', req.user); // Log the authenticated user
    const { cart, wasCleared } = await cartService.clearCart(req.user!.userId);
    if (wasCleared) {
      res.json({ message: 'Cart cleared successfully', cartId: cart._id, cart }); // Return success message with cartId
    } else {
      res.status(400).json({ message: 'Failed to clear cart' }); // Return error message
    }
  } catch (err) {
    console.error('Error in clearCart:', err.message); // Log the error
    next(err);
  }
};
